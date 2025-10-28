/**
 * Project Service
 * Gerenciamento de projetos de tatuagem dos clientes
 */

class ProjectService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Criar novo projeto
   */
  async createProject(clientId, projectData) {
    const {
      artist_id,
      project_name,
      description,
      body_location,
      size_category,
      style,
      color_type = 'color',
      total_sessions_planned,
      total_hours_planned,
      estimated_cost,
      sketch_url,
      reference_urls,
      notes
    } = projectData;

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO client_projects (
          client_id, artist_id, project_name, description,
          body_location, size_category, style, color_type,
          total_sessions_planned, total_hours_planned, estimated_cost,
          sketch_url, reference_urls, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, artist_id, project_name, description,
        body_location, size_category, style, color_type,
        total_sessions_planned, total_hours_planned, estimated_cost,
        sketch_url, JSON.stringify(reference_urls || []), notes
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Atualizar progresso do projeto
   */
  async updateProgress(projectId, sessionsCompleted, hoursSpent, amountPaid = 0) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_projects 
        SET 
          sessions_completed = sessions_completed + ?,
          total_hours_spent = total_hours_spent + ?,
          total_paid = total_paid + ?,
          updated_at = CURRENT_TIMESTAMP,
          status = CASE 
            WHEN sessions_completed + ? >= total_sessions_planned THEN 'completed'
            WHEN sessions_completed + ? > 0 THEN 'in_progress'
            ELSE status
          END
        WHERE id = ?
      `, [sessionsCompleted, hoursSpent, amountPaid, sessionsCompleted, sessionsCompleted, projectId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter detalhes do projeto
   */
  async getProjectDetails(projectId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          p.*,
          c.name as client_name,
          c.email as client_email,
          (SELECT COUNT(*) FROM client_photos WHERE project_id = p.id) as photo_count
        FROM client_projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.id = ?
      `, [projectId], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.reference_urls) {
            try {
              row.reference_urls = JSON.parse(row.reference_urls);
            } catch (e) {
              row.reference_urls = [];
            }
          }
          resolve(row);
        }
      });
    });
  }

  /**
   * Obter projetos do cliente
   */
  async getClientProjects(clientId, status = 'all') {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM client_photos WHERE project_id = p.id AND photo_type = 'after') as completed_photos,
          (p.sessions_completed * 100.0 / NULLIF(p.total_sessions_planned, 0)) as progress_percentage
        FROM client_projects p
        WHERE p.client_id = ?
      `;

      const params = [clientId];

      if (status !== 'all') {
        sql += ' AND p.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY p.created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Parse reference_urls JSON
          rows = (rows || []).map(row => {
            if (row.reference_urls) {
              try {
                row.reference_urls = JSON.parse(row.reference_urls);
              } catch (e) {
                row.reference_urls = [];
              }
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  /**
   * Marcar projeto como completo
   */
  async completeProject(projectId, completionDate = null) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_projects 
        SET 
          status = 'completed',
          completion_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [completionDate || new Date().toISOString(), projectId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Atualizar projeto
   */
  async updateProject(projectId, updateData) {
    const fields = [];
    const values = [];

    // Campos permitidos para atualização
    const allowedFields = [
      'project_name', 'description', 'body_location', 'size_category',
      'style', 'color_type', 'total_sessions_planned', 'total_hours_planned',
      'estimated_cost', 'sketch_url', 'reference_urls', 'notes', 'status'
    ];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        // Se for reference_urls, fazer JSON.stringify
        if (key === 'reference_urls' && Array.isArray(updateData[key])) {
          values.push(JSON.stringify(updateData[key]));
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      return Promise.resolve({ success: true, message: 'No fields to update' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(projectId);

    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_projects 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Deletar projeto
   */
  async deleteProject(projectId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM client_projects WHERE id = ?
      `, [projectId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter estatísticas de projetos
   */
  async getProjectStats(clientId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          COUNT(*) as total_projects,
          SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused,
          SUM(estimated_cost) as total_estimated_revenue,
          SUM(total_paid) as total_actual_revenue,
          SUM(total_hours_spent) as total_hours,
          AVG(total_hours_spent * 1.0 / NULLIF(sessions_completed, 0)) as avg_hours_per_session
        FROM client_projects
      `;

      const params = [];
      if (clientId) {
        sql += ' WHERE client_id = ?';
        params.push(clientId);
      }

      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = ProjectService;

