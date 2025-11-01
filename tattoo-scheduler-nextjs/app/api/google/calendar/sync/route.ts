// API de Sincronização com Google Calendar
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getGoogleAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  listGoogleCalendarEvents, 
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from '@/lib/google-calendar';

/**
 * POST /api/google/calendar/sync
 * Sincroniza agendamentos locais com Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Pegar access token do Google
    const accessToken = await getGoogleAccessToken(session.user.email);
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Token do Google não encontrado' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const direction = body.direction || 'both'; // 'both', 'toGoogle', 'fromGoogle'
    
    let syncedCount = 0;
    let errors: any[] = [];
    
    // ============================================
    // SINCRONIZAR: Local → Google Calendar
    // ============================================
    if (direction === 'both' || direction === 'toGoogle') {
      // Buscar agendamentos sem googleEventId (nunca sincronizados)
      const localAppointments = await prisma.appointment.findMany({
        where: {
          googleEventId: null
        },
        include: {
          client: true
        }
      });
      
      for (const appointment of localAppointments) {
        try {
          // Criar evento no Google Calendar
          const result = await createGoogleCalendarEvent(accessToken, {
            summary: appointment.title || `Agendamento - ${appointment.client.name}`,
            description: appointment.description || appointment.notes || '',
            start: {
              dateTime: appointment.startDatetime.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            end: {
              dateTime: appointment.endDatetime.toISOString(),
              timeZone: 'America/Sao_Paulo'
            },
            attendees: appointment.client.email ? [
              { email: appointment.client.email }
            ] : undefined
          });
          
          if (result.success && result.event?.id) {
            // Atualizar appointment com googleEventId
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: { googleEventId: result.event.id }
            });
            
            syncedCount++;
            console.log(`✓ Agendamento #${appointment.id} sincronizado com Google Calendar`);
          } else {
            errors.push({
              appointmentId: appointment.id,
              error: 'Falha ao criar evento no Google'
            });
          }
        } catch (error) {
          console.error(`Erro ao sincronizar agendamento #${appointment.id}:`, error);
          errors.push({
            appointmentId: appointment.id,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    }
    
    // ============================================
    // SINCRONIZAR: Google Calendar → Local
    // ============================================
    if (direction === 'both' || direction === 'fromGoogle') {
      // Buscar eventos do Google Calendar
      const eventsResult = await listGoogleCalendarEvents(accessToken, {
        timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
        maxResults: 100
      });
      
      if (eventsResult.success) {
        for (const event of eventsResult.events) {
          try {
            // Verificar se evento já existe localmente
            const existingAppointment = await prisma.appointment.findFirst({
              where: { googleEventId: event.id || '' }
            });
            
            if (!existingAppointment && event.id) {
              // Criar novo agendamento local
              // Nota: Precisa de um clientId, então vamos criar um cliente genérico se necessário
              console.log(`ℹ️  Evento do Google "${event.summary}" não tem cliente local associado`);
              // Por ora, não criar automaticamente
            }
          } catch (error) {
            console.error('Erro ao processar evento do Google:', error);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `${syncedCount} agendamento(s) sincronizado(s) com o Google Calendar`
    });
  } catch (error) {
    console.error('Erro na sincronização com Google Calendar:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro na sincronização',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/google/calendar/sync
 * Status da sincronização com Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Contar agendamentos sincronizados vs não sincronizados
    const totalAppointments = await prisma.appointment.count();
    const syncedAppointments = await prisma.appointment.count({
      where: {
        googleEventId: { not: null }
      }
    });
    const unsyncedAppointments = totalAppointments - syncedAppointments;
    
    return NextResponse.json({
      success: true,
      data: {
        totalAppointments,
        syncedAppointments,
        unsyncedAppointments,
        syncPercentage: totalAppointments > 0 
          ? Math.round((syncedAppointments / totalAppointments) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar status de sincronização:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar status',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

