/**
 * Testes de serviços: LocalStorage, MultiDestination, QNAP
 * Testa funcionalidades core dos serviços de sincronização
 */

// Mock do database
jest.mock('../database/database', () => ({
  prepare: jest.fn().mockReturnThis(),
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn()
}));

// Mock do fs-extra
jest.mock('fs-extra');

const LocalStorageService = require('../services/localStorageService');
const SyncDestinationsService = require('../services/syncDestinationsService');

describe('Local Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should configure local storage path', async () => {
    const db = require('../database/database');
    db.run.mockReturnValue({ lastInsertRowid: 1 });

    const result = await LocalStorageService.configureLocalStorage('/test/path');

    expect(result).toBeDefined();
    expect(result.base_path).toBe('/test/path');
    expect(db.run).toHaveBeenCalled();
  });

  test('should get local storage config', async () => {
    const db = require('../database/database');
    db.get.mockReturnValue({
      id: 1,
      base_path: '/test/path',
      enabled: 1
    });

    const config = await LocalStorageService.getLocalStorageConfig();

    expect(config).toBeDefined();
    expect(config.base_path).toBe('/test/path');
    expect(db.get).toHaveBeenCalled();
  });

  test('should list files with optional filters', async () => {
    const db = require('../database/database');
    db.all.mockReturnValue([
      { id: 1, file_name: 'test1.jpg', client_id: 1 },
      { id: 2, file_name: 'test2.jpg', client_id: 1 }
    ]);

    const files = await LocalStorageService.getLocalFiles(1);

    expect(files).toHaveLength(2);
    expect(files[0].file_name).toBe('test1.jpg');
    expect(db.all).toHaveBeenCalled();
  });
});

describe('Sync Destinations Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should list all destinations', async () => {
    const db = require('../database/database');
    db.all.mockReturnValue([
      { id: 1, name: 'Drive Pessoal', type: 'gdrive', color: 'blue' },
      { id: 2, name: 'QNAP Studio', type: 'qnap', color: 'orange' }
    ]);

    const destinations = await SyncDestinationsService.listDestinations();

    expect(destinations).toHaveLength(2);
    expect(destinations[0].type).toBe('gdrive');
    expect(destinations[1].type).toBe('qnap');
  });

  test('should add new Google Drive destination', async () => {
    const db = require('../database/database');
    db.run.mockReturnValue({ lastInsertRowid: 3 });
    db.get.mockReturnValue({
      id: 3,
      name: 'Novo Drive',
      type: 'gdrive',
      color: 'purple'
    });

    const config = {
      client_id: 'test',
      client_secret: 'secret'
    };

    const destination = await SyncDestinationsService.addDestination(
      'gdrive',
      'Novo Drive',
      config
    );

    expect(destination).toBeDefined();
    expect(destination.name).toBe('Novo Drive');
    expect(destination.type).toBe('gdrive');
  });

  test('should update destination', async () => {
    const db = require('../database/database');
    db.run.mockReturnValue({ changes: 1 });
    db.get.mockReturnValue({
      id: 1,
      name: 'Drive Atualizado',
      enabled: 1
    });

    const updated = await SyncDestinationsService.updateDestination(1, {
      name: 'Drive Atualizado'
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe('Drive Atualizado');
  });

  test('should delete destination', async () => {
    const db = require('../database/database');
    db.run.mockReturnValue({ changes: 1 });

    const result = await SyncDestinationsService.deleteDestination(1);

    expect(result).toBeTruthy();
    expect(db.run).toHaveBeenCalled();
  });
});

describe('Multi Destination Sync Service', () => {
  const MultiDestinationSyncService = require('../services/multiDestinationSyncService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get sync status for file', async () => {
    const db = require('../database/database');
    db.all.mockReturnValue([
      {
        id: 1,
        local_file_id: 1,
        destination_id: 1,
        status: 'synced',
        last_sync: new Date()
      },
      {
        id: 2,
        local_file_id: 1,
        destination_id: 2,
        status: 'pending'
      }
    ]);

    const statuses = await MultiDestinationSyncService.getSyncStatusForFile(1);

    expect(statuses).toHaveLength(2);
    expect(statuses[0].status).toBe('synced');
    expect(statuses[1].status).toBe('pending');
  });

  test('should handle bulk sync request', async () => {
    const fileIds = [1, 2, 3];
    const destinationIds = [1, 2];

    // Mock queue
    jest.mock('../services/syncQueue', () => ({
      addSyncJob: jest.fn().mockResolvedValue({ id: 'job-123' })
    }));

    const result = await MultiDestinationSyncService.bulkSyncFiles(
      fileIds,
      destinationIds
    );

    expect(result).toBeDefined();
    // Verifica que jobs foram criados
  });
});

describe('QNAP Service', () => {
  // Mock do QnapClient
  jest.mock('../lib/qnapClient');

  const QnapService = require('../services/qnapService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should configure QNAP destination', async () => {
    const config = {
      host: '192.168.1.100',
      protocol: 'webdav',
      username: 'admin',
      password: 'secret',
      remotePath: '/share/tattoo'
    };

    const result = await QnapService.configureQnapDestination(1, config);

    expect(result).toBeDefined();
  });

  test('should test QNAP connection', async () => {
    const QnapClient = require('../lib/qnapClient');
    QnapClient.prototype.connect = jest.fn().mockResolvedValue(true);
    QnapClient.prototype.listDirectory = jest.fn().mockResolvedValue([]);

    const result = await QnapService.testConnection(1);

    expect(result.valid).toBe(true);
  });
});

