import io from 'socket.io-client';

/**
 * Cliente WebSocket para sincronização em tempo real
 * Gerencia eventos de sincronização, fila e arquivos
 * Implementa padrão Singleton com reconexão automática
 */
class SyncWebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelayBase = 1000; // 1 segundo
    this.reconnectDelayMax = 30000; // 30 segundos
    this.socketUrl = null;
  }

  /**
   * Conecta ao servidor WebSocket (Singleton)
   * @param {string} [url] - URL do servidor (opcional)
   */
  connect(url = null) {
    // Singleton: prevenir múltiplas conexões
    if (this.socket && (this.connected || this.connectionState === 'CONNECTING')) {
      console.log('⚠️ WebSocket já conectado ou conectando');
      return;
    }

    // Se socket existe mas está desconectado, limpar antes de reconectar
    if (this.socket && !this.connected) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.connectionState = 'CONNECTING';
    this.socketUrl = url || this.socketUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    console.log('🔌 Conectando ao WebSocket:', this.socketUrl);

    this.socket = io(this.socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this._calculateReconnectDelay(),
      reconnectionDelayMax: this.reconnectDelayMax,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this._setupEventHandlers();
  }

  /**
   * Calcula delay de reconexão com exponential backoff
   * @private
   * @returns {number} Delay em ms
   */
  _calculateReconnectDelay() {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const delay = Math.min(
      this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );
    return delay;
  }

  /**
   * Configura handlers dos eventos
   * @private
   */
  _setupEventHandlers() {
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectionState = 'CONNECTED';
      this.reconnectAttempts = 0; // Reset contador ao conectar com sucesso
      console.log('✅ WebSocket conectado:', this.socket.id);
      this._emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.connectionState = 'DISCONNECTED';
      console.log('🔌 WebSocket desconectado:', reason);
      this._emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      const delay = this._calculateReconnectDelay();
      console.error(`❌ Erro de conexão WebSocket (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error.message);
      console.log(`🔄 Próxima tentativa em ${delay/1000}s`);
      this._emit('error', { error: error.message, attempts: this.reconnectAttempts, nextDelay: delay });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Tentando reconectar... (${attemptNumber})`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconectado após ${attemptNumber} tentativa(s)`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Falha ao reconectar após múltiplas tentativas');
      this._emit('reconnect_failed', {});
    });

    // ============================================
    // EVENTOS DE ARQUIVOS
    // ============================================
    
    this.socket.on('file:added', (data) => {
      console.log('📁 Arquivo adicionado:', data.fileName);
      this._emit('file:added', data);
    });

    this.socket.on('file:changed', (data) => {
      console.log('✏️ Arquivo modificado:', data.fileName);
      this._emit('file:changed', data);
    });

    this.socket.on('file:deleted', (data) => {
      console.log('🗑️ Arquivo deletado:', data.fileName);
      this._emit('file:deleted', data);
    });

    // ============================================
    // EVENTOS DE SINCRONIZAÇÃO
    // ============================================
    
    this.socket.on('sync:progress', (data) => {
      console.log('🔄 Sincronização em progresso:', data);
      this._emit('sync:progress', data);
    });

    this.socket.on('sync:complete', (data) => {
      console.log('✅ Sincronização concluída:', data);
      this._emit('sync:complete', data);
    });

    this.socket.on('sync:partial', (data) => {
      console.log('⚠️ Sincronização parcial:', data);
      this._emit('sync:partial', data);
    });

    this.socket.on('sync:error', (data) => {
      console.error('❌ Erro na sincronização:', data);
      this._emit('sync:error', data);
    });
  }

  /**
   * Registra listener para evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove listener de evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função callback
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emite evento para listeners locais
   * @private
   * @param {string} event 
   * @param {*} data 
   */
  _emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no callback do evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Inscreve-se para receber updates de arquivo específico
   * @param {number} fileId 
   */
  subscribeToFile(fileId) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ WebSocket não conectado');
      return;
    }

    this.socket.emit('subscribe:sync', { fileId });
    console.log(`📡 Inscrito em file:${fileId}`);
  }

  /**
   * Cancela inscrição de arquivo
   * @param {number} fileId 
   */
  unsubscribeFromFile(fileId) {
    if (!this.socket) return;

    this.socket.emit('unsubscribe:sync', { fileId });
    console.log(`📡 Desinscrito de file:${fileId}`);
  }

  /**
   * Inscreve-se para receber updates da fila
   */
  subscribeToQueue() {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ WebSocket não conectado');
      return;
    }

    this.socket.emit('subscribe:queue');
    console.log('📡 Inscrito na fila de sincronização');
  }

  /**
   * Cancela inscrição da fila
   */
  unsubscribeFromQueue() {
    if (!this.socket) return;

    this.socket.emit('unsubscribe:queue');
    console.log('📡 Desinscrito da fila');
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionState = 'DISCONNECTED';
      this.reconnectAttempts = 0;
      this.listeners.clear();
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  /**
   * Verifica se está conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket !== null && this.connectionState === 'CONNECTED';
  }

  /**
   * Retorna estado atual da conexão
   * @returns {string} 'DISCONNECTED', 'CONNECTING', ou 'CONNECTED'
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Reconecta ao servidor
   */
  reconnect() {
    console.log('🔄 Iniciando reconexão manual...');
    
    if (this.socket) {
      // Socket existe mas está desconectado
      if (!this.connected && this.connectionState !== 'CONNECTING') {
        this.socket.connect();
      }
    } else {
      // Socket foi destruído (após disconnect()), criar nova conexão
      this.connect();
    }
  }
}

// Exporta instância singleton
const syncWebSocket = new SyncWebSocketClient();

export default syncWebSocket;

