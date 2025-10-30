/**
 * AutoSyncWorker
 * Worker para sincronização automática em background
 */
class AutoSyncWorker {
  constructor(db, syncQueue, localStorageService) {
    this.db = db;
    this.syncQueue = syncQueue;
    this.localStorageService = localStorageService;
    this.interval = null;
    this.isRunning = false;
  }

  /**
   * Inicia o worker se auto-sync estiver habilitado
   */
  async start() {
    try {
      const config = await this.localStorageService.getAutoSyncConfig();
      
      if (config.enabled) {
        console.log(`🔄 [AUTO-SYNC] Iniciando sincronização automática (intervalo: ${config.intervalMinutes} min, modo: ${config.mode})`);
        this.isRunning = true;
        
        // Executar uma vez imediatamente (após 30s)
        setTimeout(() => {
          this.sync(config.mode).catch(err => {
            console.error('❌ [AUTO-SYNC] Erro na sincronização inicial:', err.message);
          });
        }, 30000);

        // Configurar intervalo recorrente
        this.interval = setInterval(() => {
          this.sync(config.mode).catch(err => {
            console.error('❌ [AUTO-SYNC] Erro na sincronização automática:', err.message);
          });
        }, config.intervalMinutes * 60 * 1000);

        console.log('✅ [AUTO-SYNC] Worker iniciado com sucesso');
      } else {
        console.log('⏸️ [AUTO-SYNC] Sincronização automática desabilitada');
      }
    } catch (error) {
      console.error('❌ [AUTO-SYNC] Erro ao iniciar worker:', error.message);
    }
  }

  /**
   * Para o worker
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('⏹️ [AUTO-SYNC] Worker parado');
    }
  }

  /**
   * Reinicia o worker
   */
  async restart() {
    console.log('🔄 [AUTO-SYNC] Reiniciando worker...');
    this.stop();
    await this.start();
  }

  /**
   * Executa sincronização
   * @param {string} mode - 'incremental' ou 'full'
   */
  async sync(mode) {
    if (!this.isRunning) {
      console.log('⏸️ [AUTO-SYNC] Worker não está rodando, ignorando sincronização');
      return;
    }

    try {
      console.log(`🔄 [AUTO-SYNC] Executando sincronização ${mode}...`);
      
      // Obter primeiro destino ativo
      const destination = await this.getFirstActiveDestination();
      
      if (!destination) {
        console.log('⚠️ [AUTO-SYNC] Nenhum destino de sincronização ativo encontrado');
        return;
      }

      // Buscar arquivos para sincronizar
      const result = await this.localStorageService.syncAll(mode, destination.id);
      
      if (result.count === 0) {
        console.log('✅ [AUTO-SYNC] Nenhum arquivo pendente para sincronizar');
        return;
      }

      console.log(`📋 [AUTO-SYNC] ${result.count} arquivo(s) encontrado(s) para sincronizar`);

      // Adicionar à fila de sincronização
      let addedCount = 0;
      for (const file of result.files) {
        try {
          await this.syncQueue.addToQueue(file.id, [destination.id], 3); // Prioridade 3 (background)
          addedCount++;
        } catch (error) {
          console.error(`❌ [AUTO-SYNC] Erro ao adicionar arquivo ${file.id}:`, error.message);
        }
      }

      // Processar fila
      if (addedCount > 0) {
        this.syncQueue.processQueue().catch(err => {
          console.error('❌ [AUTO-SYNC] Erro no processamento da fila:', err.message);
        });
      }

      console.log(`✅ [AUTO-SYNC] ${addedCount} arquivo(s) adicionado(s) à fila de sincronização`);
    } catch (error) {
      console.error('❌ [AUTO-SYNC] Erro ao executar sincronização:', error.message);
    }
  }

  /**
   * Obtém o primeiro destino de sincronização ativo
   * @returns {Promise<object|null>}
   */
  async getFirstActiveDestination() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM sync_destinations WHERE enabled = 1 ORDER BY priority DESC LIMIT 1',
        [],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Obtém status do worker
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.interval !== null
    };
  }
}

module.exports = AutoSyncWorker;

