// API de Cliente Individual - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/clients/:id
 * Busca cliente por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { startDatetime: 'desc' },
          take: 10
        },
        files: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            appointments: true,
            files: true
          }
        }
      }
    });
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar cliente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/:id
 * Atualiza cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Verificar se cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar cliente
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name?.trim() || existingClient.name,
        email: body.email?.trim() || existingClient.email,
        phone: body.phone?.trim() || existingClient.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : existingClient.birthDate,
        notes: body.notes?.trim() || existingClient.notes,
        folderPath: body.folderPath || existingClient.folderPath,
        googleDriveFolderId: body.googleDriveFolderId || existingClient.googleDriveFolderId
      }
    });
    
    return NextResponse.json({
      success: true,
      data: client,
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar cliente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/:id
 * Deleta cliente
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar cliente (cascade irá deletar appointments e files relacionados)
    await prisma.client.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar cliente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

