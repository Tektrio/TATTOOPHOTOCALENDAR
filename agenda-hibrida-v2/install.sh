#!/bin/bash

echo "Instalação Automática - Agenda Híbrida"
echo "======================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "ERRO: npm não encontrado após instalação do Node.js"
    exit 1
fi

echo "Instalando dependências globais..."
npm install -g concurrently nodemon

echo "Instalando dependências do projeto..."
npm install

echo "Configurando banco de dados..."
node scripts/setup-complete.js

echo "Executando testes do sistema..."
node scripts/test-system.js

echo ""
echo "Instalação concluída com sucesso!"
echo "Execute './start-linux.sh' para iniciar o sistema"
