#!/bin/bash

# ⚡ COMANDOS RÁPIDOS - CONFIGURAÇÃO FINAL GOOGLE API
# Execute estes comandos em sequência para finalizar a configuração

set -e

echo "🎯 CONFIGURAÇÃO FINAL GOOGLE API"
echo "================================="
echo ""

# Diretório do projeto
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2

echo "📁 Pasta atual: $(pwd)"
echo ""

# 1. Verificar se o arquivo JSON existe
if [ -f "google-credentials.json" ]; then
    echo "✅ Arquivo google-credentials.json encontrado!"
else
    echo "❌ Erro: Arquivo google-credentials.json não encontrado!"
    exit 1
fi

# 2. Criar/Atualizar arquivo .env
echo ""
echo "⚙️  Configurando arquivo .env..."
echo ""

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "📝 Criando novo arquivo .env..."
    cp .env.example .env
fi

# Adicionar/Atualizar credenciais Google
echo "📝 Atualizando credenciais Google no .env..."

# Remover linhas antigas do Google (se existirem)
sed -i '' '/GOOGLE_CLIENT_ID/d' .env 2>/dev/null || true
sed -i '' '/GOOGLE_CLIENT_SECRET/d' .env 2>/dev/null || true
sed -i '' '/GOOGLE_REDIRECT_URI/d' .env 2>/dev/null || true
sed -i '' '/GOOGLE_CALENDAR_ID/d' .env 2>/dev/null || true
sed -i '' '/GOOGLE_APPLICATION_CREDENTIALS/d' .env 2>/dev/null || true

# Adicionar novas credenciais
cat >> .env << 'EOF'

# 🔑 Google OAuth Credentials (Atualizado em 26/10/2025)
GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
GOOGLE_CALENDAR_ID=primary
GOOGLE_APPLICATION_CREDENTIALS=/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/google-credentials.json
EOF

echo "✅ Arquivo .env atualizado com sucesso!"
echo ""

# 3. Verificar se há NODE_MODULES
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do projeto..."
    npm install
    echo "✅ Dependências instaladas!"
else
    echo "✅ Dependências já instaladas!"
fi

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "======================================"
echo ""
echo "📋 Próximos Passos:"
echo ""
echo "1️⃣  Testar Conexão Google:"
echo "   node verificar-google-config.js"
echo ""
echo "2️⃣  Autenticar pela primeira vez:"
echo "   node reautenticar-google.js"
echo ""
echo "3️⃣  Testar Google Drive:"
echo "   node test-gdrive-connection.js"
echo ""
echo "4️⃣  Iniciar o servidor:"
echo "   npm start"
echo ""
echo "📁 Arquivos Importantes:"
echo "   • .env                    → Configurações gerais"
echo "   • google-credentials.json → Credenciais Google"
echo "   • tokens.json             → Tokens OAuth (será criado)"
echo ""
echo "🔐 LEMBRE-SE:"
echo "   • NUNCA commite .env ou google-credentials.json no Git"
echo "   • Faça backup seguro desses arquivos"
echo ""
echo "✨ Tudo pronto! Execute os comandos acima para testar."
echo ""

