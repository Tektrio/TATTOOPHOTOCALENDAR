/**
 * Jest setup file
 * Executado antes de todos os testes
 */

// Timeout padrão para operações assíncronas
jest.setTimeout(10000);

// Mock de console.warn para evitar poluição nos logs de teste
global.console.warn = jest.fn();

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

