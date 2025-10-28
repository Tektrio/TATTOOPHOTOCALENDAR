/**
 * Arquivo central de rotas
 * Importa e registra todas as rotas da aplicação
 */

const customersRouter = require('./customers');
const customerNotesRouter = require('./customer-notes');
const customerFilesRouter = require('./customer-files');
const customerFormsRouter = require('./customer-forms');
const productsRouter = require('./products');
const invoicesRouter = require('./invoices');
const packagesRouter = require('./packages');
const importsRouter = require('./imports');
const googleAccountsRouter = require('./google-accounts');
const servicesRouter = require('./services');
const clientDetailsRouter = require('./clientDetails');

/**
 * Registrar todas as rotas no app Express
 * @param {Express.Application} app - Instância do Express
 */
function registerRoutes(app) {
  // Disponibilizar db para as rotas
  app.locals.db = app.get('db');
  
  // Rotas de Clientes
  app.use('/api/customers', customersRouter);
  app.use('/api/customers', customerNotesRouter);
  app.use('/api/customers', customerFilesRouter);
  app.use('/api/customers', customerFormsRouter);
  app.use('/api/customers', packagesRouter);
  
  // Rotas de Produtos
  app.use('/api/products', productsRouter);
  
  // Rotas de Invoices
  app.use('/api/invoices', invoicesRouter);
  
  // Rotas de Pacotes
  app.use('/api/packages', packagesRouter);
  
  // Rotas de Form Templates
  app.use('/api', customerFormsRouter);
  
  // Rotas de Importação e Sincronização
  app.use('/api/imports', importsRouter);
  app.use('/api/auth', importsRouter);
  app.use('/api/sync', importsRouter);
  
  // Rotas de Google Multi-Account
  app.use('/api/google/accounts', googleAccountsRouter);
  
  // Rotas de Serviços (Service Types)
  app.use('/api/services', servicesRouter);
  
  // Rotas de Detalhes de Clientes (12 Abas)
  app.use('/api/clients', clientDetailsRouter);
  
  console.log('✅ Rotas de gestão de clientes registradas');
  console.log('✅ Rotas de importação e sincronização registradas');
  console.log('✅ Rotas de Google multi-conta registradas');
  console.log('✅ Rotas de serviços registradas');
  console.log('✅ Rotas de detalhes de clientes registradas (40+ endpoints)');
}

module.exports = { registerRoutes };

