/**
 * Teste de integração: Fluxo completo de sincronização
 * Simula o ciclo completo desde a indexação até a sincronização multi-destino
 */

const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');

// Mock database
jest.mock('../database/database');

describe('Sync Flow Integration', () => {
  let app;
  let testBasePath;

  beforeAll(async () => {
    // Setup test environment
    testBasePath = path.join(__dirname, 'test-storage');
    await fs.ensureDir(testBasePath);

    // Import app after mocks
    app = require('../server');
  });

  afterAll(async () => {
    // Cleanup
    await fs.remove(testBasePath);
  });

  test('Complete sync flow: configure -> scan -> add destination -> sync', async () => {
    // 1. Configure local storage
    const configResponse = await request(app)
      .post('/api/local-storage/configure')
      .send({ basePath: testBasePath })
      .expect(200);

    expect(configResponse.body.base_path).toBe(testBasePath);

    // 2. Create test file
    const testFile = path.join(testBasePath, 'Client A', 'test.jpg');
    await fs.ensureDir(path.dirname(testFile));
    await fs.writeFile(testFile, 'test content');

    // 3. Scan directory
    const scanResponse = await request(app)
      .post('/api/local-storage/scan')
      .expect(200);

    expect(scanResponse.body.indexed).toBeGreaterThan(0);

    // 4. Add Google Drive destination
    const addDestResponse = await request(app)
      .post('/api/sync-destinations')
      .send({
        type: 'gdrive',
        name: 'Test Drive',
        config: { /* mock config */ }
      })
      .expect(201);

    const destinationId = addDestResponse.body.id;
    expect(destinationId).toBeDefined();

    // 5. Get list of files
    const filesResponse = await request(app)
      .get('/api/local-storage/files')
      .expect(200);

    expect(filesResponse.body.files).toHaveLength(1);
    const fileId = filesResponse.body.files[0].id;

    // 6. Sync file to destination
    const syncResponse = await request(app)
      .post(`/api/sync-multi/${fileId}`)
      .send({
        destinationIds: [destinationId],
        priority: 5
      })
      .expect(200);

    expect(syncResponse.body.queued).toBe(true);

    // 7. Check sync status
    const statusResponse = await request(app)
      .get(`/api/sync-multi/status/${fileId}`)
      .expect(200);

    expect(statusResponse.body.statuses).toBeDefined();
    expect(statusResponse.body.statuses.length).toBeGreaterThan(0);
  });

  test('Should handle multiple destinations', async () => {
    // Add multiple destinations
    const dest1 = await request(app)
      .post('/api/sync-destinations')
      .send({
        type: 'gdrive',
        name: 'Drive 1',
        config: {}
      })
      .expect(201);

    const dest2 = await request(app)
      .post('/api/sync-destinations')
      .send({
        type: 'gdrive',
        name: 'Drive 2',
        config: {}
      })
      .expect(201);

    // List destinations
    const listResponse = await request(app)
      .get('/api/sync-destinations')
      .expect(200);

    expect(listResponse.body.destinations.length).toBeGreaterThanOrEqual(2);
  });

  test('Should handle bulk sync', async () => {
    // Create multiple files
    const files = ['file1.jpg', 'file2.jpg', 'file3.jpg'];
    
    for (const file of files) {
      const filePath = path.join(testBasePath, 'Bulk Client', file);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, `content of ${file}`);
    }

    // Scan
    await request(app)
      .post('/api/local-storage/scan')
      .expect(200);

    // Get all files
    const filesResponse = await request(app)
      .get('/api/local-storage/files')
      .expect(200);

    const fileIds = filesResponse.body.files.map(f => f.id);

    // Bulk sync
    const bulkSyncResponse = await request(app)
      .post('/api/sync-multi/bulk')
      .send({
        fileIds: fileIds.slice(0, 3),
        destinationIds: [1, 2],
        priority: 7
      })
      .expect(200);

    expect(bulkSyncResponse.body.totalJobs).toBeGreaterThan(0);
  });

  test('Should handle sync queue operations', async () => {
    // Get queue status
    const queueResponse = await request(app)
      .get('/api/sync-multi/queue')
      .expect(200);

    expect(queueResponse.body.items).toBeDefined();
  });

  test('Should handle destination toggle', async () => {
    const destResponse = await request(app)
      .post('/api/sync-destinations')
      .send({
        type: 'qnap',
        name: 'Test QNAP',
        config: {
          host: '192.168.1.100',
          protocol: 'webdav',
          username: 'test',
          password: 'test',
          remotePath: '/'
        }
      })
      .expect(201);

    const destId = destResponse.body.id;

    // Toggle enabled
    await request(app)
      .put(`/api/sync-destinations/${destId}`)
      .send({ enabled: false })
      .expect(200);

    // Verify
    const listResponse = await request(app)
      .get('/api/sync-destinations')
      .expect(200);

    const destination = listResponse.body.destinations.find(d => d.id === destId);
    expect(destination.enabled).toBe(false);
  });
});

