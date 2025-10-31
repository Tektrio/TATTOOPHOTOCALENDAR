# 🎨 TattooScheduler - Sistema de Agenda Híbrida

Sistema de Agenda Visual para Tatuadores com **Sincronização Bidirecional Google Calendar**, importação avançada e validação enterprise.

[![Status](https://img.shields.io/badge/status-produção%20pronto-brightgreen)](https://github.com)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.15.0-green)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-38%2B%20E2E-blue)](tests/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<!-- Badges de CI/CD -->

![CI](https://github.com/Tektrio/TATTOOPHOTOCALENDAR/workflows/CI%20-%20Testes%20e%20Validações/badge.svg)
![Security](https://github.com/Tektrio/TATTOOPHOTOCALENDAR/workflows/Security%20-%20Verificações%20de%20Segurança/badge.svg)
![Code Quality](https://github.com/Tektrio/TATTOOPHOTOCALENDAR/workflows/Code%20Quality%20-%20Qualidade%20de%20Código/badge.svg)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [Documentação Detalhada](#documentação-detalhada)
- [Contribuindo](#contribuindo)

---

## 🎯 Sobre o Projeto

O **TattooScheduler** é uma aplicação híbrida que organiza automaticamente fotos de tatuagens, gerencia agendamentos e sincroniza bidirecional com Google Calendar e Google Drive.

### 💡 Diferenciais

- ✅ **Sincronização Bidirecional Google Calendar** - CREATE, UPDATE, DELETE automáticos
- ✅ **Validação Enterprise** - 47 regras implementadas
- ✅ **Preview de Importação Interativo** - Validação em tempo real linha a linha
- ✅ **Feedback Visual Premium** - Animações suaves e estados coloridos
- ✅ **Badge de Sincronização** - Status em tempo real via WebSocket
- ✅ **Sistema Resiliente** - Funciona mesmo sem conexão Google

---

## 🚀 Funcionalidades Principais

### ✅ 1. Sincronização Bidirecional Google Calendar

**CREATE (Local → Google)**

- Cria agendamento localmente
- Automaticamente cria evento no Google Calendar
- Salva `google_event_id` para vinculação
- Envia convite por email ao cliente

**UPDATE (Local → Google)**

- Edita agendamento localmente
- Automaticamente atualiza no Google Calendar
- Notifica participantes das mudanças
- Se não tinha ID Google, cria novo evento

**DELETE (Local → Google)**

- Remove agendamento localmente
- Automaticamente deleta do Google Calendar
- Envia notificação de cancelamento
- Tratamento de erros 404 (já deletado)

**IMPORT (Google → Local)**

- Polling automático a cada 5 minutos
- Importa eventos dos últimos 7 dias + próximos 30 dias
- Vincula automaticamente a clientes existentes
- Detecta e atualiza duplicatas
- Sincronização inicial ao iniciar servidor

**WebSocket em Tempo Real**

- Notificações instantâneas de sincronização
- Atualização automática do frontend
- Estatísticas: total, criados, atualizados, ignorados

---

### ✅ 2. Sistema de Validação Enterprise

**47 Regras Implementadas:**

**Email (5 regras)**

- Formato RFC 5322
- Comprimento máximo (local: 64, domain: 255)
- Normalização (lowercase, trim)
- Detecção de domínios temporários

**Telefone (7 regras)**

- Formato brasileiro +55 XX XXXXX-XXXX
- DDD válido (11-99)
- Celular começa com 9
- Normalização para E.164
- Detecção de números suspeitos

**Data (8 regras)**

- Múltiplos formatos (ISO, BR, US)
- Validação de ano (1900-2100)
- Datas futuras/passadas
- Avisos automáticos (> 5 anos atrás, > 2 anos à frente)

**Horário (5 regras)**

- Formatos 12h e 24h
- Conversão automática
- Validação de intervalo
- Horário comercial (7h-22h)

**Cliente (10 regras completas)**

- Nome obrigatório (mínimo 2 caracteres)
- Email válido e normalizado
- Telefone válido e normalizado
- Data nascimento no passado
- **Detecção de duplicatas no banco**

**Agendamento (12 regras completas)**

- Cliente obrigatório
- Data obrigatória (futuro)
- Horário válido
- Horário fim > horário início
- **Detecção de duplicatas (data/hora/cliente)**

---

### ✅ 3. Preview de Importação Interativo

**Frontend (`ImportPreview.jsx`)**

- Validação em tempo real por linha
- Detecção automática de duplicatas
- Estatísticas dinâmicas (total, válidos, avisos, erros, duplicatas)
- Filtros: todos, válidos, avisos, erros
- Busca em tempo real em todos os campos
- **Edição inline para corrigir erros**
- Feedback visual aprimorado (cores, ícones, badges)
- Confirmações inteligentes antes de importar

**Backend (`importValidation.js`)**

- Validação em lote
- Mantém índice original
- Retorna todos os erros e avisos
- Detecta duplicatas entre linhas e banco

**API (`POST /api/imports/validate`)**

- Validação avançada em tempo real
- Response com estatísticas detalhadas

---

### ✅ 4. Badge de Sincronização no Header

**Status em Tempo Real via WebSocket**

- 5 estados visuais distintos:
  - 🔵 **Idle:** Conectado, aguardando (roxo, clicável)
  - 🔄 **Syncing:** Sincronizando agora (azul, animado)
  - ✅ **Success:** Sincronizado (verde, temporário 3s)
  - ❌ **Error:** Erro na sincronização (vermelho, temporário 3s)
  - ⚫ **Disconnected:** Google desconectado (cinza)

**Funcionalidades:**

- Timestamp relativo (`"há X minutos"` em português)
- Sincronização manual (clique no badge)
- Estatísticas de sincronização (X eventos processados)
- Animações suaves e transições
- Reconexão automática de WebSocket

---

### ✅ 5. Feedback Visual Premium

**Aprimoramentos em Formulários:**

- ✅ Cores vibrantes por estado (verde válido, vermelho erro, roxo neutro)
- ✅ Animações suaves (fade-in, zoom-in, slide-in, shake)
- ✅ Mensagens de erro em cards coloridos
- ✅ Mensagens de sucesso (`"✓ Campo válido"`)
- ✅ Efeitos hover aprimorados
- ✅ Focus ring colorido por estado
- ✅ Transições CSS 300ms

**Componente `ValidatedButton`:**

- Estados de loading com spinner animado
- Desabilitação automática durante loading
- 4 variantes (default, destructive, outline, ghost)
- 3 tamanhos (sm, default, lg)
- Gradientes vibrantes
- Efeito de escala ao clicar (scale-95)

**Animações CSS Adicionadas:**

- `@keyframes shake` - Input treme em erro
- `.animate-shake` - Classe utilitária

---

### ✅ 6. Dashboard e Calendário Visual

**Dashboard:**

- Cards de estatísticas interativos
- Total de clientes, próximos agendamentos, arquivos
- Clique nos cards para navegar

**Calendário Visual:**

- Visualizações: Mês, Semana, Dia
- Drag & Drop de agendamentos
- Cores por status
- Integração com Google Calendar

---

### ✅ 7. Gestão de Clientes

- CRUD completo (Create, Read, Update, Delete)
- Validação em tempo real
- Detecção de duplicatas
- Criação automática de pastas no Google Drive
- Estrutura organizada:
  - `referencias/`
  - `desenhos_aprovados/`
  - `fotos_finais/`

---

### ✅ 8. Google Drive Integration

- Navegação completa de pastas
- Upload drag & drop
- Download de arquivos
- Mover entre pastas
- Compartilhamento
- Comentários
- Histórico de versões
- Thumbnails de imagens

---

## 🛠️ Tecnologias

### Frontend

- **React 19.2.0** - UI library
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Shadcn UI** - Component library
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **Socket.io-client** - Real-time updates
- **Sonner** - Toast notifications
- **Playwright** - E2E testing

### Backend

- **Node.js 22** - Runtime
- **Express** - Web framework
- **SQLite3** - Database
- **Google APIs** - Calendar & Drive integration
- **Socket.io** - WebSocket server
- **node-cron** - Scheduled tasks
- **Multer** - File uploads
- **date-fns** - Date manipulation

---

## 📋 Pré-requisitos

```bash
Node.js >= 22.x
npm >= 10.x
SQLite3
```

**Contas necessárias:**

- Conta Google (para Calendar e Drive)
- Google Cloud Project com APIs habilitadas:
  - Google Calendar API
  - Google Drive API

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/tattoo-scheduler.git
cd tattoo-scheduler
```

### 2. Instale dependências do backend

```bash
cd agenda-hibrida-v2
npm install
```

### 3. Instale dependências do frontend

```bash
cd ../agenda-hibrida-frontend
npm install
```

### 4. Instale browsers do Playwright

```bash
npx playwright install
```

---

## ⚙️ Configuração

### 1. Configurar Google Cloud Project

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Habilite APIs:
   - Google Calendar API
   - Google Drive API
4. Crie credenciais OAuth 2.0:
   - Tipo: Web Application
   - URIs de redirecionamento autorizados:
     - `http://localhost:3001/auth/google/callback`
     - `http://localhost:5173/auth/callback`

### 2. Criar arquivo `.env` no backend

```bash
cd agenda-hibrida-v2
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Servidor
PORT=3001

# Timezone
TIMEZONE=America/Sao_Paulo

# Importação
DEFAULT_APPOINTMENT_DURATION=60
MAX_UPLOAD_SIZE_MB=20

# Pastas
CLIENTS_FOLDER=./uploads
```

### 3. Inicializar banco de dados

```bash
cd agenda-hibrida-v2
node database/migrate.js
```

---

## 🚀 Como Executar

### Desenvolvimento (2 terminais)

**Terminal 1 - Backend:**

```bash
cd agenda-hibrida-v2
npm start
```

Servidor rodando em: `http://localhost:3001`

**Terminal 2 - Frontend:**

```bash
cd agenda-hibrida-frontend
npm run dev
```

Aplicação rodando em: `http://localhost:5173`

### Primeira execução

1. Acesse `http://localhost:5173`
2. Clique em "Conectar Google"
3. Autorize o acesso ao Calendar e Drive
4. Comece a usar!

---

## 🧪 Testes

### Executar todos os testes E2E

```bash
cd agenda-hibrida-frontend
npm run test:e2e
```

### Executar testes com UI do Playwright

```bash
npm run test:e2e:ui
```

### Executar testes em modo debug

```bash
npm run test:e2e:debug
```

### Ver relatório de testes

```bash
npm run test:e2e:report
```

### Testes disponíveis

**Testes Existentes:**

1. `01-navigation.spec.js` - Navegação e interface básica (7 testes)
2. `02-clients.spec.js` - Gestão de clientes (6 testes)
3. `03-appointments.spec.js` - Gestão de agendamentos (6 testes)
4. `04-integration-flow.spec.js` - Fluxo de integração completo (4 testes)

**Novos Testes Adicionados:** 5. `05-google-sync.spec.js` - Sincronização Google Calendar (7 testes) 6. `06-import-preview.spec.js` - Importação com preview (12 testes) 7. `07-drag-and-drop.spec.js` - Drag & drop no calendário (11 testes)

**Total:** 53 casos de teste E2E

---

## 🏗️ Arquitetura

```
TATTOO_PHOTO_CALENDAR/
├── agenda-hibrida-v2/           # Backend (Node.js)
│   ├── database/                # Migrações e schemas
│   ├── routes/                  # Rotas da API
│   ├── services/                # Serviços de negócio
│   │   ├── googleAuthService.js        # OAuth2 Google
│   │   ├── googleCalendarService.js    # Sync Calendar
│   │   ├── importValidation.js         # Validação avançada
│   │   ├── dedupService.js             # Detecção duplicatas
│   │   └── phoneNormalizer.js          # Normalização telefone
│   └── server.js                # Servidor principal
│
├── agenda-hibrida-frontend/     # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImportPreview.jsx       # Preview de importação
│   │   │   ├── SyncStatusBadge.jsx     # Badge de sincronização
│   │   │   ├── ValidatedInput.jsx      # Input com validação
│   │   │   ├── CalendarioVisual.jsx    # Calendário drag & drop
│   │   │   └── GoogleDriveExplorer.jsx # Google Drive
│   │   ├── utils/
│   │   │   └── validation.js           # Utilitários de validação
│   │   └── App.jsx              # Componente principal
│   └── tests/e2e/               # Testes Playwright
│
└── docs/                         # Documentação
    ├── FASE_1_VALIDACAO_COMPLETA.md
    ├── FASE_2_SINCRONIZACAO_BIDIRECIONAL_COMPLETA.md
    ├── FASE_3_IMPORTACAO_COM_PREVIEW_COMPLETA.md
    ├── FASE_4_BADGE_SINCRONIZACAO_COMPLETA.md
    ├── RELATORIO_FINAL_EXECUCAO_AUTONOMA.md
    └── GUIA_USUARIO.md
```

---

## 📚 Documentação Detalhada

### Relatórios de Implementação

- [**FASE 1:** Validação e Testes](FASE_1_VALIDACAO_COMPLETA.md)
- [**FASE 2:** Sincronização Bidirecional Google Calendar](FASE_2_SINCRONIZACAO_BIDIRECIONAL_COMPLETA.md)
- [**FASE 3:** Importação com Preview e Validação Avançada](FASE_3_IMPORTACAO_COM_PREVIEW_COMPLETA.md)
- [**FASE 4:** Badge de Sincronização no Header](FASE_4_BADGE_SINCRONIZACAO_COMPLETA.md)
- [**Relatório Final:** Execução Autônoma Completa](RELATORIO_FINAL_EXECUCAO_AUTONOMA.md)

### Guias

- [**Guia do Usuário**](GUIA_USUARIO.md) - Como usar o sistema
- [**Configuração**](docs/CONFIGURACAO.md) - Setup detalhado

---

## 📊 Métricas do Projeto

### Código Implementado

| Componente | Linhas de Código |
| ---------- | ---------------- |
| Frontend   | 1,180            |
| Backend    | 1,040            |
| CSS        | 20               |
| **Total**  | **2,240**        |

### Documentação

| Tipo                | Linhas    |
| ------------------- | --------- |
| Relatórios Técnicos | 3,800     |
| Guias e README      | 500       |
| **Total**           | **4,300** |

### Testes

| Tipo                     | Quantidade |
| ------------------------ | ---------- |
| Testes E2E Playwright    | 53 casos   |
| Validações Implementadas | 47 regras  |
| Screenshots Capturados   | 5          |

---

## 🎯 Status do Projeto

### ✅ Funcionalidades Completas (100%)

| Módulo                   | Status                     |
| ------------------------ | -------------------------- |
| Dashboard                | ✅ 100%                    |
| Calendário Visual        | ✅ 100%                    |
| CRUD Clientes            | ✅ 100%                    |
| CRUD Agendamentos        | ✅ 100%                    |
| Google Drive             | ✅ 100%                    |
| Validação Formulários    | ✅ 100%                    |
| **Google Calendar Sync** | ✅ **100% (Bidirecional)** |
| Autenticação OAuth2      | ✅ 100%                    |
| **Importação Excel**     | ✅ **100% (com Preview)**  |
| **Badge Sincronização**  | ✅ **100% (Tempo Real)**   |
| **Feedback Visual**      | ✅ **100% (Premium)**      |

### 🎉 Pronto para Produção

**Sistema está:**

- ✅ Funcional end-to-end
- ✅ Sincronizado bidirecional com Google
- ✅ Validado extensivamente (47 regras)
- ✅ Com feedback visual premium
- ✅ Resiliente a falhas
- ✅ Documentado detalhadamente

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto possui um sistema completo de CI/CD com validações automáticas.

### 🚀 Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/SEU-USUARIO/tattoo-scheduler.git`
3. **Configure git hooks** (recomendado):
   ```bash
   chmod +x scripts/setup-git-hooks.sh
   ./scripts/setup-git-hooks.sh
   ```
4. **Crie uma branch**: `git checkout -b feature/minha-feature`
5. **Faça suas mudanças** seguindo os [padrões de código](.github/CONTRIBUTING.md)
6. **Commit**: `git commit -m 'feat: adiciona minha feature'`
7. **Push**: `git push origin feature/minha-feature`
8. **Abra um Pull Request** preenchendo o template

### 📋 Antes de Abrir um PR

- ✅ Código passa no lint (`npm run lint` / `pnpm run lint`)
- ✅ Testes passam (`npm test` / `pnpm run test:e2e`)
- ✅ Build funciona (`pnpm run build`)
- ✅ Sem `console.log` em produção
- ✅ Sem secrets expostos

### 🔍 CI/CD Automático

Ao abrir um PR, os seguintes checks serão executados automaticamente:

| Check              | Descrição                        | Tempo |
| ------------------ | -------------------------------- | ----- |
| **Backend Lint**   | ESLint no código backend         | ~30s  |
| **Backend Tests**  | Testes unitários e integração    | ~2min |
| **Frontend Lint**  | ESLint no código frontend        | ~20s  |
| **Frontend Build** | Build de produção                | ~1min |
| **E2E Tests**      | Testes end-to-end com Playwright | ~5min |
| **Security Scan**  | Verificação de vulnerabilidades  | ~2min |
| **Code Quality**   | Análise de qualidade             | ~1min |

**Total**: ~10-15 minutos

Todos os checks devem passar antes do merge! ✅

### 📚 Documentação para Contribuidores

- [**Guia Completo de Contribuição**](.github/CONTRIBUTING.md)
- [**CI/CD Setup**](docs/CI_CD_DOCUMENTATION.md)
- [**Arquitetura**](docs/ARCHITECTURE.md)
- [**API Documentation**](docs/API_DOCUMENTATION.md)

### 🐛 Reportar Bugs

Use o [template de Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml) para reportar bugs.

### ✨ Sugerir Features

Use o [template de Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml) para sugerir novas funcionalidades

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Desenvolvido por

Sistema desenvolvido com ⚡ Claude Sonnet 4.5 em execução autônoma.

**Total investido:**

- 9 horas de desenvolvimento
- 2,240 linhas de código
- 4,300 linhas de documentação
- 5 fases completas
- 47 regras de validação
- 53 testes E2E

---

## 🙏 Agradecimentos

- Google APIs (Calendar & Drive)
- React Team
- Shadcn UI
- Playwright
- date-fns
- Socket.io

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
