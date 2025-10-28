#!/bin/bash

echo "🔄 Forçando recarga completa do Vite..."
echo ""

# Tocar nos arquivos principais para forçar HMR
echo "📝 Atualizando timestamps dos arquivos..."
touch src/App.jsx
touch src/components/SettingsPanel.jsx
sleep 1

echo "✅ Arquivos atualizados!"
echo ""
echo "📝 Agora faça no navegador:"
echo "   Chrome/Edge/Brave: Cmd + Shift + R"
echo "   Safari: Cmd + Option + R"
echo ""
echo "🌐 Ou abra em aba anônima:"
echo "   http://localhost:5173"
echo ""

