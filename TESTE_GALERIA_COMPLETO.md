# Guia de Testes: Galeria de Imagens Completa

## Objetivo
Testar completamente a funcionalidade de **Galeria de Imagens**, incluindo upload, filtros, lightbox, sincronização com Google Drive e exclusão de fotos.

---

## Pré-requisitos

1. **Servidor backend rodando** (`node server.js` na porta 3000)
2. **Frontend rodando** (`npm start` na porta 3001)
3. **Banco de dados SQLite** configurado e acessível
4. **Google Drive conectado e autenticado**
5. **Pelo menos 2-3 clientes cadastrados** no sistema
6. **Imagens de teste preparadas**:
   - 5-10 imagens de tatuagens (JPEG/PNG)
   - Tamanhos variados (500KB - 5MB)
   - Categorias: Antes, Durante, Depois, Referência

---

## Casos de Teste

### 1. Upload de Nova Imagem - Individual

#### Objetivo
Verificar se o sistema permite fazer upload de uma única imagem com metadados completos.

#### Passos
1. Faça login no sistema
2. Navegue até a aba **"Galeria"**
3. Clique no botão **"Novo Upload"** ou **"+ Adicionar Foto"**
4. Selecione uma imagem de teste (ex: `tattoo_braço_antes.jpg`)
5. Preencha os metadados:
   - **Cliente vinculado**: Selecione um cliente da lista
   - **Categoria**: Selecione "Antes"
   - **Descrição**: "Braço antes da tatuagem realista"
   - **Tags**: "braço, antes, realismo"
6. Clique em **"Salvar"** ou **"Fazer Upload"**
7. Aguarde o upload completar

#### Resultados Esperados
- ✅ Modal/formulário de upload abre corretamente
- ✅ Seleção de arquivo funciona (botão "Escolher arquivo")
- ✅ Preview da imagem é exibido após seleção
- ✅ Dropdown de clientes está populado
- ✅ Dropdown de categorias tem opções: Antes, Durante, Depois, Referência
- ✅ Campos de descrição e tags são editáveis
- ✅ Progress bar é exibida durante upload (0-100%)
- ✅ Toast de sucesso aparece: "Foto enviada com sucesso!"
- ✅ Imagem aparece na galeria imediatamente (tempo real)
- ✅ Contador de "Arquivos Totais" no Dashboard aumenta

#### Critérios de Falha
- ❌ Modal não abre ou trava
- ❌ Upload falha sem mensagem clara
- ❌ Imagem não aparece na galeria após upload
- ❌ Progress bar não funciona
- ❌ Erro 500 ou timeout

---

### 2. Upload Múltiplo de Imagens

#### Objetivo
Verificar se o sistema suporta upload de múltiplas imagens simultaneamente.

#### Passos
1. Na aba **"Galeria"**, clique em **"Novo Upload"**
2. Selecione **múltiplas imagens** (5-10 arquivos):
   - Segure `Ctrl` (Windows/Linux) ou `Cmd` (Mac) e clique em vários arquivos
   - Ou arraste múltiplos arquivos para a área de drop
3. Para cada imagem, preencha os metadados (se individual) ou:
   - Configure metadados em lote:
     - Cliente: João da Silva
     - Categoria: Referência
     - Tags: "portfolio, 2025"
4. Clique em **"Fazer Upload de Todos"**
5. Observe o progresso

#### Resultados Esperados
- ✅ Sistema aceita múltiplas imagens
- ✅ Preview de todas as imagens selecionadas é exibido
- ✅ Progress bar individual para cada arquivo OU progress geral
- ✅ Uploads podem ocorrer em paralelo (3-5 simultâneos)
- ✅ Lista de uploads mostra status:
  - ⏳ "Aguardando..." (em fila)
  - 📤 "Enviando... 45%" (em progresso)
  - ✅ "Concluído" (sucesso)
  - ❌ "Falhou" (erro, com opção de retry)
- ✅ Todas as imagens aparecem na galeria após conclusão
- ✅ Tempo total é razoável (< 30s para 10 imagens de 2MB cada)

#### Critérios de Falha
- ❌ Sistema aceita apenas 1 imagem por vez
- ❌ Upload trava o navegador
- ❌ Algumas imagens não são enviadas sem aviso
- ❌ Demora excessiva (> 1 min para 10 imagens)

---

### 3. Validação de Tipos de Arquivo

#### Objetivo
Verificar se o sistema valida e aceita apenas formatos permitidos.

#### Passos
1. Tente fazer upload de arquivos **válidos**:
   - ✅ `foto.jpg` (JPEG)
   - ✅ `tattoo.png` (PNG)
   - ✅ `design.pdf` (PDF - se permitido)
   - ✅ `referencia.webp` (WebP - se permitido)

2. Tente fazer upload de arquivos **inválidos**:
   - ❌ `video.mp4` (Vídeo)
   - ❌ `documento.docx` (Word)
   - ❌ `planilha.xlsx` (Excel)
   - ❌ `script.js` (JavaScript)
   - ❌ `arquivo.txt` (Texto)

#### Resultados Esperados
- ✅ Arquivos válidos são aceitos e fazem upload normalmente
- ✅ Arquivos inválidos são **rejeitados imediatamente**
- ✅ Mensagem de erro clara é exibida:
  - "Formato não suportado. Use: JPG, PNG, PDF"
- ✅ Indicador visual de arquivo rejeitado (vermelho, ícone de erro)
- ✅ Lista de formatos permitidos é visível no modal

#### Critérios de Falha
- ❌ Sistema aceita formatos não permitidos
- ❌ Upload falha sem mensagem clara
- ❌ Nenhuma validação é feita

---

### 4. Validação de Tamanho de Arquivo

#### Objetivo
Verificar se o sistema valida o tamanho máximo de arquivos.

#### Passos
1. Tente fazer upload de arquivo **dentro do limite**:
   - Imagem de 2MB (deve funcionar)
   - Imagem de 10MB (deve funcionar se limite for 20MB)

2. Tente fazer upload de arquivo **acima do limite**:
   - Imagem de 25MB (deve ser rejeitada se limite for 20MB)
   - Imagem de 50MB (deve ser rejeitada)

#### Resultados Esperados
- ✅ Arquivos dentro do limite são aceitos
- ✅ Arquivos acima do limite são **rejeitados**
- ✅ Mensagem de erro clara:
  - "Arquivo muito grande. Tamanho máximo: 20MB"
  - "Seu arquivo tem 25MB"
- ✅ Opção de **compressão automática** (opcional):
  - "Deseja comprimir a imagem automaticamente?"

#### Critérios de Falha
- ❌ Upload de arquivo enorme trava o sistema
- ❌ Nenhuma validação de tamanho
- ❌ Erro genérico sem detalhes

---

### 5. Filtros da Galeria - Busca por Texto

#### Objetivo
Verificar se o filtro de busca por texto funciona corretamente.

#### Passos
1. Na aba **"Galeria"**, localize o campo de **busca/pesquisa**
2. Digite **"braço"** na busca
3. Observe os resultados
4. Limpe a busca e digite **"realismo"**
5. Teste busca parcial: **"tat"** (deve encontrar "tatuagem", "tattoo")
6. Teste busca case-insensitive: **"BRAÇO"** vs **"braço"**
7. Teste busca sem resultados: **"xyz123"**

#### Resultados Esperados
- ✅ Campo de busca está visível e funcional
- ✅ Busca filtra em tempo real (conforme digita)
- ✅ Busca case-insensitive (maiúsculas/minúsculas não importam)
- ✅ Busca em múltiplos campos:
  - Nome do arquivo
  - Descrição
  - Tags
  - Nome do cliente (se vinculado)
- ✅ Busca parcial funciona ("tat" encontra "tatuagem")
- ✅ Contador mostra: "Exibindo 3 de 15 fotos"
- ✅ Busca sem resultados mostra:
  - "Nenhuma foto encontrada para 'xyz123'"
  - Botão "Limpar busca"

#### Critérios de Falha
- ❌ Busca não funciona ou não filtra
- ❌ Busca é case-sensitive (muito restritiva)
- ❌ Busca lenta (> 1s para 100 fotos)
- ❌ Nenhum feedback visual quando sem resultados

---

### 6. Filtros da Galeria - Por Cliente

#### Objetivo
Verificar se o filtro por cliente funciona corretamente.

#### Passos
1. Na aba **"Galeria"**, localize o filtro **"Cliente"** (dropdown)
2. Selecione um cliente específico: **"João da Silva"**
3. Observe os resultados
4. Mude para outro cliente: **"Maria Santos"**
5. Selecione **"Todos os clientes"** (limpar filtro)

#### Resultados Esperados
- ✅ Dropdown de clientes está visível
- ✅ Todos os clientes cadastrados aparecem na lista
- ✅ Opção "Todos os clientes" está no topo
- ✅ Ao selecionar cliente, galeria filtra instantaneamente
- ✅ Apenas fotos vinculadas ao cliente selecionado são exibidas
- ✅ Contador atualiza: "Exibindo 5 fotos de João da Silva"
- ✅ Filtro é mantido ao trocar de aba e voltar (estado persistente)

#### Critérios de Falha
- ❌ Dropdown não aparece ou está vazio
- ❌ Filtro não funciona
- ❌ Fotos de outros clientes aparecem
- ❌ Filtro é resetado ao trocar de aba

---

### 7. Filtros da Galeria - Por Categoria

#### Objetivo
Verificar se o filtro por categoria funciona corretamente.

#### Passos
1. Na aba **"Galeria"**, localize o filtro **"Categoria"** (dropdown ou botões)
2. Selecione **"Antes"**
3. Observe os resultados
4. Mude para **"Depois"**
5. Mude para **"Referência"**
6. Selecione **"Todas as categorias"** (limpar filtro)

#### Resultados Esperados
- ✅ Filtro de categorias está visível
- ✅ Opções disponíveis:
  - Todas
  - Antes
  - Durante
  - Depois
  - Referência
- ✅ Filtro funciona instantaneamente
- ✅ Apenas fotos da categoria selecionada são exibidas
- ✅ Contador atualiza: "Exibindo 8 fotos da categoria 'Antes'"
- ✅ Indicador visual da categoria ativa (destaque, cor)

#### Critérios de Falha
- ❌ Filtro não aparece
- ❌ Filtro não funciona ou mostra fotos erradas
- ❌ Sem indicador visual da categoria ativa

---

### 8. Filtros Combinados

#### Objetivo
Verificar se múltiplos filtros podem ser aplicados simultaneamente.

#### Passos
1. Aplique **busca por texto**: "tattoo"
2. Aplique **filtro por cliente**: "João da Silva"
3. Aplique **filtro por categoria**: "Depois"
4. Observe os resultados

#### Resultados Esperados
- ✅ Todos os filtros funcionam em conjunto (AND lógico)
- ✅ Galeria mostra apenas fotos que atendem **todos** os critérios:
  - Contém "tattoo" no nome/descrição/tags
  - Vinculadas ao cliente "João da Silva"
  - Da categoria "Depois"
- ✅ Contador reflete filtros combinados:
  - "Exibindo 2 fotos de João da Silva (Depois) com 'tattoo'"
- ✅ Botão "Limpar todos os filtros" aparece
- ✅ Indicadores visuais de filtros ativos

#### Critérios de Falha
- ❌ Filtros não funcionam juntos (conflito)
- ❌ Resultados incorretos
- ❌ Sem botão para limpar filtros

---

### 9. Lightbox - Visualização de Imagem

#### Objetivo
Verificar se o lightbox (visualização em tela cheia) funciona corretamente.

#### Passos
1. Na galeria, clique em uma **imagem**
2. Observe o lightbox abrir
3. Verifique as funcionalidades:
   - **Navegação**: Setas ← → para próxima/anterior
   - **Zoom**: Botões + / - ou scroll do mouse
   - **Fechar**: Botão X, tecla ESC, clicar fora
   - **Informações**: Descrição, cliente, data, tags
4. Teste navegação entre imagens com setas
5. Teste fechar o lightbox

#### Resultados Esperados
- ✅ Lightbox abre em tela cheia com fundo escuro (overlay)
- ✅ Imagem é exibida em alta qualidade
- ✅ Navegação com setas funciona:
  - Seta direita → vai para próxima imagem
  - Seta esquerda ← volta para imagem anterior
- ✅ Navegação com teclado funciona:
  - `→` próxima
  - `←` anterior
  - `ESC` fechar
- ✅ Zoom funciona:
  - Botões + / -
  - Scroll do mouse
  - Pinch (mobile/trackpad)
- ✅ Metadados são exibidos:
  - Nome do cliente
  - Categoria
  - Data do upload
  - Descrição
  - Tags
- ✅ Botões de ação disponíveis:
  - **Download** (baixar imagem)
  - **Editar** (editar metadados)
  - **Excluir** (deletar foto)
  - **Compartilhar** (gerar link - opcional)
- ✅ Fechar funciona por múltiplas formas:
  - Botão X no canto
  - Tecla ESC
  - Clicar no overlay (fora da imagem)
- ✅ Contador de posição: "3 / 15"

#### Critérios de Falha
- ❌ Lightbox não abre ou trava
- ❌ Imagem não carrega (quebrada)
- ❌ Navegação não funciona
- ❌ Zoom não funciona
- ❌ Não dá para fechar o lightbox

---

### 10. Lightbox - Navegação em Sequência

#### Objetivo
Verificar se a navegação entre imagens no lightbox funciona suavemente.

#### Passos
1. Abra o lightbox na **primeira imagem** da galeria
2. Clique na **seta direita** repetidamente
3. Navegue até a **última imagem**
4. Continue clicando na seta direita (testar loop)
5. Volte com seta esquerda até a primeira
6. Use atalhos de teclado: `→` e `←`

#### Resultados Esperados
- ✅ Transição suave entre imagens (fade ou slide)
- ✅ Não há delay perceptível (< 300ms)
- ✅ Ao chegar na última imagem:
  - Seta direita fica desabilitada OU
  - Faz loop para primeira imagem (configurável)
- ✅ Ao chegar na primeira imagem:
  - Seta esquerda fica desabilitada OU
  - Faz loop para última imagem
- ✅ Metadados atualizam junto com a imagem
- ✅ Contador atualiza: "1/15" → "2/15" → "3/15"

#### Critérios de Falha
- ❌ Transição lenta ou com travamento
- ❌ Imagens não carregam
- ❌ Navegação para ou pula imagens
- ❌ Metadados não atualizam

---

### 11. Edição de Metadados de Foto Existente

#### Objetivo
Verificar se é possível editar os metadados de uma foto já carregada.

#### Passos
1. Na galeria, clique no botão **"Editar"** (ícone de lápis) em uma foto OU
2. Abra a foto no lightbox e clique em **"Editar"**
3. Altere os metadados:
   - Cliente: Mude para outro cliente
   - Categoria: Mude de "Antes" para "Depois"
   - Descrição: Adicione mais texto
   - Tags: Adicione novas tags: "portfolio, destaque"
4. Clique em **"Salvar"**
5. Observe as mudanças

#### Resultados Esperados
- ✅ Modal de edição abre com dados atuais preenchidos
- ✅ Todos os campos são editáveis
- ✅ Dropdown de cliente permite mudança
- ✅ Dropdown de categoria permite mudança
- ✅ Descrição e tags são editáveis
- ✅ Preview da imagem é exibido (não editável)
- ✅ Botão "Salvar" está disponível
- ✅ Ao salvar:
  - Toast de sucesso: "Metadados atualizados!"
  - Mudanças refletem imediatamente na galeria
  - Filtros se ajustam (se foto mudou de categoria)
- ✅ Botão "Cancelar" descarta mudanças

#### Critérios de Falha
- ❌ Não é possível editar metadados
- ❌ Campos não são editáveis
- ❌ Mudanças não são salvas
- ❌ Erro ao salvar sem mensagem clara

---

### 12. Sincronização com Google Drive - Verificação

#### Objetivo
Verificar se as fotos carregadas são sincronizadas com o Google Drive.

#### Passos
1. Faça upload de uma nova foto no sistema:
   - Cliente: Maria Santos
   - Categoria: Antes
   - Descrição: "Teste sincronização Google Drive"
2. Aguarde o upload completar
3. Abra o **Google Drive** em uma nova aba do navegador:
   - URL: https://drive.google.com
4. Navegue até a pasta do sistema:
   - `TATTOO_PHOTO_CALENDAR/`
5. Verifique a estrutura de pastas:
   ```
   TATTOO_PHOTO_CALENDAR/
   ├── clientes/
   │   └── maria-santos/
   │       └── antes/
   │           └── [sua_foto].jpg
   ```
6. Confirme que o arquivo está presente

#### Resultados Esperados
- ✅ Foto é sincronizada automaticamente com Google Drive
- ✅ Estrutura de pastas é criada automaticamente:
  - `TATTOO_PHOTO_CALENDAR/` (pasta raiz)
  - `clientes/` (subpasta)
  - `[nome-cliente]/` (pasta do cliente, normalizada)
  - `[categoria]/` (antes, durante, depois, referencia)
- ✅ Arquivo aparece no Google Drive web
- ✅ Nome do arquivo é preservado ou normalizado
- ✅ Data de modificação é recente (< 1 min)
- ✅ Tamanho do arquivo está correto
- ✅ Arquivo pode ser aberto e visualizado no Google Drive

#### Critérios de Falha
- ❌ Foto não aparece no Google Drive
- ❌ Estrutura de pastas está incorreta
- ❌ Arquivo está corrompido
- ❌ Sincronização demora muito (> 5 min)

---

### 13. Sincronização Bidirecional - Upload no Google Drive

#### Objetivo
Verificar se arquivos carregados diretamente no Google Drive aparecem no sistema.

#### Passos
1. Abra o **Google Drive** no navegador
2. Navegue até `TATTOO_PHOTO_CALENDAR/clientes/joao-silva/referencia/`
3. Faça upload manual de uma foto diretamente no Google Drive:
   - Arraste um arquivo `nova_referencia.jpg`
4. Aguarde o upload completar no Google Drive
5. Volte ao sistema local
6. Aba **"Galeria"** ou **"Google Drive"**
7. Clique em **"Sincronizar Agora"** (se necessário) OU
8. Aguarde sincronização automática (5-10 min)

#### Resultados Esperados
- ✅ Foto carregada no Google Drive aparece no sistema
- ✅ Sincronização automática funciona (polling a cada 5-10 min) OU
- ✅ Botão "Sincronizar Agora" força sincronização imediata
- ✅ Metadados são inferidos automaticamente:
  - Cliente: Detectado pelo nome da pasta
  - Categoria: Detectada pelo nome da subpasta
  - Descrição: Vazia (pode ser preenchida depois)
- ✅ Toast de notificação: "1 nova foto sincronizada do Google Drive"
- ✅ Foto aparece na galeria com os metadados corretos

#### Critérios de Falha
- ❌ Foto não aparece no sistema
- ❌ Sincronização não funciona
- ❌ Metadados estão incorretos
- ❌ Sincronização muito lenta (> 15 min)

---

### 14. Download de Imagem

#### Objetivo
Verificar se é possível baixar imagens da galeria.

#### Passos
1. Na galeria, clique no botão **"Download"** (ícone de download) em uma foto OU
2. Abra a foto no lightbox e clique em **"Baixar"**
3. Observe o download iniciando
4. Verifique o arquivo baixado na pasta Downloads

#### Resultados Esperados
- ✅ Botão de download está visível e acessível
- ✅ Download inicia imediatamente ao clicar
- ✅ Arquivo é baixado com nome adequado:
  - Formato: `cliente_categoria_data.jpg`
  - Exemplo: `joao_silva_antes_2025-10-27.jpg`
- ✅ Arquivo baixado está íntegro (não corrompido)
- ✅ Tamanho e resolução são mantidos (alta qualidade)
- ✅ Download funciona para todos os formatos (JPG, PNG, PDF)

#### Critérios de Falha
- ❌ Botão de download não aparece ou não funciona
- ❌ Arquivo não é baixado
- ❌ Arquivo baixado está corrompido
- ❌ Nome do arquivo é genérico (ex: "image.jpg")

---

### 15. Exclusão de Imagem - Confirmação

#### Objetivo
Verificar se o processo de exclusão de imagens funciona e requer confirmação.

#### Passos
1. Na galeria, clique no botão **"Excluir"** (ícone de lixeira) em uma foto OU
2. Abra a foto no lightbox e clique em **"Excluir"**
3. Observe o modal de confirmação aparecer
4. Leia a mensagem de confirmação
5. Clique em **"Cancelar"** primeiro (teste)
6. Repita os passos 1-2
7. Clique em **"Confirmar Exclusão"**

#### Resultados Esperados
- ✅ Botão de exclusão está visível
- ✅ Modal de confirmação aparece ao clicar em "Excluir"
- ✅ Modal contém:
  - Título: "Excluir foto?"
  - Mensagem: "Esta ação não pode ser desfeita. A foto será removida da galeria e do Google Drive."
  - Preview da foto a ser excluída
  - Botão "Cancelar" (cinza, secundário)
  - Botão "Excluir" (vermelho, destrutivo)
- ✅ Clicar em "Cancelar" fecha o modal sem deletar
- ✅ Clicar em "Excluir" remove a foto:
  - Toast de sucesso: "Foto excluída com sucesso!"
  - Foto desaparece da galeria imediatamente
  - Contador de fotos atualiza
- ✅ Não há forma de excluir acidentalmente (sempre requer confirmação)

#### Critérios de Falha
- ❌ Não há confirmação (exclusão imediata - perigoso!)
- ❌ Foto não é removida da galeria
- ❌ Erro ao excluir sem mensagem clara

---

### 16. Exclusão - Sincronização com Google Drive

#### Objetivo
Verificar se a exclusão de uma foto no sistema também remove do Google Drive.

#### Passos
1. Exclua uma foto no sistema (conforme teste anterior)
2. Aguarde a sincronização (< 1 min)
3. Abra o **Google Drive** no navegador
4. Navegue até a pasta onde a foto estava
5. Verifique se a foto foi removida
6. Confira a **Lixeira do Google Drive**

#### Resultados Esperados
- ✅ Foto é removida do Google Drive automaticamente
- ✅ Sincronização é rápida (< 1 min)
- ✅ Foto está na **Lixeira do Google Drive** (pode ser recuperada)
- ✅ Estrutura de pastas permanece intacta (pasta não é deletada)

#### Critérios de Falha
- ❌ Foto permanece no Google Drive
- ❌ Sincronização não funciona
- ❌ Foto é deletada permanentemente (sem passar pela lixeira)

---

### 17. Visualização em Grid e Lista

#### Objetivo
Verificar se a galeria oferece diferentes modos de visualização.

#### Passos
1. Na aba **"Galeria"**, localize os botões de visualização:
   - Ícone de **Grid** (grade, quadrados)
   - Ícone de **Lista** (linhas)
2. Clique em **"Grid"** (se não for o padrão)
3. Observe a galeria em formato de grade
4. Clique em **"Lista"**
5. Observe a galeria em formato de lista

#### Resultados Esperados

**Grid View**:
- ✅ Fotos exibidas em grade (3-5 colunas dependendo da largura da tela)
- ✅ Thumbnails em tamanho médio (200-300px)
- ✅ Aspectos mantidos (sem distorção)
- ✅ Hover mostra informações rápidas:
  - Nome do cliente
  - Categoria (badge)
  - Data
- ✅ Responsivo (ajusta colunas conforme tela)

**List View**:
- ✅ Fotos exibidas em lista vertical
- ✅ Cada linha contém:
  - Thumbnail pequeno (100px)
  - Nome do cliente
  - Categoria
  - Descrição (truncada)
  - Data de upload
  - Tamanho do arquivo
  - Botões de ação (Editar, Download, Excluir)
- ✅ Mais informações visíveis sem clicar
- ✅ Melhor para gerenciamento em massa

#### Critérios de Falha
- ❌ Apenas um modo de visualização disponível
- ❌ Mudança de view não funciona
- ❌ Views não são responsivas

---

### 18. Ordenação de Fotos

#### Objetivo
Verificar se é possível ordenar as fotos por diferentes critérios.

#### Passos
1. Na aba **"Galeria"**, localize o dropdown de **"Ordenar por"**
2. Teste cada opção de ordenação:
   - **Mais recente** (padrão)
   - **Mais antigo**
   - **Nome do arquivo (A-Z)**
   - **Nome do arquivo (Z-A)**
   - **Cliente (A-Z)**
   - **Tamanho (maior)**
   - **Tamanho (menor)**

#### Resultados Esperados
- ✅ Dropdown de ordenação está visível
- ✅ Ordenação funciona para cada opção:
  - **Mais recente**: Fotos mais novas primeiro
  - **Mais antigo**: Fotos mais antigas primeiro
  - **Nome A-Z**: Ordem alfabética crescente
  - **Nome Z-A**: Ordem alfabética decrescente
  - **Cliente A-Z**: Agrupado por cliente, alfabeticamente
  - **Tamanho maior**: Arquivos maiores primeiro
  - **Tamanho menor**: Arquivos menores primeiro
- ✅ Ordenação é instantânea (< 500ms)
- ✅ Ordenação persiste ao trocar de aba e voltar
- ✅ Ordenação funciona com filtros ativos

#### Critérios de Falha
- ❌ Ordenação não disponível
- ❌ Ordenação não funciona ou está incorreta
- ❌ Ordenação é lenta

---

### 19. Performance com Grande Quantidade de Fotos

#### Objetivo
Verificar se a galeria mantém boa performance com muitas fotos.

#### Passos
1. Faça upload de **50-100 fotos** (use script ou upload múltiplo repetido)
2. Navegue para a aba **"Galeria"**
3. Observe o tempo de carregamento
4. Scroll pela galeria
5. Aplique filtros
6. Teste ordenação
7. Abra lightbox e navegue entre fotos

#### Resultados Esperados
- ✅ Galeria carrega em tempo razoável (< 3s para 100 fotos)
- ✅ Scroll é suave sem travamentos
- ✅ Lazy loading de imagens (carrega conforme scroll)
- ✅ Thumbnails são leves (< 100KB cada)
- ✅ Paginação implementada (20-50 fotos por página) OU
- ✅ Infinite scroll funcionando
- ✅ Filtros continuam rápidos (< 1s)
- ✅ Navegação no lightbox é fluida
- ✅ Uso de memória é aceitável (< 500MB)

#### Critérios de Falha
- ❌ Galeria demora muito para carregar (> 10s)
- ❌ Scroll está travado ou lento
- ❌ Navegador trava ou fica lento
- ❌ Imagens carregam todas de uma vez (sem lazy loading)

---

### 20. Drag and Drop para Upload

#### Objetivo
Verificar se é possível fazer upload arrastando arquivos para a galeria.

#### Passos
1. Navegue até a aba **"Galeria"**
2. Abra o explorador de arquivos do sistema operacional
3. Selecione 2-3 imagens
4. **Arraste** as imagens para a área da galeria
5. Solte os arquivos (drop)
6. Observe o comportamento

#### Resultados Esperados
- ✅ Área de drop está visível ou aparece ao arrastar arquivos
- ✅ Feedback visual ao arrastar sobre a área:
  - Borda pontilhada ou destacada
  - Mensagem: "Solte os arquivos aqui"
  - Cor de fundo muda (azul claro, por exemplo)
- ✅ Ao soltar:
  - Modal de upload abre com arquivos pré-selecionados
  - Preview das imagens é exibido
  - Usuário pode preencher metadados
- ✅ Funciona com múltiplos arquivos simultaneamente
- ✅ Validação de tipo de arquivo ao soltar

#### Critérios de Falha
- ❌ Drag and drop não funciona
- ❌ Sem feedback visual ao arrastar
- ❌ Arquivos não são carregados ao soltar
- ❌ Aceita tipos de arquivo inválidos sem validação

---

## Testes de API (Backend)

### Endpoint: `GET /api/gallery/photos`

**Teste 1: Listar todas as fotos**
```bash
curl -X GET http://localhost:3000/api/gallery/photos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "tattoo_braço_antes.jpg",
      "client_id": 5,
      "client_name": "João da Silva",
      "category": "Antes",
      "description": "Braço antes da tatuagem realista",
      "tags": ["braço", "antes", "realismo"],
      "file_size": 2457600,
      "mime_type": "image/jpeg",
      "google_drive_id": "1abc123def456",
      "uploaded_at": "2025-10-27T10:30:00Z",
      "thumbnail_url": "https://drive.google.com/thumbnail?id=1abc123def456",
      "download_url": "/api/gallery/photos/1/download"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Endpoint: `POST /api/gallery/photos/upload`

**Teste 2: Upload de foto**
```bash
curl -X POST http://localhost:3000/api/gallery/photos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/tattoo.jpg" \
  -F "client_id=5" \
  -F "category=Antes" \
  -F "description=Teste upload API" \
  -F "tags=teste,api,braço"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Foto enviada com sucesso!",
  "data": {
    "id": 46,
    "filename": "tattoo.jpg",
    "google_drive_id": "1xyz789abc123",
    "thumbnail_url": "https://drive.google.com/thumbnail?id=1xyz789abc123"
  }
}
```

---

### Endpoint: `GET /api/gallery/photos?client_id=5`

**Teste 3: Filtrar por cliente**
```bash
curl -X GET "http://localhost:3000/api/gallery/photos?client_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [/* apenas fotos do cliente 5 */],
  "filters": {
    "client_id": 5
  }
}
```

---

### Endpoint: `GET /api/gallery/photos?category=Antes`

**Teste 4: Filtrar por categoria**
```bash
curl -X GET "http://localhost:3000/api/gallery/photos?category=Antes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Endpoint: `GET /api/gallery/photos?search=braço`

**Teste 5: Busca por texto**
```bash
curl -X GET "http://localhost:3000/api/gallery/photos?search=braço" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Endpoint: `PUT /api/gallery/photos/:id`

**Teste 6: Atualizar metadados**
```bash
curl -X PUT http://localhost:3000/api/gallery/photos/46 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Depois",
    "description": "Descrição atualizada",
    "tags": ["nova", "tag"]
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Metadados atualizados com sucesso!",
  "data": {
    "id": 46,
    "category": "Depois",
    "description": "Descrição atualizada",
    "tags": ["nova", "tag"]
  }
}
```

---

### Endpoint: `DELETE /api/gallery/photos/:id`

**Teste 7: Excluir foto**
```bash
curl -X DELETE http://localhost:3000/api/gallery/photos/46 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Foto excluída com sucesso!",
  "data": {
    "id": 46,
    "deleted_from_drive": true
  }
}
```

---

### Endpoint: `GET /api/gallery/photos/:id/download`

**Teste 8: Download de foto**
```bash
curl -X GET http://localhost:3000/api/gallery/photos/1/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_photo.jpg
```

**Resposta Esperada:**
- Arquivo binário (imagem)
- Header `Content-Type: image/jpeg`
- Header `Content-Disposition: attachment; filename="tattoo_braço_antes.jpg"`

---

## Checklist Final

- [ ] **Upload individual** funciona corretamente
- [ ] **Upload múltiplo** funciona (5-10 imagens)
- [ ] **Validação de tipo** rejeita formatos inválidos
- [ ] **Validação de tamanho** rejeita arquivos muito grandes
- [ ] **Filtro por texto** funciona (busca)
- [ ] **Filtro por cliente** funciona
- [ ] **Filtro por categoria** funciona
- [ ] **Filtros combinados** funcionam juntos
- [ ] **Lightbox** abre e exibe imagens corretamente
- [ ] **Navegação no lightbox** funciona (setas, teclado)
- [ ] **Zoom no lightbox** funciona
- [ ] **Edição de metadados** funciona
- [ ] **Sincronização com Google Drive** funciona (upload)
- [ ] **Sincronização bidirecional** funciona (download)
- [ ] **Download de imagens** funciona
- [ ] **Exclusão com confirmação** funciona
- [ ] **Exclusão sincroniza** com Google Drive
- [ ] **Grid view** funciona
- [ ] **List view** funciona
- [ ] **Ordenação** funciona (múltiplos critérios)
- [ ] **Performance** é aceitável com 50+ fotos
- [ ] **Drag and drop** funciona
- [ ] **APIs retornam respostas corretas**

---

## Problemas Conhecidos e Soluções

### Problema 1: Upload lento para imagens grandes
**Solução:** Implementar compressão automática no frontend antes do upload

### Problema 2: Galeria trava com 100+ fotos
**Solução:** Implementar paginação ou infinite scroll com lazy loading

### Problema 3: Sincronização com Google Drive demora
**Solução:** Usar webhooks do Google Drive para sincronização em tempo real

### Problema 4: Thumbnails de baixa qualidade
**Solução:** Gerar thumbnails otimizados no backend (sharp.js)

---

## Conclusão

Este guia cobre todos os cenários críticos para testar a funcionalidade de **Galeria de Imagens**. Certifique-se de executar cada teste e registrar os resultados. Em caso de falha, documente o erro e reporte ao time de desenvolvimento.

**Sistema considerado aprovado se**: 100% dos testes passarem ou apenas falhas menores (não críticas) forem encontradas.

