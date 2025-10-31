#!/bin/bash
# Git Pre-Push Hook
# Validações completas antes de push para remoto

set -e

echo "🚀 Executando validações pré-push..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contador de erros
ERRORS=0
WARNINGS=0

# Obter branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch: $CURRENT_BRANCH${NC}"
echo ""

# 1. Verificar se há commits para push
echo "📊 Verificando commits..."
COMMITS_TO_PUSH=$(git log @{u}.. --oneline 2>/dev/null | wc -l || echo "0")

if [ "$COMMITS_TO_PUSH" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum commit novo para push${NC}"
else
    echo -e "${GREEN}✅ $COMMITS_TO_PUSH commit(s) para push${NC}"
    echo ""
    echo "Commits:"
    git log @{u}.. --oneline --color=always | head -5
    echo ""
fi

# 2. Executar testes unitários backend
echo "🧪 Executando testes unitários do backend..."
cd agenda-hibrida-v2
if npm run test:unit --silent 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Testes unitários backend passaram${NC}"
else
    echo -e "${RED}❌ Testes unitários backend falharam${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# 3. Executar lint completo backend
echo "🧹 Executando lint completo do backend..."
cd agenda-hibrida-v2
if npm run lint --silent 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Lint backend passou${NC}"
else
    echo -e "${YELLOW}⚠️  Lint backend apresentou avisos${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..
echo ""

# 4. Executar build do frontend
echo "🏗️  Executando build do frontend..."
cd agenda-hibrida-frontend
if pnpm run build 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Build frontend concluído${NC}"
    
    # Verificar tamanho do build
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
    echo -e "${BLUE}📦 Tamanho do build: $BUILD_SIZE${NC}"
else
    echo -e "${RED}❌ Build frontend falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# 5. Executar lint do frontend
echo "🧹 Executando lint do frontend..."
cd agenda-hibrida-frontend
if pnpm run lint --silent 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Lint frontend passou${NC}"
else
    echo -e "${RED}❌ Lint frontend falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# 6. Verificar secrets (mais rigoroso que pre-commit)
echo "🔐 Verificação final de secrets..."
if git log @{u}.. -p | grep -iE '(api[_-]?key|secret|password|token|bearer).*=.*["\047][a-zA-Z0-9]{20,}' | \
   grep -v -E 'example|demo|test|fake|YOUR_|SUBSTITUA' > /dev/null 2>&1; then
    echo -e "${RED}❌ CRÍTICO: Possível secret detectado nos commits!${NC}"
    echo -e "${RED}   Execute: git log @{u}.. -p | grep -i secret${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Nenhum secret detectado${NC}"
fi
echo ""

# 7. Verificar se está pusando para main/develop sem PR
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "develop" ]]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Push direto para $CURRENT_BRANCH${NC}"
    echo -e "${YELLOW}   Certifique-se de que isso é intencional${NC}"
    echo -e "${YELLOW}   Em produção, use Pull Requests!${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo ""
fi

# 8. Verificar package-lock.json / pnpm-lock.yaml sincronizados
echo "📦 Verificando lockfiles..."
if git diff @{u}.. --name-only | grep -E 'package.json' > /dev/null; then
    if ! git diff @{u}.. --name-only | grep -E 'package-lock.json|pnpm-lock.yaml' > /dev/null; then
        echo -e "${YELLOW}⚠️  package.json modificado mas lockfile não atualizado${NC}"
        echo -e "${YELLOW}   Execute npm install ou pnpm install${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ Lockfiles sincronizados${NC}"
    fi
else
    echo -e "${GREEN}✅ Nenhuma mudança em package.json${NC}"
fi
echo ""

# 9. Testes E2E (opcional, comentado por padrão pois são lentos)
# echo "🎭 Executando testes E2E..."
# cd agenda-hibrida-frontend
# if pnpm run test:e2e --project=chromium 2>&1 | tail -20; then
#     echo -e "${GREEN}✅ Testes E2E passaram${NC}"
# else
#     echo -e "${RED}❌ Testes E2E falharam${NC}"
#     ERRORS=$((ERRORS + 1))
# fi
# cd ..
# echo ""

# Resumo final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Push bloqueado: $ERRORS erro(s) crítico(s)${NC}"
    echo -e "${RED}   Corrija os erros antes de fazer push${NC}"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo -e "${YELLOW}   Push permitido, mas revise os avisos${NC}"
    echo ""
    
    # Perguntar se deseja continuar
    read -p "Deseja continuar com o push? (s/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${GREEN}✅ Push permitido${NC}"
        exit 0
    else
        echo -e "${YELLOW}🛑 Push cancelado pelo usuário${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅✅✅ Todas as verificações passaram!${NC}"
    echo -e "${GREEN}✅ Push permitido com segurança${NC}"
    echo ""
    exit 0
fi

