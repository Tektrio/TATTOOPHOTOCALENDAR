#!/bin/bash

# 🚀 Script de Instalação de MCPs Essenciais
# Sistema: TattooScheduler Visual System
# Data: 26 de Outubro de 2025

echo "════════════════════════════════════════════════════════════════"
echo "🚀 Instalando MCPs essenciais para TattooScheduler"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

echo "✅ NPM encontrado: $(npm --version)"
echo ""

# 1. SQLite MCP
echo "${BLUE}📦 [1/3] Instalando SQLite MCP...${NC}"
npm install -g @modelcontextprotocol/server-sqlite
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ SQLite MCP instalado com sucesso!${NC}"
else
    echo "${YELLOW}⚠️ Erro ao instalar SQLite MCP${NC}"
fi
echo ""

# 2. Time MCP  
echo "${BLUE}⏰ [2/3] Instalando Time MCP...${NC}"
npm install -g @modelcontextprotocol/server-time
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Time MCP instalado com sucesso!${NC}"
else
    echo "${YELLOW}⚠️ Erro ao instalar Time MCP${NC}"
fi
echo ""

# 3. Brave Search MCP (opcional)
echo "${BLUE}🔍 [3/3] Instalando Brave Search MCP...${NC}"
npm install -g @modelcontextprotocol/server-brave-search
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Brave Search MCP instalado com sucesso!${NC}"
    echo "${YELLOW}⚠️ ATENÇÃO: Você precisa obter uma API key em: https://brave.com/search/api/${NC}"
else
    echo "${YELLOW}⚠️ Erro ao instalar Brave Search MCP${NC}"
fi
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "${GREEN}✅ Instalação concluída!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. ${BLUE}Adicionar MCPs ao mcp.json${NC}"
echo "   Edite: ~/.cursor/mcp.json"
echo "   Consulte: 🚀_MCPS_ESSENCIAIS_RECOMENDADOS.md"
echo ""
echo "2. ${BLUE}Obter API keys${NC}"
echo "   Brave Search: https://brave.com/search/api/ (gratuito)"
echo ""
echo "3. ${BLUE}Recarregar o Cursor${NC}"
echo "   Feche e abra o Cursor completamente"
echo ""
echo "4. ${BLUE}Testar os novos MCPs${NC}"
echo "   Verifique se estão funcionando corretamente"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "${GREEN}🎉 MCPs essenciais instalados!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📖 Para mais informações, consulte:"
echo "   - 🚀_MCPS_ESSENCIAIS_RECOMENDADOS.md"
echo "   - 📝_MCP_CONFIGURACAO_CORRIGIDA.md"
echo "   - 🆘_GUIA_TROUBLESHOOTING_MCP.md"
echo ""

