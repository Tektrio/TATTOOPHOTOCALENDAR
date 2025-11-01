// API de Agendamento Individual - GET, PUT, DELETE
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/appointments/:id
 * Busca agendamento por ID
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
    
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        files: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar agendamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appointments/:id
 * Atualiza agendamento
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
    
    // Verificar se agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });
    
    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    if (body.clientId !== undefined) {
      updateData.clientId = parseInt(body.clientId);
    }
    if (body.startDatetime !== undefined) {
      updateData.startDatetime = new Date(body.startDatetime);
    }
    if (body.endDatetime !== undefined) {
      updateData.endDatetime = new Date(body.endDatetime);
    }
    if (body.title !== undefined) {
      updateData.title = body.title?.trim() || null;
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.price !== undefined) {
      updateData.price = body.price ? parseFloat(body.price) : null;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null;
    }
    if (body.googleEventId !== undefined) {
      updateData.googleEventId = body.googleEventId || null;
    }
    
    // Atualizar agendamento
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar agendamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/:id
 * Deleta agendamento
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
    
    // Verificar se agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });
    
    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar agendamento (files relacionados terão appointmentId setado para NULL)
    await prisma.appointment.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Agendamento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar agendamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

