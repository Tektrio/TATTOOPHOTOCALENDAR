import io from 'socket.io-client';

/**
 * Cliente WebSocket para sincronização em tempo real
 * Gerencia eventos de sincronização, fila e arquivos
 */
class SyncWebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
  }

  /**
   * Conecta ao servidor WebSocket
   * @param {string} [url] - URL do servidor (opcional)
   */
  connect(url = null) {
    if (this.socket) {
      console.log('⚠️ WebSocket já conectado');
      return;
    }

    const socketUrl = url || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    console.log('🔌 Conectando ao WebSocket:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this._setupEventHandlers();
  }

  /**
   * Configura handlers dos eventos
   * @private
   */
  _setupEventHandlers() {
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ WebSocket conectado:', this.socket.id);
      this._emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('🔌 WebSocket desconectado');
      this._emit('disconnected', {});
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error.message);
      this._emit('error', { error: error.message });
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
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  /**
   * Verifica se está conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket !== null;
  }

  /**
   * Reconecta ao servidor
   */
  reconnect() {
    if (this.socket) {
      // Socket existe mas está desconectado
      this.socket.connect();
    } else {
      // Socket foi destruído (após disconnect()), criar nova conexão
      this.connect();
    }
  }
}

// Exporta instância singleton
const syncWebSocket = new SyncWebSocketClient();

export default syncWebSocket;

