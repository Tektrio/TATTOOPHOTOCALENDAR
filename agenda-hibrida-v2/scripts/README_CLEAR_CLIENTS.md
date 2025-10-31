# 🧹 Script de Limpeza Total de Clientes

## O que faz

O script `clear-all-clients.js` remove **TODOS** os clientes e dados relacionados do banco de dados. Útil para resetar o sistema antes de fazer importações de teste ou produção.

## Dados Removidos

- ✅ Todos os clientes
- ✅ Todos os agendamentos vinculados
- ✅ Todos os arquivos vinculados
- ✅ Todas as estatísticas de clientes

## Segurança

- 📦 **Backup automático** - Cria backup antes de qualquer operação
- 👀 **Modo dry-run** - Permite preview antes de executar
- 📝 **Log detalhado** - Mostra exatamente o que será removido

## Uso

### Preview (Dry-run)

Veja o que será removido **SEM** fazer alterações:

```bash
cd agenda-hibrida-v2
node scripts/clear-all-clients.js --dry-run
```

### Executar Limpeza

Remove todos os clientes e dados relacionados:

```bash
cd agenda-hibrida-v2
node scripts/clear-all-clients.js
```

### Ou executar diretamente (Linux/Mac)

```bash
cd agenda-hibrida-v2
./scripts/clear-all-clients.js
./scripts/clear-all-clients.js --dry-run  # preview
```

## Exemplo de Output

```
🧹 ============================================
🧹 LIMPEZA TOTAL DE CLIENTES
🧹 ============================================

🔌 Conectando ao banco de dados...
✅ Conectado

📊 Analisando dados...

   👥 Clientes: 150
   📅 Agendamentos vinculados: 320
   📁 Arquivos vinculados: 89
   📈 Estatísticas de clientes: 150

📦 Criando backup do banco de dados...
✅ Backup criado: backups/before-clear-clients-2025-10-31T14-30-00.db

⚠️  ATENÇÃO: Esta operação irá remover:
   - 150 clientes
   - 320 agendamentos
   - 89 arquivos
   - 150 registros de estatísticas

⚠️  Esta operação não pode ser desfeita!
   (Backup disponível em: backups/before-clear-clients-2025-10-31T14-30-00.db)

🗑️  Executando limpeza...

🗑️  Removendo arquivos vinculados aos clientes...
✅ 89 arquivos removidos

🗑️  Removendo agendamentos vinculados aos clientes...
✅ 320 agendamentos removidos

🗑️  Removendo estatísticas de clientes...
✅ 150 registros de estatísticas removidos

🗑️  Removendo todos os clientes...
✅ 150 clientes removidos

🔧 Otimizando banco de dados (VACUUM)...
✅ Banco otimizado

🔌 Conexão fechada

✅ ============================================
✅ LIMPEZA CONCLUÍDA COM SUCESSO!
✅ Backup disponível em: backups/before-clear-clients-2025-10-31T14-30-00.db
✅ O banco está pronto para importação de novos dados
✅ ============================================
```

## Recuperação

Se precisar desfazer a operação, restaure o backup:

```bash
cd agenda-hibrida-v2
cp backups/before-clear-clients-TIMESTAMP.db agenda_hibrida.db
```

## Quando Usar

- ✅ Antes de importar dados de produção
- ✅ Antes de testar sistema de importação
- ✅ Para resetar ambiente de desenvolvimento
- ✅ Para limpar dados de testes antigos

## ⚠️ Avisos

- ⚠️ **NÃO** execute em produção sem backup externo
- ⚠️ Esta operação **NÃO** pode ser desfeita (exceto via backup)
- ⚠️ Remove **TODOS** os clientes, não apenas os de teste
- ⚠️ Recomendado fazer backup manual antes de executar

## Fluxo Recomendado

1. **Preview**: Execute com `--dry-run` primeiro
2. **Backup manual**: Faça uma cópia do banco manualmente (opcional, mas recomendado)
3. **Execute**: Execute o script sem `--dry-run`
4. **Verifique**: Verifique se o backup automático foi criado
5. **Importe**: Agora pode importar novos dados

## Localização dos Backups

Os backups são salvos em:
```
agenda-hibrida-v2/backups/before-clear-clients-YYYY-MM-DDTHH-MM-SS.db
```

## Suporte

Se encontrar problemas:
1. Verifique o log de erro
2. Restaure o backup automaticamente criado
3. Relate o problema com o log completo

