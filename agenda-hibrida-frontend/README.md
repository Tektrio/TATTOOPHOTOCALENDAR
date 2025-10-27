# 🎨 TattooScheduler Frontend

Interface React moderna e responsiva para o sistema de agendamento para tatuadores.

## 📋 Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Build](#build)
- [Estrutura de Componentes](#estrutura-de-componentes)
- [Rotas](#rotas)
- [Estado e Gerenciamento](#estado-e-gerenciamento)
- [Integração com Backend](#integração-com-backend)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Sobre

Frontend desenvolvido em React 19.1.0 com Vite, oferecendo:

- ✅ Interface moderna e responsiva com Tailwind CSS
- ✅ Componentes reutilizáveis com shadcn/ui
- ✅ Calendário visual com múltiplas views (Mês, Semana, Dia, Lista)
- ✅ Galeria avançada com lightbox e filtros
- ✅ Sistema de validação em tempo real
- ✅ Tratamento robusto de erros com retry automático
- ✅ Upload avançado com chunks, progress e compressão
- ✅ WebSocket para sincronização em tempo real
- ✅ Otimizado para produção (code splitting, lazy loading, tree shaking)

---

## 🛠️ Tecnologias

### Core
- **React**: 19.1.0
- **Vite**: 6.3.5
- **React Router DOM**: 7.1.1

### UI e Estilo
- **Tailwind CSS**: 4.0.0
- **shadcn/ui**: Componentes customizados
- **Lucide React**: Ícones modernos
- **Radix UI**: Primitivos acessíveis

### Gerenciamento de Estado
- **Zustand**: Estado global leve
- **React Hook Form**: Formulários
- **Zod**: Validação de schemas

### Utilitários
- **date-fns**: Manipulação de datas
- **socket.io-client**: WebSocket
- **browser-image-compression**: Compressão de imagens
- **clsx + tailwind-merge**: Utilitários CSS

### Desenvolvimento
- **ESLint**: Linting
- **PostCSS**: Processamento CSS
- **Vite Bundle Analyzer**: Análise de bundle

---

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- pnpm (recomendado) ou npm

### Instalar Dependências

```bash
# Com pnpm (recomendado)
pnpm install

# Com npm
npm install
```

---

## 🚀 Desenvolvimento

### Iniciar Servidor de Desenvolvimento

```bash
# Com pnpm
pnpm dev

# Com npm
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### Características do Modo Dev
- ✅ Hot Module Replacement (HMR)
- ✅ Source maps completos
- ✅ Overlay de erros
- ✅ Fast Refresh para React

---

## 🏗️ Build

### Build de Produção

```bash
# Build otimizado
pnpm build

# Preview do build
pnpm preview
```

### Analisar Bundle

```bash
# Gera relatório de bundle size
pnpm build:analyze
```

### Otimizações Aplicadas
- ✅ Minificação com Terser
- ✅ Code splitting (chunks por categoria)
- ✅ Tree shaking
- ✅ Compressão Gzip/Brotli
- ✅ CSS code splitting
- ✅ Asset optimization
- ✅ Lazy loading de rotas
- ✅ Source maps condicionais

---

## 📂 Estrutura de Componentes

```
src/
├── components/
│   ├── ui/                          # Componentes shadcn/ui
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx
│   │   └── ... (30+ componentes)
│   │
│   ├── CalendarioVisual.jsx         # 📅 Calendário multi-view
│   ├── GoogleDriveExplorer.jsx      # ☁️ Explorador Google Drive
│   ├── AdvancedGallery.jsx          # 🖼️ Galeria avançada
│   ├── BudgetSystem.jsx             # 💰 Sistema de orçamentos
│   ├── SyncStatusIndicator.jsx      # 🔄 Indicador de sincronização
│   ├── ValidatedInput.jsx           # ✅ Inputs com validação
│   └── ...
│
├── utils/
│   ├── validation.js                # 🛡️ Funções de validação
│   ├── api.js                       # 🌐 Cliente API com retry
│   └── advancedUpload.js            # 📤 Sistema de upload avançado
│
├── hooks/
│   └── ... (custom hooks)
│
├── App.jsx                          # 🏠 Aplicação principal
├── App.css                          # 🎨 Estilos customizados
└── main.jsx                         # 🚪 Entry point
```

---

## 🗺️ Rotas

### Rotas Principais

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Dashboard | Visão geral com cards e métricas |
| `/calendario` | Calendário Visual | View mensal/semanal/diária |
| `/agendamentos` | Lista de Agendamentos | CRUD de agendamentos |
| `/clientes` | Lista de Clientes | Gerenciamento de clientes |
| `/galeria` | Galeria Avançada | Visualização e upload de fotos |
| `/google-drive` | Google Drive Explorer | Integração com Drive |
| `/orcamentos` | Sistema de Orçamentos | Calculadora e gerenciamento |
| `/importar` | Importar Dados | Import de Excel/ICS |
| `/configuracoes` | Configurações | Tipos de tatuagem, preferências |

---

## 🔄 Estado e Gerenciamento

### Estado Local (useState, useReducer)
Usado para:
- Estado de formulários
- UI temporária (modals, dropdowns)
- Estado de componentes isolados

### Estado Global (Zustand) - Planejado
Para:
- Dados do usuário autenticado
- Configurações globais
- Cache de dados frequentes

### Server State (React Query) - Futuro
Para:
- Dados do backend
- Cache e invalidação
- Sincronização automática

---

## 🌐 Integração com Backend

### Base URL

```javascript
const API_URL = 'http://localhost:3001';
```

### Endpoints Principais

#### Agendamentos
```javascript
GET    /api/appointments          // Listar
POST   /api/appointments          // Criar
PUT    /api/appointments/:id      // Atualizar
DELETE /api/appointments/:id      // Excluir
```

#### Clientes
```javascript
GET    /api/clients               // Listar
POST   /api/clients               // Criar
PUT    /api/clients/:id           // Atualizar
DELETE /api/clients/:id           // Excluir
```

#### Uploads
```javascript
POST   /api/files/upload          // Upload simples
POST   /api/files/upload/chunk    // Upload em chunks
POST   /api/files/finalize        // Finalizar upload chunks
```

#### Google Drive
```javascript
GET    /api/google-drive/files    // Listar arquivos
POST   /api/google-drive/folders  // Criar pasta
GET    /api/google-drive/download/:id  // Download
```

#### Google Calendar
```javascript
GET    /api/google-calendar/events     // Listar eventos
POST   /api/google-calendar/events     // Criar evento
PUT    /api/google-calendar/events/:id // Atualizar evento
```

### Cliente API com Retry

O arquivo `src/utils/api.js` fornece funções com retry automático:

```javascript
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '@/utils/api';

// Exemplo de uso
try {
  const clients = await apiGet('/api/clients');
  console.log(clients);
} catch (error) {
  // Erro já tratado com toasts
}
```

---

## ⚡ Performance

### Otimizações Implementadas

#### Frontend
- ✅ **Code Splitting**: Chunks por categoria (vendor-react, vendor-ui, etc)
- ✅ **Lazy Loading**: Componentes carregados sob demanda
- ✅ **Tree Shaking**: Remoção de código não utilizado
- ✅ **CSS Code Splitting**: CSS dividido por componente
- ✅ **Image Compression**: Compressão antes do upload
- ✅ **Asset Organization**: Assets organizados por tipo
- ✅ **Memoization**: `useMemo` e `useCallback` onde necessário
- ✅ **Virtual Scrolling**: Para listas longas (planejado)

#### Build
- ✅ **Terser Minification**: JavaScript otimizado
- ✅ **Gzip Compression**: Ativado no servidor
- ✅ **Conditional Source Maps**: Apenas em dev
- ✅ **Bundle Analysis**: Monitoramento de tamanho

#### Medidas de Performance

| Métrica | Valor | Status |
|---------|-------|--------|
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3s | ✅ |
| Bundle Size (gzipped) | < 500KB | ✅ |
| Lighthouse Score | > 90 | 🔄 |

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Backend

**Sintoma**: `ERR_CONNECTION_REFUSED` ou `Network Error`

**Solução**:
```bash
# Verificar se o backend está rodando
curl http://localhost:3001/health

# Iniciar backend se necessário
cd ../agenda-hibrida-v2
npm start
```

#### 2. Erro ao Instalar Dependências

**Sintoma**: `ERESOLVE unable to resolve dependency tree`

**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

#### 3. Build Falha

**Sintoma**: `Transforming... error during build`

**Solução**:
```bash
# Verificar sintaxe com ESLint
npm run lint

# Limpar e rebuildar
rm -rf dist
npm run build
```

#### 4. HMR Não Funciona

**Sintoma**: Mudanças não refletem automaticamente

**Solução**:
```bash
# Restart do dev server
# Ctrl+C, depois:
npm run dev
```

#### 5. Erro de CORS

**Sintoma**: `Access-Control-Allow-Origin header`

**Solução**: Verificar se o backend tem CORS habilitado em `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 🧪 Testes

### Executar Linting

```bash
# Verificar erros
pnpm lint

# Corrigir automaticamente
pnpm lint:fix
```

### Testes Unitários (Futuro)

```bash
# Testes com Vitest
pnpm test

# Coverage
pnpm test:coverage
```

---

## 📚 Documentação Adicional

- [**API Documentation**](../API_DOCUMENTATION.md) - Endpoints completos
- [**Component Guide**](../COMPONENT_GUIDE.md) - Guia de componentes
- [**Troubleshooting Guide**](../TROUBLESHOOTING.md) - Resolução de problemas
- [**Performance Guide**](../OTIMIZACOES_FRONTEND.md) - Otimizações implementadas

---

## 🤝 Contribuindo

### Padrões de Código

- **ESLint**: `eslint . --fix`
- **Prettier**: Integrado com ESLint
- **Commits**: Conventional Commits (feat, fix, docs, etc)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`

### Processo de PR

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adiciona minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](../LICENSE) para detalhes.

---

**Desenvolvido com ❤️ usando React + Vite**

*Última atualização: Outubro 2025*

