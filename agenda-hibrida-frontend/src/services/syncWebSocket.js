/**
 * WebSocket Singleton para Status de Sincronização
 * Garante apenas uma conexão WebSocket ativa por vez
 */

import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SyncWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED | CONNECTING | CONNECTED
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Começa com 1 segundo
  }

  /**
   * Conecta ao WebSocket (se ainda não estiver conectado)
   */
  connect() {
    // Se já está conectando ou conectado, não fazer nada
    if (this.connectionState !== 'DISCONNECTED') {
      console.log('⚠️ WebSocket já está em processo de conexão ou conectado');
      return this.socket;
    }

    this.connectionState = 'CONNECTING';
    console.log('🔌 Iniciando conexão WebSocket...');

    this.socket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling']
    });

    // Event: Conexão estabelecida
    this.socket.on('connect', () => {
      this.connectionState = 'CONNECTED';
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket conectado - ID:', this.socket.id);
      this._notifyListeners('connect', { socketId: this.socket.id });
    });

    // Event: Sincronização iniciada
    this.socket.on('calendar_sync_started', (data) => {
      console.log('🔄 Sincronização iniciada:', data);
      this._notifyListeners('calendar_sync_started', data);
    });

    // Event: Sincronização concluída
    this.socket.on('calendar_synced', (data) => {
      console.log('📅 Sincronização concluída:', data);
      this._notifyListeners('calendar_synced', data);
    });

    // Event: Erro de sincronização
    this.socket.on('calendar_sync_error', (data) => {
      console.error('❌ Erro na sincronização:', data);
      this._notifyListeners('calendar_sync_error', data);
    });

    // Event: Desconexão
    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      this.connectionState = 'DISCONNECTED';
      this._notifyListeners('disconnect', { reason });

      // Se foi desconexão do servidor, tentar reconectar
      if (reason === 'io server disconnect') {
        this._attemptReconnect();
      }
    });

    // Event: Erro de conexão
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error.message);
      this.connectionState = 'DISCONNECTED';
      this._notifyListeners('connect_error', { error: error.message });
      this._attemptReconnect();
    });

    return this.socket;
  }

  /**
   * Tenta reconectar com exponential backoff
   */
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
    
    setTimeout(() => {
      if (this.connectionState === 'DISCONNECTED') {
        this.connect();
      }
    }, delay);
  }

  /**
   * Desconecta o WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.connectionState = 'DISCONNECTED';
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Adiciona um listener para eventos
   * @param {string} listenerId - ID único do listener
   * @param {function} callback - Função de callback
   */
  addListener(listenerId, callback) {
    this.listeners.set(listenerId, callback);
  }

  /**
   * Remove um listener
   * @param {string} listenerId - ID do listener a remover
   */
  removeListener(listenerId) {
    this.listeners.delete(listenerId);
  }

  /**
   * Notifica todos os listeners sobre um evento
   * @param {string} event - Nome do evento
   * @param {object} data - Dados do evento
   */
  _notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  /**
   * Retorna o estado atual da conexão
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.connectionState === 'CONNECTED' && this.socket?.connected;
  }
}

// Exportar instância singleton
const syncWebSocketService = new SyncWebSocketService();
export default syncWebSocketService;
