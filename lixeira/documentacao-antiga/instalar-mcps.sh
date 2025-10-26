#!/bin/bash

# ============================================================================
# Script de Instalação de MCPs para Desenvolvimento
# Data: 22 de Outubro de 2025
# ============================================================================

echo "🚀 Instalando MCPs Essenciais para Desenvolvimento..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado! Por favor, instale Node.js v18+ primeiro.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão muito antiga ($NODE_VERSION). Precisa de v18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) encontrado!${NC}"
echo ""

# Verificar npm
echo "📦 Verificando npm..."
if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) encontrado!${NC}"
echo ""

# Lista de MCPs para instalar
declare -a MCPS=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-git"
    "@modelcontextprotocol/server-sqlite"
    "@modelcontextprotocol/server-fetch"
    "@modelcontextprotocol/server-memory"
)

# MCPs opcionais (comentados por padrão)
declare -a OPTIONAL_MCPS=(
    "@modelcontextprotocol/server-github"
    "@modelcontextprotocol/server-postgres"
    "@modelcontextprotocol/server-puppeteer"
    "@modelcontextprotocol/server-slack"
    "@modelcontextprotocol/server-google-drive"
)

echo "🔧 MCPs ESSENCIAIS que serão instalados:"
for mcp in "${MCPS[@]}"; do
    echo "   - $mcp"
done
echo ""

echo "📝 MCPs OPCIONAIS disponíveis (edite o script para instalar):"
for mcp in "${OPTIONAL_MCPS[@]}"; do
    echo "   - $mcp"
done
echo ""

read -p "Deseja continuar com a instalação? (s/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "❌ Instalação cancelada."
    exit 0
fi

# Instalar MCPs essenciais
SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL=${#MCPS[@]}

echo ""
echo "🚀 Instalando MCPs essenciais..."
echo "================================================"

for mcp in "${MCPS[@]}"; do
    echo ""
    echo "📥 Instalando: $mcp"
    
    if npm install -g "$mcp"; then
        echo -e "${GREEN}✅ $mcp instalado com sucesso!${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Falha ao instalar $mcp${NC}"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "================================================"
echo "📊 RESUMO DA INSTALAÇÃO"
echo "================================================"
echo -e "✅ Instalados com sucesso: ${GREEN}$SUCCESS_COUNT${NC} de $TOTAL"
echo -e "❌ Falhas: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os MCPs foram instalados com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  Alguns MCPs falharam. Tente instalá-los manualmente.${NC}"
fi

echo ""
echo "================================================"
echo "📋 PRÓXIMOS PASSOS"
echo "================================================"
echo ""
echo "1. Configure os MCPs no Cursor:"
echo "   - Pressione Cmd+Shift+P"
echo "   - Digite 'MCP: Edit Configuration'"
echo "   - Cole a configuração do arquivo MELHORES_MCPS_DESENVOLVIMENTO.md"
echo ""
echo "2. Reinicie o Cursor:"
echo "   - Cmd+Shift+P > 'Developer: Reload Window'"
echo ""
echo "3. Teste os MCPs instalados:"
echo "   - Abra o chat do Cursor"
echo "   - Peça: 'Liste todos os arquivos .jsx no projeto'"
echo ""
echo "================================================"
echo ""

# Verificar instalações
echo "🔍 Verificando instalações..."
echo ""

for mcp in "${MCPS[@]}"; do
    PACKAGE_NAME=$(echo "$mcp" | sed 's/@modelcontextprotocol\/server-//')
    COMMAND_NAME="mcp-server-$PACKAGE_NAME"
    
    if command_exists "$COMMAND_NAME"; then
        echo -e "✅ $COMMAND_NAME: ${GREEN}OK${NC}"
    else
        echo -e "❌ $COMMAND_NAME: ${RED}NÃO ENCONTRADO${NC}"
    fi
done

echo ""
echo "================================================"
echo "📚 DOCUMENTAÇÃO"
echo "================================================"
echo ""
echo "Leia o guia completo em:"
echo "   MELHORES_MCPS_DESENVOLVIMENTO.md"
echo ""
echo "Para instalar MCPs opcionais:"
echo "   npm install -g @modelcontextprotocol/server-github"
echo "   npm install -g @modelcontextprotocol/server-puppeteer"
echo ""
echo "================================================"
echo ""
echo -e "${GREEN}✅ Script finalizado!${NC}"
echo ""

