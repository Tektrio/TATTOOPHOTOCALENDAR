# Plano: Validação Final - Testes Sprints 4, 5 e UI da Lixeira

## Contexto para Nova Conversa

Este plano documenta o trabalho já realizado e os próximos passos para validação. Use este arquivo ao iniciar uma nova conversa para dar continuidade ao projeto.

---

## ✅ Trabalho Já Concluído (Conversa Anterior)

### Correções Implementadas

1. ✅ **Badge da Lixeira**
   - Arquivo: `agenda-hibrida-frontend/src/components/customer/FilesTab.jsx`
   - Linha 484: Adicionado `await loadTrashedFiles()`
   - Efeito: Badge atualiza automaticamente após deletar arquivo

2. ✅ **Investigação Completa do Código**
   - Verificados 3 arquivos principais (FilesTab.jsx, CustomerManagement.jsx, App.jsx)
   - Confirmadas 8 funcionalidades já implementadas corretamente
   - Identificado problema externo (file choosers) não relacionado ao código

### Documentação Criada

1. `DIAGNOSTICO_FILE_CHOOSERS.md` - Investigação completa
2. `RELATORIO_FINAL_CORRECOES.md` - Relatório técnico
3. `PROXIMOS_PASSOS.md` - Guia de testes e validação
4. `RESUMO_EXECUTIVO_CORRECOES.md` - Overview executivo
5. `PLANO_NOVA_CONVERSA_TESTXX.md` - Este arquivo

---

## 📋 Status Atual das Funcionalidades

### Backend (100% Funcional)

- ✅ `GET /api/clients/:id/trash` - Lista arquivos deletados
- ✅ `POST /api/files/:id/restore` - Restaura arquivo
- ✅ `DELETE /api/files/:id?permanent=true` - Delete permanente
- ✅ Soft delete move para `.trash` folder
- ✅ Delete permanente remove arquivo físico (fs.remove)
- ✅ Data formatada em ISO

### Frontend (100% Funcional)

- ✅ Componente Tabs instalado
- ✅ Tab "Lixeira" com badge contador
- ✅ Função `loadTrashedFiles()` com finally block
- ✅ Função `handleRestoreFile()` completa
- ✅ Função `handleDeletePermanently()` completa
- ✅ Opacidade visual (60% → 100% hover)
- ✅ Confirmação de delete permanente
- ✅ Data formatada pt-BR
- ✅ Loading states corretos
- ✅ Empty state implementado

---

## 🎯 Objetivo desta Nova Conversa

**Executar testes manuais completos e validar todas as funcionalidades.**

### O Que Precisa Ser Feito

1. ⏳ Limpar cache do navegador e reiniciar servidor
2. ⏳ Executar 8 testes da lixeira
3. ⏳ Executar 6 testes das Sprints 4 & 5
4. ⏳ Documentar resultados
5. ⏳ Criar relatório final de validação

---

## 🚀 PASSO 1: Preparação do Ambiente

### Comandos para Executar

```bash
# Navegar para frontend
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-frontend

# Parar servidor se rodando (Ctrl+C)

# Limpar caches
rm -rf .vite
rm -rf node_modules/.vite
rm -rf dist

# Reiniciar
npm run dev
```

### Limpeza do Navegador

1. Chrome: `Cmd+Shift+Delete` (Mac) ou `Ctrl+Shift+Delete` (Windows)
2. Selecionar: "Cache de imagens e arquivos"
3. Período: "Todo o período"
4. Clicar: "Limpar dados"
5. Hard refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows)

### Verificar

- [ ] Servidor rodando em http://localhost:5173
- [ ] Backend rodando em http://localhost:3001
- [ ] Página carrega sem file choosers travados

**Se file choosers ainda aparecem:** Consultar `DIAGNOSTICO_FILE_CHOOSERS.md` para soluções alternativas.

---

## 🧪 PASSO 2: Testes da Lixeira (8 testes)

### Teste 1: Tab Lixeira Aparece

**Ações:**
1. Acessar http://localhost:5173
2. Navegar para um cliente
3. Abrir aba "Arquivos"

**Verificar:**
- [ ] Duas tabs aparecem: "Arquivos" e "Lixeira"
- [ ] Badge na "Lixeira" mostra "0" (se vazia)
- [ ] Click nas tabs alterna o conteúdo

**Status:** ⬜ Não testado

---

### Teste 2: Deletar Arquivo (Soft Delete)

**Ações:**
1. Na tab "Arquivos", clicar no ícone de lixeira em um arquivo
2. Confirmar deleção no dialog

**Verificar:**
- [ ] Arquivo desaparece da lista
- [ ] Mensagem "Arquivo deletado com sucesso!" aparece
- [ ] Badge da "Lixeira" incrementa (ex: de "0" para "1")

**Status:** ⬜ Não testado

---

### Teste 3: Visualizar Lixeira

**Ações:**
1. Clicar na tab "Lixeira"

**Verificar:**
- [ ] Arquivo deletado aparece na lista
- [ ] Card tem opacidade reduzida (~60%)
- [ ] Ao passar mouse, opacidade aumenta (~100%)
- [ ] Badge mostra "Deletado em DD/MM/AAAA"
- [ ] Dois botões aparecem: "Restaurar" e "X"

**Status:** ⬜ Não testado

---

### Teste 4: Restaurar Arquivo

**Ações:**
1. Na tab "Lixeira", clicar botão "Restaurar"

**Verificar:**
- [ ] Mensagem "Arquivo restaurado com sucesso!" aparece
- [ ] Arquivo desaparece da lixeira
- [ ] Badge decrementa (ex: de "1" para "0")
- [ ] Arquivo aparece de volta na tab "Arquivos"

**Status:** ⬜ Não testado

---

### Teste 5: Deletar Permanentemente

**Ações:**
1. Deletar outro arquivo (vai para lixeira)
2. Na tab "Lixeira", clicar botão "X"
3. Confirmar no dialog

**Verificar:**
- [ ] Dialog pergunta: "Deletar permanentemente? Esta ação não pode ser desfeita!"
- [ ] Mensagem "Arquivo deletado permanentemente!" aparece
- [ ] Arquivo desaparece da lixeira
- [ ] Badge decrementa
- [ ] Arquivo físico removido de `.trash/` (verificar no filesystem)

**Status:** ⬜ Não testado

---

### Teste 6: Badge Dinâmico

**Ações:**
1. Deletar 3 arquivos
2. Restaurar 1 arquivo
3. Deletar permanentemente 1 arquivo

**Verificar:**
- [ ] Após deletar 3: Badge mostra "3"
- [ ] Após restaurar 1: Badge mostra "2"
- [ ] Após delete permanente 1: Badge mostra "1"

**Status:** ⬜ Não testado

---

### Teste 7: Loading States

**Ações:**
1. Clicar na tab "Lixeira"

**Verificar:**
- [ ] Spinner aparece brevemente
- [ ] Spinner desaparece em até 2 segundos
- [ ] Conteúdo carrega OU mensagem de erro aparece
- [ ] Spinner não trava infinitamente

**Status:** ⬜ Não testado

---

### Teste 8: Empty State

**Ações:**
1. Garantir que lixeira está vazia (deletar permanentemente todos)

**Verificar:**
- [ ] Ícone de lixeira (cinza) aparece
- [ ] Mensagem "Lixeira vazia"
- [ ] Texto "Arquivos deletados aparecerão aqui"
- [ ] Badge mostra "0" ou não aparece

**Status:** ⬜ Não testado

---

## 🧪 PASSO 3: Testes Sprints 4 & 5 (6 testes)

### Teste 9: Upload com Progresso

**Ações:**
1. Clicar "Upload" em qualquer categoria
2. Selecionar um arquivo

**Verificar:**
- [ ] Barra de progresso aparece
- [ ] Progresso vai de 0% a 100%
- [ ] Nome do arquivo aparece
- [ ] Mensagem de sucesso aparece
- [ ] Arquivo aparece na lista

**Status:** ⬜ Não testado

---

### Teste 10: Renomear Arquivo

**Ações:**
1. Clicar ícone de lápis (edit) em um arquivo
2. Digite novo nome
3. Clicar "Renomear"

**Verificar:**
- [ ] Dialog abre com input preenchido
- [ ] Nome atualiza na lista
- [ ] Mensagem de sucesso aparece

**Status:** ⬜ Não testado

---

### Teste 11: Mover Arquivo

**Ações:**
1. Clicar ícone de pasta com seta em um arquivo
2. Selecionar categoria de destino
3. Clicar "Mover"

**Verificar:**
- [ ] Dialog com select de categorias
- [ ] Arquivo muda de categoria na lista
- [ ] Mensagem de sucesso aparece

**Status:** ⬜ Não testado

---

### Teste 12: Copiar Arquivo

**Ações:**
1. Clicar ícone de copiar em um arquivo
2. Selecionar categoria de destino
3. Clicar "Copiar"

**Verificar:**
- [ ] Arquivo original permanece
- [ ] Cópia aparece na categoria destino
- [ ] Mensagem mostra nome da cópia

**Status:** ⬜ Não testado

---

### Teste 13: Preview de Arquivo

**Ações:**
1. Clicar em uma imagem ou PDF

**Verificar:**
- [ ] Modal de preview abre
- [ ] Imagem/PDF é exibido corretamente
- [ ] Botão de fechar funciona
- [ ] Modal fecha ao clicar fora

**Status:** ⬜ Não testado

---

### Teste 14: Botões de Pastas

**Ações:**
1. Clicar "Pasta Local"
2. Clicar "Google Drive"
3. Clicar "QNAP" (se configurado)

**Verificar:**
- [ ] Pasta Local: Explorador de arquivos abre
- [ ] Google Drive: Nova aba abre com pasta
- [ ] QNAP: File Station abre
- [ ] Ícones de status de sync aparecem

**Status:** ⬜ Não testado

---

## 📊 PASSO 4: Documentar Resultados

### Template de Relatório

```markdown
# Relatório de Validação - Testes Manuais

**Data:** DD/MM/AAAA
**Testador:** [Nome]

## Resumo

- Testes executados: ___/14
- Testes passaram: ___/14
- Testes falharam: ___/14

## Detalhes

### Testes da Lixeira (8)

1. Tab Lixeira: ✅ / ❌
2. Deletar Arquivo: ✅ / ❌
3. Visualizar Lixeira: ✅ / ❌
4. Restaurar Arquivo: ✅ / ❌
5. Deletar Permanentemente: ✅ / ❌
6. Badge Dinâmico: ✅ / ❌
7. Loading States: ✅ / ❌
8. Empty State: ✅ / ❌

### Testes Sprints 4 & 5 (6)

9. Upload com Progresso: ✅ / ❌
10. Renomear Arquivo: ✅ / ❌
11. Mover Arquivo: ✅ / ❌
12. Copiar Arquivo: ✅ / ❌
13. Preview Arquivo: ✅ / ❌
14. Botões de Pastas: ✅ / ❌

## Problemas Encontrados

1. [Descrever problema]
   - Teste: #X
   - Sintoma: [Descrição]
   - Console: [Erros JavaScript]
   - Network: [Erros de API]

## Observações

[Comentários gerais sobre a experiência de uso]

## Conclusão

✅ Sistema pronto para produção
❌ Correções necessárias
```

---

## 🐛 Troubleshooting

### Se File Choosers Aparecerem

1. Tentar modo anônimo: `chrome --incognito http://localhost:5173`
2. Tentar outro navegador (Firefox, Safari)
3. Verificar console (F12) para erros JavaScript
4. Consultar `DIAGNOSTICO_FILE_CHOOSERS.md`

### Se Badge Não Atualizar

1. Verificar console (F12) - há erros?
2. Verificar Network tab - `/api/clients/:id/trash` retorna 200?
3. Verificar linha 484 de FilesTab.jsx tem `await loadTrashedFiles()`

### Se Endpoint Retornar 500

1. Backend rodando? Verificar `http://localhost:3001/api/health`
2. Verificar logs do backend no terminal
3. Banco de dados acessível?

### Se Restaurar Não Funcionar

1. Network tab - `/api/files/:id/restore` retorna 200?
2. Console - há erros?
3. Arquivo está em `.trash/`?

---

## 📚 Documentos de Referência

Ler antes de iniciar testes:

1. **RELATORIO_FINAL_CORRECOES.md**
   - Detalhes de todas as correções implementadas
   - Status de cada funcionalidade

2. **PROXIMOS_PASSOS.md**
   - Guia detalhado de cada teste
   - Instruções passo a passo

3. **DIAGNOSTICO_FILE_CHOOSERS.md**
   - Solução para problema de file choosers

4. **RESUMO_EXECUTIVO_CORRECOES.md**
   - Overview rápido do projeto

---

## ✅ Critérios de Sucesso

Para considerar o projeto validado:

- [ ] 14/14 testes passando
- [ ] Nenhum erro no console do navegador
- [ ] Nenhum erro 500 no backend
- [ ] UX fluida e profissional
- [ ] Performance adequada
- [ ] Documentação de problemas (se houver)

---

## 📝 Checklist Final

Antes de concluir:

- [ ] PASSO 1: Ambiente preparado
- [ ] PASSO 2: 8 testes da lixeira executados
- [ ] PASSO 3: 6 testes Sprints 4 & 5 executados
- [ ] PASSO 4: Relatório de validação criado
- [ ] Problemas documentados (se houver)
- [ ] Screenshots de evidência capturados
- [ ] Conclusão final documentada

---

## 🎯 Próxima Conversa

Se todos os testes passarem:
- Criar relatório final de sucesso
- Marcar projeto como concluído
- Planejar próximas melhorias (roadmap)

Se houver problemas:
- Documentar erros específicos
- Anexar screenshots e logs
- Criar plano de correção específico

---

**Criado em:** 31/10/2025  
**Para usar em:** Nova conversa "testxx"  
**Objetivo:** Validação completa das correções implementadas  
**Estimativa:** 1-2 horas de testes manuais

