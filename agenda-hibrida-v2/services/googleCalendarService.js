/**
 * Serviço de sincronização com Google Calendar
 * Lista e importa eventos do Google Calendar
 */

const { google } = require('googleapis');
const { format, parseISO } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { getAuthenticatedClient } = require('./googleAuthService');
const { findDuplicateAppointment } = require('./dedupService');

/**
 * Lista calendários do usuário
 * @param {object} db - Instância do banco de dados
 * @returns {Promise<Array>} - Lista de calendários
 */
async function listCalendars(db) {
  try {
    const auth = await getAuthenticatedClient(db);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.calendarList.list();
    
    return response.data.items.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    }));
  } catch (error) {
    throw new Error(`Erro ao listar calendários: ${error.message}`);
  }
}

/**
 * Lista eventos de um calendário
 * @param {object} db - Instância do banco de dados
 * @param {object} options - Opções de busca
 * @returns {Promise<Array>} - Lista de eventos
 */
async function listEvents(db, options = {}) {
  const {
    calendarId = 'primary',
    timeMin = null,
    timeMax = null,
    maxResults = 250,
    singleEvents = true,
    orderBy = 'startTime'
  } = options;

  try {
    const auth = await getAuthenticatedClient(db);
    const calendar = google.calendar({ version: 'v3', auth });
    
    const params = {
      calendarId: calendarId,
      maxResults: maxResults,
      singleEvents: singleEvents,
      orderBy: orderBy
    };

    if (timeMin) {
      params.timeMin = timeMin;
    }

    if (timeMax) {
      params.timeMax = timeMax;
    }

    const response = await calendar.events.list(params);
    
    return response.data.items || [];
  } catch (error) {
    throw new Error(`Erro ao listar eventos: ${error.message}`);
  }
}

/**
 * Mapeia evento do Google Calendar para objeto de agendamento
 * @param {object} event - Evento do Google Calendar
 * @param {string} calendarId - ID do calendário
 * @param {string} timezone - Timezone padrão
 * @returns {object|null} - Objeto de agendamento ou null
 */
function mapGoogleEventToAppointment(event, calendarId, timezone = 'America/Sao_Paulo') {
  try {
    if (!event.start || !event.summary) {
      return null;
    }

    // Detectar eventos all-day vs com horário
    const isAllDay = !!event.start.date;
    
    let startDateTime;
    let endDateTime;

    if (isAllDay) {
      // Evento de dia inteiro
      startDateTime = parseISO(event.start.date);
      endDateTime = event.end ? parseISO(event.end.date) : startDateTime;
    } else {
      // Evento com horário específico
      startDateTime = parseISO(event.start.dateTime);
      endDateTime = event.end ? parseISO(event.end.dateTime) : startDateTime;
      
      // Converter para timezone local
      startDateTime = utcToZonedTime(startDateTime, timezone);
      endDateTime = utcToZonedTime(endDateTime, timezone);
    }

    // Extrair nome do cliente
    let clientName = null;
    
    // Tentar extrair de attendees
    if (event.attendees && event.attendees.length > 0) {
      const firstAttendee = event.attendees[0];
      clientName = firstAttendee.displayName || firstAttendee.email;
    }

    // Tentar extrair da descrição
    if (!clientName && event.description) {
      const clientMatch = event.description.match(/Cliente:\s*(.+)/i);
      if (clientMatch) {
        clientName = clientMatch[1].trim();
      }
    }

    // Calcular duração em minutos
    const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));

    const appointment = {
      client_name: clientName || 'Cliente Google',
      date: format(startDateTime, 'yyyy-MM-dd'),
      time: isAllDay ? '00:00' : format(startDateTime, 'HH:mm'),
      end_time: isAllDay ? '23:59' : format(endDateTime, 'HH:mm'),
      title: event.summary,
      service: event.summary,
      status: event.status === 'confirmed' ? 'scheduled' : (event.status || 'scheduled'),
      notes: event.description || null,
      duration: duration || 60,
      google_event_id: event.id,
      google_calendar_id: calendarId,
      ical_uid: event.iCalUID || null,
      external_source: 'google_calendar',
      external_id: event.id,
      last_sync_date: new Date().toISOString()
    };

    // Adicionar localização às notas
    if (event.location) {
      appointment.notes = appointment.notes 
        ? `${appointment.notes}\n\nLocal: ${event.location}`
        : `Local: ${event.location}`;
    }

    // Adicionar link do meet se existir
    if (event.hangoutLink) {
      appointment.notes = appointment.notes 
        ? `${appointment.notes}\n\nGoogle Meet: ${event.hangoutLink}`
        : `Google Meet: ${event.hangoutLink}`;
    }

    return appointment;
  } catch (error) {
    console.error('Erro ao mapear evento do Google:', error);
    return null;
  }
}

/**
 * Sincroniza eventos do Google Calendar
 * @param {object} db - Instância do banco de dados
 * @param {object} options - Opções de sincronização
 * @returns {Promise<object>} - Relatório de sincronização
 */
async function syncGoogleCalendar(db, options = {}) {
  const {
    calendarId = 'primary',
    daysBack = 30,
    daysForward = 90,
    timezone = 'America/Sao_Paulo',
    autoLinkClients = true,
    skipDuplicates = false
  } = options;

  const report = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Calcular intervalo de datas
    const now = new Date();
    const timeMin = new Date(now);
    timeMin.setDate(timeMin.getDate() - daysBack);
    
    const timeMax = new Date(now);
    timeMax.setDate(timeMax.getDate() + daysForward);

    console.log(`📅 Sincronizando eventos de ${format(timeMin, 'yyyy-MM-dd')} até ${format(timeMax, 'yyyy-MM-dd')}`);

    // Listar eventos do Google Calendar
    const events = await listEvents(db, {
      calendarId: calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 250
    });

    report.total = events.length;
    console.log(`📋 Total de eventos encontrados: ${events.length}`);

    // Processar cada evento
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      try {
        // Mapear evento para agendamento
        const appointmentData = mapGoogleEventToAppointment(event, calendarId, timezone);
        
        if (!appointmentData) {
          report.skipped++;
          report.errors.push({
            event: i + 1,
            eventId: event.id,
            reason: 'Dados inválidos ou campos obrigatórios ausentes'
          });
          continue;
        }

        // Tentar vincular a cliente existente
        if (autoLinkClients && appointmentData.client_name) {
          const client = await new Promise((resolve, reject) => {
            db.get(
              'SELECT id FROM clients WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)',
              [appointmentData.client_name, appointmentData.client_name],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });

          if (client) {
            appointmentData.client_id = client.id;
          }
        }

        // Verificar duplicata
        const duplicate = await findDuplicateAppointment(db, appointmentData);

        if (duplicate) {
          if (skipDuplicates) {
            report.skipped++;
            continue;
          }

          // Atualizar agendamento existente
          const updateQuery = `
            UPDATE appointments SET
              client_id = ?,
              client_name = ?,
              date = ?,
              time = ?,
              end_time = ?,
              title = ?,
              service = ?,
              status = ?,
              notes = ?,
              duration = ?,
              google_event_id = ?,
              google_calendar_id = ?,
              ical_uid = ?,
              external_source = ?,
              external_id = ?,
              last_sync_date = ?
            WHERE id = ?
          `;

          await new Promise((resolve, reject) => {
            db.run(updateQuery, [
              appointmentData.client_id,
              appointmentData.client_name,
              appointmentData.date,
              appointmentData.time,
              appointmentData.end_time,
              appointmentData.title,
              appointmentData.service,
              appointmentData.status,
              appointmentData.notes,
              appointmentData.duration,
              appointmentData.google_event_id,
              appointmentData.google_calendar_id,
              appointmentData.ical_uid,
              appointmentData.external_source,
              appointmentData.external_id,
              appointmentData.last_sync_date,
              duplicate.id
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.updated++;
        } else {
          // Inserir novo agendamento
          const insertQuery = `
            INSERT INTO appointments (
              client_id, client_name, date, time, end_time,
              title, service, status, notes, duration,
              google_event_id, google_calendar_id, ical_uid,
              external_source, external_id, last_sync_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            db.run(insertQuery, [
              appointmentData.client_id,
              appointmentData.client_name,
              appointmentData.date,
              appointmentData.time,
              appointmentData.end_time,
              appointmentData.title,
              appointmentData.service,
              appointmentData.status,
              appointmentData.notes,
              appointmentData.duration,
              appointmentData.google_event_id,
              appointmentData.google_calendar_id,
              appointmentData.ical_uid,
              appointmentData.external_source,
              appointmentData.external_id,
              appointmentData.last_sync_date
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.created++;
        }
      } catch (error) {
        report.errors.push({
          event: i + 1,
          eventId: event.id,
          reason: error.message
        });
      }
    }

    // Atualizar última sincronização
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO sync_settings (setting_key, setting_value, updated_at)
         VALUES ('google_calendar_last_sync', ?, ?)`,
        [new Date().toISOString(), new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return report;
  } catch (error) {
    throw new Error(`Erro na sincronização: ${error.message}`);
  }
}

/**
 * Obtém última sincronização
 * @param {object} db - Instância do banco de dados
 * @returns {Promise<string|null>} - Data/hora da última sincronização
 */
async function getLastSync(db) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT setting_value FROM sync_settings WHERE setting_key = 'google_calendar_last_sync'",
      (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.setting_value : null);
      }
    );
  });
}

module.exports = {
  listCalendars,
  listEvents,
  mapGoogleEventToAppointment,
  syncGoogleCalendar,
  getLastSync
};
