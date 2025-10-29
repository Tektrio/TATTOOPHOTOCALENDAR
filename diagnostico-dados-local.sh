#!/bin/bash
# Script de Diagnóstico - Aba Dados Local
# Verifica se tudo está configurado corretamente

echo "🔍 ============================================"
echo "   DIAGNÓSTICO: ABA DADOS LOCAL"
echo "============================================"
echo ""

CD_BASE="/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR"
DB_PATH="$CD_BASE/agenda-hibrida-v2/database/database.db"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar
check_item() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

# Função para contar
count_item() {
    echo -e "${BLUE}ℹ️${NC}  $1: ${YELLOW}$2${NC}"
}

echo "📦 1. VERIFICANDO BANCO DE DADOS"
echo "   ────────────────────────────"

# Verifica se o banco existe
if [ -f "$DB_PATH" ]; then
    check_item 0 "Banco de dados existe"
    
    # Verifica tabelas
    TABLES=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('local_storage_config', 'sync_destinations', 'local_files', 'sync_status', 'sync_rules', 'sync_queue');" 2>/dev/null | wc -l)
    
    if [ "$TABLES" -eq 6 ]; then
        check_item 0 "Todas as 6 tabelas existem"
    else
        check_item 1 "Faltam tabelas (encontradas: $TABLES/6)"
    fi
    
    # Conta registros
    echo ""
    LOCAL_FILES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM local_files;" 2>/dev/null)
    DESTINATIONS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sync_destinations;" 2>/dev/null)
    SYNC_STATUS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sync_status;" 2>/dev/null)
    
    count_item "Arquivos indexados" "$LOCAL_FILES"
    count_item "Destinos configurados" "$DESTINATIONS"
    count_item "Status de sincronização" "$SYNC_STATUS"
    
    # Verifica configuração
    CONFIG=$(sqlite3 "$DB_PATH" "SELECT base_path FROM local_storage_config WHERE id=1;" 2>/dev/null)
    if [ -n "$CONFIG" ]; then
        check_item 0 "Configuração salva: $CONFIG"
        
        if [ -d "$CONFIG" ]; then
            check_item 0 "Pasta configurada existe"
            FILE_COUNT=$(find "$CONFIG" -type f 2>/dev/null | wc -l | tr -d ' ')
            count_item "Arquivos na pasta" "$FILE_COUNT"
        else
            check_item 1 "Pasta configurada NÃO existe!"
        fi
    else
        check_item 1 "Nenhuma pasta configurada ainda"
    fi
else
    check_item 1 "Banco de dados NÃO encontrado!"
fi

echo ""
echo "📁 2. VERIFICANDO ARQUIVOS DO BACKEND"
echo "   ────────────────────────────────"

# Rotas
[ -f "$CD_BASE/agenda-hibrida-v2/routes/localStorageRouter.js" ] && check_item 0 "localStorageRouter.js" || check_item 1 "localStorageRouter.js"
[ -f "$CD_BASE/agenda-hibrida-v2/routes/syncDestinationsRouter.js" ] && check_item 0 "syncDestinationsRouter.js" || check_item 1 "syncDestinationsRouter.js"

# Serviços
[ -f "$CD_BASE/agenda-hibrida-v2/services/localStorageService.js" ] && check_item 0 "localStorageService.js" || check_item 1 "localStorageService.js"
[ -f "$CD_BASE/agenda-hibrida-v2/services/syncDestinationsService.js" ] && check_item 0 "syncDestinationsService.js" || check_item 1 "syncDestinationsService.js"

# Utilitários
[ -f "$CD_BASE/agenda-hibrida-v2/utils/pathParser.js" ] && check_item 0 "pathParser.js" || check_item 1 "pathParser.js"
[ -f "$CD_BASE/agenda-hibrida-v2/utils/fileHasher.js" ] && check_item 0 "fileHasher.js" || check_item 1 "fileHasher.js"

echo ""
echo "🎨 3. VERIFICANDO ARQUIVOS DO FRONTEND"
echo "   ─────────────────────────────────"

# Páginas
[ -f "$CD_BASE/agenda-hibrida-frontend/src/pages/LocalStorage.jsx" ] && check_item 0 "LocalStorage.jsx" || check_item 1 "LocalStorage.jsx"

# Componentes
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/LocalFileExplorer.jsx" ] && check_item 0 "LocalFileExplorer.jsx" || check_item 1 "LocalFileExplorer.jsx"
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/DestinationManager.jsx" ] && check_item 0 "DestinationManager.jsx" || check_item 1 "DestinationManager.jsx"
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/LocalFileTable.jsx" ] && check_item 0 "LocalFileTable.jsx" || check_item 1 "LocalFileTable.jsx"
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/AddGoogleAccountModal.jsx" ] && check_item 0 "AddGoogleAccountModal.jsx" || check_item 1 "AddGoogleAccountModal.jsx"

# Utilitários
[ -f "$CD_BASE/agenda-hibrida-frontend/src/utils/syncHelpers.js" ] && check_item 0 "syncHelpers.js" || check_item 1 "syncHelpers.js"
[ -f "$CD_BASE/agenda-hibrida-frontend/src/utils/storageConfig.js" ] && check_item 0 "storageConfig.js" || check_item 1 "storageConfig.js"

echo ""
echo "🧪 4. VERIFICANDO PASTA DE TESTE"
echo "   ───────────────────────────"

TEST_PATH="/Users/luizlopes/Desktop/TATTOO_TEST"
if [ -d "$TEST_PATH" ]; then
    check_item 0 "Pasta de teste existe"
    
    TEST_FILES=$(find "$TEST_PATH" -type f 2>/dev/null | wc -l | tr -d ' ')
    count_item "Arquivos de teste" "$TEST_FILES"
    
    # Lista estrutura
    echo ""
    echo -e "${BLUE}📂 Estrutura:${NC}"
    tree "$TEST_PATH" -L 3 2>/dev/null || find "$TEST_PATH" -maxdepth 3 -print | sed 's|[^/]*/| |g'
else
    check_item 1 "Pasta de teste NÃO encontrada"
    echo -e "${YELLOW}⚠️  Execute: mkdir -p $TEST_PATH${NC}"
fi

echo ""
echo "🌐 5. VERIFICANDO SERVIÇOS"
echo "   ──────────────────────"

# Verifica se backend está rodando
if lsof -i :3001 >/dev/null 2>&1; then
    check_item 0 "Backend rodando na porta 3001"
else
    check_item 1 "Backend NÃO está rodando"
    echo -e "${YELLOW}⚠️  Inicie: cd agenda-hibrida-v2 && npm start${NC}"
fi

# Verifica se frontend está rodando
if lsof -i :5173 >/dev/null 2>&1; then
    check_item 0 "Frontend rodando na porta 5173"
else
    check_item 1 "Frontend NÃO está rodando"
    echo -e "${YELLOW}⚠️  Inicie: cd agenda-hibrida-frontend && npm run dev${NC}"
fi

echo ""
echo "📊 RESUMO"
echo "   ─────"
echo ""

# Calcula pontuação
SCORE=0
MAX_SCORE=20

[ -f "$DB_PATH" ] && ((SCORE++))
[ "$TABLES" -eq 6 ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/routes/localStorageRouter.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/routes/syncDestinationsRouter.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/services/localStorageService.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/services/syncDestinationsService.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/utils/pathParser.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-v2/utils/fileHasher.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/pages/LocalStorage.jsx" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/LocalFileExplorer.jsx" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/DestinationManager.jsx" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/LocalFileTable.jsx" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/components/AddGoogleAccountModal.jsx" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/utils/syncHelpers.js" ] && ((SCORE++))
[ -f "$CD_BASE/agenda-hibrida-frontend/src/utils/storageConfig.js" ] && ((SCORE++))
[ -d "$TEST_PATH" ] && ((SCORE++))
lsof -i :3001 >/dev/null 2>&1 && ((SCORE++))
lsof -i :5173 >/dev/null 2>&1 && ((SCORE++))

PERCENT=$((SCORE * 100 / MAX_SCORE))

echo -e "Pontuação: ${YELLOW}$SCORE/$MAX_SCORE${NC} (${YELLOW}$PERCENT%${NC})"
echo ""

if [ $PERCENT -eq 100 ]; then
    echo -e "${GREEN}🎉 SISTEMA 100% PRONTO PARA TESTES!${NC}"
    echo ""
    echo "📖 Próximo passo:"
    echo "   1. Abra o navegador em: http://localhost:5173"
    echo "   2. Siga o guia: [TESTE]_GUIA_DADOS_LOCAL_PASSO_A_PASSO.md"
elif [ $PERCENT -ge 80 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA QUASE PRONTO${NC}"
    echo ""
    echo "Revise os itens marcados com ❌ acima"
elif [ $PERCENT -ge 50 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA PARCIALMENTE CONFIGURADO${NC}"
    echo ""
    echo "Corrija os problemas antes de testar"
else
    echo -e "${RED}❌ SISTEMA NÃO ESTÁ PRONTO${NC}"
    echo ""
    echo "Muitos componentes faltando. Revise a instalação."
fi

echo ""
echo "============================================"
echo ""

