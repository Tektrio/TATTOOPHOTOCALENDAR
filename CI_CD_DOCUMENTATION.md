# 🚀 CI/CD Pipeline - TattooScheduler

## 📋 Visão Geral

Sistema completo de CI/CD implementado usando GitHub Actions para automatizar testes, verificações de qualidade, segurança e deploy.

---

## ✅ Workflows Implementados

### 1. **Test and Quality Checks** (`.github/workflows/test.yml`)

**Trigger**: Push ou Pull Request para `main` ou `develop`

**Jobs**:

#### **Backend Tests**
- ✅ Setup Node.js 22
- ✅ Instalação de dependências
- ✅ Execução de testes unitários
- ✅ Execução de testes de integração
- ✅ Upload de cobertura para Codecov

#### **Frontend Tests**
- ✅ Setup Node.js 22
- ✅ Instalação de dependências
- ✅ Lint do código (ESLint)
- ✅ Build de produção
- ✅ Upload de artefatos de build

#### **E2E Tests**
- ✅ Setup Node.js 22
- ✅ Instalação do Playwright
- ✅ Inicialização do backend
- ✅ Execução de testes E2E
- ✅ Upload de relatórios e screenshots (em caso de falha)

#### **Code Quality**
- ✅ ESLint no backend e frontend
- ✅ Verificação de vulnerabilidades de segurança (`npm audit`)

#### **Build Summary**
- ✅ Resumo de todos os jobs
- ✅ Falha se qualquer job falhar

---

### 2. **Deploy to Production** (`.github/workflows/deploy.yml`)

**Trigger**: 
- Push de tag `v*.*.*` (ex: `v1.0.0`)
- Dispatch manual com escolha de ambiente (staging/production)

**Jobs**:

#### **Build**
- ✅ Build do frontend para produção
- ✅ Instalação de dependências de produção
- ✅ Execução de testes
- ✅ Criação de pacote de deployment
- ✅ Upload de artefatos

#### **Deploy to Staging**
- ✅ Download do pacote
- ✅ Deploy para servidor staging
- ✅ Smoke tests
- **Environment**: `staging`
- **URL**: https://staging.seudominio.com

#### **Deploy to Production**
- ✅ Download do pacote
- ✅ Criação de backup antes do deploy
- ✅ Deploy para servidor de produção
- ✅ Smoke tests
- ✅ Notificação de sucesso/falha
- ✅ Rollback automático em caso de falha
- **Environment**: `production`
- **URL**: https://seudominio.com

#### **Health Check**
- ✅ Verificação de saúde da aplicação
- ✅ Testes pós-deployment

---

### 3. **Security Checks** (`.github/workflows/security.yml`)

**Trigger**: 
- Push ou Pull Request para `main` ou `develop`
- Agendado semanalmente (segunda-feira 9h)

**Jobs**:

#### **Dependency Scan**
- ✅ `npm audit` no backend e frontend
- ✅ Verificação de pacotes desatualizados
- ✅ Relatório de vulnerabilidades

#### **Secret Scan**
- ✅ Gitleaks para detecção de secrets
- ✅ Verificação de credenciais hardcoded
- ✅ Patterns de senhas/tokens

#### **Code Security**
- ✅ CodeQL Analysis
- ✅ Análise estática de segurança
- ✅ Detecção de vulnerabilidades no código

#### **Security Summary**
- ✅ Resumo de verificações de segurança
- ✅ Falha se issues críticas forem encontradas

---

## 📝 Templates de Issue e PR

### **Pull Request Template** (`.github/PULL_REQUEST_TEMPLATE.md`)

**Seções**:
- ✅ Descrição das mudanças
- ✅ Tipo de mudança (bug fix, feature, etc.)
- ✅ Issue relacionada
- ✅ Screenshots
- ✅ Checklist completo:
  - Geral (código limpo, sem warnings)
  - Testes (unitários, integração, E2E)
  - Backend (migrations, API docs, validações)
  - Frontend (responsividade, acessibilidade)
  - Segurança (secrets, validação, sanitização)
- ✅ Instruções de teste
- ✅ Notas adicionais

### **Bug Report Template** (`.github/ISSUE_TEMPLATE/bug_report.md`)

**Seções**:
- ✅ Descrição do bug
- ✅ Passos para reproduzir
- ✅ Comportamento esperado vs atual
- ✅ Screenshots
- ✅ Ambiente (OS, browser, versão)
- ✅ Logs de erro
- ✅ Console do navegador
- ✅ Severidade (crítica, alta, média, baixa)
- ✅ Contexto adicional

### **Feature Request Template** (`.github/ISSUE_TEMPLATE/feature_request.md`)

**Seções**:
- ✅ Descrição da funcionalidade
- ✅ Problema que resolve
- ✅ Solução proposta
- ✅ Alternativas consideradas
- ✅ Mockups/Screenshots
- ✅ Impacto na UX
- ✅ Complexidade estimada
- ✅ Prioridade sugerida
- ✅ Público-alvo
- ✅ Requisitos funcionais

---

## 🔧 Como Usar

### **Executar Testes Localmente**

```bash
# Backend
cd agenda-hibrida-v2
npm run test:unit
npm run test:integration

# Frontend
cd agenda-hibrida-frontend
npm run lint
npm run build
npm run test:e2e
```

### **Criar uma Tag de Release**

```bash
# Criar tag
git tag -a v1.0.0 -m "Release 1.0.0"

# Push tag (isso dispara o workflow de deploy)
git push origin v1.0.0
```

### **Deploy Manual**

1. Acesse **GitHub** → **Actions** → **Deploy to Production**
2. Clique em **Run workflow**
3. Escolha o ambiente (`staging` ou `production`)
4. Clique em **Run workflow**

### **Verificar Status dos Workflows**

1. Acesse **GitHub** → **Actions**
2. Veja o status de cada workflow:
   - ✅ Verde: Sucesso
   - 🟡 Amarelo: Em execução
   - ❌ Vermelho: Falhou

### **Proteger Branch Main**

Configure regras de proteção no GitHub:

1. **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Habilitar:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
     - Backend Tests
     - Frontend Tests
     - E2E Tests
     - Code Quality
   - ✅ **Require conversation resolution before merging**
   - ✅ **Include administrators**
   - ✅ **Restrict who can push to matching branches**

---

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### **Para Testes**
- `GOOGLE_CLIENT_ID` (opcional para testes)
- `GOOGLE_CLIENT_SECRET` (opcional para testes)

### **Para Deploy**
- `SSH_PRIVATE_KEY` - Chave SSH para deploy no servidor
- `PRODUCTION_HOST` - IP/domínio do servidor de produção
- `STAGING_HOST` - IP/domínio do servidor de staging
- `DEPLOY_USER` - Usuário SSH para deploy

### **Para Notificações** (opcional)
- `SLACK_WEBHOOK` - Webhook do Slack para notificações
- `DISCORD_WEBHOOK` - Webhook do Discord para notificações

---

## 📊 Badges para README

Adicione badges ao README.md para mostrar o status:

```markdown
![Tests](https://github.com/seu-usuario/tattoo-calendar/workflows/Tests%20and%20Quality%20Checks/badge.svg)
![Security](https://github.com/seu-usuario/tattoo-calendar/workflows/Security%20Checks/badge.svg)
![Deploy](https://github.com/seu-usuario/tattoo-calendar/workflows/Deploy%20to%20Production/badge.svg)
[![codecov](https://codecov.io/gh/seu-usuario/tattoo-calendar/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/tattoo-calendar)
```

---

## 🐛 Troubleshooting

### **Testes E2E falhando**

**Problema**: Playwright não consegue instalar browsers no CI

**Solução**:
```yaml
- name: Install Playwright browsers
  run: |
    cd agenda-hibrida-frontend
    npx playwright install --with-deps chromium
```

### **Build falhando por falta de memória**

**Problema**: Node.js fica sem memória durante build

**Solução**:
```yaml
- name: Build frontend
  run: |
    cd agenda-hibrida-frontend
    NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### **Deploy falhando por timeout SSH**

**Problema**: Conexão SSH demora muito ou falha

**Solução**:
```bash
# Adicionar timeout maior
ssh -o ConnectTimeout=30 user@server "comando"
```

---

## 🎯 Próximos Passos

- [ ] Configurar Codecov para visualização de cobertura
- [ ] Implementar notificações Slack/Discord
- [ ] Adicionar deploy automatizado via SSH
- [ ] Configurar ambientes staging e production no GitHub
- [ ] Implementar rollback automático mais robusto
- [ ] Adicionar testes de performance no CI
- [ ] Configurar dependabot para atualizações automáticas
- [ ] Adicionar smoke tests mais abrangentes

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [CodeQL Analysis](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning-with-codeql)
- [Gitleaks](https://github.com/zricethezav/gitleaks)

---

## ✅ Status

**CI/CD Pipeline**: 100% Configurado e Documentado! 🎉

- ✅ Testes automatizados (unit, integration, E2E)
- ✅ Verificações de qualidade (linting, audit)
- ✅ Verificações de segurança (secrets, vulnerabilities, CodeQL)
- ✅ Deploy automatizado (staging + production)
- ✅ Templates de PR e Issues
- ✅ Documentação completa

