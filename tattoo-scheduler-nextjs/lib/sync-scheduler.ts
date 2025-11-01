// Agendador de Sincronização (Manual + Ao abrir + Background 24h)
'use client';

import { syncService, type Conflict } from './sync-service';

export class SyncScheduler {
  private static instance: SyncScheduler;
  private SYNC_INTERVAL_24H = 24 * 60 * 60 * 1000; // 24 horas
  private intervalId: NodeJS.Timeout | null = null;
  private onConflictCallback?: (conflicts: Conflict[]) => void;
  private onSuccessCallback?: () => void;
  private onErrorCallback?: (error: any) => void;
  
  private constructor() {
    // Privado para singleton
  }
  
  /**
   * Obtém instância única do scheduler
   */
  static getInstance(): SyncScheduler {
    if (!SyncScheduler.instance) {
      SyncScheduler.instance = new SyncScheduler();
    }
    return SyncScheduler.instance;
  }
  
  /**
   * Inicializa o scheduler
   */
  initialize(callbacks?: {
    onConflict?: (conflicts: Conflict[]) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }) {
    this.onConflictCallback = callbacks?.onConflict;
    this.onSuccessCallback = callbacks?.onSuccess;
    this.onErrorCallback = callbacks?.onError;
    
    // GATILHO 1: Verificar ao abrir o app
    this.checkSyncOnStartup();
    
    // GATILHO 2: Agendar sincronização a cada 24h
    this.scheduleBackgroundSync();
  }
  
  /**
   * GATILHO 1: Sincronizar ao abrir aplicativo (se passou 24h)
   */
  private async checkSyncOnStartup() {
    try {
      const lastSync = this.getLastSyncTime();
      
      if (!lastSync) {
        console.log('ℹ️  Primeira execução - sincronização não executada automaticamente');
        return;
      }
      
      const hoursSinceSync = this.getHoursSince(lastSync);
      
      // Se passou 24h desde última sync, sincronizar automaticamente
      if (hoursSinceSync >= 24 && this.isOnline()) {
        console.log('🔄 Sincronização automática (ao abrir - 24h passadas)');
        await this.performSync('startup');
      } else {
        console.log(`ℹ️  Última sincronização: ${hoursSinceSync.toFixed(1)}h atrás`);
      }
    } catch (error) {
      console.error('Erro ao verificar sincronização inicial:', error);
    }
  }
  
  /**
   * GATILHO 2: Background a cada 24h
   */
  private scheduleBackgroundSync() {
    // Limpar intervalo anterior se existir
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(async () => {
      try {
        if (!this.isOnline()) {
          console.log('📴 Offline - sincronização adiada');
          return;
        }
        
        const lastSync = this.getLastSyncTime();
        const hoursSinceSync = this.getHoursSince(lastSync);
        
        if (hoursSinceSync >= 24) {
          console.log('🔄 Sincronização automática (background - 24h)');
          await this.performSync('background');
        }
      } catch (error) {
        console.error('Erro na sincronização em background:', error);
      }
    }, this.SYNC_INTERVAL_24H);
  }
  
  /**
   * GATILHO 3: Sincronização manual (botão)
   */
  async syncManually(): Promise<{ success: boolean; conflicts: Conflict[] }> {
    console.log('🔄 Sincronização manual (usuário clicou)');
    return await this.performSync('manual');
  }
  
  /**
   * Executa sincronização
   */
  private async performSync(
    trigger: 'startup' | 'background' | 'manual'
  ): Promise<{ success: boolean; conflicts: Conflict[] }> {
    try {
      const conflicts = await syncService.syncAll();
      
      // Atualizar timestamp da última sync
      this.updateLastSyncTime();
      
      if (conflicts.length > 0) {
        console.log(`⚠️  ${conflicts.length} conflito(s) encontrado(s)`);
        
        // Callback para mostrar modal de conflitos
        if (this.onConflictCallback) {
          this.onConflictCallback(conflicts);
        }
      } else {
        console.log('✅ Sincronização concluída sem conflitos');
        
        // Callback de sucesso
        if (this.onSuccessCallback) {
          this.onSuccessCallback();
        }
      }
      
      return { success: true, conflicts };
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      
      // Callback de erro
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
      
      return { success: false, conflicts: [] };
    }
  }
  
  /**
   * Obtém hora da última sincronização
   */
  private getLastSyncTime(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lastSyncTime');
  }
  
  /**
   * Atualiza hora da última sincronização
   */
  private updateLastSyncTime() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }
  
  /**
   * Calcula quantas horas se passaram desde determinado momento
   */
  private getHoursSince(dateString: string | null): number {
    if (!dateString) return Infinity;
    
    const lastSync = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours;
  }
  
  /**
   * Verifica se está online
   */
  private isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return window.navigator.onLine;
  }
  
  /**
   * Para o scheduler (cleanup)
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Retorna status da sincronização
   */
  getStatus(): {
    lastSync: string | null;
    hoursSinceSync: number;
    needsSync: boolean;
    isOnline: boolean;
  } {
    const lastSync = this.getLastSyncTime();
    const hoursSinceSync = this.getHoursSince(lastSync);
    const needsSync = hoursSinceSync >= 24;
    const isOnline = this.isOnline();
    
    return {
      lastSync,
      hoursSinceSync,
      needsSync,
      isOnline
    };
  }
}

// Hook para facilitar uso no React
export function useSyncScheduler() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return SyncScheduler.getInstance();
}

