#!/bin/bash

# Script de Teste - Thumbnails e Suporte PSD
# Uso: ./TESTAR_THUMBNAILS_E_PSD.sh

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🖼️  TESTE DE THUMBNAILS E SUPORTE PSD                          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se está no diretório correto
if [ ! -f "agenda-hibrida-v2/server.js" ]; then
    echo "❌ Erro: Execute este script do diretório raiz do projeto"
    echo "   (onde está a pasta agenda-hibrida-v2)"
    exit 1
fi

echo "📋 Checklist de Verificação:"
echo ""

# 1. Verificar ag-psd instalado
echo "1️⃣  Verificando biblioteca ag-psd..."
cd agenda-hibrida-v2
if npm list ag-psd &> /dev/null; then
    echo "   ✅ ag-psd instalado"
else
    echo "   ❌ ag-psd NÃO instalado"
    echo "   Instalando agora..."
    npm install ag-psd
fi

# 2. Verificar Sharp instalado
echo ""
echo "2️⃣  Verificando biblioteca sharp..."
if npm list sharp &> /dev/null; then
    echo "   ✅ sharp instalado"
else
    echo "   ❌ sharp NÃO instalado"
    echo "   Instalando agora..."
    npm install sharp
fi

# 3. Criar diretórios de cache se não existirem
echo ""
echo "3️⃣  Verificando diretórios de cache..."
mkdir -p thumbnails_cache
mkdir -p psd_thumbnails_cache
echo "   ✅ Diretórios criados"

# 4. Verificar se há arquivos para testar
echo ""
echo "4️⃣  Verificando arquivos de teste..."
FILE_COUNT=$(find uploads -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.psd" \) 2>/dev/null | wc -l)
echo "   📁 Encontrados $FILE_COUNT arquivo(s) de imagem/PSD"

cd ..

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "🚀 PRONTO PARA TESTAR!"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Inicie o backend em um terminal:"
echo "   cd agenda-hibrida-v2"
echo "   node server.js"
echo ""
echo "2. Inicie o frontend em outro terminal:"
echo "   cd agenda-hibrida-frontend"
echo "   npm run dev"
echo ""
echo "3. Acesse: http://localhost:5173"
echo ""
echo "4. Testes recomendados:"
echo "   ✓ Upload de imagem JPG/PNG"
echo "   ✓ Upload de arquivo PSD"
echo "   ✓ Verificar thumbnails na lista"
echo "   ✓ Clicar em 'Detalhes' para ver thumbnail maior"
echo "   ✓ Verificar Google Drive (se conectado)"
echo ""
echo "5. Monitorar logs:"
echo "   Backend:  Procure por 🖼️ [THUMBNAIL] e 🎨 [PSD]"
echo "   Browser:  Abra DevTools (F12) e veja o Console"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "📖 Para mais informações, veja:"
echo "   CORRECAO_THUMBNAILS_E_PSD.md"
echo ""

# Perguntar se deseja ver status do cache
echo ""
read -p "Deseja ver o status dos caches de thumbnails? (s/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "📦 Cache de Thumbnails Normais:"
    if [ -d "agenda-hibrida-v2/thumbnails_cache" ]; then
        THUMB_COUNT=$(ls -1 agenda-hibrida-v2/thumbnails_cache/ 2>/dev/null | wc -l)
        THUMB_SIZE=$(du -sh agenda-hibrida-v2/thumbnails_cache/ 2>/dev/null | cut -f1)
        echo "   Arquivos: $THUMB_COUNT"
        echo "   Tamanho:  $THUMB_SIZE"
    else
        echo "   (vazio)"
    fi
    
    echo ""
    echo "📦 Cache de Thumbnails PSD:"
    if [ -d "agenda-hibrida-v2/psd_thumbnails_cache" ]; then
        PSD_COUNT=$(ls -1 agenda-hibrida-v2/psd_thumbnails_cache/ 2>/dev/null | wc -l)
        PSD_SIZE=$(du -sh agenda-hibrida-v2/psd_thumbnails_cache/ 2>/dev/null | cut -f1)
        echo "   Arquivos: $PSD_COUNT"
        echo "   Tamanho:  $PSD_SIZE"
    else
        echo "   (vazio)"
    fi
    echo ""
fi

echo "✨ Bom teste!"

