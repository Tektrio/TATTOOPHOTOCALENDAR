#!/bin/bash

echo "🖼️  TESTE DE THUMBNAILS - Sistema de Agenda Híbrida"
echo "=================================================="
echo ""

API_URL="http://localhost:3001"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando se o servidor está rodando...${NC}"
if curl -s "$API_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor está online${NC}"
else
    echo -e "${RED}❌ Servidor não está rodando!${NC}"
    echo "   Execute: cd agenda-hibrida-v2 && node server.js"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Verificando dependências...${NC}"

# Verificar Sharp
if cd agenda-hibrida-v2 && npm list sharp 2>/dev/null | grep -q "sharp@"; then
    SHARP_VERSION=$(npm list sharp 2>/dev/null | grep "sharp@" | sed 's/.*sharp@//' | sed 's/ .*//')
    echo -e "${GREEN}✅ Sharp instalado (v${SHARP_VERSION})${NC}"
else
    echo -e "${RED}❌ Sharp não está instalado!${NC}"
    echo "   Execute: cd agenda-hibrida-v2 && npm install sharp"
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}3. Verificando pasta de cache...${NC}"

CACHE_DIR="agenda-hibrida-v2/thumbnails_cache"
if [ -d "$CACHE_DIR" ]; then
    CACHE_COUNT=$(ls -1 "$CACHE_DIR" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Pasta de cache existe${NC}"
    echo "   📁 Localização: $CACHE_DIR"
    echo "   📊 Thumbnails em cache: $CACHE_COUNT"
else
    echo -e "${YELLOW}⚠️  Pasta de cache será criada automaticamente${NC}"
fi

echo ""
echo -e "${BLUE}4. Buscando arquivos de imagem...${NC}"

# Buscar arquivos
RESPONSE=$(curl -s "$API_URL/api/files")
IMAGE_COUNT=$(echo "$RESPONSE" | grep -o '"is_image":true' | wc -l | tr -d ' ')

if [ "$IMAGE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Encontradas $IMAGE_COUNT imagens${NC}"
    
    # Pegar ID da primeira imagem
    FIRST_IMAGE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    
    if [ ! -z "$FIRST_IMAGE_ID" ]; then
        echo ""
        echo -e "${BLUE}5. Testando geração de thumbnail...${NC}"
        echo "   🔍 Testando arquivo ID: $FIRST_IMAGE_ID"
        
        # Testar thumbnail
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/files/$FIRST_IMAGE_ID/thumbnail?size=300")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ Thumbnail gerado com sucesso!${NC}"
            echo "   📎 URL: $API_URL/api/files/$FIRST_IMAGE_ID/thumbnail?size=300"
        else
            echo -e "${RED}❌ Erro ao gerar thumbnail (HTTP $HTTP_CODE)${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}6. Testando diferentes tamanhos...${NC}"
        
        for SIZE in 150 300 500; do
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/files/$FIRST_IMAGE_ID/thumbnail?size=$SIZE")
            if [ "$HTTP_CODE" = "200" ]; then
                echo -e "${GREEN}   ✅ Tamanho ${SIZE}x${SIZE}${NC}"
            else
                echo -e "${RED}   ❌ Tamanho ${SIZE}x${SIZE} (HTTP $HTTP_CODE)${NC}"
            fi
        done
        
        echo ""
        echo -e "${BLUE}7. Verificando cache após geração...${NC}"
        if [ -d "$CACHE_DIR" ]; then
            NEW_CACHE_COUNT=$(ls -1 "$CACHE_DIR" 2>/dev/null | wc -l | tr -d ' ')
            echo -e "${GREEN}✅ Thumbnails em cache: $NEW_CACHE_COUNT${NC}"
            
            if [ "$NEW_CACHE_COUNT" -gt "$CACHE_COUNT" ]; then
                DIFF=$((NEW_CACHE_COUNT - CACHE_COUNT))
                echo -e "${GREEN}   📈 Novos thumbnails criados: $DIFF${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Nenhuma imagem encontrada no sistema${NC}"
    echo "   Faça upload de algumas imagens para testar"
fi

echo ""
echo -e "${BLUE}8. Resumo de Formatos Suportados:${NC}"
echo "   ✅ JPEG/JPG"
echo "   ✅ PNG"
echo "   ✅ WebP"
echo "   ✅ GIF"
echo "   ✅ BMP"
echo "   ✅ TIFF"

echo ""
echo -e "${BLUE}9. Testando endpoints da API...${NC}"

# Testar rota de arquivos
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/files")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ GET /api/files${NC}"
else
    echo -e "${RED}❌ GET /api/files (HTTP $HTTP_CODE)${NC}"
fi

# Testar rota de drive
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/drive/files")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ GET /api/drive/files${NC}"
else
    echo -e "${RED}❌ GET /api/drive/files (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✨ TESTE CONCLUÍDO!${NC}"
echo ""
echo "📖 Para mais informações, veja:"
echo "   - THUMBNAILS_IMPLEMENTADOS.md"
echo "   - Documentação da API"
echo ""
echo "🌐 Acesse o frontend em:"
echo "   http://localhost:5173"
echo ""

