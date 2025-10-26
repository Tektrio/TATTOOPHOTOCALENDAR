# 🎨 TattooScheduler Visual System

Sistema de Agenda Visual para Tatuadores - Organize automaticamente fotos, clientes e agendamentos com integração Google Calendar e Google Drive.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](https://github.com)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.15.0-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Como Testar](#como-testar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **TattooScheduler Visual System** é uma aplicação híbrida revolucionária que combina as funcionalidades do Mylio Photos com um sistema de agenda específico para tatuadores. O sistema organiza automaticamente fotos de tatuagens por data e cliente, integra com Google Calendar e Google Drive, e apresenta uma interface visual temporal para navegação intuitiva do histórico de trabalhos.

### 💡 Problema que Resolve

- **Desorganização**: Milhares de fotos sem organização temporal
- **Agenda Desconectada**: Agendamentos separados das fotos dos trabalhos
- **Busca Ineficiente**: Dificuldade para encontrar trabalhos específicos por data/cliente
- **Backup Manual**: Risco de perda de portfólio
- **Interface Inadequada**: Ferramentas genéricas não atendem necessidades específicas

### ✨ Solução Proposta

Sistema visual temporal que:
- ✅ **Organiza automaticamente** fotos por data e cliente
- ✅ **Integra agenda** com visualização das fotos no calendário
- ✅ **Sincroniza** com Google Drive e Google Calendar
- ✅ **Interface temporal** similar ao Mylio Photos
- ✅ **Busca inteligente** por cliente, data, tipo de trabalho
- ✅ **Backup automático** e sincronização em nuvem

---

## 🚀 Funcionalidades

### ✅ Implementadas

#### 📅 Sistema de Organização Temporal
- **Timeline por Anos**: Navegue visualmente pelo histórico de trabalhos
- **Timeline por Meses**: Visualize fotos representativas de cada mês
- **Timeline por Dias**: Calendário com fotos nos dias correspondentes
- **Calendário Visual**: Interface intuitiva inspirada no Mylio Photos

#### 🗂️ Gestão Automática de Pastas
- **Criação Automática**: Pastas criadas automaticamente para cada cliente
- **Estrutura Organizada**: 
  - `01_Referencias`
  - `02_Desenhos_Aprovados`
  - `03_Processo`
  - `04_Fotos_Finais`
  - `05_Cuidados_Pos_Tatuagem`

#### 🔄 Sincronização Google
- **Google Calendar**: Sincronização bidirecional de eventos
- **Google Drive**: Backup e organização automática
- **Sincronização em Tempo Real**: Detecta novos agendamentos automaticamente

#### 🔍 Sistema de Busca
- **Busca por Cliente**: Encontre rapidamente trabalhos por nome ou telefone
- **Busca por Data**: Navegação temporal por períodos específicos
- **Filtros Avançados**: Por tipo de trabalho, localização corporal, etc.

#### 🖼️ Galeria Avançada
- **Visualização em Grid**: Organização visual de fotos
- **Preview Rápido**: Hover para preview das imagens
- **Zoom e Navegação**: Funcionalidades de galeria profissional
- **Upload Drag & Drop**: Arraste e solte para fazer upload

#### 💰 Sistema de Orçamentos
- **Calculadora Integrada**: Precificação de trabalhos
- **Histórico de Preços**: Controle financeiro
- **Relatórios**: Análise de faturamento

### 🔜 Em Desenvolvimento

- 🤖 **IA para Categorização**: Reconhecimento automático de características
- 📱 **App Mobile**: Versão React Native
- 📊 **Analytics Avançados**: Relatórios de produtividade
- 🌐 **Portfólio Público**: Geração automática de site
- 💳 **Pagamentos**: Integração com PIX e cartões

---

## 🛠️ Tecnologias

### Frontend

- **React 19.1.0** - Biblioteca JavaScript para interfaces
- **Vite 6.3.5** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI modernos
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **FullCalendar.js** - Componente de calendário

### Backend

- **Node.js 22.15.0** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **SQLite3** - Banco de dados local
- **Prisma** - ORM moderno
- **Sharp** - Processamento de imagens
- **Multer** - Upload de arquivos

### Integrações

- **Google Calendar API** - Sincronização de eventos
- **Google Drive API** - Armazenamento em nuvem
- **OAuth2** - Autenticação Google

### DevTools

- **MCPs (Model Context Protocols)**: 
  - Filesystem MCP
  - Memory MCP
  - Chrome DevTools MCP

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js**: versão 18.0.0 ou superior
  ```bash
  node --version  # Deve retornar v18.x.x ou superior
  ```

- **npm** ou **pnpm**: gerenciador de pacotes
  ```bash
  npm --version   # ou
  pnpm --version
  ```

- **Conta Google**: para integração com Calendar e Drive
  - Google Calendar API habilitada
  - Google Drive API habilitada
  - Credenciais OAuth2 configuradas

---

## 🚀 Como Executar

### 1️⃣ Clone o Repositório

```bash
git clone <url-do-repositorio>
cd agenda-hibrida-v2
```

### 2️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Backend
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# Google APIs
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Google Drive
GOOGLE_DRIVE_ROOT_FOLDER=TattooScheduler_Portfolio
```

### 3️⃣ Instale as Dependências

#### Backend

```bash
cd agenda-hibrida-v2
npm install
```

#### Frontend

```bash
cd agenda-hibrida-frontend
pnpm install  # ou npm install
```

### 4️⃣ Execute o Backend

```bash
cd agenda-hibrida-v2
npm start
```

O backend estará rodando em: **http://localhost:3001**

### 5️⃣ Execute o Frontend

Em outro terminal:

```bash
cd agenda-hibrida-frontend
pnpm dev  # ou npm run dev
```

O frontend estará rodando em: **http://localhost:5175**

### 6️⃣ Acesse a Aplicação

Abra seu navegador e acesse:

```
http://localhost:5175
```

---

## 🧪 Como Testar

### Testes Automatizados

```bash
# Backend
cd agenda-hibrida-v2
npm test

# Frontend
cd agenda-hibrida-frontend
pnpm test
```

### Testes Manuais

#### 1. Teste o Calendário Visual

```bash
./TESTAR_CALENDARIO_VISUAL.sh
```

#### 2. Teste a Sincronização

```bash
./TESTAR_SINCRONIZACAO.sh
```

#### 3. Teste o Google Drive

```bash
./TESTE_RAPIDO_GOOGLE_DRIVE.sh
```

#### 4. Teste Upload de Fotos

```bash
./TESTE_THUMBNAILS.sh
```

### Testes de Integração

1. **Teste Google Calendar**:
   - Crie um evento no Google Calendar
   - Verifique se aparece na aplicação
   - Confirme a criação automática de pastas no Drive

2. **Teste Google Drive**:
   - Faça upload de uma foto
   - Verifique se foi salva no Drive
   - Confirme a criação de thumbnails

3. **Teste Timeline**:
   - Navegue pelos anos, meses e dias
   - Verifique se as fotos aparecem corretamente
   - Teste os filtros de busca

---

## 📁 Estrutura do Projeto

```
agenda-hibrida-v2/
├── agenda-hibrida-frontend/          # Frontend React
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── CalendarioVisual.jsx  # Calendário com timeline
│   │   │   ├── GoogleDriveExplorer.jsx
│   │   │   ├── AdvancedGallery.jsx
│   │   │   ├── BudgetSystem.jsx
│   │   │   └── ui/                   # Componentes shadcn/ui
│   │   ├── hooks/                    # Custom hooks
│   │   ├── lib/                      # Utilitários
│   │   └── main.jsx                  # Entry point
│   ├── public/                       # Arquivos estáticos
│   ├── package.json
│   └── vite.config.js
│
├── agenda-hibrida-v2/                # Backend Node.js
│   ├── routes/                       # Rotas da API
│   ├── services/                     # Serviços (Google APIs)
│   ├── models/                       # Modelos de dados
│   ├── utils/                        # Utilitários
│   ├── package.json
│   └── server.js
│
├── test-*.js                         # Scripts de teste
├── *.sh                              # Scripts de automação
├── *.md                              # Documentação
└── README.md                         # Este arquivo
```

---

## 📚 Documentação

### Documentação Principal

- [**00_COMECE_AQUI.md**](00_COMECE_AQUI.md) - Guia de início rápido
- [**Product Requirements Document (PRD).md**](Product%20Requirements%20Document%20(PRD).md) - Requisitos completos
- [**INDICE.md**](INDICE.md) - Índice de toda documentação

### Guias Específicos

#### Funcionalidades

- [**CALENDARIO_VISUAL_MELHORADO.md**](CALENDARIO_VISUAL_MELHORADO.md) - Guia do calendário
- [**GOOGLE_DRIVE_COMPLETO.md**](GOOGLE_DRIVE_COMPLETO.md) - Integração Google Drive
- [**GUIA_TESTE_SINCRONIZACAO.md**](GUIA_TESTE_SINCRONIZACAO.md) - Sistema de sincronização

#### Configuração

- [**CONFIGURACOES_OTIMIZADAS.md**](CONFIGURACOES_OTIMIZADAS.md) - Configurações do projeto
- [**CHROME_CONFIGURACAO_COMPLETA.md**](CHROME_CONFIGURACAO_COMPLETA.md) - Setup Chrome DevTools
- [**CHECKLIST_CONFIGURACOES.md**](CHECKLIST_CONFIGURACOES.md) - Checklist de setup

#### MCPs (Model Context Protocols)

- [**RESUMO_MCPS.md**](RESUMO_MCPS.md) - Resumo dos MCPs
- [**GUIA_MCPS_INSTALADOS.md**](GUIA_MCPS_INSTALADOS.md) - Guia prático
- [**MELHORES_MCPS_DESENVOLVIMENTO.md**](MELHORES_MCPS_DESENVOLVIMENTO.md) - Lista completa

### Relatórios de Progresso

- [**ENTREGA_FINAL.md**](ENTREGA_FINAL.md) - Relatório de entrega
- [**APP_RODANDO.md**](APP_RODANDO.md) - Status da aplicação
- [**VERIFICACAO_FINAL.md**](VERIFICACAO_FINAL.md) - Verificação completa

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Concluída)

- [x] Timeline básica (Anos → Meses → Dias)
- [x] Integração Google Calendar (leitura/escrita)
- [x] Criação automática de pastas no Google Drive
- [x] Upload e organização de fotos
- [x] Busca por cliente
- [x] Interface desktop com React

### 🔄 Fase 2: Funcionalidades Avançadas (Em Andamento)

- [x] Sincronização bidirecional Google Calendar
- [ ] Sistema de tags automáticas
- [x] Busca avançada com filtros
- [ ] Dashboard com analytics
- [ ] Notificações automáticas
- [x] Sistema de orçamentos

### 🔜 Fase 3: Recursos Premium (Planejado)

- [ ] Aplicativo mobile (React Native)
- [ ] IA para categorização automática
- [ ] Relatórios avançados
- [ ] Portfólio público automático
- [ ] Integração com pagamentos
- [ ] Marketing automático

### 🌟 Fase 4: Integrações Externas (Futuro)

- [ ] Instagram/Facebook para portfólio
- [ ] WhatsApp Business para comunicação
- [ ] Sistemas de pagamento (PIX, cartão)
- [ ] APIs de terceiros

---

## 👥 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Frontend**: ESLint + Prettier
- **Backend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branches**: feature/, bugfix/, hotfix/

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato e Suporte

### Recursos

- **Documentação**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/agenda-hibrida-v2/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/agenda-hibrida-v2/discussions)

### Links Úteis

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org)

---

## 🎉 Agradecimentos

- **Mylio Photos** - Inspiração para a interface temporal
- **shadcn/ui** - Componentes de UI modernos
- **Google** - APIs de Calendar e Drive
- **Comunidade Open Source** - Ferramentas e bibliotecas incríveis

---

## 📊 Status do Projeto

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Backend:  ✅ RODANDO (porta 3001)                  ║
║   Frontend: ✅ RODANDO (porta 5175)                  ║
║   Database: ✅ SQLite3                               ║
║   Google:   ✅ Calendar + Drive                      ║
║   Status:   🟢 100% Funcional                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

**Desenvolvido com ❤️ para tatuadores que valorizam organização e profissionalismo.**

---

*Última atualização: Outubro 2025*

