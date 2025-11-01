#!/bin/bash

# Script para verificar se o Supabase está pronto e criar as tabelas

echo "🔍 Verificando conexão com Supabase..."
echo "⏰ Aguarde, isso pode levar alguns minutos..."
echo ""

MAX_ATTEMPTS=30
ATTEMPT=1
WAIT_TIME=30

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Tentativa $ATTEMPT de $MAX_ATTEMPTS..."
    
    # Tentar conectar ao Supabase
    if npx prisma db push --schema=./prisma/schema-cloud.prisma --accept-data-loss 2>&1 | grep -q "already in sync\|Your database is now in sync"; then
        echo ""
        echo "✅ SUCESSO! Supabase está pronto e tabelas foram criadas!"
        echo ""
        echo "🎉 Próximos passos:"
        echo "1. O sistema está rodando em: http://localhost:3000"
        echo "2. Você pode fazer deploy na Vercel agora"
        echo "3. Consulte o arquivo 🎯_PROXIMOS_PASSOS_AGORA.md"
        exit 0
    fi
    
    # Se falhou, aguardar e tentar novamente
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "⏳ Aguardando ${WAIT_TIME}s antes da próxima tentativa..."
        echo ""
        sleep $WAIT_TIME
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "❌ Tempo limite excedido. O Supabase pode demorar mais que o esperado."
echo ""
echo "💡 Tente executar manualmente em alguns minutos:"
echo "   npx prisma db push --schema=./prisma/schema-cloud.prisma --accept-data-loss"

