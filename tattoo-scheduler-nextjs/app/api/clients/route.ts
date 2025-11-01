// API de Clientes - GET (listar) e POST (criar)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/clients
 * Lista todos os clientes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};
    
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            appointments: true,
            files: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar clientes',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Cria novo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nome é obrigatório' 
        },
        { status: 400 }
      );
    }
    
    // Criar cliente
    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        notes: body.notes?.trim() || null,
        folderPath: body.folderPath || null,
        googleDriveFolderId: body.googleDriveFolderId || null
      }
    });
    
    return NextResponse.json({
      success: true,
      data: client,
      message: 'Cliente criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    // Verificar se é erro de unicidade
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente com este email ou telefone já existe' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar cliente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

