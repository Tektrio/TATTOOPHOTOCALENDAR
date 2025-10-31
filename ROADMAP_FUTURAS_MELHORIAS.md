# 🗺️ Roadmap - Futuras Melhorias

**Data:** 31 de Outubro de 2025  
**Versão:** 2.0.0  
**Status:** Planejamento para versões futuras

---

## Introdução

Este documento apresenta melhorias e funcionalidades planejadas para futuras versões do sistema. As melhorias estão organizadas por prioridade e complexidade.

---

## Sprint 6: Interface da Lixeira (UI Completa)

### Prioridade: Alta 🔴
### Complexidade: Média
### Estimativa: 2-3 dias

**Objetivo:** Criar interface completa para gerenciamento da lixeira.

### Funcionalidades:

1. **Tab "Lixeira" no FilesTab**
   - Adicionar componente `Tabs` do shadcn/ui
   - Duas abas: "Arquivos" e "Lixeira"
   - Badge mostrando quantidade de arquivos na lixeira
   - Estado `showTrash` para alternar visualização

2. **Listagem de Arquivos Deletados**
   - Grid/Lista com visual diferenciado (opacidade reduzida)
   - Badge "Deletado em [data]" em cada arquivo
   - Ordenação por data de deleção (mais recente primeiro)
   - Filtro por categoria (opcional)

3. **Ações na Lixeira**
   - Botão "Restaurar" (ícone RotateCcw) por arquivo
   - Botão "Deletar Permanentemente" (ícone X) por arquivo
   - Dialog de confirmação para deleção permanente
   - Ações em lote (selecionar múltiplos arquivos)

4. **Feedback Visual**
   - Mensagem de sucesso ao restaurar
   - Mensagem de sucesso ao deletar permanentemente
   - Loading states durante operações
   - Atualização automática da badge de contagem

### Arquivos Envolvidos:
- `agenda-hibrida-frontend/src/components/customer/FilesTab.jsx`
- `agenda-hibrida-v2/server.js` (endpoint já implementado)

---

## Sprint 7: Limpeza Automática da Lixeira

### Prioridade: Média 🟡
### Complexidade: Média
### Estimativa: 1-2 dias

**Objetivo:** Implementar limpeza automática de arquivos antigos na lixeira.

### Funcionalidades:

1. **Job Agendado**
   - Script executado diariamente (cron job ou node-schedule)
   - Deletar permanentemente arquivos com `deleted_at` > 30 dias
   - Logs de arquivos removidos
   - Configurável via variável `.env`

2. **Configurações**
   - `TRASH_RETENTION_DAYS=30` (dias antes de deleção permanente)
   - `TRASH_CLEANUP_ENABLED=true` (habilitar/desabilitar)
   - `TRASH_CLEANUP_TIME=02:00` (horário de execução)

3. **Notificações**
   - Email para admin com resumo de arquivos removidos
   - Dashboard com estatísticas de limpeza

### Arquivos Envolvidos:
- `agenda-hibrida-v2/jobs/trash-cleanup.js` (novo)
- `agenda-hibrida-v2/server.js` (inicializar job)
- `agenda-hibrida-v2/.env` (configurações)

---

## Sprint 8: Sincronização de Lixeira com Google Drive

### Prioridade: Média 🟡
### Complexidade: Alta
### Estimativa: 3-4 dias

**Objetivo:** Sincronizar soft delete com Google Drive usando Trash do Drive.

### Funcionalidades:

1. **Move to Trash no Drive**
   - Quando deletar arquivo remoto, usar API do Drive para mover para Trash
   - Não deletar permanentemente sem confirmação
   - Sincronizar status de deletado entre local e Drive

2. **Restauração Bidirecional**
   - Restaurar de lixeira local → restaurar no Drive
   - Restaurar de lixeira do Drive → restaurar localmente

---

## Sprint 9: Histórico de Operações (Auditoria)

### Prioridade: Baixa 🟢
### Complexidade: Média
### Estimativa: 2-3 dias

**Objetivo:** Manter log de todas operações de arquivos para auditoria.

### Funcionalidades:

1. **Tabela de Logs**
   - Nova tabela `file_operations_log`
   - Registrar: upload, rename, move, copy, delete, restore
   - Campos: user, operation, file_id, timestamp, detalhes

2. **Interface de Visualização**
   - Página dedicada de histórico
   - Filtros por: data, usuário, tipo de operação
   - Exportar relatório em CSV

---

## Melhorias de Performance

### Paginação de Arquivos
- Implementar lazy loading
- Carregar 50 arquivos por vez
- Infinite scroll ou paginação

### Cache de Thumbnails
- Gerar thumbnails sob demanda
- Armazenar em pasta `.cache`
- Limpar cache periodicamente

### Otimização de Queries
- Índices no banco de dados
- Query optimization para listagens grandes

---

## Melhorias de UX

### Busca Avançada
- Buscar por nome, categoria, data
- Buscar em conteúdo (OCR para imagens)
- Filtros combinados

### Tags e Labels
- Sistema de tags personalizadas
- Categorização múltipla
- Busca por tags

### Favoritos
- Marcar arquivos como favoritos
- Seção dedicada de favoritos
- Ordenação personalizada

---

**Roadmap sujeito a alterações baseado em feedback dos usuários.**User Input Required: Comando acima foi interrompido. Preciso continuar a partir daqui, completando a implementação da UI da Lixeira e finalizando o roadmap.


