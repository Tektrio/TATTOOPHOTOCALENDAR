#!/bin/bash

# Script para iniciar o sistema e testar o Calendário Visual Melhorado
# Uso: ./START_CALENDARIO.sh

echo "🚀 =========================================="
echo "   INICIANDO SISTEMA AGENDA HÍBRIDA"
echo "   Calendário Visual Melhorado v2.0"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -d "agenda-hibrida-v2" ] || [ ! -d "agenda-hibrida-frontend" ]; then
    echo -e "${RED}❌ Erro: Execute este script do diretório raiz do projeto!${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Verificando dependências...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado! Instale o Node.js primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado! Instale o npm primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# Instalar dependências se necessário
if [ ! -d "agenda-hibrida-v2/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    cd agenda-hibrida-v2
    npm install
    cd ..
fi

if [ ! -d "agenda-hibrida-frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    cd agenda-hibrida-frontend
    npm install
    cd ..
fi

echo ""
echo -e "${BLUE}🔧 Criando arquivos de log...${NC}"
touch agenda-hibrida-v2/backend.log
touch agenda-hibrida-frontend/frontend.log

echo ""
echo -e "${GREEN}✅ Tudo pronto para iniciar!${NC}"
echo ""
echo -e "${BLUE}=========================================="
echo "   INICIANDO SERVIÇOS"
echo "==========================================${NC}"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Encerrando serviços...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Serviços encerrados com sucesso!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo -e "${BLUE}🔵 Iniciando Backend (porta 3001)...${NC}"
cd agenda-hibrida-v2
npm start > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
echo -e "${YELLOW}⏳ Aguardando backend inicializar (5 segundos)...${NC}"
sleep 5

# Verificar se backend está rodando
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar backend! Verifique o log em agenda-hibrida-v2/backend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend rodando (PID: $BACKEND_PID)${NC}"
echo ""

# Iniciar frontend
echo -e "${BLUE}🔵 Iniciando Frontend (porta 5173)...${NC}"
cd agenda-hibrida-frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Aguardar frontend inicializar
echo -e "${YELLOW}⏳ Aguardando frontend inicializar (5 segundos)...${NC}"
sleep 5

# Verificar se frontend está rodando
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar frontend! Verifique o log em agenda-hibrida-frontend/frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend rodando (PID: $FRONTEND_PID)${NC}"
echo ""

# Sistema iniciado com sucesso
echo -e "${GREEN}=========================================="
echo "   ✅ SISTEMA INICIADO COM SUCESSO!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}📊 Informações dos Serviços:${NC}"
echo ""
echo -e "  ${GREEN}🔵 Backend:${NC}"
echo "     URL: http://localhost:3001"
echo "     PID: $BACKEND_PID"
echo "     Log: agenda-hibrida-v2/backend.log"
echo ""
echo -e "  ${GREEN}🔵 Frontend:${NC}"
echo "     URL: http://localhost:5173"
echo "     PID: $FRONTEND_PID"
echo "     Log: agenda-hibrida-frontend/frontend.log"
echo ""
echo -e "${YELLOW}=========================================="
echo "   📋 COMO TESTAR O CALENDÁRIO VISUAL"
echo "==========================================${NC}"
echo ""
echo "1. Abra o navegador em: ${GREEN}http://localhost:5173${NC}"
echo "2. Clique na aba ${GREEN}'Calendário Visual'${NC}"
echo "3. Veja as informações completas dos agendamentos"
echo "4. ${GREEN}Dê DUPLO CLIQUE${NC} em qualquer imagem para abrir a pasta!"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - CALENDARIO_VISUAL_MELHORADO.md"
echo "   - TESTAR_CALENDARIO_VISUAL.md"
echo "   - RESUMO_IMPLEMENTACAO_CALENDARIO.md"
echo ""
echo -e "${RED}⚠️  Pressione Ctrl+C para parar os serviços${NC}"
echo ""

# Abrir navegador automaticamente (opcional)
if command -v open &> /dev/null; then
    # macOS
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    sleep 2
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    # Linux
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    sleep 2
    xdg-open http://localhost:5173
elif command -v start &> /dev/null; then
    # Windows (Git Bash)
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    sleep 2
    start http://localhost:5173
fi

# Manter script rodando e monitorar logs
echo -e "${YELLOW}📝 Monitorando logs (últimas 10 linhas)...${NC}"
echo ""

while true; do
    sleep 10
    
    # Verificar se processos ainda estão rodando
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend parou inesperadamente!${NC}"
        echo -e "${YELLOW}Últimas linhas do log:${NC}"
        tail -n 20 agenda-hibrida-v2/backend.log
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend parou inesperadamente!${NC}"
        echo -e "${YELLOW}Últimas linhas do log:${NC}"
        tail -n 20 agenda-hibrida-frontend/frontend.log
        cleanup
    fi
done

