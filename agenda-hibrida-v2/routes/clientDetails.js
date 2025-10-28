/**
 * Client Details Routes
 * Routes para gerenciar todas as abas do perfil do cliente
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/client-photos'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware para injetar services no req
router.use((req, res, next) => {
  const WaitingListService = require('../services/waitingListService');
  const ProjectService = require('../services/projectService');
  const PhotoService = require('../services/photoService');
  const DocumentService = require('../services/documentService');
  const HealthService = require('../services/healthService');
  const CommunicationService = require('../services/communicationService');
  const analyticsService = require('../services/analyticsService');

  req.services = {
    waitingList: new WaitingListService(req.app.get('db')),
    project: new ProjectService(req.app.get('db')),
    photo: new PhotoService(req.app.get('db')),
    analytics: analyticsService,
    document: new DocumentService(req.app.get('db')),
    health: new HealthService(req.app.get('db')),
    communication: new CommunicationService(req.app.get('db'))
  };

  next();
});

// ============================================
// WAITING LIST ROUTES
// ============================================

// GET /api/clients/:clientId/waiting-list
router.get('/:clientId/waiting-list', async (req, res) => {
  try {
    const { status } = req.query;
    const items = await req.services.waitingList.getClientWaitingList(
      req.params.clientId,
      status
    );
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/waiting-list
router.post('/:clientId/waiting-list', async (req, res) => {
  try {
    const result = await req.services.waitingList.addToWaitingList(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding to waiting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/waiting-list/:id
router.put('/:clientId/waiting-list/:id', async (req, res) => {
  try {
    const result = await req.services.waitingList.updateWaitingListItem(
      req.params.id,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating waiting list item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:clientId/waiting-list/:id
router.delete('/:clientId/waiting-list/:id', async (req, res) => {
  try {
    const result = await req.services.waitingList.removeFromWaitingList(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error removing from waiting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/waiting-list/:id/schedule
router.post('/:clientId/waiting-list/:id/schedule', async (req, res) => {
  try {
    const result = await req.services.waitingList.scheduleFromWaitingList(
      req.params.id,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error scheduling from waiting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/waiting-list/reorder
router.put('/:clientId/waiting-list/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    const result = await req.services.waitingList.reorderPriorities(
      req.params.clientId,
      orderedIds
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error reordering waiting list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/waiting-list/stats
router.get('/:clientId/waiting-list/stats', async (req, res) => {
  try {
    const stats = await req.services.waitingList.getWaitingListStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching waiting list stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PROJECT ROUTES
// ============================================

// GET /api/clients/:clientId/projects
router.get('/:clientId/projects', async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const projects = await req.services.project.getClientProjects(
      req.params.clientId,
      status
    );
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/projects/:projectId
router.get('/:clientId/projects/:projectId', async (req, res) => {
  try {
    const project = await req.services.project.getProjectDetails(req.params.projectId);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/projects
router.post('/:clientId/projects', async (req, res) => {
  try {
    const result = await req.services.project.createProject(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/projects/:projectId
router.put('/:clientId/projects/:projectId', async (req, res) => {
  try {
    const result = await req.services.project.updateProject(
      req.params.projectId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/projects/:projectId/progress
router.put('/:clientId/projects/:projectId/progress', async (req, res) => {
  try {
    const { sessionsCompleted, hoursSpent, amountPaid } = req.body;
    const result = await req.services.project.updateProgress(
      req.params.projectId,
      sessionsCompleted,
      hoursSpent,
      amountPaid
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating project progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/projects/:projectId/complete
router.put('/:clientId/projects/:projectId/complete', async (req, res) => {
  try {
    const { completionDate } = req.body;
    const result = await req.services.project.completeProject(
      req.params.projectId,
      completionDate
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:clientId/projects/:projectId
router.delete('/:clientId/projects/:projectId', async (req, res) => {
  try {
    const result = await req.services.project.deleteProject(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/projects/stats
router.get('/:clientId/projects/stats', async (req, res) => {
  try {
    const stats = await req.services.project.getProjectStats(req.params.clientId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHOTO ROUTES
// ============================================

// GET /api/clients/:clientId/photos
router.get('/:clientId/photos', async (req, res) => {
  try {
    const filters = {
      photo_type: req.query.photo_type,
      project_id: req.query.project_id,
      is_portfolio: req.query.is_portfolio === 'true',
      show_to_client: req.query.show_to_client === 'true' ? true : req.query.show_to_client === 'false' ? false : undefined
    };
    
    const photos = await req.services.photo.getClientPhotos(
      req.params.clientId,
      filters
    );
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/photos
router.post('/:clientId/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhuma foto enviada' });
    }

    const photoData = {
      ...req.body,
      photo_url: `/uploads/client-photos/${req.file.filename}`,
      thumbnail_url: `/uploads/client-photos/${req.file.filename}` // TODO: gerar thumbnail
    };

    const result = await req.services.photo.addPhoto(
      req.params.clientId,
      photoData
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/photos/:photoId/portfolio
router.put('/:clientId/photos/:photoId/portfolio', async (req, res) => {
  try {
    const { isPortfolio } = req.body;
    const result = await req.services.photo.togglePortfolio(
      req.params.photoId,
      isPortfolio
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error toggling portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/photos/:photoId/approve
router.put('/:clientId/photos/:photoId/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const result = await req.services.photo.approvePhoto(
      req.params.photoId,
      approved
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/photos/:photoId/visibility
router.put('/:clientId/photos/:photoId/visibility', async (req, res) => {
  try {
    const { showToClient } = req.body;
    const result = await req.services.photo.updateVisibility(
      req.params.photoId,
      showToClient
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/photos/:photoId/metadata
router.put('/:clientId/photos/:photoId/metadata', async (req, res) => {
  try {
    const { caption, tags } = req.body;
    const result = await req.services.photo.updatePhotoMetadata(
      req.params.photoId,
      caption,
      tags
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating photo metadata:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:clientId/photos/:photoId
router.delete('/:clientId/photos/:photoId', async (req, res) => {
  try {
    const result = await req.services.photo.deletePhoto(req.params.photoId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/photos/stats
router.get('/:clientId/photos/stats', async (req, res) => {
  try {
    const stats = await req.services.photo.getPhotoStats(req.params.clientId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching photo stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DOCUMENT ROUTES
// ============================================

// GET /api/clients/:clientId/documents
router.get('/:clientId/documents', async (req, res) => {
  try {
    const { onlyValid } = req.query;
    const documents = await req.services.document.getClientDocuments(
      req.params.clientId,
      onlyValid === 'true'
    );
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/documents
router.post('/:clientId/documents', async (req, res) => {
  try {
    const result = await req.services.document.addDocument(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/documents/:documentType/validity
router.get('/:clientId/documents/:documentType/validity', async (req, res) => {
  try {
    const validity = await req.services.document.checkDocumentValidity(
      req.params.clientId,
      req.params.documentType
    );
    res.json({ success: true, data: validity });
  } catch (error) {
    console.error('Error checking document validity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/documents/:documentId/invalidate
router.put('/:clientId/documents/:documentId/invalidate', async (req, res) => {
  try {
    const result = await req.services.document.invalidateDocument(req.params.documentId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error invalidating document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/documents/:documentId/renew
router.post('/:clientId/documents/:documentId/renew', async (req, res) => {
  try {
    const result = await req.services.document.renewDocument(
      req.params.documentId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error renewing document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/documents/stats
router.get('/:clientId/documents/stats', async (req, res) => {
  try {
    const stats = await req.services.document.getDocumentStats(req.params.clientId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/documents/completeness
router.get('/:clientId/documents/completeness', async (req, res) => {
  try {
    const completeness = await req.services.document.checkDocumentCompleteness(req.params.clientId);
    res.json({ success: true, data: completeness });
  } catch (error) {
    console.error('Error checking document completeness:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// HEALTH ROUTES
// ============================================

// GET /api/clients/:clientId/health
router.get('/:clientId/health', async (req, res) => {
  try {
    const healthInfo = await req.services.health.getHealthInfo(req.params.clientId);
    res.json({ success: true, data: healthInfo });
  } catch (error) {
    console.error('Error fetching health info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/health
// PUT /api/clients/:clientId/health
router.post('/:clientId/health', async (req, res) => {
  try {
    const result = await req.services.health.upsertHealthInfo(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error upserting health info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:clientId/health', async (req, res) => {
  try {
    const result = await req.services.health.upsertHealthInfo(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error upserting health info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/health/risks
router.get('/:clientId/health/risks', async (req, res) => {
  try {
    const risks = await req.services.health.checkHealthRisks(req.params.clientId);
    res.json({ success: true, data: risks });
  } catch (error) {
    console.error('Error checking health risks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:clientId/health
router.delete('/:clientId/health', async (req, res) => {
  try {
    const result = await req.services.health.deleteHealthInfo(req.params.clientId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting health info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// COMMUNICATION ROUTES
// ============================================

// GET /api/clients/:clientId/communications
router.get('/:clientId/communications', async (req, res) => {
  try {
    const filters = {
      communication_type: req.query.communication_type,
      direction: req.query.direction,
      is_important: req.query.is_important === 'true' ? true : req.query.is_important === 'false' ? false : undefined,
      is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const communications = await req.services.communication.getClientTimeline(
      req.params.clientId,
      filters
    );
    res.json({ success: true, data: communications });
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients/:clientId/communications
router.post('/:clientId/communications', async (req, res) => {
  try {
    const result = await req.services.communication.addCommunication(
      req.params.clientId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding communication:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/communications/:commId/read
router.put('/:clientId/communications/:commId/read', async (req, res) => {
  try {
    const { isRead } = req.body;
    const result = await req.services.communication.markAsRead(
      req.params.commId,
      isRead !== undefined ? isRead : true
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/communications/mark-all-read
router.put('/:clientId/communications/mark-all-read', async (req, res) => {
  try {
    const result = await req.services.communication.markAllAsRead(req.params.clientId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/communications/:commId/important
router.put('/:clientId/communications/:commId/important', async (req, res) => {
  try {
    const { isImportant } = req.body;
    const result = await req.services.communication.toggleImportant(
      req.params.commId,
      isImportant
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error toggling important:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:clientId/communications/:commId
router.put('/:clientId/communications/:commId', async (req, res) => {
  try {
    const result = await req.services.communication.updateCommunication(
      req.params.commId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:clientId/communications/:commId
router.delete('/:clientId/communications/:commId', async (req, res) => {
  try {
    const result = await req.services.communication.deleteCommunication(req.params.commId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting communication:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/communications/stats
router.get('/:clientId/communications/stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const stats = await req.services.communication.getCommunicationStats(
      req.params.clientId,
      period
    );
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/communications/search
router.get('/:clientId/communications/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }
    const results = await req.services.communication.searchCommunications(
      req.params.clientId,
      q
    );
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching communications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// ANALYTICS ROUTES
// ======================

// GET /api/clients/:clientId/metrics
router.get('/:clientId/metrics', async (req, res) => {
  try {
    const metrics = await req.services.analytics.getClientMetrics(req.params.clientId);
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching client metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/financial-history
router.get('/:clientId/financial-history', async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    const history = await req.services.analytics.getFinancialHistory(req.params.clientId, period);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching financial history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:clientId/frequent-services
router.get('/:clientId/frequent-services', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const services = await req.services.analytics.getMostFrequentServices(req.params.clientId, parseInt(limit));
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching frequent services:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

