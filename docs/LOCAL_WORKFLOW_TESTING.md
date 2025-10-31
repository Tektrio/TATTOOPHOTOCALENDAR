# 🧪 Testando Workflows Localmente com Act

Este guia mostra como testar os workflows do GitHub Actions localmente antes de fazer push, economizando tempo e evitando commits de teste.

---

## 📋 O que é Act?

[Act](https://github.com/nektos/act) é uma ferramenta que roda GitHub Actions workflows localmente usando Docker, simulando o ambiente do GitHub Actions.

**Benefícios:**
- ✅ Teste workflows antes do push
- ✅ Economize minutos do GitHub Actions
- ✅ Debug mais rápido
- ✅ Desenvolvimento offline
- ✅ Evite múltiplos commits de teste

---

## 🚀 Instalação

### macOS

```bash
# Usando Homebrew
brew install act

# Verificar instalação
act --version
```

### Linux

```bash
# Usando curl
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Ou manualmente
wget https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz
tar xf act_Linux_x86_64.tar.gz
sudo mv act /usr/local/bin/

# Verificar instalação
act --version
```

### Windows

```powershell
# Usando Chocolatey
choco install act-cli

# Ou Scoop
scoop install act

# Verificar instalação
act --version
```

### Requisitos

- **Docker** instalado e rodando
- **Git** instalado
- Pelo menos **4GB RAM** disponível

```bash
# Verificar Docker
docker --version
docker ps

# Se Docker não estiver rodando
# macOS: Abrir Docker Desktop
# Linux: sudo systemctl start docker
```

---

## 🎯 Uso Básico

### 1. Listar Workflows Disponíveis

```bash
# Na raiz do projeto
act -l

# Saída esperada:
# Stage  Job ID            Job name          Workflow name                  Workflow file
# 0      backend-lint      Backend - Lint    CI - Testes e Validações      ci.yml
# 0      backend-tests     Backend - Testes  CI - Testes e Validações      ci.yml
# 0      frontend-lint     Frontend - Lint   CI - Testes e Validações      ci.yml
# ...
```

### 2. Ver o Que Seria Executado (Dry Run)

```bash
# Simular push event
act push --dryrun

# Simular pull_request event
act pull_request --dryrun
```

### 3. Executar Todos os Workflows de Push

```bash
# Executar workflows triggerados por push
act push

# Executar workflows triggerados por pull_request
act pull_request
```

### 4. Executar Job Específico

```bash
# Executar apenas backend-lint
act -j backend-lint

# Executar apenas frontend-build
act -j frontend-build

# Executar apenas e2e-tests
act -j e2e-tests
```

### 5. Executar Workflow Específico

```bash
# Executar apenas o workflow de CI
act -W .github/workflows/ci.yml

# Executar apenas o workflow de segurança
act -W .github/workflows/security.yml

# Executar apenas o workflow de qualidade
act -W .github/workflows/code-quality.yml
```

---

## ⚙️ Configuração Avançada

### Arquivo de Configuração `.actrc`

Crie um arquivo `.actrc` na raiz do projeto para configurações personalizadas:

```bash
# .actrc
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--container-architecture linux/amd64
--artifact-server-path /tmp/artifacts
-s GITHUB_TOKEN=seu_token_aqui
```

### Variáveis de Ambiente

```bash
# Passar secrets como variáveis
act -s CODECOV_TOKEN=abc123

# Usar arquivo .env
echo "CODECOV_TOKEN=abc123" > .secrets
act --secret-file .secrets

# Múltiplas variáveis
act -s VAR1=value1 -s VAR2=value2
```

### Escolher Imagem Docker

Act usa imagens Docker para simular o ambiente. Você pode escolher:

```bash
# Imagem micro (rápida, poucos recursos)
act -P ubuntu-latest=node:16-buster-slim

# Imagem medium (balanço entre velocidade e recursos)
act -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Imagem full (completa, igual ao GitHub)
act -P ubuntu-latest=catthehacker/ubuntu:full-latest
```

**Recomendação para este projeto**: `catthehacker/ubuntu:act-latest`

---

## 🔧 Testando Nossos Workflows

### Teste 1: Backend Lint (Rápido)

```bash
# ~30 segundos
act -j backend-lint

# Com logs verbosos
act -j backend-lint -v
```

**O que testa:**
- ✅ ESLint no código backend
- ✅ Instalação de dependências

### Teste 2: Frontend Build

```bash
# ~1-2 minutos
act -j frontend-build

# Ver artefatos gerados
ls /tmp/act-artifacts/
```

**O que testa:**
- ✅ Build com Vite
- ✅ Verificação de tamanho
- ✅ Geração de artifacts

### Teste 3: Workflow Completo de CI

```bash
# ~10-15 minutos (todos os jobs)
act -W .github/workflows/ci.yml

# Com matriz limitada (mais rápido)
act -W .github/workflows/ci.yml --matrix os:ubuntu-latest
```

### Teste 4: Apenas Jobs Rápidos

```bash
# Backend e Frontend lint (~1 min)
act -j backend-lint -j frontend-lint
```

---

## 📝 Script de Validação Local

Criamos um script que executa validações similares ao CI:

### `scripts/validate-local.sh`

```bash
#!/bin/bash
# Validação local similar ao CI

set -e

echo "🧪 Executando validações locais..."
echo ""

# Backend
echo "📦 Backend..."
cd agenda-hibrida-v2
npm run lint
npm run test:unit
cd ..

# Frontend
echo "🎨 Frontend..."
cd agenda-hibrida-frontend
pnpm run lint
pnpm run build
cd ..

echo ""
echo "✅ Todas as validações locais passaram!"
```

### Uso:

```bash
# Tornar executável
chmod +x scripts/validate-local.sh

# Executar
./scripts/validate-local.sh
```

---

## 🐛 Troubleshooting

### Problema: Docker não encontrado

```bash
# Verificar se Docker está rodando
docker ps

# Se não estiver:
# macOS: Abrir Docker Desktop
# Linux: sudo systemctl start docker
```

### Problema: Erro de permissão

```bash
# Adicionar usuário ao grupo docker (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Testar
docker run hello-world
```

### Problema: Act muito lento

**Soluções:**
1. Usar imagem Docker menor
2. Limitar matrix strategy
3. Executar apenas jobs específicos
4. Aumentar recursos do Docker

```bash
# Docker Desktop > Preferences > Resources
# - CPUs: 4+
# - Memory: 8GB+
# - Swap: 2GB+
```

### Problema: Falha ao baixar imagem Docker

```bash
# Limpar cache do Docker
docker system prune -a

# Baixar manualmente
docker pull catthehacker/ubuntu:act-latest

# Testar
act -j backend-lint
```

### Problema: Jobs não encontrados

```bash
# Listar jobs disponíveis
act -l

# Verificar syntax dos workflows
act --dryrun

# Ver logs detalhados
act -v
```

### Problema: Timeouts

```bash
# Aumentar timeout
act --container-daemon-socket /var/run/docker.sock \
    --job backend-tests \
    --env ACT_TIMEOUT=3600
```

---

## 💡 Dicas e Boas Práticas

### 1. Teste Antes do Push

```bash
# Seu fluxo de trabalho:
git add .
git commit -m "feat: nova feature"

# Antes de push, teste localmente
act -j backend-lint -j frontend-lint

# Se passar, faça push
git push origin sua-branch
```

### 2. Use Git Hooks + Act

Combine os git hooks com act para validação máxima:

```bash
# pre-push.sh
#!/bin/bash
# Executar act antes de push
act -j backend-lint -j frontend-lint

if [ $? -ne 0 ]; then
    echo "❌ Act validation failed"
    exit 1
fi
```

### 3. Cache de Dependências

Act não cacheia `node_modules` por padrão. Para acelerar:

```bash
# Usar volumes
act -j backend-lint \
    --bind \
    --volume $HOME/.npm:/root/.npm
```

### 4. Debug Jobs

```bash
# Pausar execução para debug
act -j backend-tests --env ACT_DEBUG=true

# Entrar no container
docker exec -it <container_id> /bin/bash

# Ver logs completos
act -j backend-tests -v 2>&1 | tee act-debug.log
```

### 5. Jobs Paralelos

Act roda jobs sequencialmente por padrão. Para paralelizar:

```bash
# Rodar múltiplos jobs em background
act -j backend-lint &
act -j frontend-lint &
wait
```

---

## 📊 Comparação: Local vs GitHub Actions

| Aspecto | Act (Local) | GitHub Actions |
|---------|-------------|----------------|
| **Velocidade** | Mais lento (setup) | Mais rápido (VMs dedicadas) |
| **Custo** | Grátis (usa seu hardware) | 2000 min/mês grátis |
| **Ambiente** | Quase idêntico | Exato |
| **Cache** | Manual | Automático |
| **Debugging** | Mais fácil | Mais difícil |
| **Uso** | Desenvolvimento | Produção/CI |

**Quando usar:**
- **Act**: Desenvolvimento, debug, teste rápido
- **GitHub Actions**: CI oficial, deploy, PRs

---

## 🎯 Fluxo de Trabalho Recomendado

```bash
# 1. Desenvolver feature
git checkout -b feature/minha-feature
# ... código ...

# 2. Validação rápida local (git hooks)
git add .
git commit -m "feat: minha feature"
# hooks executam: lint, console.log check, etc

# 3. Validação completa com act (opcional)
act -j backend-lint -j frontend-lint
# ou
./scripts/validate-local.sh

# 4. Push para GitHub
git push origin feature/minha-feature
# GitHub Actions executa CI completo

# 5. Abrir PR
# Aguardar CI passar
# Merge!
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Act GitHub](https://github.com/nektos/act)
- [Act Documentation](https://nektosact.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

### Comandos Úteis

```bash
# Ajuda completa
act --help

# Listar eventos disponíveis
act -l

# Versão
act --version

# Limpar containers antigos
docker container prune

# Ver containers do act rodando
docker ps | grep act
```

### Imagens Docker Recomendadas

```bash
# Lista completa em:
# https://github.com/catthehacker/docker_images

# Micro (~200MB)
catthehacker/ubuntu:act-latest

# Medium (~500MB)
catthehacker/ubuntu:runner-latest

# Full (~2GB)
catthehacker/ubuntu:full-latest
```

---

## ✅ Checklist de Setup

- [ ] Docker instalado e rodando
- [ ] Act instalado (`act --version`)
- [ ] Testado um job simples (`act -j backend-lint`)
- [ ] Arquivo `.actrc` configurado (opcional)
- [ ] Script `validate-local.sh` criado
- [ ] Imagem Docker baixada

---

## 🎉 Conclusão

Com Act, você pode:
- ✅ Testar workflows antes do push
- ✅ Economizar minutos do GitHub Actions
- ✅ Debug problemas mais rápido
- ✅ Desenvolver workflows offline
- ✅ Ter mais confiança no CI

**Próximos Passos:**
1. Instale o Act
2. Teste um job simples
3. Configure `.actrc`
4. Integre ao seu fluxo de trabalho

---

**Última Atualização**: Outubro 2025
**Versão**: 1.0.0

