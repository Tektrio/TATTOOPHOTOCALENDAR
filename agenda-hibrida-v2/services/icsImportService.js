/**
 * Serviço de importação de arquivos ICS (iCalendar)
 * Suporta importação manual de calendários em formato .ics
 */

const ical = require('node-ical');
const { format, parseISO } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { findDuplicateAppointment } = require('./dedupService');

/**
 * Parse de arquivo ICS
 * @param {Buffer|string} data - Buffer ou string do arquivo ICS
 * @returns {Array<object>} - Array de eventos parseados
 */
function parseIcsFile(data) {
  try {
    const events = [];
    const parsed = ical.parseICS(data.toString());

    for (const key in parsed) {
      const event = parsed[key];
      
      // Filtrar apenas eventos (não VTIMEZONE, etc)
      if (event.type === 'VEVENT') {
        events.push(event);
      }
    }

    return events;
  } catch (error) {
    throw new Error(`Erro ao fazer parse do arquivo ICS: ${error.message}`);
  }
}

/**
 * Mapeia evento ICS para objeto de agendamento
 * @param {object} event - Evento ICS parseado
 * @param {string} timezone - Timezone padrão
 * @returns {object|null} - Objeto de agendamento ou null
 */
function mapIcsEventToAppointment(event, timezone = 'America/Sao_Paulo') {
  try {
    if (!event.start || !event.summary) {
      return null;
    }

    // Converter datas para timezone local
    const startDate = event.start;
    const endDate = event.end;
    
    let localStartDate;
    let localEndDate;

    // Tratar datas all-day e com timezone
    if (typeof startDate === 'string') {
      localStartDate = parseISO(startDate);
    } else {
      localStartDate = utcToZonedTime(startDate, timezone);
    }

    if (endDate) {
      if (typeof endDate === 'string') {
        localEndDate = parseISO(endDate);
      } else {
        localEndDate = utcToZonedTime(endDate, timezone);
      }
    }

    // Extrair nome do cliente da descrição ou attendees
    let clientName = null;
    
    // Tentar extrair de attendees
    if (event.attendee) {
      const attendees = Array.isArray(event.attendee) ? event.attendee : [event.attendee];
      const firstAttendee = attendees[0];
      
      if (firstAttendee) {
        if (typeof firstAttendee === 'string') {
          clientName = firstAttendee.replace(/mailto:/i, '');
        } else if (firstAttendee.params && firstAttendee.params.CN) {
          clientName = firstAttendee.params.CN;
        }
      }
    }

    // Tentar extrair da descrição
    if (!clientName && event.description) {
      const clientMatch = event.description.match(/Cliente:\s*(.+)/i);
      if (clientMatch) {
        clientName = clientMatch[1].trim();
      }
    }

    // Calcular duração em minutos
    let duration = 60; // Padrão: 1 hora
    if (localEndDate) {
      duration = Math.round((localEndDate - localStartDate) / (1000 * 60));
    }

    const appointment = {
      client_name: clientName || 'Cliente ICS',
      date: format(localStartDate, 'yyyy-MM-dd'),
      time: format(localStartDate, 'HH:mm'),
      end_time: localEndDate ? format(localEndDate, 'HH:mm') : null,
      title: event.summary || 'Evento ICS',
      service: event.summary || null,
      status: event.status?.toLowerCase() || 'scheduled',
      notes: event.description || null,
      duration: duration,
      ical_uid: event.uid || null,
      external_source: 'ics',
      external_id: event.uid || null,
      last_sync_date: new Date().toISOString()
    };

    // Informações adicionais
    if (event.location) {
      appointment.notes = appointment.notes 
        ? `${appointment.notes}\n\nLocal: ${event.location}`
        : `Local: ${event.location}`;
    }

    return appointment;
  } catch (error) {
    console.error('Erro ao mapear evento ICS:', error);
    return null;
  }
}

/**
 * Importa eventos de arquivo ICS
 * @param {object} db - Instância do banco de dados
 * @param {Buffer|string} data - Dados do arquivo ICS
 * @param {object} options - Opções de importação
 * @returns {Promise<object>} - Relatório de importação
 */
async function importFromIcs(db, data, options = {}) {
  const {
    skipDuplicates = false,
    timezone = 'America/Sao_Paulo',
    autoLinkClients = true
  } = options;

  const report = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Parse arquivo ICS
    const events = parseIcsFile(data);
    report.total = events.length;

    console.log(`📋 Total de eventos a processar: ${events.length}`);

    // Processar cada evento
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      try {
        // Mapear evento para agendamento
        const appointmentData = mapIcsEventToAppointment(event, timezone);
        
        if (!appointmentData) {
          report.skipped++;
          report.errors.push({
            event: i + 1,
            uid: event.uid,
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
              ical_uid, external_source, external_id, last_sync_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          uid: event.uid,
          reason: error.message
        });
      }
    }

    return report;
  } catch (error) {
    throw new Error(`Erro na importação ICS: ${error.message}`);
  }
}

/**
 * Preview de eventos do arquivo ICS
 * @param {Buffer|string} data - Dados do arquivo ICS
 * @param {string} timezone - Timezone padrão
 * @returns {object} - Preview com eventos
 */
function previewIcsFile(data, timezone = 'America/Sao_Paulo') {
  try {
    const events = parseIcsFile(data);
    
    const preview = events.slice(0, 10).map(event => {
      const mapped = mapIcsEventToAppointment(event, timezone);
      return {
        original: {
          summary: event.summary,
          start: event.start,
          end: event.end,
          description: event.description,
          location: event.location,
          uid: event.uid
        },
        mapped: mapped
      };
    });

    return {
      totalEvents: events.length,
      preview: preview
    };
  } catch (error) {
    throw new Error(`Erro ao fazer preview ICS: ${error.message}`);
  }
}

/**
 * Valida arquivo ICS
 * @param {Buffer|string} data - Dados do arquivo
 * @returns {object} - Resultado da validação
 */
function validateIcsFile(data) {
  try {
    const events = parseIcsFile(data);
    
    const validation = {
      valid: true,
      totalEvents: events.length,
      eventsWithDates: 0,
      eventsWithAttendees: 0,
      warnings: []
    };

    events.forEach(event => {
      if (event.start && event.end) {
        validation.eventsWithDates++;
      }
      
      if (event.attendee) {
        validation.eventsWithAttendees++;
      }
    });

    if (validation.totalEvents === 0) {
      validation.valid = false;
      validation.warnings.push('Nenhum evento encontrado no arquivo');
    }

    if (validation.eventsWithDates < validation.totalEvents) {
      validation.warnings.push(
        `${validation.totalEvents - validation.eventsWithDates} eventos sem datas`
      );
    }

    return validation;
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

module.exports = {
  importFromIcs,
  previewIcsFile,
  validateIcsFile,
  parseIcsFile,
  mapIcsEventToAppointment
};
