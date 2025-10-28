const db = require('../config/database');

/**
 * Service para gerenciar preferências dos clientes
 * Preferências de contato, notificações, agendamento, etc.
 */

/**
 * Buscar preferências de um cliente
 */
async function getClientPreferences(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM client_preferences WHERE client_id = ?',
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

/**
 * Criar ou atualizar preferências do cliente
 */
async function upsertClientPreferences(clientId, preferences) {
  // Verificar se já existe
  const existing = await getClientPreferences(clientId);

  if (existing) {
    // Update
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE client_preferences SET
          preferred_contact_method = ?,
          preferred_contact_time = ?,
          notification_appointment_reminder = ?,
          notification_appointment_confirm = ?,
          notification_followup = ?,
          notification_marketing = ?,
          preferred_session_duration = ?,
          preferred_days_of_week = ?,
          preferred_time_of_day = ?,
          avoid_days_of_week = ?,
          preferred_artist_id = ?,
          preferred_payment_method = ?,
          preferred_language = ?,
          accessibility_needs = ?,
          dietary_restrictions = ?,
          music_preferences = ?,
          temperature_preference = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE client_id = ?`,
        [
          preferences.preferred_contact_method || 'email',
          preferences.preferred_contact_time || null,
          preferences.notification_appointment_reminder !== undefined ? preferences.notification_appointment_reminder : 1,
          preferences.notification_appointment_confirm !== undefined ? preferences.notification_appointment_confirm : 1,
          preferences.notification_followup !== undefined ? preferences.notification_followup : 1,
          preferences.notification_marketing !== undefined ? preferences.notification_marketing : 0,
          preferences.preferred_session_duration || 120,
          preferences.preferred_days_of_week ? JSON.stringify(preferences.preferred_days_of_week) : null,
          preferences.preferred_time_of_day || null,
          preferences.avoid_days_of_week ? JSON.stringify(preferences.avoid_days_of_week) : null,
          preferences.preferred_artist_id || null,
          preferences.preferred_payment_method || null,
          preferences.preferred_language || 'pt-BR',
          preferences.accessibility_needs || null,
          preferences.dietary_restrictions || null,
          preferences.music_preferences || null,
          preferences.temperature_preference || 'normal',
          preferences.notes || null,
          clientId
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: existing.id, updated: true });
        }
      );
    });
  } else {
    // Insert
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO client_preferences (
          client_id,
          preferred_contact_method,
          preferred_contact_time,
          notification_appointment_reminder,
          notification_appointment_confirm,
          notification_followup,
          notification_marketing,
          preferred_session_duration,
          preferred_days_of_week,
          preferred_time_of_day,
          avoid_days_of_week,
          preferred_artist_id,
          preferred_payment_method,
          preferred_language,
          accessibility_needs,
          dietary_restrictions,
          music_preferences,
          temperature_preference,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          preferences.preferred_contact_method || 'email',
          preferences.preferred_contact_time || null,
          preferences.notification_appointment_reminder !== undefined ? preferences.notification_appointment_reminder : 1,
          preferences.notification_appointment_confirm !== undefined ? preferences.notification_appointment_confirm : 1,
          preferences.notification_followup !== undefined ? preferences.notification_followup : 1,
          preferences.notification_marketing !== undefined ? preferences.notification_marketing : 0,
          preferences.preferred_session_duration || 120,
          preferences.preferred_days_of_week ? JSON.stringify(preferences.preferred_days_of_week) : null,
          preferences.preferred_time_of_day || null,
          preferences.avoid_days_of_week ? JSON.stringify(preferences.avoid_days_of_week) : null,
          preferences.preferred_artist_id || null,
          preferences.preferred_payment_method || null,
          preferences.preferred_language || 'pt-BR',
          preferences.accessibility_needs || null,
          preferences.dietary_restrictions || null,
          preferences.music_preferences || null,
          preferences.temperature_preference || 'normal',
          preferences.notes || null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, created: true });
        }
      );
    });
  }
}

/**
 * Deletar preferências de um cliente
 */
async function deleteClientPreferences(clientId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM client_preferences WHERE client_id = ?',
      [clientId],
      function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes > 0 });
      }
    );
  });
}

module.exports = {
  getClientPreferences,
  upsertClientPreferences,
  deleteClientPreferences
};

