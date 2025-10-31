#!/bin/bash
# Git Pre-Commit Hook
# Validações rápidas antes de permitir commit

set -e

echo "🔍 Executando validações pré-commit..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar arquivos staged
echo "📂 Verificando arquivos staged..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|json|md)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ Nenhum arquivo JS/JSX/JSON para validar${NC}"
else
    echo -e "${GREEN}✅ ${#STAGED_FILES[@]} arquivo(s) para validar${NC}"
fi

# 2. Check for console.log em arquivos JS/JSX (exceto testes)
echo ""
echo "🔎 Verificando console.log em código de produção..."
CONSOLE_LOGS=$(git diff --cached --name-only --diff-filter=ACM | \
    grep -E '\.(js|jsx)$' | \
    grep -v -E 'test|spec|__tests__|playwright.config|vite.config|jest.config' | \
    xargs grep -n "console\.log" 2>/dev/null || true)

if [ -n "$CONSOLE_LOGS" ]; then
    echo -e "${YELLOW}⚠️  AVISO: console.log encontrado:${NC}"
    echo "$CONSOLE_LOGS"
    echo -e "${YELLOW}   Considere remover antes do commit${NC}"
    # Não bloqueia, apenas avisa
else
    echo -e "${GREEN}✅ Nenhum console.log encontrado${NC}"
fi

# 3. Check for TODO/FIXME não resolvidos
echo ""
echo "📝 Verificando TODO/FIXME..."
TODO_COUNT=$(git diff --cached | grep -E '^\+.*TODO|^\+.*FIXME' | wc -l || echo "0")

if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $TODO_COUNT novo(s) TODO/FIXME adicionado(s)${NC}"
    git diff --cached | grep -E '^\+.*TODO|^\+.*FIXME' || true
    echo -e "${YELLOW}   Certifique-se de criar issues para eles${NC}"
else
    echo -e "${GREEN}✅ Nenhum TODO/FIXME novo${NC}"
fi

# 4. Check for secrets/tokens hardcoded
echo ""
echo "🔐 Verificando secrets hardcoded..."
SECRETS=$(git diff --cached | grep -iE '^\+.*(api[_-]?key|secret|password|token|bearer|auth[_-]?token).*=.*["\047]' | \
    grep -v -E 'example|demo|test|fake|YOUR_|SUBSTITUA|COLOQUE_SEU' || true)

if [ -n "$SECRETS" ]; then
    echo -e "${RED}❌ ERRO: Possível secret/token detectado:${NC}"
    echo "$SECRETS"
    echo -e "${RED}   NUNCA commite secrets reais! Use variáveis de ambiente.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Nenhum secret detectado${NC}"
fi

# 5. Lint arquivos staged (apenas frontend e backend principais)
echo ""
echo "🧹 Executando lint em arquivos modificados..."

# Frontend lint (apenas arquivos staged)
FRONTEND_FILES=$(echo "$STAGED_FILES" | grep "^agenda-hibrida-frontend/src" || true)
if [ -n "$FRONTEND_FILES" ]; then
    echo "   Frontend..."
    cd agenda-hibrida-frontend
    if ! pnpm exec eslint $FRONTEND_FILES --max-warnings 0 2>/dev/null; then
        echo -e "${RED}❌ ESLint falhou no frontend${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ Frontend lint passou${NC}"
    fi
    cd ..
else
    echo -e "${GREEN}✅ Nenhum arquivo frontend para lint${NC}"
fi

# Backend lint (apenas arquivos staged)
BACKEND_FILES=$(echo "$STAGED_FILES" | grep "^agenda-hibrida-v2/" | grep -E '\.(js)$' || true)
if [ -n "$BACKEND_FILES" ]; then
    echo "   Backend..."
    cd agenda-hibrida-v2
    if ! npm run lint 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Lint do backend apresentou avisos${NC}"
        # Não bloqueia, pois backend pode ter warnings aceitáveis
    else
        echo -e "${GREEN}✅ Backend lint passou${NC}"
    fi
    cd ..
else
    echo -e "${GREEN}✅ Nenhum arquivo backend para lint${NC}"
fi

# 6. Check for large files
echo ""
echo "📦 Verificando arquivos grandes..."
LARGE_FILES=$(git diff --cached --name-only | xargs ls -l 2>/dev/null | \
    awk '$5 > 5242880 {printf "%s (%.2f MB)\n", $9, $5/1048576}' || true)

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  AVISO: Arquivo(s) grande(s) detectado(s):${NC}"
    echo "$LARGE_FILES"
    echo -e "${YELLOW}   Considere usar Git LFS para arquivos >5MB${NC}"
else
    echo -e "${GREEN}✅ Nenhum arquivo muito grande${NC}"
fi

# Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Commit bloqueado: $ERRORS erro(s) encontrado(s)${NC}"
    echo -e "${RED}   Corrija os erros acima antes de commitar${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
    echo -e "${GREEN}✅ Commit permitido${NC}"
    exit 0
fi

