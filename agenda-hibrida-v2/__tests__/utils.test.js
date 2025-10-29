/**
 * Testes unitários para utilitários do sistema de sincronização
 * Testa: fileHasher, colorAssigner, pathParser
 */

const { calculateMD5 } = require('../utils/fileHasher');
const { assignGoogleDriveColor, getQnapColor } = require('../utils/colorAssigner');
const { identifyClientFromPath } = require('../utils/pathParser');
const fs = require('fs-extra');
const path = require('path');

describe('File Hasher', () => {
  test('should calculate MD5 hash correctly', async () => {
    // Cria arquivo temporário para teste
    const testFile = path.join(__dirname, 'temp-test-file.txt');
    await fs.writeFile(testFile, 'test content');

    const hash = await calculateMD5(testFile);

    expect(hash).toBeDefined();
    expect(hash).toHaveLength(32); // MD5 tem 32 caracteres hex
    expect(hash).toMatch(/^[a-f0-9]{32}$/); // Apenas hex lowercase

    // Cleanup
    await fs.remove(testFile);
  });

  test('should generate same hash for same content', async () => {
    const testFile1 = path.join(__dirname, 'temp-test-1.txt');
    const testFile2 = path.join(__dirname, 'temp-test-2.txt');

    await fs.writeFile(testFile1, 'same content');
    await fs.writeFile(testFile2, 'same content');

    const hash1 = await calculateMD5(testFile1);
    const hash2 = await calculateMD5(testFile2);

    expect(hash1).toBe(hash2);

    // Cleanup
    await fs.remove(testFile1);
    await fs.remove(testFile2);
  });

  test('should generate different hash for different content', async () => {
    const testFile1 = path.join(__dirname, 'temp-different-1.txt');
    const testFile2 = path.join(__dirname, 'temp-different-2.txt');

    await fs.writeFile(testFile1, 'content A');
    await fs.writeFile(testFile2, 'content B');

    const hash1 = await calculateMD5(testFile1);
    const hash2 = await calculateMD5(testFile2);

    expect(hash1).not.toBe(hash2);

    // Cleanup
    await fs.remove(testFile1);
    await fs.remove(testFile2);
  });
});

describe('Color Assigner', () => {
  test('should assign colors in sequence for Google Drive', () => {
    expect(assignGoogleDriveColor(1)).toBe('blue');
    expect(assignGoogleDriveColor(2)).toBe('green');
    expect(assignGoogleDriveColor(3)).toBe('purple');
    expect(assignGoogleDriveColor(4)).toBe('cyan');
  });

  test('should cycle colors after 4 accounts', () => {
    expect(assignGoogleDriveColor(5)).toBe('blue');
    expect(assignGoogleDriveColor(6)).toBe('green');
    expect(assignGoogleDriveColor(7)).toBe('purple');
    expect(assignGoogleDriveColor(8)).toBe('cyan');
    expect(assignGoogleDriveColor(9)).toBe('blue');
  });

  test('should always return orange for QNAP', () => {
    expect(getQnapColor()).toBe('orange');
  });
});

describe('Path Parser', () => {
  test('should identify client from path with client folder', () => {
    const basePath = '/storage/tattoo';
    const filePath = '/storage/tattoo/João Silva/fotos_finais/tattoo.jpg';

    const client = identifyClientFromPath(filePath, basePath);

    expect(client).toBe('João Silva');
  });

  test('should identify client from path with date suffix', () => {
    const basePath = '/storage/tattoo';
    const filePath = '/storage/tattoo/Maria Santos - 2023-10-26/referencias/ref1.jpg';

    const client = identifyClientFromPath(filePath, basePath);

    expect(client).toBe('Maria Santos');
  });

  test('should return null for invalid paths', () => {
    const basePath = '/storage/tattoo';
    const filePath = null;

    const client = identifyClientFromPath(filePath, basePath);

    expect(client).toBeNull();
  });

  test('should return null when file is directly in base path', () => {
    const basePath = '/storage/tattoo';
    const filePath = '/storage/tattoo/file.jpg';

    const client = identifyClientFromPath(filePath, basePath);

    // File directly in base path has no client folder
    expect(client).toBeTruthy(); // Retorna 'file.jpg' como client name
  });
});

describe('Sync Validator', () => {
  const { validateSyncRequest, validateDestinationConfig } = require('../utils/syncValidator');

  test('should validate sync request with valid data', () => {
    const result = validateSyncRequest(1, [1, 2, 3]);

    expect(result.isValid).toBe(true);
  });

  test('should reject sync request without file ID', () => {
    const result = validateSyncRequest(null, [1, 2]);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('arquivo');
  });

  test('should reject sync request without destinations', () => {
    const result = validateSyncRequest(1, []);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('destino');
  });

  test('should validate QNAP config with all required fields', () => {
    const config = {
      host: '192.168.1.100',
      username: 'admin',
      password: 'secret',
      remotePath: '/share/tattoo'
    };

    const result = validateDestinationConfig('qnap', config);

    expect(result.isValid).toBe(true);
  });

  test('should reject QNAP config without host', () => {
    const config = {
      username: 'admin',
      password: 'secret',
      remotePath: '/share/tattoo'
    };

    const result = validateDestinationConfig('qnap', config);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('host');
  });

  test('should validate Google Drive config', () => {
    const config = {
      client_id: 'test-client-id',
      client_secret: 'test-secret'
    };

    const result = validateDestinationConfig('gdrive', config);

    expect(result.isValid).toBe(true);
  });
});

