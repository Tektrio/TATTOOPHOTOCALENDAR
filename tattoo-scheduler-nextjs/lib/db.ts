// Seletor automático de banco (Local ou Cloud)
import { prismaLocal } from './db-local';
import { prismaCloud } from './db-cloud';

// Detecta qual banco usar baseado no ambiente
const useLocalDB = process.env.USE_LOCAL_DB === 'true' || process.env.NODE_ENV === 'development';

/**
 * Cliente Prisma que automaticamente usa:
 * - SQLite (local) em desenvolvimento ou quando USE_LOCAL_DB=true
 * - PostgreSQL (cloud) em produção
 */
export const prisma = useLocalDB ? prismaLocal : prismaCloud;

// Exporta ambos para uso específico (sincronização)
export { prismaLocal, prismaCloud };

// Log do modo atual
if (process.env.NODE_ENV === 'development') {
  console.log(`🗄️  Usando banco de dados: ${useLocalDB ? 'SQLite (LOCAL)' : 'PostgreSQL (CLOUD)'}`);
}

