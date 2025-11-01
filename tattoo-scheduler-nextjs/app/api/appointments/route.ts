// API de Agendamentos - GET (listar) e POST (criar)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/appointments
 * Lista agendamentos com filtros opcionais
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    
    // Construir filtros dinamicamente
    const where: any = {};
    
    if (clientId) {
      where.clientId = parseInt(clientId);
    }
    
    if (startDate && endDate) {
      where.startDatetime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.startDatetime = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.startDatetime = {
        lte: new Date(endDate)
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            files: true
          }
        }
      },
      orderBy: { startDatetime: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar agendamentos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Cria novo agendamento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.clientId) {
      return NextResponse.json(
        { success: false, error: 'Cliente é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!body.startDatetime || !body.endDatetime) {
      return NextResponse.json(
        { success: false, error: 'Data de início e fim são obrigatórias' },
        { status: 400 }
      );
    }
    
    // Verificar se cliente existe
    const client = await prisma.client.findUnique({
      where: { id: parseInt(body.clientId) }
    });
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        clientId: parseInt(body.clientId),
        startDatetime: new Date(body.startDatetime),
        endDatetime: new Date(body.endDatetime),
        title: body.title?.trim() || null,
        description: body.description?.trim() || null,
        status: body.status || 'pending',
        price: body.price ? parseFloat(body.price) : null,
        notes: body.notes?.trim() || null,
        googleEventId: body.googleEventId || null
      },
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
      message: 'Agendamento criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar agendamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

