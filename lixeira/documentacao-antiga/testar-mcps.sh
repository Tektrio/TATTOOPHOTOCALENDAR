#!/bin/bash

# ============================================================================
# Script de Teste de MCPs
# Data: 22 de Outubro de 2025
# ============================================================================

echo "🧪 Testando MCPs Instalados..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contador
PASSED=0
FAILED=0

# Função de teste
test_mcp() {
    local name=$1
    local command=$2
    
    echo -e "${BLUE}🔍 Testando: ${name}${NC}"
    
    if command -v "$command" >/dev/null 2>&1; then
        local path=$(which "$command")
        echo -e "${GREEN}✅ PASSOU${NC}"
        echo "   Localização: $path"
        ((PASSED++))
    else
        echo -e "${RED}❌ FALHOU${NC}"
        echo "   Comando não encontrado: $command"
        ((FAILED++))
    fi
    echo ""
}

echo "================================================"
echo "           TESTE DE MCPs INSTALADOS"
echo "================================================"
echo ""

# Testes
test_mcp "Chrome DevTools MCP" "mcp-server-chrome-devtools"
test_mcp "Filesystem MCP" "mcp-server-filesystem"
test_mcp "Memory MCP" "mcp-server-memory"

# Testes adicionais (esperado falhar se não instalados)
echo "================================================"
echo "           MCPs OPCIONAIS (Não Instalados)"
echo "================================================"
echo ""

test_mcp "Git MCP" "mcp-server-git"
test_mcp "SQLite MCP" "mcp-server-sqlite"
test_mcp "Fetch MCP" "mcp-server-fetch"
test_mcp "GitHub MCP" "mcp-server-github"

echo "================================================"
echo "           RESUMO DOS TESTES"
echo "================================================"
echo ""
echo -e "✅ Passaram: ${GREEN}$PASSED${NC}"
echo -e "❌ Falharam: ${RED}$FAILED${NC}"
echo ""

# Verificar versões
echo "================================================"
echo "           INFORMAÇÕES DO SISTEMA"
echo "================================================"
echo ""
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "Path: $PATH"
echo ""

# Verificar pacotes npm globais
echo "================================================"
echo "           PACOTES MCP INSTALADOS (npm)"
echo "================================================"
echo ""
npm list -g --depth=0 2>/dev/null | grep -i mcp || echo "Nenhum pacote MCP encontrado no npm global"
echo ""

# Listar binários MCP
echo "================================================"
echo "           BINÁRIOS MCP DISPONÍVEIS"
echo "================================================"
echo ""
ls -lh ~/.nvm/versions/node/v*/bin/mcp-* 2>/dev/null || echo "Nenhum binário MCP encontrado"
echo ""

# Testar execução
echo "================================================"
echo "           TESTE DE EXECUÇÃO"
echo "================================================"
echo ""

echo "🧪 Testando Filesystem MCP..."
if timeout 2s mcp-server-filesystem --version 2>/dev/null; then
    echo -e "${GREEN}✅ Filesystem MCP responde${NC}"
else
    echo -e "${YELLOW}⚠️  Filesystem MCP não responde (normal se não tem --version)${NC}"
fi
echo ""

echo "🧪 Testando Memory MCP..."
if timeout 2s mcp-server-memory --version 2>/dev/null; then
    echo -e "${GREEN}✅ Memory MCP responde${NC}"
else
    echo -e "${YELLOW}⚠️  Memory MCP não responde (normal se não tem --version)${NC}"
fi
echo ""

# Configuração recomendada
echo "================================================"
echo "           PRÓXIMOS PASSOS"
echo "================================================"
echo ""
echo "1. Abra o Cursor IDE"
echo "2. Pressione Cmd+Shift+P"
echo "3. Digite: 'MCP: Edit Configuration'"
echo "4. Cole a configuração do arquivo: GUIA_MCPS_INSTALADOS.md"
echo "5. Reinicie o Cursor: Cmd+Shift+P > 'Developer: Reload Window'"
echo ""
echo "Depois teste no chat do Cursor:"
echo "  'Liste todos os arquivos .jsx no projeto'"
echo ""

echo "================================================"
echo ""
echo -e "${GREEN}✅ Teste completo!${NC}"
echo ""
echo "Leia o guia completo em: GUIA_MCPS_INSTALADOS.md"
echo ""

