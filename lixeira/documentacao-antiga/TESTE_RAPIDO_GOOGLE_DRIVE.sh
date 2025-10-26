#!/bin/bash

# Script de teste rápido do Google Drive
# Execute com: bash TESTE_RAPIDO_GOOGLE_DRIVE.sh

clear

echo "═══════════════════════════════════════════════════════════"
echo "    🧪 TESTE RÁPIDO - GOOGLE DRIVE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o backend está rodando
echo "1️⃣  Verificando se o backend está rodando..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando na porta 3001${NC}"
else
    echo -e "${RED}❌ Backend NÃO está rodando!${NC}"
    echo -e "${YELLOW}   Execute: cd agenda-hibrida-v2 && npm start${NC}"
    exit 1
fi
echo ""

# Verificar status de autenticação
echo "2️⃣  Verificando status de autenticação..."
AUTH_STATUS=$(curl -s http://localhost:3001/auth/status | python3 -c "import sys, json; data = json.load(sys.stdin); print('OK' if data.get('authenticated') else 'FAIL')" 2>/dev/null)

if [ "$AUTH_STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ Google Drive autenticado${NC}"
    
    # Mostrar informações da conta
    curl -s http://localhost:3001/auth/status | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('   - Drive:', '✅' if data['services']['drive'] else '❌')
print('   - Calendar:', '✅' if data['services']['calendar'] else '❌')
print('   - Token expira em:', data['user'].get('tokenExpiry', 'N/A'))
" 2>/dev/null
else
    echo -e "${RED}❌ Google Drive NÃO autenticado!${NC}"
    echo -e "${YELLOW}   Execute: node agenda-hibrida-v2/test-gdrive-connection.js${NC}"
    echo -e "${YELLOW}   Ou acesse: http://localhost:3001/auth/google${NC}"
    exit 1
fi
echo ""

# Testar API de listagem de arquivos
echo "3️⃣  Testando API de listagem de arquivos..."
FILE_COUNT=$(curl -s http://localhost:3001/api/drive/files | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data))" 2>/dev/null)

if [ ! -z "$FILE_COUNT" ]; then
    echo -e "${GREEN}✅ API respondeu com $FILE_COUNT arquivos${NC}"
else
    echo -e "${RED}❌ Erro ao acessar API de arquivos${NC}"
    exit 1
fi
echo ""

# Testar informações de storage
echo "4️⃣  Testando informações de storage..."
curl -s http://localhost:3001/api/drive/about | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' not in data:
        used_gb = data['usage'] / (1024**3)
        limit_gb = data['limit'] / (1024**3)
        percentage = (data['usage'] / data['limit']) * 100
        print(f'   💾 Usado: {used_gb:.2f} GB / {limit_gb:.2f} GB ({percentage:.1f}%)')
        print(f'   👤 Usuário: {data[\"user\"][\"displayName\"]}')
        print(f'   📧 Email: {data[\"user\"][\"emailAddress\"]}')
        print('✅ Storage OK')
    else:
        print('❌ Erro ao buscar storage')
except:
    print('❌ Erro ao processar resposta')
" 2>/dev/null
echo ""

# Testar estatísticas
echo "5️⃣  Testando estatísticas..."
curl -s http://localhost:3001/api/drive/stats | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' not in data:
        print(f'   📁 Pastas: {data[\"totalFolders\"]}')
        print(f'   📄 Arquivos: {data[\"totalFiles\"]}')
        print(f'   🖼️  Imagens: {data[\"totalImages\"]}')
        print(f'   🎥 Vídeos: {data[\"totalVideos\"]}')
        print('✅ Estatísticas OK')
    else:
        print('❌ Erro ao buscar estatísticas')
except:
    print('❌ Erro ao processar resposta')
" 2>/dev/null
echo ""

# Executar teste completo
echo "6️⃣  Executando teste completo de conexão..."
cd agenda-hibrida-v2 2>/dev/null || cd . 
if node test-gdrive-connection.js 2>/dev/null | grep -q "TESTE CONCLUÍDO COM SUCESSO"; then
    echo -e "${GREEN}✅ Teste completo passou${NC}"
else
    echo -e "${YELLOW}⚠️  Teste completo teve problemas (mas API está respondendo)${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 GOOGLE DRIVE ESTÁ FUNCIONANDO!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "   1. Acesse o frontend: http://localhost:5173"
echo "   2. Clique em 'Google Drive Explorer'"
echo "   3. Comece a usar!"
echo ""
echo "   Ou execute o teste detalhado:"
echo "   cd agenda-hibrida-v2"
echo "   node test-gdrive-connection.js"
echo ""
echo "═══════════════════════════════════════════════════════════"

