# 🧪 Guia de Teste - Funcionalidades Avançadas do Google Drive

## 📋 CHECKLIST DE TESTES

### ✅ PRÉ-REQUISITOS

Antes de começar os testes, verifique:

- [ ] Backend rodando (`node server.js` na pasta `agenda-hibrida-v2`)
- [ ] Frontend rodando (`npm run dev` na pasta `agenda-hibrida-frontend`)
- [ ] Google Drive conectado e autenticado
- [ ] Tokens do Google Drive válidos (`tokens.json` existe)
- [ ] Console do navegador aberto (F12) para ver logs

---

## 1. 📤 TESTE: UPLOAD DE ARQUIVOS

### Método 1: Clique no Botão

1. Abra o Google Drive Explorer
2. Clique no botão verde "Upload"
3. Selecione 1 ou mais arquivos
4. Observe:
   - [ ] Card de progresso aparece
   - [ ] Barra de progresso aumenta de 0% a 100%
   - [ ] Status muda para "Concluído" com ícone ✅
   - [ ] Toast de sucesso aparece
   - [ ] Arquivo aparece na lista após 3 segundos
   - [ ] Estatísticas são atualizadas

### Método 2: Drag & Drop

1. Abra o File Explorer/Finder
2. Selecione um ou mais arquivos
3. Arraste sobre o Google Drive Explorer
4. Observe:
   - [ ] Overlay roxo aparece com "Solte os arquivos aqui!"
   - [ ] Ícone de nuvem anima (bounce)
   - [ ] Mensagem mostra pasta de destino
5. Solte os arquivos
6. Observe:
   - [ ] Mesmo comportamento do upload por clique
   - [ ] Card de progresso para cada arquivo
   - [ ] Uploads simultâneos funcionam

### Teste de Múltiplos Arquivos

1. Faça upload de 5+ arquivos simultaneamente
2. Observe:
   - [ ] Todos aparecem no card de progresso
   - [ ] Cada um tem sua própria barra de progresso
   - [ ] Progresso independente por arquivo
   - [ ] Contador no título do card

### ⚠️ Possíveis Erros

- Se falhar: verifique se `upload.single('file')` no backend está configurado
- Se não aparecer: verifique console para erros de CORS
- Se progresso não atualizar: verifique eventos XMLHttpRequest

**Status esperado:** ✅ Sucesso com toast verde

---

## 2. 📥 TESTE: DOWNLOAD DE ARQUIVOS

### Download Individual

1. Localize um arquivo na lista
2. Clique nos 3 pontos (⋮)
3. Clique em "Baixar"
4. Observe:
   - [ ] Toast "Preparando download" aparece
   - [ ] Navegador inicia download automaticamente
   - [ ] Arquivo mantém nome original
   - [ ] Toast "Baixado com sucesso" aparece

### Download em Lote

1. Clique no botão "Selecionar"
2. Marque 3-5 arquivos (não pastas)
3. Clique no botão azul "Baixar" na barra de ferramentas
4. Observe:
   - [ ] Toast "Baixando X arquivo(s)" aparece
   - [ ] Cada arquivo baixa sequencialmente
   - [ ] Toast de sucesso para cada arquivo

### Download de Versão Antiga

1. Abra um arquivo com histórico (⋮ → Histórico de Versões)
2. Clique em "Baixar" em uma versão antiga
3. Observe:
   - [ ] Versão específica é baixada
   - [ ] Nome do arquivo é preservado

**Status esperado:** ✅ Arquivos baixados na pasta de Downloads

---

## 3. 🔗 TESTE: COMPARTILHAMENTO

### Compartilhar por Email

1. Selecione um arquivo
2. Clique em ⋮ → "Compartilhar"
3. Digite um email válido
4. Selecione permissão:
   - [ ] 👁️ Visualizador
   - [ ] 💬 Comentarista
   - [ ] ✏️ Editor
5. Clique em "Compartilhar"
6. Observe:
   - [ ] Toast de sucesso aparece
   - [ ] Email recebe notificação do Google
   - [ ] Arquivo aparece no Drive do destinatário

### Copiar Link Público

1. Selecione um arquivo
2. Clique em ⋮ → "Copiar Link"
3. Observe:
   - [ ] Toast "Link copiado" aparece com ícone 🔗
   - [ ] Link está na área de transferência (Ctrl+V para testar)
4. Cole o link em uma aba anônima
5. Verifique:
   - [ ] Arquivo é acessível sem login
   - [ ] Link funciona

### Teste de Validação

1. Tente compartilhar sem inserir email
2. Observe:
   - [ ] Mensagem de erro "Por favor, insira um email"
   - [ ] Dialog não fecha

**Status esperado:** ✅ Compartilhamento bem-sucedido

---

## 4. 💬 TESTE: COMENTÁRIOS

### Visualizar Comentários

1. Selecione um arquivo do Google Docs/Sheets
2. Clique em ⋮ → "Comentários"
3. Observe:
   - [ ] Dialog abre
   - [ ] Lista de comentários existentes (se houver)
   - [ ] Avatar do autor
   - [ ] Data/hora do comentário
   - [ ] Estado vazio se não houver comentários

### Adicionar Comentário

1. Digite um comentário na área de texto
2. Clique em "Comentar"
3. Observe:
   - [ ] Toast de sucesso
   - [ ] Comentário aparece na lista
   - [ ] Avatar e timestamp corretos
   - [ ] Campo de texto limpa

### Teste com Arquivo Incompatível

1. Tente comentar em uma imagem JPG
2. Observe:
   - [ ] Lista vazia sem erro
   - [ ] Pode tentar adicionar (Google pode não permitir)

**Status esperado:** ✅ Comentários funcionam em arquivos compatíveis

**Nota:** Nem todos os tipos de arquivo suportam comentários no Google Drive (ex: apenas Google Docs, Sheets, Slides e alguns outros)

---

## 5. 📜 TESTE: HISTÓRICO DE VERSÕES

### Visualizar Versões

1. Selecione um arquivo que foi editado várias vezes
2. Clique em ⋮ → "Histórico de Versões"
3. Observe:
   - [ ] Dialog abre com lista de versões
   - [ ] Badge "Atual" na versão mais recente
   - [ ] Números de versão (v1, v2, v3...)
   - [ ] Data e hora de cada modificação
   - [ ] Nome do autor com avatar
   - [ ] Tamanho de cada versão

### Baixar Versão Antiga

1. Na lista de versões, clique em "Baixar" em uma versão antiga
2. Observe:
   - [ ] Download inicia
   - [ ] Arquivo baixado é a versão correta

### Restaurar Versão (se implementado)

1. Clique em "Restaurar" em uma versão antiga
2. Observe:
   - [ ] Confirmação solicitada
   - [ ] Versão restaurada
   - [ ] Arquivo atualizado

### Arquivo sem Histórico

1. Teste com arquivo recém-criado
2. Observe:
   - [ ] Mensagem "Nenhuma versão anterior"
   - [ ] Estado vazio amigável

**Status esperado:** ✅ Histórico exibido corretamente

---

## 6. ☑️ TESTE: SELEÇÃO MÚLTIPLA

### Ativar Modo de Seleção

1. Clique no botão "Selecionar" no topo
2. Observe:
   - [ ] Botão fica roxo/destacado
   - [ ] Checkboxes aparecem em todos os itens
   - [ ] Grid e List view mostram checkboxes

### Selecionar Itens

1. Clique em 3-5 checkboxes
2. Observe:
   - [ ] Checkboxes ficam marcados
   - [ ] Barra de ferramentas aparece no topo
   - [ ] Badge mostra "X item(ns) selecionado(s)"
   - [ ] Contador atualiza em tempo real

### Selecionar/Desmarcar Todos

1. Clique em "Selecionar Todos"
2. Observe:
   - [ ] Todos os itens são marcados
   - [ ] Contador mostra total de arquivos
3. Clique em "Desmarcar Todos"
4. Observe:
   - [ ] Todos os itens são desmarcados
   - [ ] Contador volta a 0

### Cancelar Seleção

1. Selecione alguns itens
2. Clique no X na barra de ferramentas
3. Observe:
   - [ ] Seleção é limpa
   - [ ] Barra de ferramentas desaparece
   - [ ] Checkboxes continuam visíveis (modo ativo)
4. Clique novamente em "Selecionar"
5. Observe:
   - [ ] Modo de seleção desativa
   - [ ] Checkboxes desaparecem

**Status esperado:** ✅ Seleção funciona perfeitamente

---

## 7. 🔄 TESTE: OPERAÇÕES EM LOTE

### Download em Lote

1. Ative modo de seleção
2. Selecione 3+ arquivos (não pastas)
3. Clique no botão azul "Baixar"
4. Observe:
   - [ ] Toast "Baixando X arquivo(s)"
   - [ ] Cada arquivo baixa sequencialmente
   - [ ] Downloads bem-sucedidos
   - [ ] Pastas são ignoradas

### Mover em Lote

1. Selecione 2+ itens
2. Clique no botão amarelo "Mover"
3. Selecione pasta de destino
4. Confirme
5. Observe:
   - [ ] Dialog de seleção de pasta abre
   - [ ] Itens são movidos
   - [ ] Toast de sucesso
   - [ ] Lista atualiza
   - [ ] Estatísticas atualizam

### Excluir em Lote

1. Selecione 2+ itens
2. Clique no botão vermelho "Excluir"
3. Confirme a exclusão
4. Observe:
   - [ ] Dialog de confirmação aparece
   - [ ] Mensagem mostra quantidade de itens
   - [ ] Toast "Excluindo X item(ns)"
   - [ ] Progresso de exclusão
   - [ ] Toast final com sucessos e erros
   - [ ] Lista atualiza
   - [ ] Estatísticas atualizam
   - [ ] Storage info atualiza

### Teste de Erros em Lote

1. Selecione itens mistos (alguns sem permissão)
2. Tente operação em lote
3. Observe:
   - [ ] Toast mostra sucessos E erros
   - [ ] Ex: "3 itens excluídos, 1 erro"

**Status esperado:** ✅ Operações em lote funcionam

---

## 🎨 TESTES DE UI/UX

### Responsividade

- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768x1024)
- [ ] Testar em mobile (375x667)
- [ ] Grid/List view funciona em todas as resoluções
- [ ] Dialogs são responsivos

### Animações

- [ ] Hover effects nos botões
- [ ] Transições suaves
- [ ] Loading spinners aparecem
- [ ] Bounce animation no drag & drop
- [ ] Checkboxes animam ao marcar/desmarcar

### Estados Visuais

- [ ] Loading states com spinners
- [ ] Empty states com mensagens amigáveis
- [ ] Error states com mensagens claras
- [ ] Success states com confirmações visuais

### Acessibilidade

- [ ] Cores têm bom contraste
- [ ] Ícones são descritivos
- [ ] Tooltips são claros
- [ ] Teclado navigation funciona (Tab, Enter, Esc)

---

## 🐛 TROUBLESHOOTING

### Upload não funciona

```bash
# Verifique se multer está instalado
cd agenda-hibrida-v2
npm list multer

# Se não estiver, instale
npm install multer
```

### Download não inicia

- Verifique se popup blocker está ativo
- Veja console do navegador para erros
- Teste em aba anônima

### Compartilhamento falha

- Verifique se email é válido do Gmail
- Confira se tem permissões no Google Drive API
- Veja logs do servidor

### Comentários não aparecem

- Apenas Google Docs, Sheets, Slides suportam comentários
- Arquivos de imagem/vídeo não têm comentários
- Isso é normal e esperado

### Versões não aparecem

- Arquivos recém-criados não têm histórico
- Apenas arquivos editados múltiplas vezes têm versões
- Isso é normal

---

## 📊 MÉTRICAS DE SUCESSO

Após todos os testes, você deve ter:

- ✅ 100% das funcionalidades testadas
- ✅ Upload funcionando (clique e drag & drop)
- ✅ Download funcionando (individual e lote)
- ✅ Compartilhamento funcionando
- ✅ Comentários funcionando (em arquivos compatíveis)
- ✅ Histórico de versões funcionando
- ✅ Seleção múltipla funcionando
- ✅ Operações em lote funcionando
- ✅ UI responsiva e intuitiva
- ✅ Feedback visual claro
- ✅ Sem erros críticos no console

---

## 📸 EVIDÊNCIAS DE TESTE

Tire screenshots de:

1. Upload em progresso
2. Drag & drop overlay
3. Barra de seleção múltipla
4. Dialog de compartilhamento
5. Dialog de comentários
6. Dialog de histórico de versões
7. Operações em lote em ação

---

## 🎯 PRÓXIMAS MELHORIAS SUGERIDAS

Depois dos testes, considere implementar:

- [ ] Preview de arquivos antes do upload
- [ ] Editar comentários
- [ ] Notificações de compartilhamento
- [ ] Comparação entre versões
- [ ] Restauração de versões
- [ ] Arrastar e soltar para mover arquivos
- [ ] Copiar/Colar arquivos
- [ ] Atalhos de teclado
- [ ] Pesquisa avançada com filtros
- [ ] Tags e categorias personalizadas

---

## ✅ CONCLUSÃO

Se todos os testes passarem, você terá um sistema completo de gerenciamento de arquivos no Google Drive com:

- 📤 Upload drag & drop
- 📥 Downloads inteligentes
- 🔗 Compartilhamento fácil
- 💬 Sistema de comentários
- 📜 Controle de versões
- ☑️ Seleção múltipla
- 🔄 Operações em lote

**Parabéns! 🎉**

Sistema pronto para produção!
