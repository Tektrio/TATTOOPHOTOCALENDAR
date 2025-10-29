/**
 * Photo Service
 * Gerenciamento de fotos e galeria de tatuagens
 */

class PhotoService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Adicionar nova foto
   */
  async addPhoto(clientId, photoData) {
    const {
      project_id,
      session_id,
      photo_type,
      photo_url,
      thumbnail_url,
      taken_date,
      is_portfolio = false,
      client_approved = false,
      show_to_client = true,
      caption,
      tags
    } = photoData;

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO client_photos (
          client_id, project_id, session_id, photo_type,
          photo_url, thumbnail_url, taken_date, is_portfolio,
          client_approved, show_to_client, caption, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, project_id, session_id, photo_type,
        photo_url, thumbnail_url, taken_date, is_portfolio ? 1 : 0,
        client_approved ? 1 : 0, show_to_client ? 1 : 0, caption,
        JSON.stringify(tags || [])
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Obter fotos do cliente
   */
  async getClientPhotos(clientId, filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          p.*,
          pr.project_name,
          a.start_datetime as session_date
        FROM client_photos p
        LEFT JOIN client_projects pr ON p.project_id = pr.id
        LEFT JOIN appointments a ON p.session_id = a.id
        WHERE p.client_id = ?
      `;

      const params = [clientId];

      // Filtros opcionais
      if (filters.photo_type) {
        sql += ' AND p.photo_type = ?';
        params.push(filters.photo_type);
      }

      if (filters.project_id) {
        sql += ' AND p.project_id = ?';
        params.push(filters.project_id);
      }

      if (filters.is_portfolio) {
        sql += ' AND p.is_portfolio = 1';
      }

      if (filters.show_to_client !== undefined) {
        sql += ' AND p.show_to_client = ?';
        params.push(filters.show_to_client ? 1 : 0);
      }

      sql += ' ORDER BY p.upload_date DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Parse tags JSON
          rows = (rows || []).map(row => {
            if (row.tags) {
              try {
                row.tags = JSON.parse(row.tags);
              } catch (e) {
                row.tags = [];
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
   * Obter fotos de um projeto
   */
  async getProjectPhotos(projectId, photoType = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM client_photos
        WHERE project_id = ?
      `;

      const params = [projectId];

      if (photoType) {
        sql += ' AND photo_type = ?';
        params.push(photoType);
      }

      sql += ' ORDER BY taken_date DESC, upload_date DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          rows = (rows || []).map(row => {
            if (row.tags) {
              try {
                row.tags = JSON.parse(row.tags);
              } catch (e) {
                row.tags = [];
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
   * Marcar foto para portfólio
   */
  async togglePortfolio(photoId, isPortfolio) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_photos 
        SET is_portfolio = ?
        WHERE id = ?
      `, [isPortfolio ? 1 : 0, photoId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Aprovar foto pelo cliente
   */
  async approvePhoto(photoId, approved) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_photos 
        SET client_approved = ?
        WHERE id = ?
      `, [approved ? 1 : 0, photoId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Atualizar visibilidade da foto
   */
  async updateVisibility(photoId, showToClient) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_photos 
        SET show_to_client = ?
        WHERE id = ?
      `, [showToClient ? 1 : 0, photoId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Atualizar caption e tags
   */
  async updatePhotoMetadata(photoId, caption, tags) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_photos 
        SET caption = ?, tags = ?
        WHERE id = ?
      `, [caption, JSON.stringify(tags || []), photoId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Deletar foto
   */
  async deletePhoto(photoId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM client_photos WHERE id = ?
      `, [photoId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter estatísticas de fotos
   */
  async getPhotoStats(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          COUNT(*) as total_photos,
          SUM(CASE WHEN photo_type = 'before' THEN 1 ELSE 0 END) as before_photos,
          SUM(CASE WHEN photo_type = 'after' THEN 1 ELSE 0 END) as after_photos,
          SUM(CASE WHEN photo_type = 'during' THEN 1 ELSE 0 END) as during_photos,
          SUM(CASE WHEN photo_type = 'healing' THEN 1 ELSE 0 END) as healing_photos,
          SUM(CASE WHEN is_portfolio = 1 THEN 1 ELSE 0 END) as portfolio_photos,
          SUM(CASE WHEN client_approved = 1 THEN 1 ELSE 0 END) as approved_photos
        FROM client_photos
        WHERE client_id = ?
      `, [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Obter galeria de portfólio (fotos públicas)
   */
  async getPortfolioGallery(artistId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          p.*,
          c.name as client_name,
          pr.project_name,
          pr.style,
          pr.artist_id
        FROM client_photos p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN client_projects pr ON p.project_id = pr.id
        WHERE p.is_portfolio = 1 AND p.client_approved = 1
      `;

      const params = [];

      if (artistId) {
        sql += ' AND pr.artist_id = ?';
        params.push(artistId);
      }

      sql += ' ORDER BY p.upload_date DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = PhotoService;

