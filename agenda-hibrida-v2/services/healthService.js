/**
 * Health Service
 * Gerenciamento de informações de saúde dos clientes
 */

class HealthService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Criar ou atualizar informações de saúde
   */
  async upsertHealthInfo(clientId, healthData) {
    const {
      allergies = [],
      medical_conditions = [],
      medications = [],
      blood_type,
      has_diabetes = false,
      has_hemophilia = false,
      has_keloid_tendency = false,
      has_skin_conditions = false,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      contraindications = [],
      special_notes
    } = healthData;

    return new Promise((resolve, reject) => {
      // Verificar se já existe
      this.db.get(`
        SELECT id FROM client_health WHERE client_id = ?
      `, [clientId], (err, existing) => {
        if (err) return reject(err);

        const params = [
          JSON.stringify(allergies),
          JSON.stringify(medical_conditions),
          JSON.stringify(medications),
          blood_type,
          has_diabetes ? 1 : 0,
          has_hemophilia ? 1 : 0,
          has_keloid_tendency ? 1 : 0,
          has_skin_conditions ? 1 : 0,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relation,
          JSON.stringify(contraindications),
          special_notes
        ];

        if (existing) {
          // UPDATE
          this.db.run(`
            UPDATE client_health SET
              allergies = ?,
              medical_conditions = ?,
              medications = ?,
              blood_type = ?,
              has_diabetes = ?,
              has_hemophilia = ?,
              has_keloid_tendency = ?,
              has_skin_conditions = ?,
              emergency_contact_name = ?,
              emergency_contact_phone = ?,
              emergency_contact_relation = ?,
              contraindications = ?,
              special_notes = ?,
              last_updated = CURRENT_TIMESTAMP
            WHERE client_id = ?
          `, [...params, clientId], (err) => {
            if (err) reject(err);
            else resolve({ id: existing.id, updated: true });
          });
        } else {
          // INSERT
          this.db.run(`
            INSERT INTO client_health (
              client_id, allergies, medical_conditions, medications,
              blood_type, has_diabetes, has_hemophilia, has_keloid_tendency,
              has_skin_conditions, emergency_contact_name, emergency_contact_phone,
              emergency_contact_relation, contraindications, special_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [clientId, ...params], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, created: true });
          });
        }
      });
    });
  }

  /**
   * Obter informações de saúde do cliente
   */
  async getHealthInfo(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM client_health WHERE client_id = ?
      `, [clientId], (err, row) => {
        if (err) return reject(err);
        
        if (row) {
          // Parse JSON fields
          try {
            row.allergies = JSON.parse(row.allergies || '[]');
            row.medical_conditions = JSON.parse(row.medical_conditions || '[]');
            row.medications = JSON.parse(row.medications || '[]');
            row.contraindications = JSON.parse(row.contraindications || '[]');
          } catch (e) {
            // Se houver erro no parse, manter como arrays vazios
            row.allergies = [];
            row.medical_conditions = [];
            row.medications = [];
            row.contraindications = [];
          }
          
          // Converter flags para boolean
          row.has_diabetes = !!row.has_diabetes;
          row.has_hemophilia = !!row.has_hemophilia;
          row.has_keloid_tendency = !!row.has_keloid_tendency;
          row.has_skin_conditions = !!row.has_skin_conditions;
        }
        
        resolve(row);
      });
    });
  }

  /**
   * Verificar riscos de saúde (alerta antes de sessão)
   */
  async checkHealthRisks(clientId) {
    return new Promise((resolve, reject) => {
      this.getHealthInfo(clientId)
        .then(healthInfo => {
          if (!healthInfo) {
            return resolve({
              hasRisks: false,
              hasWarnings: false,
              hasInfoMissing: true,
              risks: [],
              warnings: [],
              message: 'Informações de saúde não cadastradas'
            });
          }

          const risks = [];
          const warnings = [];

          // RISCOS CRÍTICOS
          if (healthInfo.has_hemophilia) {
            risks.push({
              level: 'critical',
              type: 'hemophilia',
              message: 'Cliente tem hemofilia - ALTO RISCO DE SANGRAMENTO'
            });
          }

          if (healthInfo.contraindications && healthInfo.contraindications.length > 0) {
            risks.push({
              level: 'critical',
              type: 'contraindications',
              message: `Contraindicações: ${healthInfo.contraindications.join(', ')}`
            });
          }

          // AVISOS
          if (healthInfo.has_diabetes) {
            warnings.push({
              level: 'warning',
              type: 'diabetes',
              message: 'Cliente tem diabetes - cuidado com cicatrização'
            });
          }

          if (healthInfo.has_keloid_tendency) {
            warnings.push({
              level: 'warning',
              type: 'keloid',
              message: 'Cliente tem tendência a queloides'
            });
          }

          if (healthInfo.has_skin_conditions) {
            warnings.push({
              level: 'warning',
              type: 'skin',
              message: 'Cliente tem condições de pele - verificar área'
            });
          }

          if (healthInfo.allergies && healthInfo.allergies.length > 0) {
            warnings.push({
              level: 'warning',
              type: 'allergies',
              message: `Alergias: ${healthInfo.allergies.join(', ')}`
            });
          }

          if (healthInfo.medications && healthInfo.medications.length > 0) {
            warnings.push({
              level: 'info',
              type: 'medications',
              message: `Medicações: ${healthInfo.medications.join(', ')}`
            });
          }

          resolve({
            hasRisks: risks.length > 0,
            hasWarnings: warnings.length > 0,
            hasInfoMissing: false,
            risks,
            warnings,
            healthInfo
          });
        })
        .catch(reject);
    });
  }

  /**
   * Adicionar alergia
   */
  async addAllergy(clientId, allergy) {
    return this._addToArray(clientId, 'allergies', allergy);
  }

  /**
   * Adicionar condição médica
   */
  async addMedicalCondition(clientId, condition) {
    return this._addToArray(clientId, 'medical_conditions', condition);
  }

  /**
   * Adicionar medicação
   */
  async addMedication(clientId, medication) {
    return this._addToArray(clientId, 'medications', medication);
  }

  /**
   * Remover alergia
   */
  async removeAllergy(clientId, allergy) {
    return this._removeFromArray(clientId, 'allergies', allergy);
  }

  /**
   * Função auxiliar para adicionar item a array JSON
   */
  async _addToArray(clientId, field, value) {
    return new Promise((resolve, reject) => {
      this.getHealthInfo(clientId)
        .then(healthInfo => {
          if (!healthInfo) {
            return reject(new Error('Health info not found'));
          }

          const array = healthInfo[field] || [];
          if (!array.includes(value)) {
            array.push(value);
          }

          this.db.run(`
            UPDATE client_health 
            SET ${field} = ?, last_updated = CURRENT_TIMESTAMP
            WHERE client_id = ?
          `, [JSON.stringify(array), clientId], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
          });
        })
        .catch(reject);
    });
  }

  /**
   * Função auxiliar para remover item de array JSON
   */
  async _removeFromArray(clientId, field, value) {
    return new Promise((resolve, reject) => {
      this.getHealthInfo(clientId)
        .then(healthInfo => {
          if (!healthInfo) {
            return reject(new Error('Health info not found'));
          }

          const array = (healthInfo[field] || []).filter(item => item !== value);

          this.db.run(`
            UPDATE client_health 
            SET ${field} = ?, last_updated = CURRENT_TIMESTAMP
            WHERE client_id = ?
          `, [JSON.stringify(array), clientId], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
          });
        })
        .catch(reject);
    });
  }

  /**
   * Deletar informações de saúde
   */
  async deleteHealthInfo(clientId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM client_health WHERE client_id = ?
      `, [clientId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
}

module.exports = HealthService;

