#!/bin/bash

# ⚡ COMANDOS RÁPIDOS - Google API Setup
# Execute: ./⚡_COMANDOS_RAPIDOS.sh <comando>

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

function show_help() {
    echo -e "${BLUE}⚡ COMANDOS RÁPIDOS - Google API Setup${NC}"
    echo ""
    echo "Uso: ./⚡_COMANDOS_RAPIDOS.sh <comando>"
    echo ""
    echo "📋 Comandos disponíveis:"
    echo ""
    echo -e "  ${GREEN}buscar${NC}       - Busca o arquivo JSON nas Downloads"
    echo -e "  ${GREEN}secret${NC}       - Extrai o Client Secret do JSON"
    echo -e "  ${GREEN}configurar${NC}   - Executa configuração automática"
    echo -e "  ${GREEN}autenticar${NC}   - Inicia processo OAuth"
    echo -e "  ${GREEN}testar${NC}       - Testa conexão com Google Drive"
    echo -e "  ${GREEN}verificar${NC}    - Verifica configuração atual"
    echo -e "  ${GREEN}links${NC}        - Mostra links importantes"
    echo -e "  ${GREEN}tudo${NC}         - Executa configuração completa"
    echo ""
    echo "Exemplos:"
    echo "  ./⚡_COMANDOS_RAPIDOS.sh buscar"
    echo "  ./⚡_COMANDOS_RAPIDOS.sh configurar"
    echo "  ./⚡_COMANDOS_RAPIDOS.sh tudo"
}

function buscar_json() {
    echo -e "${BLUE}🔍 Procurando arquivo JSON...${NC}"
    JSON_FILE=$(find ~/Downloads -name "client_secret_*.json" -type f -mtime -1 2>/dev/null | head -1)
    
    if [ -z "$JSON_FILE" ]; then
        echo -e "${YELLOW}❌ Arquivo não encontrado nas Downloads${NC}"
        echo ""
        echo "Procure manualmente:"
        echo "  ls ~/Downloads/client_secret_*.json"
        echo ""
        echo "Ou baixe novamente:"
        echo "  https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0"
    else
        echo -e "${GREEN}✅ Encontrado:${NC} $(basename "$JSON_FILE")"
        echo ""
        echo "Caminho completo:"
        echo "  $JSON_FILE"
    fi
}

function extrair_secret() {
    echo -e "${BLUE}🔑 Extraindo Client Secret...${NC}"
    JSON_FILE=$(find ~/Downloads -name "client_secret_*.json" -type f -mtime -1 2>/dev/null | head -1)
    
    if [ -z "$JSON_FILE" ]; then
        echo -e "${YELLOW}❌ Arquivo JSON não encontrado${NC}"
        echo "Execute: ./⚡_COMANDOS_RAPIDOS.sh buscar"
        exit 1
    fi
    
    CLIENT_SECRET=$(cat "$JSON_FILE" | grep -o '"client_secret"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"client_secret"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    
    if [ -z "$CLIENT_SECRET" ]; then
        echo -e "${YELLOW}❌ Client Secret não encontrado no arquivo${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Client Secret extraído:${NC}"
    echo ""
    echo "  $CLIENT_SECRET"
    echo ""
    echo "Copiado para a área de transferência!" | pbcopy && echo "$CLIENT_SECRET" | pbcopy 2>/dev/null || true
}

function configurar() {
    echo -e "${BLUE}⚙️  Executando configuração automática...${NC}"
    cd agenda-hibrida-v2 2>/dev/null || {
        echo -e "${YELLOW}❌ Pasta agenda-hibrida-v2 não encontrada${NC}"
        exit 1
    }
    
    if [ -f "./configurar-google-automatico.sh" ]; then
        ./configurar-google-automatico.sh
    else
        echo -e "${YELLOW}❌ Script de configuração não encontrado${NC}"
        echo "Execute: node configurar-novas-credenciais-google.js"
    fi
}

function autenticar() {
    echo -e "${BLUE}🔐 Iniciando autenticação OAuth...${NC}"
    cd agenda-hibrida-v2 2>/dev/null || {
        echo -e "${YELLOW}❌ Pasta agenda-hibrida-v2 não encontrada${NC}"
        exit 1
    }
    
    if [ -f "./reautenticar-google.js" ]; then
        node reautenticar-google.js
    else
        echo -e "${YELLOW}❌ Script de autenticação não encontrado${NC}"
    fi
}

function testar() {
    echo -e "${BLUE}🧪 Testando conexão com Google Drive...${NC}"
    cd agenda-hibrida-v2 2>/dev/null || {
        echo -e "${YELLOW}❌ Pasta agenda-hibrida-v2 não encontrada${NC}"
        exit 1
    }
    
    if [ -f "./test-gdrive-connection.js" ]; then
        node test-gdrive-connection.js
    else
        echo -e "${YELLOW}❌ Script de teste não encontrado${NC}"
    fi
}

function verificar() {
    echo -e "${BLUE}🔍 Verificando configuração atual...${NC}"
    cd agenda-hibrida-v2 2>/dev/null || {
        echo -e "${YELLOW}❌ Pasta agenda-hibrida-v2 não encontrada${NC}"
        exit 1
    }
    
    if [ -f ".env" ]; then
        echo ""
        echo "Configuração atual no .env:"
        echo ""
        grep "GOOGLE" .env
        echo ""
    else
        echo -e "${YELLOW}❌ Arquivo .env não encontrado${NC}"
    fi
}

function mostrar_links() {
    echo -e "${BLUE}🔗 Links Importantes${NC}"
    echo ""
    echo "Google Cloud Console:"
    echo "  https://console.cloud.google.com/"
    echo ""
    echo "Seu Projeto:"
    echo "  https://console.cloud.google.com/auth/overview?project=polar-program-476423-i0"
    echo ""
    echo "OAuth Clients (Download JSON):"
    echo "  https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0"
    echo ""
    echo "Test Users:"
    echo "  https://console.cloud.google.com/auth/audience?project=polar-program-476423-i0"
}

function configurar_tudo() {
    echo -e "${BLUE}🚀 Configuração Completa${NC}"
    echo ""
    
    echo "Passo 1/4: Buscar arquivo JSON"
    buscar_json
    echo ""
    
    read -p "Pressione ENTER para continuar..." dummy
    
    echo "Passo 2/4: Configurar credenciais"
    configurar
    echo ""
    
    read -p "Pressione ENTER para continuar..." dummy
    
    echo "Passo 3/4: Autenticar"
    autenticar
    echo ""
    
    read -p "Pressione ENTER para continuar..." dummy
    
    echo "Passo 4/4: Testar"
    testar
    echo ""
    
    echo -e "${GREEN}✅ Configuração completa!${NC}"
}

# Menu principal
case "$1" in
    buscar)
        buscar_json
        ;;
    secret)
        extrair_secret
        ;;
    configurar)
        configurar
        ;;
    autenticar)
        autenticar
        ;;
    testar)
        testar
        ;;
    verificar)
        verificar
        ;;
    links)
        mostrar_links
        ;;
    tudo)
        configurar_tudo
        ;;
    *)
        show_help
        ;;
esac

