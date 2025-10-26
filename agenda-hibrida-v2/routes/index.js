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
  
  console.log('✅ Rotas de gestão de clientes registradas');
}

module.exports = { registerRoutes };

