# Guia de Customização - Sistema de Sincronização Multi-Destino

## 📋 Visão Geral

Este guia mostra onde e como customizar cores, textos, comportamentos e UI/UX do sistema de sincronização multi-destino.

---

## 🎨 1. CORES

### 1.1 Cores dos Destinos
**Arquivo**: `agenda-hibrida-frontend/src/utils/storageConfig.js`

```javascript
// Linhas 26-67
export const DESTINATION_COLORS = {
  gdrive: [
    {
      id: 'blue',
      emoji: '🔵',
      label: 'Azul',
      bgClass: 'bg-blue-600',
      textClass: 'text-blue-400',
      // ... mais propriedades
    },
    // ... outras cores
  ],
  qnap: {
    id: 'orange',
    emoji: '🟠',
    label: 'Laranja',
    // ... propriedades
  }
};
```

**Como customizar**:
- Adicionar nova cor: Inserir novo objeto no array `gdrive`
- Mudar emoji: Alterar propriedade `emoji`
- Ajustar cor QNAP: Modificar objeto `qnap`
- Mudar classes Tailwind: Alterar `bgClass`, `textClass`, etc.

---

### 1.2 Cores de Status
**Arquivo**: `agenda-hibrida-frontend/src/utils/storageConfig.js`

```javascript
// Linhas 73-121
export const SYNC_STATUS = {
  pending: {
    label: 'Pendente',
    icon: '⏳',
    emoji: '⏳',
    color: 'yellow',
    bgClass: 'bg-yellow-600',
    // ...
  },
  synced: {
    label: 'Sincronizado',
    icon: '✓',
    emoji: '✅',
    color: 'green',
    // ...
  },
  // ... outros status
};
```

**Como customizar**:
- Mudar cores: Alterar `bgClass`, `textClass`, `borderClass`
- Mudar ícones: Alterar `icon` e `emoji`
- Mudar labels: Alterar propriedade `label`

---

### 1.3 Status Combinado
**Arquivo**: `agenda-hibrida-frontend/src/utils/storageConfig.js`

```javascript
// Linhas 126-172
export const COMBINED_STATUS = {
  local_only: {
    label: 'Apenas Local',
    emoji: '📁',
    bgClass: 'bg-teal-600',
    // ...
  },
  all_synced: {
    label: 'Tudo Sincronizado',
    emoji: '⚡',
    bgClass: 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600',
    // ...
  },
  // ...
};
```

---

## 📝 2. TEXTOS E LABELS

### 2.1 Página Principal
**Arquivo**: `agenda-hibrida-frontend/src/pages/LocalStorage.jsx`

```javascript
// Linha 112: Título seção 1
<CardTitle className="flex items-center gap-2">
  <HardDrive className="w-5 h-5" />
  Configurar Pasta Local  // ← Mudar aqui
</CardTitle>

// Linha 120: Placeholder input
<Input
  placeholder="/caminho/para/pasta/arquivos"  // ← Mudar aqui
  // ...
/>

// Linha 171: Título seção 2
<CardTitle className="flex items-center gap-2">
  <Cloud className="w-5 h-5" />
  Destinos de Sincronização  // ← Mudar aqui
</CardTitle>
```

---

### 2.2 Modais

#### Modal Google Drive
**Arquivo**: `agenda-hibrida-frontend/src/components/AddGoogleAccountModal.jsx`

```javascript
// Linha 57: Título modal
<DialogTitle className="flex items-center gap-2">
  <Cloud className="w-5 h-5" />
  Adicionar Conta Google Drive  // ← Mudar aqui
</DialogTitle>

// Linha 67: Label input
<Label htmlFor="account-name">Nome da Conta</Label>  // ← Mudar aqui

// Linha 70: Placeholder
<Input
  placeholder="Ex: Backup, Trabalho, Compartilhada..."  // ← Mudar aqui
/>
```

#### Modal QNAP
**Arquivo**: `agenda-hibrida-frontend/src/components/QnapConfigModal.jsx`

```javascript
// Linha 112: Título
<DialogTitle>
  {initialConfig ? 'Editar' : 'Configurar'} QNAP NAS  // ← Mudar aqui
</DialogTitle>

// Todas as labels estão nas linhas 123-234
```

#### Modal Sincronização
**Arquivo**: `agenda-hibrida-frontend/src/components/SyncSelectionModal.jsx`

```javascript
// Linha 142: Título
<DialogTitle>
  Sincronizar: {fileName}  // ← Mudar aqui
</DialogTitle>
```

---

### 2.3 Componentes

#### Destination Manager
**Arquivo**: `agenda-hibrida-frontend/src/components/DestinationManager.jsx`

```javascript
// Linha 35: Badge status ativo
<Badge variant="outline" className="border-green-500 text-green-400">
  <CheckCircle className="w-3 h-3 mr-1" />
  Ativo  // ← Mudar aqui
</Badge>
```

#### Local File Table
**Arquivo**: `agenda-hibrida-frontend/src/components/LocalFileTable.jsx`

```javascript
// Linha 96: Título
<CardTitle className="flex items-center gap-2">
  📁 Arquivos Locais  // ← Mudar aqui
  <Badge variant="outline">{processedFiles.length}</Badge>
</CardTitle>

// Linha 128: Placeholder busca
<Input
  placeholder="Buscar por nome de arquivo ou cliente..."  // ← Mudar aqui
/>
```

---

## ⚙️ 3. COMPORTAMENTOS

### 3.1 Polling Interval (Status de Sincronização)
**Arquivo**: `agenda-hibrida-frontend/src/hooks/useSyncStatus.js`

```javascript
// Linha 98-104: Intervalo de polling
useEffect(() => {
  if (!fileId) return;

  const interval = setInterval(() => {
    fetchStatus();
  }, 30000); // ← Mudar aqui (30000ms = 30 segundos)

  return () => clearInterval(interval);
}, [fileId, fetchStatus]);
```

**Valores sugeridos**:
- 10000 (10s) - Mais responsivo, mais requests
- 30000 (30s) - Balanceado (padrão)
- 60000 (60s) - Menos requests, menos responsivo

---

### 3.2 Prioridades da Fila
**Arquivo**: `agenda-hibrida-frontend/src/components/SyncSelectionModal.jsx`

```javascript
// Linha 92: Prioridade padrão
const [priority, setPriority] = useState(5);  // ← Mudar aqui (1-10)

// Linha 215: Range de prioridade
<input
  type="range"
  min="1"    // ← Mudar min
  max="10"   // ← Mudar max
  value={priority}
/>
```

---

### 3.3 File Watcher (Debounce)
**Arquivo**: `agenda-hibrida-v2/services/localFileWatcher.js`

```javascript
// Implementar debounce no watcher se necessário
// Exemplo:
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Usar no evento 'add' ou 'change'
this.watcher.on('add', debounce(async (filePath) => {
  // ...
}, 1000)); // ← Tempo de debounce em ms
```

---

### 3.4 Regras de Auto-Sync
**Arquivo**: Backend SQL + Frontend

**Criar regra via SQL**:
```sql
INSERT INTO sync_rules (destination_id, auto_sync, categories)
VALUES (1, 1, '["fotos_finais", "desenhos_aprovados"]');
```

**Ou via API**:
```javascript
// Adicionar endpoint em routes/syncRouter.js
router.post('/rules', async (req, res) => {
  const { destinationId, autoSync, categories } = req.body;
  // Implementar lógica
});
```

---

### 3.5 Retry Automático (Fila)
**Arquivo**: `agenda-hibrida-v2/services/syncQueue.js`

```javascript
// Linha 1-10: Configuração do Bull Queue
const syncQueue = new Queue('file sync', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
  // Adicionar opções de retry:
  defaultJobOptions: {
    attempts: 3,           // ← Número de tentativas
    backoff: {
      type: 'exponential',
      delay: 2000          // ← Delay entre retries
    }
  }
});
```

---

## 🎨 4. UI/UX

### 4.1 Layout da Página Principal
**Arquivo**: `agenda-hibrida-frontend/src/pages/LocalStorage.jsx`

```javascript
// Linha 98: Container principal
<div className="p-6 space-y-6">  // ← Ajustar padding e spacing

// Linha 203: Grid de destinos
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  // ← Ajustar breakpoints e gap
```

**Sugestões de customização**:
- `p-6` → `p-4` ou `p-8` (padding)
- `space-y-6` → `space-y-4` ou `space-y-8` (espaçamento vertical)
- `grid-cols-3` → `grid-cols-2` ou `grid-cols-4` (colunas)

---

### 4.2 Tamanho dos Cards de Destino
**Arquivo**: `agenda-hibrida-frontend/src/components/DestinationManager.jsx`

```javascript
// Linha 21: Card container
<Card className={`border-2 ${colorConfig.borderClass} ...`}>
  // ← Adicionar classes de altura/largura

// Linha 29: Ícone do destino
<div className={`p-2 rounded-lg ${colorConfig.bgClass}`}>
  <Icon className="w-5 h-5 text-white" />  // ← Ajustar tamanho
</div>

// Linha 49: Grid de estatísticas
<div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-lg">
  // ← Ajustar layout
```

---

### 4.3 Formato dos Badges de Status
**Arquivo**: `agenda-hibrida-frontend/src/components/SyncStatusIndicator.jsx`

```javascript
// Linha 46: Container dos badges
<div className="flex items-center gap-1">  // ← Ajustar gap

// Linha 82: Tamanho do emoji
<span className={`inline-flex items-center gap-0.5 ${compact ? 'text-base' : 'text-lg'}`}>
  // ← Ajustar tamanhos
```

---

### 4.4 Tabela de Arquivos
**Arquivo**: `agenda-hibrida-frontend/src/components/LocalFileTable.jsx`

```javascript
// Linha 123: Placeholder busca
<Input
  placeholder="Buscar por nome de arquivo ou cliente..."
  className="pl-10"  // ← Ajustar padding left para ícone
/>

// Linha 147: Tamanho da tabela
<div className="overflow-x-auto">  // ← Adicionar altura máxima se necessário
  <table className="w-full">
```

---

## 🔧 5. CONFIGURAÇÕES AVANÇADAS

### 5.1 Limite de Arquivos na Listagem
**Arquivo**: `agenda-hibrida-frontend/src/components/LocalFileTable.jsx`

```javascript
// Adicionar paginação ou limite
const ITEMS_PER_PAGE = 50;  // ← Definir limite

const paginatedFiles = useMemo(() => {
  return processedFiles.slice(0, ITEMS_PER_PAGE);
}, [processedFiles]);
```

---

### 5.2 Timeout de Requisições
**Arquivo**: Qualquer arquivo que faz `fetch`

```javascript
const fetchWithTimeout = async (url, options, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
```

---

### 5.3 Tamanho Máximo de Upload
**Arquivo**: `agenda-hibrida-v2/routes/localStorageRouter.js` ou middleware

```javascript
// Adicionar middleware de limite
const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024  // ← 100MB (ajustar)
  }
});
```

---

## 📊 6. ESTATÍSTICAS E LOGS

### 6.1 Adicionar Logs Detalhados
**Arquivo**: Qualquer service

```javascript
// Adicionar logger
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'sync-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'sync-combined.log' })
  ]
});

// Usar em operações
logger.info('File synced', { fileId, destinationId, duration });
logger.error('Sync failed', { fileId, error: err.message });
```

---

### 6.2 Métricas de Performance
**Arquivo**: `agenda-hibrida-v2/services/multiDestinationSyncService.js`

```javascript
// Adicionar tracking de tempo
const startTime = Date.now();
await googleDriveService.uploadFile(...);
const duration = Date.now() - startTime;

// Salvar métrica
await db.run(`
  INSERT INTO sync_metrics (file_id, destination_id, duration_ms, status)
  VALUES (?, ?, ?, ?)
`, [fileId, destId, duration, 'success']);
```

---

## ✅ 7. CHECKLIST DE AJUSTES COMUNS

### Tradução e Textos
- [ ] Traduzir labels em `LocalStorage.jsx`
- [ ] Traduzir placeholders nos modais
- [ ] Ajustar mensagens de erro
- [ ] Customizar tooltips em `SyncStatusIndicator.jsx`

### Cores e Tema
- [ ] Ajustar cores dos destinos em `storageConfig.js`
- [ ] Modificar cores de status
- [ ] Customizar gradientes de status combinado
- [ ] Ajustar contraste para acessibilidade

### Comportamento
- [ ] Ajustar intervalo de polling
- [ ] Configurar regras de auto-sync
- [ ] Modificar prioridades padrão
- [ ] Configurar retry automático
- [ ] Ajustar debounce do file watcher

### UI/UX
- [ ] Ajustar layout da página (padding, spacing)
- [ ] Modificar grid de destinos (colunas)
- [ ] Customizar tamanho de cards
- [ ] Ajustar formato de badges
- [ ] Modificar table responsive

### Performance
- [ ] Adicionar paginação
- [ ] Configurar timeout de requests
- [ ] Ajustar limite de upload
- [ ] Implementar lazy loading
- [ ] Adicionar caching

### Avançado
- [ ] Adicionar logs detalhados
- [ ] Implementar métricas
- [ ] Criar dashboard de estatísticas
- [ ] Adicionar notificações push
- [ ] Implementar compressão de arquivos

---

## 🚀 8. COMO APLICAR CUSTOMIZAÇÕES

### Passo 1: Identificar o que customizar
Consulte as seções 1-6 deste guia para localizar o arquivo e linha exata.

### Passo 2: Fazer backup
```bash
git stash  # ou criar branch
```

### Passo 3: Editar arquivo
Use seu editor preferido para modificar os valores.

### Passo 4: Testar
```bash
# Backend
cd agenda-hibrida-v2
npm run dev

# Frontend
cd agenda-hibrida-frontend
npm run dev
```

### Passo 5: Validar
- Verificar visualmente no browser
- Testar funcionalidade
- Verificar console para erros

### Passo 6: Commit
```bash
git add .
git commit -m "Customização: [descrição]"
```

---

## 📞 9. SUPORTE

### Arquivos Principais
- **Cores**: `storageConfig.js`
- **Textos**: Componentes `.jsx`
- **Comportamentos**: Services `.js` + Hooks
- **UI/UX**: Páginas e componentes `.jsx`

### Estrutura de Diretórios
```
agenda-hibrida-v2/
├── services/         # Lógica backend
├── routes/           # Endpoints API
├── utils/            # Utilidades backend
└── lib/              # Clientes (QNAP, etc)

agenda-hibrida-frontend/src/
├── components/       # Componentes React
├── pages/            # Páginas
├── hooks/            # Hooks customizados
├── utils/            # Utilidades frontend
└── services/         # WebSocket, etc
```

---

**Última atualização**: 29 de Outubro de 2025  
**Versão**: 1.0.0

