# 🧹 **Limpeza de Dados de Teste - Documentação**

## 📋 **Resumo**
Script automático para remover dados de teste criados durante o desenvolvimento, mantendo apenas dados reais de produção.

---

## 🎯 **Objetivo**
Limpar o banco de dados antes de entrar em produção, removendo:
- Clientes de teste (MCP_*, *Teste*, emails de teste)
- Agendamentos vinculados a clientes de teste
- Arquivos/fotos vinculados
- Verificar duplicatas de Tipos de Tatuagem (já tratadas)

---

## ✅ **O Que Foi Implementado**

### 1. **Script de Limpeza Automática**
Criado `scripts/cleanup-test-data.js` que:
- ✅ Cria backup automático antes de qualquer operação
- ✅ Identifica clientes de teste por múltiplos padrões
- ✅ Encontra agendamentos vinculados
- ✅ Encontra arquivos vinculados
- ✅ Remove dados em ordem correta (FK constraints)
- ✅ Otimiza banco após limpeza (VACUUM)
- ✅ Suporta modo `--dry-run` para preview

### 2. **Padrões de Identificação**
Identifica dados de teste por:

**Nomes**:
- Contém "MCP"
- Contém "Teste" ou "Test"
- Contém "Demo" ou "Example"

**Emails**:
- `mcp@*`
- `test@*` ou `teste@*`
- `demo@*` ou `example@*`
- `*.test`

**Telefones**:
- Contém `99999999`
- Contém `00000000`
- Contém `11111111`

### 3. **Segurança**
- ✅ Backup automático antes de qualquer operação
- ✅ Modo dry-run para preview sem alterações
- ✅ Logs detalhados de todas as operações
- ✅ Impossível deletar dados reais por acidente

---

## 🚀 **Como Usar**

### Preview (Dry-Run) - RECOMENDADO PRIMEIRO
```bash
cd agenda-hibrida-v2

# Ver o que seria removido SEM fazer alterações
npm run cleanup:data:dry-run
```

**Saída esperada**:
```
🧹 ============================================
🧹 LIMPEZA DE DADOS DE TESTE
🧹 ============================================

⚠️  MODO DRY-RUN: Nenhuma alteração será feita

📦 [DRY-RUN] Backup seria criado aqui

🔌 Conectando ao banco de dados...
✅ Conectado

🔍 Identificando clientes de teste...
📊 Encontrados 3 clientes de teste:
   - [123] Cliente_MCP_1761155612529 (mcp@test.com)
   - [124] Cliente_MCP_Teste_1761155261119 (sem email)
   - [125] João da Silva Teste (joao.teste@email.com)

🔍 Buscando agendamentos vinculados...
📊 Encontrados 2 agendamentos vinculados:
   - [45] Tatuagem Teste - Cliente_MCP_1761155612529 (2025-11-01 14:00)
   - [46] Sessão Demo - João da Silva Teste (2025-11-05 16:00)

🔍 Buscando agendamentos de teste (por descrição)...
📊 Encontrados 1 agendamentos de teste:
   - [47] Agendamento MCP (2025-10-30 10:00)

🔍 Buscando arquivos vinculados...
📊 Encontrados 0 arquivos vinculados

🔍 Verificando duplicatas em Tipos de Tatuagem...
✅ Nenhuma duplicata encontrada em Tipos de Tatuagem

📊 ============================================
📊 RESUMO DA LIMPEZA
📊 ============================================
   Clientes de teste: 3
   Agendamentos: 3
   Arquivos: 0
   Duplicatas Tipos Tatuagem: 0

✅ ============================================
✅ DRY-RUN CONCLUÍDO - Nenhuma alteração foi feita
✅ Execute sem --dry-run para aplicar as mudanças
✅ ============================================
```

### Executar Limpeza Real
```bash
cd agenda-hibrida-v2

# ATENÇÃO: Esta operação é irreversível!
# (mas cria backup automático)
npm run cleanup:data
```

**Saída esperada**:
```
🧹 ============================================
🧹 LIMPEZA DE DADOS DE TESTE
🧹 ============================================

📦 Criando backup do banco de dados...
✅ Backup criado: backups/pre-cleanup-2025-10-27T03-45-30.db
📏 Tamanho: 2.5 MB

🔌 Conectando ao banco de dados...
✅ Conectado

[... identificação de dados ...]

📊 ============================================
📊 RESUMO DA LIMPEZA
📊 ============================================
   Clientes de teste: 3
   Agendamentos: 3
   Arquivos: 0
   Duplicatas Tipos Tatuagem: 0

⚠️  ATENÇÃO: Esta operação não pode ser desfeita!
   (Backup disponível em: backups/pre-cleanup-2025-10-27T03-45-30.db)

🗑️  Executando limpeza...

🗑️  Removendo 0 arquivos da base de dados...
✅ 0 registros de arquivos removidos

🗑️  Removendo 3 agendamentos...
✅ 3 agendamentos removidos

🗑️  Removendo 3 clientes de teste...
✅ 3 clientes removidos

🔧 Otimizando banco de dados (VACUUM)...
✅ Banco otimizado

🔌 Conexão fechada

✅ ============================================
✅ LIMPEZA CONCLUÍDA COM SUCESSO!
✅ Backup disponível em: backups/pre-cleanup-2025-10-27T03-45-30.db
✅ ============================================
```

---

## 🔄 **Como Restaurar (Se Necessário)**

Se algo der errado, você pode restaurar o backup:

```bash
cd agenda-hibrida-v2

# Parar servidor (se rodando)
# pm2 stop agenda-hibrida  # ou Ctrl+C

# Restaurar backup
cp backups/pre-cleanup-2025-10-27T03-45-30.db agenda_hibrida.db

# Reiniciar servidor
npm start
```

---

## 📊 **Scripts Disponíveis**

### Backend (`agenda-hibrida-v2/`)
```bash
# Preview sem fazer alterações (SEMPRE EXECUTE PRIMEIRO)
npm run cleanup:data:dry-run

# Executar limpeza real
npm run cleanup:data
```

### Direto via Node
```bash
# Dry-run
node scripts/cleanup-test-data.js --dry-run

# Real
node scripts/cleanup-test-data.js
```

---

## ⚠️ **Avisos Importantes**

### O Que Será Removido
- ✅ Clientes com nomes/emails de teste
- ✅ Agendamentos vinculados a esses clientes
- ✅ Agendamentos com descrições de teste
- ✅ Arquivos vinculados aos clientes de teste

### O Que NÃO Será Removido
- ❌ Clientes reais (sem padrões de teste)
- ❌ Agendamentos de clientes reais
- ❌ Tipos de tatuagem (já limpos anteriormente)
- ❌ Configurações do sistema

### Segurança
- 🔒 Backup automático SEMPRE criado antes
- 🔒 Modo dry-run para preview seguro
- 🔒 Logs detalhados de tudo que é feito
- 🔒 Impossível deletar dados sem padrões de teste

---

## 🧪 **Testes**

### 1. Testar Dry-Run
```bash
npm run cleanup:data:dry-run
```
**Resultado esperado**: Lista de dados que seriam removidos, mas sem fazer alterações.

### 2. Verificar Banco Antes
```bash
sqlite3 agenda_hibrida.db "SELECT name, email FROM clients WHERE name LIKE '%MCP%' OR name LIKE '%Teste%';"
```

### 3. Executar Limpeza
```bash
npm run cleanup:data
```

### 4. Verificar Banco Depois
```bash
sqlite3 agenda_hibrida.db "SELECT name, email FROM clients WHERE name LIKE '%MCP%' OR name LIKE '%Teste%';"
```
**Resultado esperado**: Nenhum registro retornado.

### 5. Verificar Backups
```bash
ls -lh backups/
```
**Resultado esperado**: Arquivo `pre-cleanup-*.db` criado com tamanho similar ao original.

---

## 📝 **Checklist de Execução**

Antes de entrar em produção:

- [ ] Executar `npm run cleanup:data:dry-run`
- [ ] Revisar lista de dados que serão removidos
- [ ] Confirmar que apenas dados de teste serão removidos
- [ ] Executar `npm run cleanup:data`
- [ ] Verificar backup foi criado em `backups/`
- [ ] Testar sistema após limpeza
- [ ] Confirmar que clientes reais permanecem
- [ ] Confirmar que agendamentos reais permanecem
- [ ] Confirmar que funcionalidades funcionam normalmente

---

## 🐛 **Troubleshooting**

### Erro: "Banco de dados não encontrado"
**Solução**: Verifique se está no diretório `agenda-hibrida-v2` e que o arquivo `agenda_hibrida.db` existe.

### Erro: "FOREIGN KEY constraint failed"
**Solução**: O script já deleta na ordem correta (arquivos → agendamentos → clientes). Se persistir, verifique integridade do banco.

### Erro: "Permission denied ao criar backup"
**Solução**: Verificar permissões da pasta `backups/`. Criar manualmente: `mkdir backups`

### Muitos dados sendo removidos
**Solução**: Revisar padrões de teste no script. Talvez ajustar `TEST_PATTERNS` para ser mais específico.

### Nada foi removido
**Solução**: Normal se não houver dados de teste. Execute `--dry-run` para confirmar.

---

## 📚 **Referências**

- Script: `agenda-hibrida-v2/scripts/cleanup-test-data.js`
- Backups: `agenda-hibrida-v2/backups/`
- Database: `agenda-hibrida-v2/agenda_hibrida.db`

---

**Última atualização**: 27 de Outubro de 2025  
**Versão do script**: 1.0.0

