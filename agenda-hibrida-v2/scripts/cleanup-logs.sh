#!/bin/bash

# Script para remover console.logs de debug
# Mantém console.error, console.warn e logs importantes

echo "🧹 Limpando console.logs desnecessários..."

# Contador
removed=0

# Processar arquivos .js (excluindo node_modules, tests, etc)
find . -name "*.js" \
  -not -path "*/node_modules/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/test-*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -type f | while read file; do
  
  # Contar console.logs no arquivo
  count=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
  
  if [ "$count" -gt 0 ]; then
    echo "   📝 $file: $count console.log(s) encontrado(s)"
    
    # Remover apenas console.log de debug simples (não os importantes)
    sed -i '/^\s*console\.log(.*debug.*/d' "$file"
    sed -i '/^\s*console\.log(.*DEBUG.*/d' "$file"
    sed -i '/^\s*\/\/.*console\.log/d' "$file"
    
    removed=$((removed + count))
  fi
done

echo ""
echo "✅ Limpeza concluída!"
echo "   🗑️  Aproximadamente $removed console.log(s) processado(s)"
echo "   ✅ console.error e console.warn mantidos"
