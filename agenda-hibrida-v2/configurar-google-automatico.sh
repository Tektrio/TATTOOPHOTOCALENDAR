#!/bin/bash

# Script de configuração automática das credenciais Google OAuth
# Tenta localizar o arquivo JSON e extrair o Client Secret automaticamente

echo "🔐 CONFIGURAÇÃO AUTOMÁTICA - GOOGLE OAUTH"
echo "========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para mostrar erro e sair
error_exit() {
    echo -e "${RED}❌ $1${NC}" 1>&2
    exit 1
}

# Função para mostrar sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para mostrar aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error_exit "Execute este script dentro da pasta agenda-hibrida-v2"
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    error_exit "Arquivo .env não encontrado. Copie .env.example para .env primeiro."
fi

success "Arquivo .env encontrado"
echo ""

# Tentar encontrar o arquivo JSON
echo "🔍 Procurando arquivo de credenciais..."
JSON_FILE=$(find ~/Downloads -name "client_secret_*.json" -type f -mtime -1 2>/dev/null | head -1)

if [ -z "$JSON_FILE" ]; then
    warning "Arquivo JSON não encontrado automaticamente"
    echo ""
    echo "📁 Procure manualmente em:"
    echo "   ~/Downloads/client_secret_*.json"
    echo ""
    echo "Ou baixe novamente em:"
    echo "   https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0"
    echo ""
    read -p "Digite o caminho completo do arquivo JSON: " JSON_FILE
    
    if [ ! -f "$JSON_FILE" ]; then
        error_exit "Arquivo não encontrado: $JSON_FILE"
    fi
fi

success "Arquivo JSON encontrado: $(basename "$JSON_FILE")"
echo ""

# Extrair Client Secret
echo "🔑 Extraindo Client Secret..."
CLIENT_SECRET=$(cat "$JSON_FILE" | grep -o '"client_secret"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"client_secret"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$CLIENT_SECRET" ]; then
    error_exit "Não foi possível extrair o Client Secret do arquivo JSON"
fi

success "Client Secret extraído: ${CLIENT_SECRET:0:15}..."
echo ""

# Criar backup do .env
BACKUP_FILE=".env.backup.$(date +%s)"
cp .env "$BACKUP_FILE"
success "Backup criado: $BACKUP_FILE"
echo ""

# Atualizar .env
echo "📝 Atualizando arquivo .env..."

# Client ID
sed -i.tmp 's|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com|' .env

# Client Secret
sed -i.tmp "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$CLIENT_SECRET|" .env

# Redirect URI
sed -i.tmp 's|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback|' .env

# Remover arquivo temporário do sed
rm -f .env.tmp

success "Arquivo .env atualizado!"
echo ""

# Mostrar configuração
echo "📋 Configuração aplicada:"
echo "   GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com"
echo "   GOOGLE_CLIENT_SECRET=${CLIENT_SECRET:0:20}..."
echo "   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback"
echo ""

# Copiar arquivo JSON para o projeto (opcional)
read -p "Deseja copiar o arquivo JSON para a pasta config? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    mkdir -p config
    cp "$JSON_FILE" "config/google-credentials.json"
    success "Arquivo copiado para: config/google-credentials.json"
    echo ""
fi

# Próximos passos
echo "🎯 Próximos passos:"
echo ""
echo "1. Autenticar com o Google:"
echo "   ${GREEN}node reautenticar-google.js${NC}"
echo ""
echo "2. Fazer login com:"
echo "   ${YELLOW}photocalendar25@gmail.com${NC}"
echo ""
echo "3. Testar a conexão:"
echo "   ${GREEN}node test-gdrive-connection.js${NC}"
echo ""
echo "4. Iniciar o servidor:"
echo "   ${GREEN}npm start${NC}"
echo ""

success "Configuração concluída!"

