# 🧪 Guia de Testes: Aba Dados Local - Passo a Passo

## ✅ Fase 1: Verificação da Infraestrutura - COMPLETA

### Resultado da Verificação:

- ✅ **Banco de Dados:** Todas as 6 tabelas existem

  - `local_storage_config`
  - `sync_destinations`
  - `local_files`
  - `sync_status`
  - `sync_rules`
  - `sync_queue`

- ✅ **Rotas Backend:** Registradas corretamente no server.js

  - `localStorageRouter` - linha 185
  - `syncDestinationsRouter` - linha 186
  - Serviços inicializados - linhas 198-199
  - Rotas montadas - linhas 205-206

- ✅ **Componentes Frontend:** Todos existem

  - DestinationManager.jsx
  - LocalFileExplorer.jsx
  - LocalFileTable.jsx
  - AddGoogleAccountModal.jsx
  - SyncSelectionModal.jsx
  - QnapConfigModal.jsx
  - SyncStatusIndicator.jsx

- ✅ **Serviços Backend:** Todos existem

  - localStorageService.js
  - syncDestinationsService.js
  - qnapValidator.js

- ✅ **Utilitários:** Todos existem

  - pathParser.js
  - fileHasher.js
  - syncHelpers.js
  - storageConfig.js

- ✅ **Pasta de Teste:** Criada com sucesso
  - Localização: `/Users/luizlopes/Desktop/TATTOO_TEST`
  - Estrutura: 2 clientes (João Silva, Maria Lima)
  - Total de arquivos: 7 arquivos de teste

---

## 📋 Fase 2: Testes Manuais - INICIE AQUI

### Pré-requisitos:

1. ✅ Backend rodando: `cd agenda-hibrida-v2 && npm start`
2. ✅ Frontend rodando: `cd agenda-hibrida-frontend && npm run dev`
3. ✅ Navegador: Chrome, Edge ou Opera (para botão Selecionar funcionar)

---

## 🧪 Teste 1: Botão "Selecionar"

### Objetivo:

Verificar se o botão abre a janela de seleção de pasta do sistema operacional.

### Passos:

1. Abra o navegador em `http://localhost:5173` (ou porta configurada)
2. Clique na aba **"Dados Local"** (ícone de disco rígido 💾)
3. Localize a seção "Configurar Pasta Local"
4. Clique no botão **"Selecionar"** (ícone de pasta 📁)

### Resultado Esperado:

- ✅ Janela nativa do macOS deve abrir
- ✅ Você pode navegar visualmente pelas pastas
- ✅ Selecione: `/Users/luizlopes/Desktop/TATTOO_TEST`
- ✅ Toast de sucesso aparece mostrando:
  - Nome da pasta selecionada
  - Quantidade de arquivos encontrados
- ✅ Campo de caminho é preenchido (pode ser um caminho estimado)
- ✅ Toast de aviso pedindo para ajustar o caminho completo

### ⚠️ Se não funcionar:

- Verifique se está usando Chrome/Edge/Opera
- Firefox e Safari **NÃO suportam** esta API
- Neste caso, digite o caminho manualmente

### Status: [ ] Passou ✅ / [ ] Falhou ❌

**Observações:**

```
[Escreva aqui o que aconteceu]
```

---

## 🧪 Teste 2: Botão "Configurar"

### Objetivo:

Salvar o caminho da pasta no banco de dados e validar que ela existe.

### Passos:

1. No campo "Caminho", digite ou ajuste para: `/Users/luizlopes/Desktop/TATTOO_TEST`
2. Clique no botão **"Configurar"** (ícone de disco rígido 💾)

### Resultado Esperado:

- ✅ Toast: "📊 X item(ns) encontrado(s) na pasta"
- ✅ Toast: "✅ Pasta local configurada com sucesso!"
- ✅ Card verde aparece: "Pasta configurada"
- ✅ Mostra o caminho: `/Users/luizlopes/Desktop/TATTOO_TEST`
- ✅ Botão **"Escanear Arquivos"** fica visível

### Logs esperados no terminal do backend:

```
📁 [LOCAL-STORAGE] Validando caminho: /Users/luizlopes/Desktop/TATTOO_TEST
✅ [LOCAL-STORAGE] Validação resultado: { valid: true, fileCount: 7 }
⚙️ [LOCAL-STORAGE] Configurando pasta: /Users/luizlopes/Desktop/TATTOO_TEST
✅ [LOCAL-STORAGE] Pasta configurada
```

### Status: [ ] Passou ✅ / [ ] Falhou ❌

**Observações:**

```
[Escreva aqui o que aconteceu]
```

---

## 🧪 Teste 3: Botão "Escanear"

### Objetivo:

Indexar todos os arquivos da pasta no banco de dados.

### Passos:

1. Clique no botão **"Escanear Arquivos"** (ícone de refresh 🔄)
2. Aguarde o processo terminar

### Resultado Esperado:

- ✅ Botão muda para: "🔄 Escaneando..."
- ✅ Após alguns segundos, toast: "✅ 7 arquivo(s) indexado(s) com sucesso!"
- ✅ Seção "Arquivos e Pastas" é recarregada
- ✅ Arquivos aparecem no explorador

### Logs esperados no terminal do backend:

```
🔍 [LOCAL-STORAGE] Iniciando escaneamento...
📁 Iniciando scan de: /Users/luizlopes/Desktop/TATTOO_TEST
✅ Scan concluído: 7 arquivos indexados
📂 [FRONTEND] 7 arquivo(s) carregado(s)
```

### Status: [ ] Passou ✅ / [ ] Falhou ❌

**Observações:**

```
[Escreva aqui o que aconteceu]
```

---

## 🧪 Teste 4: Visualização de Arquivos

### Objetivo:

Verificar se os arquivos indexados aparecem corretamente no explorador.

### Teste 4.1: Modo Explorador (Padrão)

**Passos:**

1. Verifique se está no modo "Explorador" (botão ativo)
2. Observe a sidebar esquerda

**Resultado Esperado:**

- ✅ Estrutura de pastas visível na sidebar:
  - 📁 Cliente_Joao_Silva (4 itens)
  - 📁 Cliente_Maria_Lima (3 itens)
- ✅ Clicar em "Cliente_Joao_Silva" expande e mostra subpastas
- ✅ Breadcrumbs mostram o caminho atual
- ✅ Arquivos listados com ícones apropriados

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

### Teste 4.2: Modo Tabela

**Passos:**

1. Clique no botão "Tabela" (ícone de lista 📝)

**Resultado Esperado:**

- ✅ Visualização muda para tabela
- ✅ Colunas visíveis: Nome, Cliente, Destinos, Tamanho
- ✅ Todos os 7 arquivos listados
- ✅ Nome do cliente identificado (João Silva / Maria Lima)

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

### Teste 4.3: Navegação de Pastas

**Passos:**

1. Na sidebar, clique em "Cliente_Joao_Silva"
2. Clique em "referencias"
3. Verifique os breadcrumbs
4. Clique em "Início" nos breadcrumbs

**Resultado Esperado:**

- ✅ Conteúdo atualiza ao clicar em pasta
- ✅ Breadcrumbs mostram: Início > Cliente_Joao_Silva > referencias
- ✅ Clique em breadcrumb navega de volta
- ✅ Arquivos da pasta selecionada são exibidos

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

### Teste 4.4: Busca

**Passos:**

1. Digite "final" na caixa de busca
2. Observe os resultados

**Resultado Esperado:**

- ✅ Filtro instantâneo funciona
- ✅ Apenas arquivos com "final" no nome são exibidos
- ✅ Limpar busca mostra todos novamente

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

---

## 🧪 Teste 5: Adicionar Destino Google Drive

### Objetivo:

Configurar uma conta Google Drive como destino de sincronização.

### Passos:

1. Role até a seção "Destinos de Sincronização"
2. Clique em **"+ Adicionar Google Drive"**
3. No modal, digite nome: "Drive Principal"
4. Clique em "Conectar com Google"
5. Complete o processo OAuth do Google

### Resultado Esperado:

- ✅ Modal abre com campo de nome
- ✅ Popup OAuth do Google abre
- ✅ Após autenticação, popup fecha
- ✅ Destino aparece na lista com:
  - Nome: "Drive Principal"
  - Badge: "✓ Conectado"
  - Cor: Azul 🔵
  - Ícone de nuvem ☁️

### Status: [ ] Passou ✅ / [ ] Falhou ❌

**Observações:**

```
[Escreva aqui o que aconteceu]
```

---

## 🧪 Teste 6: Sincronização de Arquivos

### Objetivo:

Sincronizar arquivo(s) da pasta local para o Google Drive.

### Teste 6.1: Sincronização Individual

**Passos:**

1. No explorador, marque o checkbox de 1 arquivo
2. Clique no botão "Sincronizar (1)"
3. No modal, selecione "Drive Principal"
4. Clique em "Sincronizar Selecionados"

**Resultado Esperado:**

- ✅ Modal abre com lista de destinos
- ✅ Toast: "Sincronização iniciada!"
- ✅ Status do arquivo muda para 🔵✓
- ✅ Badge indica sincronização concluída

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

### Teste 6.2: Sincronização Múltipla

**Passos:**

1. Marque checkboxes de 3 arquivos
2. Clique em "Sincronizar (3)"
3. Selecione destinos
4. Confirme

**Resultado Esperado:**

- ✅ Modal mostra 3 arquivos
- ✅ Todos sincronizam com sucesso
- ✅ Badges individuais atualizados

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

---

## 🧪 Teste 7: Casos Extremos

### Teste 7.1: Caminho Inválido

**Passos:**

1. Digite caminho que não existe: `/caminho/invalido`
2. Clique em "Configurar"

**Resultado Esperado:**

- ✅ Toast de erro: "Caminho inválido: Caminho não existe"

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

### Teste 7.2: Rescanear Após Adicionar Arquivos

**Passos:**

1. No Finder, adicione um novo arquivo em TATTOO_TEST
2. No navegador, clique em "Escanear Arquivos" novamente

**Resultado Esperado:**

- ✅ Novo arquivo é indexado
- ✅ Total de arquivos aumenta
- ✅ Novo arquivo aparece na lista

**Status:** [ ] Passou ✅ / [ ] Falhou ❌

---

## 📊 Resumo dos Testes

| Teste                 | Status | Observações |
| --------------------- | ------ | ----------- |
| 1. Botão Selecionar   | ⬜     |             |
| 2. Botão Configurar   | ⬜     |             |
| 3. Botão Escanear     | ⬜     |             |
| 4.1. Modo Explorador  | ⬜     |             |
| 4.2. Modo Tabela      | ⬜     |             |
| 4.3. Navegação        | ⬜     |             |
| 4.4. Busca            | ⬜     |             |
| 5. Google Drive       | ⬜     |             |
| 6.1. Sync Individual  | ⬜     |             |
| 6.2. Sync Múltipla    | ⬜     |             |
| 7.1. Caminho Inválido | ⬜     |             |
| 7.2. Rescan           | ⬜     |             |

**Legenda:** ⬜ Não testado | ✅ Passou | ❌ Falhou

---

## 🐛 Problemas Encontrados

### Problema 1:

**Descrição:**

```
[Descreva o problema]
```

**Como reproduzir:**

```
1. [Passo 1]
2. [Passo 2]
3. [Resultado]
```

**Logs do console/backend:**

```
[Cole os logs aqui]
```

---

## 📝 Notas Adicionais

- **Navegador testado:** [Chrome / Edge / Opera]
- **Versão do navegador:** [XX.X]
- **Data do teste:** [Data]
- **Testador:** Luiz Lopes

---

## 🎯 Próximos Passos

Após completar todos os testes:

1. ✅ Marque todos os status como ✅ ou ❌
2. ✅ Documente qualquer problema encontrado
3. ✅ Se houver falhas, consulte o desenvolvedor
4. ✅ Se tudo passou, o sistema está pronto para uso! 🎉
