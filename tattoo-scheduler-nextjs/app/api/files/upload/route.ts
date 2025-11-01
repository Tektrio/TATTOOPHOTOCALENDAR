// API de Upload de Arquivos
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadFileToSupabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/files/upload
 * Upload de arquivo (Supabase Storage ou local)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    const appointmentId = formData.get('appointmentId') as string | null;
    const category = formData.get('category') as string | null;
    
    // Validações
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Cliente é obrigatório' },
        { status: 400 }
      );
    }
    
    const clientIdNum = parseInt(clientId);
    
    // Verificar se cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientIdNum }
    });
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${clientId}_${timestamp}${ext}`;
    
    // Decidir se salva local ou cloud
    const useLocalDB = process.env.USE_LOCAL_DB === 'true';
    
    let filePath: string;
    let storageType: string;
    let publicUrl: string | null = null;
    
    if (useLocalDB) {
      // ============================================
      // MODO LOCAL: Salvar em /uploads
      // ============================================
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Criar diretório se não existir
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Diretório já existe
      }
      
      filePath = path.join(uploadsDir, filename);
      storageType = 'local';
      
      // Converter File para Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Salvar arquivo localmente
      await writeFile(filePath, buffer);
      
      console.log(`✓ Arquivo salvo localmente: ${filePath}`);
    } else {
      // ============================================
      // MODO CLOUD: Upload para Supabase Storage
      // ============================================
      const uploadPath = `${clientId}/${filename}`;
      
      // Converter File para Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload para Supabase
      const uploadResult = await uploadFileToSupabase(
        buffer,
        uploadPath,
        'uploads'
      );
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao fazer upload para Supabase',
            details: uploadResult.error
          },
          { status: 500 }
        );
      }
      
      filePath = uploadResult.path!;
      publicUrl = uploadResult.publicUrl!;
      storageType = 'supabase';
      
      console.log(`✓ Arquivo enviado para Supabase: ${publicUrl}`);
    }
    
    // Salvar metadados no banco
    const fileRecord = await prisma.file.create({
      data: {
        clientId: clientIdNum,
        appointmentId: appointmentId ? parseInt(appointmentId) : null,
        filename,
        originalName: file.name,
        filePath,
        storageType,
        category: category || null,
        fileType: ext.substring(1), // Remove o ponto
        mimeType: file.type,
        fileSize: file.size
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...fileRecord,
        publicUrl: publicUrl || `/uploads/${filename}` // URL local ou Supabase
      },
      message: 'Arquivo enviado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao fazer upload',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/files/upload?clientId=1
 * Lista arquivos de um cliente
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const appointmentId = searchParams.get('appointmentId');
    const category = searchParams.get('category');
    
    const where: any = {};
    
    if (clientId) {
      where.clientId = parseInt(clientId);
    }
    
    if (appointmentId) {
      where.appointmentId = parseInt(appointmentId);
    }
    
    if (category) {
      where.category = category;
    }
    
    const files = await prisma.file.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        appointment: {
          select: {
            id: true,
            title: true,
            startDatetime: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Adicionar URLs públicas
    const filesWithUrls = files.map(file => ({
      ...file,
      publicUrl: file.storageType === 'supabase' 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${file.filePath}`
        : `/uploads/${file.filename}`
    }));
    
    return NextResponse.json({
      success: true,
      data: filesWithUrls,
      count: files.length
    });
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar arquivos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

