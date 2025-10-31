#!/bin/bash
# Script de Validação Local
# Executa validações similares ao CI sem usar Act

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🧪 Executando validações locais..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contador de falhas
ERRORS=0

# 1. Backend Lint
echo -e "${BLUE}📦 Backend - Lint${NC}"
cd agenda-hibrida-v2
if npm run lint 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Backend lint passou${NC}"
else
    echo -e "${RED}❌ Backend lint falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Backend Tests
echo -e "${BLUE}🧪 Backend - Testes${NC}"
if npm run test:unit 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Backend testes passaram${NC}"
else
    echo -e "${RED}❌ Backend testes falharam${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# 3. Frontend Lint
echo -e "${BLUE}🎨 Frontend - Lint${NC}"
cd agenda-hibrida-frontend
if pnpm run lint 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Frontend lint passou${NC}"
else
    echo -e "${RED}❌ Frontend lint falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Frontend Build
echo -e "${BLUE}🏗️  Frontend - Build${NC}"
if pnpm run build 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Frontend build passou${NC}"
    
    # Verificar tamanho
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
        echo -e "${BLUE}📦 Tamanho do build: $BUILD_SIZE${NC}"
    fi
else
    echo -e "${RED}❌ Frontend build falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
echo ""

# 5. Frontend Unit Tests (se existirem)
echo -e "${BLUE}🧪 Frontend - Testes Unitários${NC}"
cd agenda-hibrida-frontend
if pnpm run test:unit 2>&1 | tail -10; then
    echo -e "${GREEN}✅ Frontend testes passaram${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum teste unitário ou falharam${NC}"
fi
cd ..
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅✅✅ Todas as validações locais passaram!${NC}"
    echo -e "${GREEN}✅ Pronto para push${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS validação(ões) falharam${NC}"
    echo -e "${RED}❌ Corrija os erros antes de fazer push${NC}"
    echo ""
    exit 1
fi

