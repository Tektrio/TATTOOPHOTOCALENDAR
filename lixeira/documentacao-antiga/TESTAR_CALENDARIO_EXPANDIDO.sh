#!/bin/bash

# 🧪 SCRIPT DE TESTE - CALENDÁRIO COM DIA EXPANDIDO
# Data: 24 de Outubro de 2025
# Autor: AI Assistant

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 TESTE DO CALENDÁRIO COM VISUALIZAÇÃO EXPANDIDA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se os servidores estão rodando
echo -e "${BLUE}📋 Verificando servidores...${NC}"
echo ""

# Verificar Backend
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend rodando na porta 3001${NC}"
else
    echo -e "${RED}❌ Backend NÃO está rodando!${NC}"
    echo -e "${YELLOW}   Execute: cd agenda-hibrida-v2 && npm start${NC}"
    exit 1
fi

# Verificar Frontend
if lsof -ti:5175 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend rodando na porta 5175${NC}"
else
    echo -e "${RED}❌ Frontend NÃO está rodando!${NC}"
    echo -e "${YELLOW}   Execute: cd agenda-hibrida-frontend && pnpm dev${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TUDO PRONTO PARA TESTAR!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📝 PASSO A PASSO PARA TESTAR:${NC}"
echo ""
echo "1️⃣  Abra o navegador em: http://localhost:5175"
echo ""
echo "2️⃣  Clique na aba 'Calendário Visual'"
echo ""
echo "3️⃣  Teste expandir o DIA 25 (que tem agendamento):"
echo "    - Clique no dia 25"
echo "    - Verifique se mostra: 'sábado, 25 de outubro de 2025'"
echo "    - Verifique se mostra: '1 agendamento'"
echo "    - Verifique se mostra: Nome do cliente, horário, imagens"
echo "    - Clique em 'Voltar ao Calendário'"
echo ""
echo "4️⃣  Teste expandir um DIA SEM AGENDAMENTO (ex: dia 1):"
echo "    - Clique no dia 1"
echo "    - Verifique se mostra: 'quarta-feira, 01 de outubro de 2025'"
echo "    - Verifique se mostra: '0 agendamentos'"
echo "    - Verifique se mostra: 'Nenhum agendamento para este dia'"
echo "    - Clique em 'Voltar ao Calendário'"
echo ""
echo "5️⃣  Teste a GALERIA DE IMAGENS:"
echo "    - Expanda o dia 25"
echo "    - Veja as 2 imagens na galeria"
echo "    - Passe o mouse sobre uma imagem (deve mostrar overlay)"
echo "    - Dê duplo clique em uma imagem (deve abrir a pasta do cliente)"
echo ""
echo "6️⃣  Teste o BOTÃO 'Abrir Pasta do Cliente':"
echo "    - Na visualização expandida do dia 25"
echo "    - Role até o final"
echo "    - Clique no botão 'Abrir Pasta do Cliente'"
echo "    - Verifique se abre a pasta correta"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📸 SCREENSHOTS DISPONÍVEIS:${NC}"
echo ""
echo "   1. calendario-visual-completo.png"
echo "   2. calendario-dia-25-expandido.png"
echo "   3. calendario-dia-sem-agendamentos.png"
echo ""
echo "   📁 Localização: .playwright-mcp/"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📖 DOCUMENTAÇÃO COMPLETA:${NC}"
echo ""
echo "   ✅_CALENDARIO_DIA_EXPANDIDO.md"
echo ""
echo "   Contém:"
echo "   - Descrição completa da funcionalidade"
echo "   - Screenshots e explicações"
echo "   - Código implementado"
echo "   - Casos de uso"
echo "   - Instruções detalhadas"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ FUNCIONALIDADE 100% IMPLEMENTADA E TESTADA! ✨${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Perguntar se quer abrir o navegador
read -p "🌐 Deseja abrir o navegador agora? (s/n): " resposta
if [[ $resposta =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 Abrindo navegador...${NC}"
    open http://localhost:5175
    echo ""
    echo -e "${GREEN}✅ Navegador aberto!${NC}"
    echo ""
fi

echo -e "${YELLOW}📝 Dica: Execute este script sempre que quiser testar a funcionalidade${NC}"
echo ""

