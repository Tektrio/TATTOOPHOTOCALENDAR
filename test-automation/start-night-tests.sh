#!/bin/bash

# Script para iniciar testes autônomos noturnos
# Uso: ./start-night-tests.sh [duração]
# Exemplo: ./start-night-tests.sh 8h (padrão é 8 horas)

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║     🌙 Sistema de Testes Autônomos Noturnos 🌙            ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Diretório do projeto
PROJECT_DIR="/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR"
cd "$PROJECT_DIR/test-automation"

# Duração (padrão 8h)
DURATION="${1:-8h}"

echo -e "${YELLOW}📋 Configurações:${NC}"
echo -e "  📁 Projeto: $PROJECT_DIR"
echo -e "  ⏰ Duração: $DURATION"
echo -e "  📅 Início: $(date '+%d/%m/%Y %H:%M:%S')"
echo ""

# Verificar dependências
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ NPM: $(npm --version)${NC}"
echo ""

# Verificar se servidores já estão rodando
echo -e "${BLUE}🔍 Verificando servidores...${NC}"

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend já está rodando (porta 3001)${NC}"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}⚠️ Backend não está rodando${NC}"
    SERVER_RUNNING=false
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend já está rodando (porta 5173)${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend não está rodando${NC}"
    SERVER_RUNNING=false
fi

echo ""

# Perguntar se quer iniciar servidores
if [ "$SERVER_RUNNING" = false ]; then
    echo -e "${YELLOW}🚀 Os servidores serão iniciados automaticamente${NC}"
    echo ""
fi

# Criar diretórios necessários
echo -e "${BLUE}📁 Criando estrutura de diretórios...${NC}"
mkdir -p logs
mkdir -p ../RELATORIOS_NOTURNO/{screenshots,videos,logs}
echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

# Verificar Playwright
echo -e "${BLUE}🎭 Verificando Playwright...${NC}"
cd "$PROJECT_DIR/agenda-hibrida-frontend"

if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}📦 Instalando Playwright...${NC}"
    npm run playwright:install
    echo -e "${GREEN}✅ Playwright instalado${NC}"
else
    echo -e "${GREEN}✅ Playwright já instalado${NC}"
fi

cd "$PROJECT_DIR/test-automation"
echo ""

# Confirmar início
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  ATENÇÃO: Os testes rodarão por ${DURATION}${NC}"
echo -e "${YELLOW}⚠️  O terminal ficará ocupado durante toda a execução${NC}"
echo -e "${YELLOW}⚠️  Pressione Ctrl+C para parar a qualquer momento${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "$(echo -e ${GREEN}Deseja iniciar os testes? [S/n]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]] && [[ ! -z $REPLY ]]; then
    echo -e "${RED}❌ Execução cancelada${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Iniciando testes autônomos...${NC}"
echo -e "${BLUE}📄 Logs serão salvos em: test-automation/logs/${NC}"
echo -e "${BLUE}📊 Relatórios serão gerados em: RELATORIOS_NOTURNO/${NC}"
echo ""

# Iniciar testes
node test-automation-night.js --duration=$DURATION --start-servers

# Após conclusão
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Relatórios disponíveis em:${NC}"
echo -e "  📁 $PROJECT_DIR/RELATORIOS_NOTURNO/"
echo ""
echo -e "${YELLOW}🌅 Próximos passos:${NC}"
echo -e "  1. Leia o arquivo: ${GREEN}_BOM_DIA_LEIA_PRIMEIRO.md${NC}"
echo -e "  2. Revise os relatórios gerados"
echo -e "  3. Aprove as correções automáticas"
echo ""
echo -e "${BLUE}Bom dia! 🌅${NC}"

