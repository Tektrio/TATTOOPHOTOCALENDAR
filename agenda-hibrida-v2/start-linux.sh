#!/bin/bash

echo "Iniciando Agenda Híbrida - Sistema para Tatuadores"
echo "================================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

echo "Node.js versão: $(node --version)"

# Instalar dependências do backend
echo "Instalando dependências do backend..."
npm install

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd ../agenda-hibrida-frontend
npm install
cd ../agenda-hibrida-v2

# Iniciar backend em background
echo "Iniciando servidor backend..."
npm run dev &
BACKEND_PID=$!

# Aguardar um pouco
sleep 3

# Iniciar frontend
echo "Iniciando frontend..."
cd ../agenda-hibrida-frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Sistema iniciado com sucesso!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para parar os serviços"

# Aguardar interrupção
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
