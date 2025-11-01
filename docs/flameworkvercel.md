# Sistema Dual: Local (Offline) + Cloud (Online) com Sincronização

## CONFIGURAÇÃO ESCOLHIDA ✅

✅ **Versão Local**: SQLite + arquivos locais (trabalha OFFLINE)

✅ **Versão Cloud**: Supabase + Vercel (acesso de qualquer lugar)

✅ **Sincronização**: Manual + Ao abrir (se passou 24h) + Background (a cada 24h)

✅ **Conflitos**: Interface para usuário decidir

✅ **Custo**: $0/mês (tudo FREE)

✅ **Dados**: Começar do zero (não migrar dados antigos)

---

## ARQUITETURA COMPLETA

```
┌─────────────────────────────────────────────────────┐
│         SEU PC (Funciona OFFLINE)                   │
│                                                      │
│  Next.js localhost:3000                             │
│  ┌──────────────┐    ┌──────────────┐              │
│  │SQLite (local)│    │  /uploads    │              │
│  │   dev.db     │    │   (local)    │              │
│  └──────────────┘    └──────────────┘              │
│         ↕                     ↕                      │
│    [SINCRONIZAÇÃO A CADA 24H]                       │
│         ↕                     ↕                      │
└─────────────────────────────────────────────────────┘
                        ↓
               (quando tiver internet)
                        ↓
┌─────────────────────────────────────────────────────┐
│              VERCEL + SUPABASE (Cloud)              │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │  PostgreSQL      │    │ Supabase Storage │      │
│  │   (Supabase)     │    │   (Cloud files)  │      │
│  └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## COMO FUNCIONA A SINCRONIZAÇÃO

### 1. Quando Sincroniza (3 gatilhos)

```typescript
// lib/sync-scheduler.ts

class SyncScheduler {
  private SYNC_INTERVAL_24H = 24 * 60 * 60 * 1000; // 24 horas

  constructor() {
    // GATILHO 1: Ao abrir o app
    this.checkSyncOnStartup();

    // GATILHO 2: Background a cada 24h
    this.scheduleBackgroundSync();
  }

  // GATILHO 1: Ao abrir aplicativo
  async checkSyncOnStartup() {
    const lastSync = localStorage.getItem("lastSyncTime");

    if (!lastSync) {
      console.log("Primeira vez! Sincronizar?");
      return;
    }

    const hoursSinceSync = this.getHoursSince(lastSync);

    // Se passou 24h, sincronizar automaticamente
    if (hoursSinceSync >= 24 && navigator.onLine) {
      console.log("🔄 Sincronização automática (ao abrir - 24h passadas)");
      await this.performSync();
    }
  }

  // GATILHO 2: Background a cada 24h
  scheduleBackgroundSync() {
    setInterval(async () => {
      if (navigator.onLine) {
        const lastSync = localStorage.getItem("lastSyncTime");
        const hoursSinceSync = this.getHoursSince(lastSync);

        if (hoursSinceSync >= 24) {
          console.log("🔄 Sincronização automática (background - 24h)");
          await this.performSync();
        }
      }
    }, this.SYNC_INTERVAL_24H);
  }

  // GATILHO 3: Manual (botão)
  async syncManually() {
    console.log("🔄 Sincronização manual (usuário clicou)");
    await this.performSync();
  }

  private async performSync() {
    const conflicts = await syncService.syncAll();

    if (conflicts.length > 0) {
      // Mostrar modal para resolver conflitos
      this.showConflictModal(conflicts);
    } else {
      toast.success("✅ Sincronizado com sucesso!");
    }

    localStorage.setItem("lastSyncTime", new Date().toISOString());
  }
}
```

### 2. Fluxo de Sincronização

```
┌──────────────────────────────────────────────────┐
│  1. ENVIAR: Local → Cloud                        │
│     - Busca registros novos/editados localmente  │
│     - Envia para Supabase                        │
│     - Marca como sincronizado                    │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│  2. BAIXAR: Cloud → Local                        │
│     - Busca registros novos/editados no cloud    │
│     - Salva localmente                           │
│     - Verifica conflitos                         │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│  3. RESOLVER CONFLITOS                           │
│     - Encontrou mesmo registro editado em 2      │
│       lugares? → PERGUNTAR ao usuário            │
│     - Mostrar modal com opções                   │
│     - Usuário decide qual manter                 │
└──────────────────────────────────────────────────┘
```

### 3. Schema do Banco (adiciona campos de sync)

```sql
-- Adiciona em TODAS as tabelas:

ALTER TABLE clients ADD COLUMN synced_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN sync_hash TEXT; -- para detectar mudanças

ALTER TABLE appointments ADD COLUMN synced_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN sync_hash TEXT;

ALTER TABLE files ADD COLUMN synced_at TIMESTAMPTZ;
ALTER TABLE files ADD COLUMN sync_hash TEXT;
```

**Para que serve:**

- `synced_at = NULL` → nunca foi sincronizado
- `synced_at = 2024-01-15` → última sincronização
- `sync_hash` → hash dos dados para detectar mudanças

### 4. Detectar Mudanças

```typescript
// lib/sync-detector.ts

function generateHash(data: any): string {
  // Gera hash MD5 dos dados para detectar mudanças
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

async function findChangedRecords() {
  const localClients = await prismaLocal.client.findAll();
  const changes = [];

  for (const client of localClients) {
    const currentHash = generateHash(client);

    // Se hash mudou desde última sync, foi editado
    if (client.sync_hash !== currentHash) {
      changes.push({
        type: "client",
        id: client.id,
        data: client,
        oldHash: client.sync_hash,
        newHash: currentHash,
      });
    }
  }

  return changes;
}
```

---

## MODAL DE CONFLITOS (Interface do Usuário)

### Quando aparece?

Quando mesmo registro foi editado em LOCAL e CLOUD:

```
Local:  Cliente #5 - Nome: "João Silva Jr"   (editado ontem offline)
Cloud:  Cliente #5 - Nome: "João da Silva"   (editado hoje online)
```

### Interface do Modal

```tsx
// components/ConflictModal.tsx

function ConflictModal({ conflicts }: { conflicts: Conflict[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const conflict = conflicts[currentIndex];

  return (
    <Dialog open>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            ⚠️ Conflito Encontrado ({currentIndex + 1} de {conflicts.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Este {conflict.type} foi editado em dois lugares diferentes. Escolha
            qual versão manter:
          </p>

          {/* Versão LOCAL */}
          <div className="border-2 border-blue-500 p-4 rounded">
            <h3 className="font-bold flex items-center gap-2">
              💻 Versão Local (Seu PC)
              <span className="text-xs text-gray-500">
                Editado há {timeAgo(conflict.local.updatedAt)}
              </span>
            </h3>
            <div className="mt-2 space-y-1">
              {renderFields(conflict.local.data)}
            </div>
            <Button
              onClick={() => resolveConflict(conflict, "local")}
              className="mt-2 w-full"
              variant="default"
            >
              ✅ Manter Versão Local
            </Button>
          </div>

          {/* Versão CLOUD */}
          <div className="border-2 border-green-500 p-4 rounded">
            <h3 className="font-bold flex items-center gap-2">
              ☁️ Versão Cloud (Online)
              <span className="text-xs text-gray-500">
                Editado há {timeAgo(conflict.cloud.updatedAt)}
              </span>
            </h3>
            <div className="mt-2 space-y-1">
              {renderFields(conflict.cloud.data)}
            </div>
            <Button
              onClick={() => resolveConflict(conflict, "cloud")}
              className="mt-2 w-full"
              variant="outline"
            >
              ✅ Manter Versão Cloud
            </Button>
          </div>

          {/* Opção: Manter AMBOS (criar duplicado) */}
          <Button
            onClick={() => resolveConflict(conflict, "both")}
            variant="secondary"
            className="w-full"
          >
            📋 Manter Ambas (criar 2 registros)
          </Button>
        </div>

        <DialogFooter>
          <p className="text-xs text-gray-500">
            {conflicts.length - currentIndex - 1} conflitos restantes
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Exemplo Visual do Modal

```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Conflito Encontrado (1 de 2)                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Este cliente foi editado em dois lugares.          │
│  Escolha qual versão manter:                        │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 💻 Versão Local (Seu PC)                   │    │
│  │ Editado há 1 dia                            │    │
│  │                                              │    │
│  │ Nome: João Silva Jr                         │    │
│  │ Email: joao@email.com                       │    │
│  │ Telefone: (11) 99999-9999                   │    │
│  │                                              │    │
│  │ [✅ Manter Versão Local]                    │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ ☁️ Versão Cloud (Online)                    │    │
│  │ Editado há 2 horas                          │    │
│  │                                              │    │
│  │ Nome: João da Silva                         │    │
│  │ Email: joao.silva@email.com                 │    │
│  │ Telefone: (11) 99999-9999                   │    │
│  │                                              │    │
│  │ [✅ Manter Versão Cloud]                    │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [📋 Manter Ambas (criar 2 registros)]              │
│                                                      │
│  1 conflito restante                                │
└──────────────────────────────────────────────────────┘
```

---

## CÓDIGO DE SINCRONIZAÇÃO COMPLETO

### lib/sync-service.ts (~600 linhas)

```typescript
// lib/sync-service.ts

import { prisma as prismaLocal } from "./db-local";
import { prisma as prismaCloud } from "./db-cloud";

interface Conflict {
  type: "client" | "appointment" | "file";
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

  // SINCRONIZAÇÃO COMPLETA
  async syncAll(): Promise<Conflict[]> {
    console.log("🔄 Iniciando sincronização...");

    this.conflicts = [];

    // 1. Sincronizar clientes
    await this.syncClients();

    // 2. Sincronizar agendamentos
    await this.syncAppointments();

    // 3. Sincronizar arquivos
    await this.syncFiles();

    console.log(
      `✅ Sincronização concluída. ${this.conflicts.length} conflitos.`
    );

    return this.conflicts;
  }

  // SINCRONIZAR CLIENTES
  private async syncClients() {
    // ENVIAR: Local → Cloud
    const localClients = await prismaLocal.client.findMany({
      where: {
        OR: [
          { syncedAt: null }, // Nunca sincronizado
          { updatedAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Editado nas últimas 24h
        ],
      },
    });

    for (const localClient of localClients) {
      // Verificar se existe no cloud
      const cloudClient = await prismaCloud.client.findUnique({
        where: { id: localClient.id },
      });

      if (!cloudClient) {
        // Não existe no cloud, criar
        await prismaCloud.client.create({ data: localClient });
        await this.markAsSynced("client", localClient.id, "local");
      } else {
        // Existe no cloud, verificar conflito
        if (this.hasConflict(localClient, cloudClient)) {
          this.conflicts.push({
            type: "client",
            id: localClient.id.toString(),
            local: {
              data: localClient,
              updatedAt: localClient.updatedAt,
            },
            cloud: {
              data: cloudClient,
              updatedAt: cloudClient.updatedAt,
            },
          });
        } else {
          // Sem conflito, atualizar cloud
          await prismaCloud.client.update({
            where: { id: localClient.id },
            data: localClient,
          });
          await this.markAsSynced("client", localClient.id, "local");
        }
      }
    }

    // BAIXAR: Cloud → Local
    const cloudClients = await prismaCloud.client.findMany({
      where: {
        updatedAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    for (const cloudClient of cloudClients) {
      const localClient = await prismaLocal.client.findUnique({
        where: { id: cloudClient.id },
      });

      if (!localClient) {
        // Não existe local, criar
        await prismaLocal.client.create({ data: cloudClient });
      } else if (!this.hasConflict(localClient, cloudClient)) {
        // Sem conflito, atualizar local
        await prismaLocal.client.update({
          where: { id: cloudClient.id },
          data: cloudClient,
        });
      }
      // Se tem conflito, já foi adicionado acima
    }
  }

  // VERIFICAR CONFLITO
  private hasConflict(local: any, cloud: any): boolean {
    // Conflito = ambos foram editados desde última sync

    // Se local nunca foi sincronizado, não é conflito
    if (!local.syncedAt) return false;

    // Se cloud foi editado DEPOIS da última sync local
    const localWasEditedAfterSync = local.updatedAt > local.syncedAt;
    const cloudWasEditedAfterSync = cloud.updatedAt > local.syncedAt;

    return localWasEditedAfterSync && cloudWasEditedAfterSync;
  }

  // MARCAR COMO SINCRONIZADO
  private async markAsSynced(
    type: "client" | "appointment" | "file",
    id: bigint,
    location: "local" | "cloud"
  ) {
    const now = new Date();

    if (location === "local") {
      await prismaLocal[type].update({
        where: { id },
        data: { syncedAt: now },
      });
    } else {
      await prismaCloud[type].update({
        where: { id },
        data: { syncedAt: now },
      });
    }
  }

  // RESOLVER CONFLITO (chamado pelo modal)
  async resolveConflict(
    conflict: Conflict,
    resolution: "local" | "cloud" | "both"
  ) {
    const { type, id, local, cloud } = conflict;

    if (resolution === "local") {
      // Manter local, sobrescrever cloud
      await prismaCloud[type].update({
        where: { id: BigInt(id) },
        data: local.data,
      });
    } else if (resolution === "cloud") {
      // Manter cloud, sobrescrever local
      await prismaLocal[type].update({
        where: { id: BigInt(id) },
        data: cloud.data,
      });
    } else if (resolution === "both") {
      // Criar duplicado
      // Local mantém ID original
      // Cloud cria novo registro com novo ID
      const newCloudRecord = await prismaCloud[type].create({
        data: { ...cloud.data, id: undefined }, // Remove ID para criar novo
      });
    }

    // Marcar como resolvido
    await this.markAsSynced(type, BigInt(id), "local");
    await this.markAsSynced(type, BigInt(id), "cloud");
  }
}

export const syncService = new SyncService();
```

---

## INTERFACE DO USUÁRIO

### Botão de Sincronização

```tsx
// components/SyncButton.tsx

function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Carregar última sync
    const lastSyncStr = localStorage.getItem("lastSyncTime");
    if (lastSyncStr) {
      setLastSync(new Date(lastSyncStr));
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);

    try {
      const conflicts = await syncService.syncAll();

      if (conflicts.length > 0) {
        // Mostrar modal de conflitos
        showConflictModal(conflicts);
      } else {
        toast.success("✅ Sincronizado com sucesso!");
      }

      setLastSync(new Date());
    } catch (error) {
      toast.error("❌ Erro ao sincronizar");
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={syncing || !navigator.onLine}
        variant="outline"
        size="sm"
      >
        {syncing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4 mr-2" />
            Sincronizar
          </>
        )}
      </Button>

      {lastSync && (
        <span className="text-xs text-gray-500">
          Última sync:{" "}
          {formatDistanceToNow(lastSync, { locale: ptBR, addSuffix: true })}
        </span>
      )}

      {!navigator.onLine && (
        <span className="text-xs text-red-500">📴 Offline</span>
      )}
    </div>
  );
}
```

### Badge de Status

```tsx
// components/SyncStatus.tsx

function SyncStatus() {
  const [status, setStatus] = useState<"synced" | "pending" | "offline">(
    "pending"
  );
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Verificar status
    checkSyncStatus();

    // Atualizar a cada minuto
    const interval = setInterval(checkSyncStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSyncStatus = async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    // Contar registros não sincronizados
    const count = await countUnsyncedRecords();
    setPendingCount(count);

    setStatus(count > 0 ? "pending" : "synced");
  };

  const statusConfig = {
    synced: {
      icon: "✅",
      text: "Sincronizado",
      color: "text-green-600 bg-green-100",
    },
    pending: {
      icon: "⚠️",
      text: `${pendingCount} não sincronizados`,
      color: "text-yellow-600 bg-yellow-100",
    },
    offline: {
      icon: "📴",
      text: "Offline",
      color: "text-gray-600 bg-gray-100",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon} {config.text}
    </div>
  );
}
```

---

## CONFIGURAÇÃO DO PRISMA DUAL

### prisma/schema-local.prisma (SQLite)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client-local"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Modelos (igual schema-cloud, mas SQLite)
model Client {
  id        BigInt    @id @default(autoincrement())
  name      String
  syncedAt  DateTime? @map("synced_at")
  // ... resto dos campos
}
```

### prisma/schema-cloud.prisma (PostgreSQL)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client-cloud"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelos (igual schema-local, mas PostgreSQL)
model Client {
  id        BigInt    @id @default(autoincrement())
  name      String
  syncedAt  DateTime? @map("synced_at")
  // ... resto dos campos
}
```

### lib/db-local.ts

```typescript
import { PrismaClient as PrismaClientLocal } from "../node_modules/.prisma/client-local";

const globalForPrisma = globalThis as unknown as {
  prismaLocal: PrismaClientLocal | undefined;
};

export const prisma = globalForPrisma.prismaLocal ?? new PrismaClientLocal();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaLocal = prisma;
}
```

### lib/db-cloud.ts

```typescript
import { PrismaClient as PrismaClientCloud } from "../node_modules/.prisma/client-cloud";

const globalForPrisma = globalThis as unknown as {
  prismaCloud: PrismaClientCloud | undefined;
};

export const prisma = globalForPrisma.prismaCloud ?? new PrismaClientCloud();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaCloud = prisma;
}
```

---

## TEMPO DE DESENVOLVIMENTO

```
Semana 1: Setup projeto + contas            (5 dias)
Semana 2-3: Migrar frontend React           (10 dias)
Semana 4: Migrar APIs básicas               (5 dias)
Semana 5: Implementar SINCRONIZAÇÃO         (7 dias) ← NOVO
 - Dia 1-2: Lógica de sync
 - Dia 3-4: Detecção de conflitos
 - Dia 5-6: Interface do modal
 - Dia 7: Testes
Semana 6: Testes e deploy                   (5 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 6 semanas (32 dias úteis)
```

---

## TAMANHO DO CÓDIGO

```
Sistema Base Next.js:             ~3.000 linhas
+ Sincronização (sync-service):   ~  600 linhas
+ Interface (modal conflitos):    ~  200 linhas
+ Scheduler (automático 24h):     ~  100 linhas
+ Badges e indicadores:           ~  100 linhas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                            ~4.000 linhas (+33%)
```

---

## CUSTO (AINDA $0/MÊS!)

```
Vercel FREE:              $0
Supabase FREE:            $0
Sincronização:            $0 (apenas código)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                    $0/mês ✅
```

---

## RESUMO FINAL

### ✅ O que você terá:

1.  **Sistema Local** (offline)

                                                                                                - Roda em localhost:3000
                                                                                                - SQLite + arquivos locais
                                                                                                - Funciona SEM internet

2.  **Sistema Cloud** (online)

                                                                                                - Deploy na Vercel
                                                                                                - Supabase PostgreSQL + Storage
                                                                                                - Acesso de qualquer lugar

3.  **Sincronização Inteligente**

                                                                                                - Manual: botão "Sincronizar"
                                                                                                - Automática ao abrir (se passou 24h)
                                                                                                - Background (a cada 24h)
                                                                                                - Resolução de conflitos via interface

4.  **Interface Completa**

                                                                                                - Badge mostrando status
                                                                                                - Contador de itens não sincronizados
                                                                                                - Modal bonito para resolver conflitos
                                                                                                - Indicador online/offline

### 📊 Uso Típico (5 clientes/dia):

```
Sincronização diária:
- 5 clientes × 30 dias = 150 registros/mês
- 150 × 5KB cada = 750KB/mês
- MUITO dentro dos limites FREE ✅
```

---

## POSSO COMEÇAR A EXECUTAR?

Estou pronto para:

1. ✅ Criar projeto Next.js com estrutura dual
2. ✅ Configurar Prisma local + cloud
3. ✅ Implementar lógica de sincronização
4. ✅ Criar interface de conflitos
5. ✅ Configurar sincronização a cada 24h
6. ✅ Deploy na Vercel

**Confirma para eu começar?** 🚀
