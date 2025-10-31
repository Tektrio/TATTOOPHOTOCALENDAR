# Guia de Testes Manuais - Sprints 4 & 5

**Data:** 31 de Outubro de 2025  
**Versão:** 2.0.0  
**Objetivo:** Validar todas as funcionalidades implementadas nos Sprints 4 e 5

---

## Pré-requisitos

### 1. Ambiente
- ✅ Servidor backend rodando (`node server.js` em `agenda-hibrida-v2/`)
- ✅ Frontend rodando (`npm run dev` em `agenda-hibrida-frontend/`)
- ✅ Navegador Chrome/Firefox atualizado
- ✅ Banco de dados SQLite com dados de teste

### 2. Cliente de Teste
- **ID:** 7 (Luiz Lopes) ou qualquer cliente com arquivos
- **Requisitos:**
  - Pelo menos 3 arquivos em categorias diferentes
  - Pelo menos 1 imagem (JPG/PNG)
  - Pelo menos 1 PDF (opcional)
  - Pasta local configurada
  - Google Drive configurado (opcional)

### 3. Acesso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Testes Sprint 4

### Teste 4.1: Sincronização Google Drive em Background

**Objetivo:** Verificar que operações do Google Drive não bloqueiam a UI

**Passos:**
1. Navegar para página do cliente (ex: `/customers/7`)
2. Clicar na aba "Arquivos"
3. Observar o botão "Google Drive"
4. Verificar ícone de status ao lado do botão:
   - ✅ Verde (CheckCircle) = Sincronizado
   - ⏱️ Amarelo (Clock) = Sincronizando
   - ❌ Vermelho (XCircle) = Erro

**Se não há pasta no Drive:**
5. Clicar em "Criar Pasta"
6. Observar loading state no botão
7. Aguardar 5-10 segundos
8. Verificar se ícone muda de amarelo para verde
9. Confirmar que mensagem de sucesso aparece

**Resultado Esperado:**
- ✅ UI permanece responsiva durante sync
- ✅ Ícone atualiza automaticamente (polling a cada 3s)
- ✅ Mensagem de sucesso após conclusão
- ✅ Botão Google Drive habilitado após sync

**Como Identificar Erros:**
- ❌ UI trava durante criação de pasta
- ❌ Ícone não muda de status
- ❌ Erro no console do navegador
- ❌ Mensagem de erro aparece

---

### Teste 4.2: Suporte Completo ao QNAP

**Objetivo:** Verificar que o botão QNAP abre corretamente

**Pré-requisito:** Configurar variáveis no `.env`:
```env
QNAP_ENABLED=true
QNAP_HOST=192.168.1.100
QNAP_SHARE_PATH=/share/Tatuagens
```

**Passos:**
1. Reiniciar o servidor backend
2. Navegar para página do cliente
3. Clicar na aba "Arquivos"
4. Observar o botão "QNAP"
5. Passar mouse sobre o botão (verificar tooltip)
6. Clicar no botão "QNAP"
7. Verificar se nova aba abre com URL do QNAP
8. Verificar mensagem com caminho da pasta

**Resultado Esperado:**
- ✅ Botão habilitado (não cinza)
- ✅ Tooltip mostra informação relevante
- ✅ Nova aba abre com `http://[QNAP_HOST]`
- ✅ Mensagem mostra caminho: `/share/Tatuagens/[nome_cliente]`

**Como Identificar Erros:**
- ❌ Botão desabilitado mesmo com variáveis configuradas
- ❌ Erro 400/500 ao clicar
- ❌ Nova aba não abre
- ❌ Mensagem de erro no frontend

---

### Teste 4.3: Barra de Progresso para Uploads

**Objetivo:** Verificar feedback visual durante upload

**Passos:**
1. Navegar para página do cliente
2. Clicar na aba "Arquivos"
3. Selecionar uma categoria no dropdown de upload
4. Escolher um arquivo grande (> 1MB) para upload
5. Clicar em "Upload" ou arrastar arquivo
6. **Observar imediatamente:**
   - Barra de progresso aparece
   - Porcentagem aumenta (0% → 100%)
   - Nome do arquivo sendo enviado
7. Aguardar conclusão
8. Verificar mensagem de sucesso
9. Confirmar que arquivo aparece na lista

**Resultado Esperado:**
- ✅ Barra de progresso visível durante upload
- ✅ Porcentagem atualiza em tempo real
- ✅ Nome do arquivo exibido
- ✅ Barra desaparece após conclusão
- ✅ Arquivo aparece na categoria correta

**Como Identificar Erros:**
- ❌ Barra não aparece
- ❌ Porcentagem não atualiza
- ❌ Upload falha sem feedback
- ❌ Arquivo não aparece após conclusão

---

### Teste 4.4: Preview de Arquivos Inline

**Objetivo:** Verificar visualização de imagens e PDFs

**Passos - Imagem:**
1. Localizar um arquivo de imagem (JPG/PNG)
2. Passar mouse sobre o arquivo
3. Clicar no ícone de "Olho" (Eye)
4. Verificar se modal abre com a imagem
5. Testar botões:
   - Zoom In (+)
   - Zoom Out (-)
   - Próximo (→)
   - Anterior (←)
   - Baixar (Download)
6. Testar atalhos de teclado:
   - Seta direita (próximo)
   - Seta esquerda (anterior)
   - ESC (fechar)
7. Clicar em X para fechar

**Passos - PDF:**
1. Localizar um arquivo PDF
2. Passar mouse sobre o arquivo
3. Clicar no ícone de "Olho" (Eye)
4. Verificar se PDF carrega no iframe
5. Testar navegação de páginas (se múltiplas)
6. Clicar em "Baixar" para download
7. Fechar modal

**Resultado Esperado:**
- ✅ Modal abre rapidamente
- ✅ Imagem/PDF carrega corretamente
- ✅ Zoom funciona (imagens)
- ✅ Navegação entre arquivos funciona
- ✅ Atalhos de teclado respondem
- ✅ Download funciona

**Como Identificar Erros:**
- ❌ Modal não abre
- ❌ Imagem/PDF não carrega
- ❌ Erro "Failed to load"
- ❌ Botões não respondem
- ❌ Atalhos não funcionam

---

## Testes Sprint 5

### Teste 5.1: Renomear Arquivos

**Objetivo:** Verificar que arquivos podem ser renomeados com validação

**Passos:**
1. Localizar qualquer arquivo
2. Passar mouse sobre o arquivo
3. Clicar no ícone de "Lápis" (Edit)
4. Verificar se dialog abre com nome atual pré-preenchido
5. **Teste 1 - Sucesso:**
   - Digitar novo nome válido (ex: "novo-nome.jpg")
   - Pressionar Enter ou clicar "Renomear"
   - Verificar mensagem de sucesso
   - Confirmar que arquivo aparece com novo nome
6. **Teste 2 - Validação (nome vazio):**
   - Abrir dialog novamente
   - Apagar todo o texto
   - Tentar renomear
   - Verificar mensagem de erro
7. **Teste 3 - Caracteres inválidos:**
   - Tentar nome com `< > : " / \ | ? *`
   - Verificar erro do backend

**Resultado Esperado:**
- ✅ Dialog abre com nome pré-preenchido
- ✅ Enter confirma renomeação
- ✅ Arquivo renomeado com sucesso
- ✅ Lista atualiza automaticamente
- ✅ Validações funcionam corretamente
- ✅ Extensão preservada

**Como Identificar Erros:**
- ❌ Dialog não abre
- ❌ Nome não pré-preenchido
- ❌ Renomeação falha
- ❌ Lista não atualiza
- ❌ Aceita caracteres inválidos
- ❌ Extensão perdida

---

### Teste 5.2: Mover Arquivos Entre Categorias

**Objetivo:** Verificar movimentação de arquivos

**Passos:**
1. Localizar arquivo em categoria "Referências"
2. Passar mouse sobre o arquivo
3. Clicar no ícone de "Pasta" (FolderInput)
4. Verificar se dialog abre
5. Observar dropdown de categorias
6. **Confirmar:** Categoria atual NÃO aparece no dropdown
7. Selecionar categoria diferente (ex: "Inspirações")
8. Clicar em "Mover"
9. Verificar mensagem: "Arquivo movido para [categoria]"
10. Mudar filtro para nova categoria
11. Confirmar que arquivo aparece lá
12. Voltar para categoria original
13. Confirmar que arquivo não está mais lá

**Resultado Esperado:**
- ✅ Dialog abre corretamente
- ✅ Categoria atual excluída do dropdown
- ✅ Arquivo movido com sucesso
- ✅ Arquivo físico movido (backend)
- ✅ Banco de dados atualizado
- ✅ Lista atualiza em ambas categorias

**Como Identificar Erros:**
- ❌ Dialog não abre
- ❌ Categoria atual aparece no dropdown
- ❌ Movimentação falha
- ❌ Arquivo duplicado em ambas categorias
- ❌ Arquivo desaparece completamente

---

### Teste 5.3: Copiar Arquivos

**Objetivo:** Verificar duplicação de arquivos

**Passos:**
1. Localizar qualquer arquivo
2. Passar mouse sobre o arquivo
3. Clicar no ícone de "Cópia" (Copy)
4. Verificar se dialog abre
5. **Teste 1 - Mesma categoria:**
   - Deixar "Mesma categoria" selecionado
   - Clicar em "Copiar"
   - Verificar mensagem com nome do arquivo copiado
   - Confirmar que arquivo `[nome]_copy.[ext]` aparece
6. **Teste 2 - Categoria diferente:**
   - Copiar outro arquivo
   - Selecionar categoria diferente no dropdown
   - Clicar em "Copiar"
   - Mudar filtro para categoria de destino
   - Confirmar que cópia aparece lá
7. **Teste 3 - Múltiplas cópias:**
   - Copiar o mesmo arquivo 3 vezes
   - Verificar nomes: `_copy`, `_copy1`, `_copy2`

**Resultado Esperado:**
- ✅ Dialog abre corretamente
- ✅ Opção "Mesma categoria" disponível
- ✅ Arquivo copiado com sucesso
- ✅ Sufixo `_copy` adicionado
- ✅ Múltiplas cópias numeradas automaticamente
- ✅ Arquivo original não é alterado

**Como Identificar Erros:**
- ❌ Dialog não abre
- ❌ Cópia falha
- ❌ Arquivo sobrescrito em vez de copiado
- ❌ Sufixo não adicionado
- ❌ Múltiplas cópias têm mesmo nome

---

### Teste 5.4: Deletar com Confirmação (Soft Delete)

**Objetivo:** Verificar deleção suave de arquivos

**Passos:**
1. Contar quantos arquivos existem atualmente
2. Localizar arquivo para deletar
3. Passar mouse sobre o arquivo
4. Clicar no ícone de "Lixeira" (Trash2)
5. Verificar dialog de confirmação:
   - Título: "Deletar arquivo?"
   - Mensagem com nome do arquivo
   - Botões: "Cancelar" e "Deletar"
6. **Teste 1 - Cancelar:**
   - Clicar em "Cancelar"
   - Confirmar que arquivo permanece
7. **Teste 2 - Deletar:**
   - Abrir dialog novamente
   - Clicar em "Deletar"
   - Verificar mensagem de sucesso
   - Confirmar que arquivo desaparece da lista
8. Recarregar a página
9. Confirmar que arquivo não reaparece

**Verificação Backend (Opcional):**
1. Abrir diretório do cliente
2. Verificar pasta `.trash`
3. Confirmar que arquivo está lá

**Resultado Esperado:**
- ✅ Dialog de confirmação aparece
- ✅ Cancelar mantém arquivo
- ✅ Deletar remove arquivo da lista
- ✅ Arquivo movido para `.trash` (não deletado permanentemente)
- ✅ Campo `deleted_at` preenchido no banco
- ✅ Arquivo não reaparece após reload

**Como Identificar Erros:**
- ❌ Dialog não aparece
- ❌ Arquivo deletado sem confirmação
- ❌ Arquivo permanentemente deletado (não em `.trash`)
- ❌ Arquivo reaparece após reload
- ❌ Erro ao deletar

---

## Testes de Integração

### Teste I1: Fluxo Completo de Gestão de Arquivo

**Objetivo:** Testar todas operações em sequência

**Passos:**
1. **Upload:** Fazer upload de "teste.jpg" na categoria "Referências"
2. **Preview:** Visualizar o arquivo
3. **Renomear:** Renomear para "arquivo-teste.jpg"
4. **Copiar:** Copiar para categoria "Inspirações"
5. **Mover:** Mover original para "Fotos Finais"
6. **Deletar:** Deletar a cópia em "Inspirações"
7. **Verificar:** Confirmar que apenas 1 arquivo existe em "Fotos Finais"

**Resultado Esperado:**
- ✅ Todas operações executam com sucesso
- ✅ Estado final correto
- ✅ Nenhum erro ou inconsistência

---

### Teste I2: Operações Simultâneas

**Objetivo:** Verificar que operações paralelas não causam problemas

**Passos:**
1. Abrir duas abas com o mesmo cliente
2. Na aba 1: Iniciar upload de arquivo grande
3. Na aba 2: Renomear outro arquivo
4. Verificar que ambas operações completam
5. Recarregar ambas abas
6. Confirmar consistência dos dados

**Resultado Esperado:**
- ✅ Operações não interferem entre si
- ✅ Ambas completam com sucesso
- ✅ Dados consistentes em ambas abas após reload

---

## Testes de Botões de Acesso às Pastas

### Teste P1: Botão Pasta Local

**Passos:**
1. Clicar em "Pasta Local"
2. Verificar que pasta abre no Finder/Explorer
3. Confirmar caminho correto

**Resultado Esperado:**
- ✅ Pasta abre no sistema operacional
- ✅ Caminho: `[BASE]/Clientes/[nome_cliente]/[telefone]`

---

### Teste P2: Botão Google Drive

**Passos:**
1. Clicar em "Google Drive"
2. Verificar que nova aba abre
3. Confirmar que é a pasta correta no Drive

**Resultado Esperado:**
- ✅ Nova aba com Google Drive
- ✅ Pasta correta aberta

---

## Checklist Rápido

Use esta checklist para testes rápidos:

- [ ] Upload com progresso funciona
- [ ] Renomear arquivo funciona
- [ ] Mover arquivo entre categorias funciona
- [ ] Copiar arquivo funciona
- [ ] Deletar arquivo (soft delete) funciona
- [ ] Preview de imagem funciona
- [ ] Preview de PDF funciona (se disponível)
- [ ] Botão Pasta Local funciona
- [ ] Botão Google Drive funciona
- [ ] Botão QNAP funciona (se configurado)
- [ ] Sincronização Drive mostra status correto
- [ ] Filtro por categoria funciona
- [ ] Busca de arquivos funciona
- [ ] Todas validações funcionam

---

## Troubleshooting

### Problema: Upload não funciona
**Solução:**
- Verificar se servidor backend está rodando
- Verificar console do navegador
- Confirmar que cliente tem pasta configurada

### Problema: Preview não abre
**Solução:**
- Verificar tipo de arquivo (apenas imagens e PDFs)
- Verificar console do navegador
- Testar endpoint: `GET /api/files/:id/preview`

### Problema: Botões de pasta não respondem
**Solução:**
- Verificar se cliente tem `folder_path` configurado
- Para QNAP: verificar variáveis no `.env`
- Verificar console do navegador e logs do backend

### Problema: Operações falham silenciosamente
**Solução:**
- Abrir console do navegador (F12)
- Verificar aba "Network" para erros de API
- Verificar logs do servidor backend

---

## Relatório de Teste

Após completar os testes, preencha:

**Data do Teste:** ___________  
**Testador:** ___________  
**Ambiente:** Desenvolvimento / Produção  

**Resultados:**
- ✅ Testes Passados: ___ / ___
- ❌ Testes Falhados: ___ / ___
- ⚠️ Bugs Encontrados: ___ 

**Bugs Identificados:**
1. ___________
2. ___________
3. ___________

**Observações:**
___________
___________
___________

---

**Fim do Guia de Testes Manuais**

