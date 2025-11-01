// API de Cron Job - Sincronização Automática com Google Calendar
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent
} from '@/lib/google-calendar';

/**
 * GET /api/cron/sync-calendar
 * Endpoint para cron externo (cron-job.org) chamar a cada 5 minutos
 * 
 * Exemplo de uso:
 * GET https://seu-app.vercel.app/api/cron/sync-calendar?secret=seu-secret-aqui
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // VALIDAR SECRET
    // ============================================
    const secret = request.nextUrl.searchParams.get('secret');
    
    if (!secret || secret !== process.env.CRON_SECRET) {
      console.warn('⚠️  Tentativa de acesso ao cron com secret inválido');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🕐 Iniciando sincronização automática com Google Calendar...');
    
    // ============================================
    // BUSCAR TOKENS ATIVOS
    // ============================================
    const tokens = await prisma.oAuthToken.findMany({
      where: {
        provider: 'google',
        accessToken: { not: '' }
      }
    });
    
    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum token do Google encontrado',
        syncedCount: 0
      });
    }
    
    let totalSynced = 0;
    const errors: any[] = [];
    
    // ============================================
    // SINCRONIZAR PARA CADA USUÁRIO
    // ============================================
    for (const token of tokens) {
      try {
        // Buscar agendamentos não sincronizados (últimas 24h)
        const unsyncedAppointments = await prisma.appointment.findMany({
          where: {
            googleEventId: null,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          include: {
            client: true
          },
          take: 10 // Limitar a 10 por execução
        });
        
        for (const appointment of unsyncedAppointments) {
          try {
            // Criar evento no Google Calendar
            const result = await createGoogleCalendarEvent(token.accessToken, {
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
              
              totalSynced++;
              console.log(`  ✓ Agendamento #${appointment.id} sincronizado`);
            } else {
              errors.push({
                appointmentId: appointment.id,
                error: 'Falha ao criar evento no Google'
              });
            }
          } catch (error) {
            console.error(`  ✗ Erro ao sincronizar agendamento #${appointment.id}:`, error);
            errors.push({
              appointmentId: appointment.id,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar token do usuário ${token.userId}:`, error);
        errors.push({
          userId: token.userId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    console.log(`✅ Sincronização automática concluída: ${totalSynced} agendamento(s) sincronizado(s)`);
    
    return NextResponse.json({
      success: true,
      syncedCount: totalSynced,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sincronização automática concluída: ${totalSynced} agendamento(s) sincronizado(s)`
    });
  } catch (error) {
    console.error('❌ Erro na sincronização automática:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro na sincronização automática',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

