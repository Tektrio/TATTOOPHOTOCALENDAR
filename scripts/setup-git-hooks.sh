#!/bin/bash
# Script para configurar Git Hooks localmente

set -e

echo "🔧 Configurando Git Hooks..."
echo ""

# Verificar se estamos no diretório raiz do projeto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Execute este script na raiz do repositório"
    exit 1
fi

# Criar diretório de hooks se não existir
mkdir -p .git/hooks

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Instalar pre-commit hook
echo "📝 Instalando pre-commit hook..."
if [ -f "scripts/pre-commit.sh" ]; then
    cp scripts/pre-commit.sh .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ pre-commit hook instalado${NC}"
else
    echo -e "${YELLOW}⚠️  scripts/pre-commit.sh não encontrado${NC}"
fi

# 2. Instalar pre-push hook
echo "📝 Instalando pre-push hook..."
if [ -f "scripts/pre-push.sh" ]; then
    cp scripts/pre-push.sh .git/hooks/pre-push
    chmod +x .git/hooks/pre-push
    echo -e "${GREEN}✅ pre-push hook instalado${NC}"
else
    echo -e "${YELLOW}⚠️  scripts/pre-push.sh não encontrado${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Git Hooks configurados com sucesso!${NC}"
echo ""
echo "Hooks instalados:"
echo "  • pre-commit: Validações rápidas antes de commit"
echo "  • pre-push: Validações completas antes de push"
echo ""
echo "Para desabilitar temporariamente:"
echo "  git commit --no-verify"
echo "  git push --no-verify"
echo ""
echo "Para remover os hooks:"
echo "  rm .git/hooks/pre-commit .git/hooks/pre-push"
echo ""

