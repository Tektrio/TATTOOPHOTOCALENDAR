#!/bin/bash

# Script de configuração automática do Chrome Canary para MCP
# Criado por: AI Assistant
# Data: 22 de Outubro de 2025

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║         🚀 CONFIGURAÇÃO AUTOMÁTICA DO CHROME CANARY 🚀          ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Chrome Canary está instalado
if [ ! -d "/Applications/Google Chrome Canary.app" ]; then
    echo "❌ Chrome Canary NÃO encontrado!"
    echo ""
    echo "Por favor:"
    echo "1. Baixe em: https://www.google.com/chrome/canary/"
    echo "2. Instale (arraste para Applications)"
    echo "3. Execute este script novamente"
    echo ""
    exit 1
fi

echo "✅ Chrome Canary encontrado!"
echo ""

# Backup do mcp.json existente
if [ -f "$HOME/.cursor/mcp.json" ]; then
    echo "📦 Fazendo backup de ~/.cursor/mcp.json..."
    cp "$HOME/.cursor/mcp.json" "$HOME/.cursor/mcp.json.backup-$(date +%Y%m%d-%H%M%S)"
    echo "✅ Backup criado!"
    echo ""
fi

# Criar diretório .cursor se não existir
mkdir -p "$HOME/.cursor"

# Criar novo mcp.json
echo "🔧 Configurando MCP para usar Chrome Canary..."

cat > "$HOME/.cursor/mcp.json" << 'EOF'
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ],
      "env": {
        "CHROME_PATH": "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
      },
      "disabled": false
    }
  }
}
EOF

echo "✅ MCP configurado!"
echo ""

# Verificar a configuração
echo "📋 Verificando configuração..."
if grep -q "Chrome Canary" "$HOME/.cursor/mcp.json"; then
    echo "✅ Configuração OK!"
else
    echo "❌ Erro na configuração!"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║              ✅ CONFIGURAÇÃO COMPLETA! ✅                        ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  Reinicie o Cursor (⌘ + Q e abra novamente)"
echo ""
echo "2️⃣  Abra o Chrome Canary"
echo ""
echo "3️⃣  No Chrome Canary, vá para:"
echo "   https://chrome.google.com/webstore"
echo ""
echo "4️⃣  Instale as extensões:"
echo "   ✅ React Developer Tools"
echo "   ✅ JSON Viewer"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 DICA: Chrome Canary é perfeito para desenvolvimento!"
echo "   - Sem políticas empresariais"
echo "   - Features experimentais"
echo "   - Extensões funcionam normalmente"
echo ""
echo "📚 Documentação completa:"
echo "   cat CORRIGIR_INSTALACAO_EXTENSIONS.md"
echo ""
echo "✅ Pronto para desenvolvimento! 🚀"
echo ""

