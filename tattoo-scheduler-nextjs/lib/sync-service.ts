// Serviço de Sincronização Bidirecional (Local ↔ Cloud)
import { prismaLocal } from './db-local';
import { prismaCloud } from './db-cloud';
import { generateHash } from './utils';

export interface Conflict {
  type: 'client' | 'appointment' | 'file';
  id: string;
  local: {
    data: any;
    updatedAt: Date;
  };
  cloud: {
    data: any;
    updatedAt: Date;
  };
}

class SyncService {
  private conflicts: Conflict[] = [];
  
  /**
   * Sincronização completa bidirecional
   */
  async syncAll(): Promise<Conflict[]> {
    console.log('🔄 Iniciando sincronização...');
    
    this.conflicts = [];
    
    try {
      // 1. Sincronizar clientes
      await this.syncClients();
      
      // 2. Sincronizar agendamentos
      await this.syncAppointments();
      
      // 3. Sincronizar arquivos (metadados)
      await this.syncFiles();
      
      console.log(`✅ Sincronização concluída. ${this.conflicts.length} conflitos encontrados.`);
      
      return this.conflicts;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }
  
  /**
   * Sincronizar clientes
   */
  private async syncClients() {
    console.log('📋 Sincronizando clientes...');
    
    // ENVIAR: Local → Cloud
    const localClients = await prismaLocal.client.findMany({
      where: {
        OR: [
          { syncedAt: null }, // Nunca sincronizado
          { 
            updatedAt: { 
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            } 
          } // Editado nas últimas 24h
        ]
      }
    });
    
    for (const localClient of localClients) {
      try {
        const cloudClient = await prismaCloud.client.findUnique({
          where: { id: localClient.id }
        });
        
        if (!cloudClient) {
          // Não existe no cloud, criar
          await prismaCloud.client.create({ 
            data: {
              id: localClient.id,
              name: localClient.name,
              email: localClient.email,
              phone: localClient.phone,
              birthDate: localClient.birthDate,
              notes: localClient.notes,
              folderPath: localClient.folderPath,
              googleDriveFolderId: localClient.googleDriveFolderId,
              syncedAt: new Date(),
              syncHash: await generateHash(localClient),
              createdAt: localClient.createdAt,
              updatedAt: localClient.updatedAt
            }
          });
          await this.markAsSynced('client', localClient.id, 'local');
          console.log(`  ✓ Cliente #${localClient.id} criado no cloud`);
        } else {
          // Existe, verificar conflito
          if (this.hasConflict(localClient, cloudClient)) {
            this.conflicts.push({
              type: 'client',
              id: localClient.id.toString(),
              local: {
                data: localClient,
                updatedAt: localClient.updatedAt
              },
              cloud: {
                data: cloudClient,
                updatedAt: cloudClient.updatedAt
              }
            });
            console.log(`  ⚠️  Conflito detectado em Cliente #${localClient.id}`);
          } else {
            // Sem conflito, atualizar cloud
            await prismaCloud.client.update({
              where: { id: localClient.id },
              data: {
                name: localClient.name,
                email: localClient.email,
                phone: localClient.phone,
                birthDate: localClient.birthDate,
                notes: localClient.notes,
                folderPath: localClient.folderPath,
                googleDriveFolderId: localClient.googleDriveFolderId,
                syncedAt: new Date(),
                syncHash: await generateHash(localClient),
                updatedAt: localClient.updatedAt
              }
            });
            await this.markAsSynced('client', localClient.id, 'local');
            console.log(`  ✓ Cliente #${localClient.id} atualizado no cloud`);
          }
        }
      } catch (error) {
        console.error(`  ✗ Erro ao sincronizar Cliente #${localClient.id}:`, error);
      }
    }
    
    // BAIXAR: Cloud → Local
    const cloudClients = await prismaCloud.client.findMany({
      where: {
        updatedAt: { 
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      }
    });
    
    for (const cloudClient of cloudClients) {
      try {
        const localClient = await prismaLocal.client.findUnique({
          where: { id: cloudClient.id }
        });
        
        if (!localClient) {
          // Não existe local, criar
          await prismaLocal.client.create({ 
            data: {
              id: cloudClient.id,
              name: cloudClient.name,
              email: cloudClient.email,
              phone: cloudClient.phone,
              birthDate: cloudClient.birthDate,
              notes: cloudClient.notes,
              folderPath: cloudClient.folderPath,
              googleDriveFolderId: cloudClient.googleDriveFolderId,
              syncedAt: new Date(),
              syncHash: await generateHash(cloudClient),
              createdAt: cloudClient.createdAt,
              updatedAt: cloudClient.updatedAt
            }
          });
          console.log(`  ✓ Cliente #${cloudClient.id} criado no local`);
        } else if (!this.hasConflict(localClient, cloudClient)) {
          // Sem conflito, atualizar local
          await prismaLocal.client.update({
            where: { id: cloudClient.id },
            data: {
              name: cloudClient.name,
              email: cloudClient.email,
              phone: cloudClient.phone,
              birthDate: cloudClient.birthDate,
              notes: cloudClient.notes,
              folderPath: cloudClient.folderPath,
              googleDriveFolderId: cloudClient.googleDriveFolderId,
              syncedAt: new Date(),
              syncHash: await generateHash(cloudClient),
              updatedAt: cloudClient.updatedAt
            }
          });
          console.log(`  ✓ Cliente #${cloudClient.id} atualizado no local`);
        }
      } catch (error) {
        console.error(`  ✗ Erro ao baixar Cliente #${cloudClient.id}:`, error);
      }
    }
  }
  
  /**
   * Sincronizar agendamentos
   */
  private async syncAppointments() {
    console.log('📅 Sincronizando agendamentos...');
    
    // ENVIAR: Local → Cloud
    const localAppointments = await prismaLocal.appointment.findMany({
      where: {
        OR: [
          { syncedAt: null },
          { 
            updatedAt: { 
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            } 
          }
        ]
      }
    });
    
    for (const localAppt of localAppointments) {
      try {
        const cloudAppt = await prismaCloud.appointment.findUnique({
          where: { id: localAppt.id }
        });
        
        if (!cloudAppt) {
          await prismaCloud.appointment.create({ 
            data: {
              id: localAppt.id,
              clientId: localAppt.clientId,
              startDatetime: localAppt.startDatetime,
              endDatetime: localAppt.endDatetime,
              title: localAppt.title,
              description: localAppt.description,
              status: localAppt.status,
              googleEventId: localAppt.googleEventId,
              price: localAppt.price ? parseFloat(localAppt.price.toString()) : null,
              notes: localAppt.notes,
              syncedAt: new Date(),
              syncHash: await generateHash(localAppt),
              createdAt: localAppt.createdAt,
              updatedAt: localAppt.updatedAt
            }
          });
          await this.markAsSynced('appointment', localAppt.id, 'local');
          console.log(`  ✓ Agendamento #${localAppt.id} criado no cloud`);
        } else if (this.hasConflict(localAppt, cloudAppt)) {
          this.conflicts.push({
            type: 'appointment',
            id: localAppt.id.toString(),
            local: { data: localAppt, updatedAt: localAppt.updatedAt },
            cloud: { data: cloudAppt, updatedAt: cloudAppt.updatedAt }
          });
        } else {
          await prismaCloud.appointment.update({
            where: { id: localAppt.id },
            data: {
              clientId: localAppt.clientId,
              startDatetime: localAppt.startDatetime,
              endDatetime: localAppt.endDatetime,
              title: localAppt.title,
              description: localAppt.description,
              status: localAppt.status,
              googleEventId: localAppt.googleEventId,
              price: localAppt.price ? parseFloat(localAppt.price.toString()) : null,
              notes: localAppt.notes,
              syncedAt: new Date(),
              syncHash: await generateHash(localAppt),
              updatedAt: localAppt.updatedAt
            }
          });
          await this.markAsSynced('appointment', localAppt.id, 'local');
        }
      } catch (error) {
        console.error(`  ✗ Erro ao sincronizar Agendamento #${localAppt.id}:`, error);
      }
    }
    
    // BAIXAR: Cloud → Local (similar ao clientes)
    const cloudAppointments = await prismaCloud.appointment.findMany({
      where: {
        updatedAt: { 
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      }
    });
    
    for (const cloudAppt of cloudAppointments) {
      try {
        const localAppt = await prismaLocal.appointment.findUnique({
          where: { id: cloudAppt.id }
        });
        
        if (!localAppt) {
          await prismaLocal.appointment.create({
            data: {
              id: cloudAppt.id,
              clientId: cloudAppt.clientId,
              startDatetime: cloudAppt.startDatetime,
              endDatetime: cloudAppt.endDatetime,
              title: cloudAppt.title,
              description: cloudAppt.description,
              status: cloudAppt.status,
              googleEventId: cloudAppt.googleEventId,
              price: cloudAppt.price ? parseFloat(cloudAppt.price.toString()) : null,
              notes: cloudAppt.notes,
              syncedAt: new Date(),
              syncHash: await generateHash(cloudAppt),
              createdAt: cloudAppt.createdAt,
              updatedAt: cloudAppt.updatedAt
            }
          });
        } else if (!this.hasConflict(localAppt, cloudAppt)) {
          await prismaLocal.appointment.update({
            where: { id: cloudAppt.id },
            data: {
              clientId: cloudAppt.clientId,
              startDatetime: cloudAppt.startDatetime,
              endDatetime: cloudAppt.endDatetime,
              title: cloudAppt.title,
              description: cloudAppt.description,
              status: cloudAppt.status,
              googleEventId: cloudAppt.googleEventId,
              price: cloudAppt.price ? parseFloat(cloudAppt.price.toString()) : null,
              notes: cloudAppt.notes,
              syncedAt: new Date(),
              syncHash: await generateHash(cloudAppt),
              updatedAt: cloudAppt.updatedAt
            }
          });
        }
      } catch (error) {
        console.error(`  ✗ Erro ao baixar Agendamento #${cloudAppt.id}:`, error);
      }
    }
  }
  
  /**
   * Sincronizar arquivos (metadados apenas)
   */
  private async syncFiles() {
    console.log('📁 Sincronizando metadados de arquivos...');
    // Implementação similar aos clientes e agendamentos
    // Por ora, apenas log
    console.log('  ℹ️  Sincronização de arquivos será implementada na próxima etapa');
  }
  
  /**
   * Verifica se há conflito entre local e cloud
   */
  private hasConflict(local: any, cloud: any): boolean {
    // Se local nunca foi sincronizado, não é conflito
    if (!local.syncedAt) return false;
    
    // Conflito = ambos foram editados desde última sync
    const localWasEditedAfterSync = new Date(local.updatedAt) > new Date(local.syncedAt);
    const cloudWasEditedAfterSync = new Date(cloud.updatedAt) > new Date(local.syncedAt);
    
    return localWasEditedAfterSync && cloudWasEditedAfterSync;
  }
  
  /**
   * Marca registro como sincronizado
   */
  private async markAsSynced(
    type: 'client' | 'appointment' | 'file',
    id: number,
    location: 'local' | 'cloud'
  ) {
    const now = new Date();
    
    try {
      if (location === 'local') {
        await prismaLocal[type].update({
          where: { id },
          data: { syncedAt: now }
        });
      } else {
        await prismaCloud[type].update({
          where: { id },
          data: { syncedAt: now }
        });
      }
    } catch (error) {
      console.error(`Erro ao marcar ${type} #${id} como sincronizado:`, error);
    }
  }
  
  /**
   * Resolve conflito (chamado pelo modal do usuário)
   */
  async resolveConflict(
    conflict: Conflict,
    resolution: 'local' | 'cloud' | 'both'
  ) {
    const { type, id, local, cloud } = conflict;
    const numId = parseInt(id);
    
    try {
      if (resolution === 'local') {
        // Manter local, sobrescrever cloud
        await prismaCloud[type].update({
          where: { id: numId },
          data: { ...local.data, syncedAt: new Date() }
        });
        await this.markAsSynced(type, numId, 'local');
        console.log(`✓ Conflito resolvido: mantida versão local de ${type} #${id}`);
      } else if (resolution === 'cloud') {
        // Manter cloud, sobrescrever local
        await prismaLocal[type].update({
          where: { id: numId },
          data: { ...cloud.data, syncedAt: new Date() }
        });
        await this.markAsSynced(type, numId, 'cloud');
        console.log(`✓ Conflito resolvido: mantida versão cloud de ${type} #${id}`);
      } else if (resolution === 'both') {
        // Criar duplicado no cloud com novo ID
        const { id: _, syncedAt: __, syncHash: ___, ...dataWithoutId } = cloud.data;
        await prismaCloud[type].create({
          data: { ...dataWithoutId, syncedAt: new Date() }
        });
        await this.markAsSynced(type, numId, 'local');
        console.log(`✓ Conflito resolvido: mantidas ambas versões de ${type} #${id}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Erro ao resolver conflito:`, error);
      return { success: false, error };
    }
  }
}

// Exportar instância única
export const syncService = new SyncService();

