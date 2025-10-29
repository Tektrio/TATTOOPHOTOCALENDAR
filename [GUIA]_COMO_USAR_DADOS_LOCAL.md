# 📚 Guia do Usuário: Como Usar "Dados Local"

## 🎯 O que é "Dados Local"?

A aba "Dados Local" permite que você:
- 📁 Selecione uma pasta do seu computador onde estão os arquivos dos clientes
- 🔍 Indexe automaticamente todos os arquivos
- ☁️ Sincronize para múltiplas contas do Google Drive
- 🗂️ Organize arquivos por cliente automaticamente
- 🔄 Mantenha backups em vários lugares

---

## 🚀 Primeiros Passos

### 1. Organize seus arquivos localmente

Crie uma estrutura de pastas como esta:

```
📁 Meus_Arquivos_Tatuagem/
   ├── Cliente_Joao_Silva/
   │   ├── referencias/
   │   │   └── tatuagem_dragao.jpg
   │   ├── fotos_finais/
   │   │   └── resultado_final.jpg
   │   └── documentos/
   │       └── contrato.pdf
   │
   ├── Cliente_Maria_Lima/
   │   ├── referencias/
   │   │   └── flores_coloridas.jpg
   │   └── fotos_finais/
   │       └── tatuagem_concluida.jpg
   └── ...
```

**Dicas:**
- Nome das pastas de clientes: `Cliente_Nome_Sobrenome`
- Subpastas recomendadas: `referencias`, `fotos_finais`, `documentos`, `rascunhos`
- O sistema identifica o cliente automaticamente pelo nome da pasta

---

## 📖 Passo a Passo

### Passo 1: Abrir a Aba

1. Abra o sistema no navegador
2. Clique na aba **"Dados Local"** (ícone 💾)

Você verá 3 seções principais:
- 🔧 Configurar Pasta Local
- ☁️ Destinos de Sincronização
- 📂 Arquivos e Pastas

---

### Passo 2: Selecionar a Pasta

#### Opção A: Seleção Visual (Recomendado)

1. Clique no botão **"Selecionar"** (📁)
2. Uma janela do seu sistema operacional abre
3. Navegue até sua pasta de arquivos
4. Selecione a pasta desejada
5. Clique em "Abrir" ou "Selecionar Pasta"

**Resultado:**
- ✅ Nome da pasta aparece
- ✅ Quantidade de arquivos é mostrada
- ⚠️ Ajuste o caminho completo no campo se necessário

#### Opção B: Digitação Manual

Se o botão não funcionar (Firefox/Safari):
1. Digite o caminho completo da pasta
2. Exemplo macOS: `/Users/seu_usuario/Desktop/Meus_Arquivos_Tatuagem`
3. Exemplo Windows: `C:\Users\seu_usuario\Desktop\Meus_Arquivos_Tatuagem`

---

### Passo 3: Configurar a Pasta

1. Com o caminho preenchido, clique em **"Configurar"**
2. O sistema valida se a pasta existe
3. Mostra quantos arquivos encontrou

**Resultado:**
- ✅ Card verde: "Pasta configurada"
- ✅ Caminho é salvo no banco de dados
- ✅ Botão "Escanear Arquivos" aparece

---

### Passo 4: Escanear Arquivos

1. Clique no botão **"Escanear Arquivos"** (🔄)
2. Aguarde o processo (pode levar alguns segundos)
3. Uma notificação mostra quantos arquivos foram indexados

**O que acontece:**
- 🔍 Sistema lê todos os arquivos da pasta
- 📝 Identifica clientes pelos nomes das pastas
- 🏷️ Categoriza arquivos (referencias, fotos_finais, etc.)
- 🔢 Calcula hash MD5 para detectar duplicatas
- 💾 Salva tudo no banco de dados

**Resultado:**
- ✅ Arquivos aparecem na seção "Arquivos e Pastas"
- ✅ Estrutura de pastas na sidebar
- ✅ Pronto para visualizar e sincronizar!

---

### Passo 5: Visualizar Arquivos

Você tem dois modos de visualização:

#### Modo Explorador (Padrão)
- 📂 Sidebar com árvore de pastas
- 🖱️ Clique em pastas para navegar
- 🍞 Breadcrumbs mostram onde você está
- 👁️ Visual estilo Google Drive

#### Modo Tabela
- 📊 Lista detalhada com colunas
- 📋 Mostra: Nome, Cliente, Destinos, Tamanho
- 🔍 Ideal para ver muitos arquivos

**Alternar modos:**
- Clique nos botões "Explorador" ou "Tabela" no topo

**Buscar arquivos:**
- Digite na caixa de busca
- Filtro instantâneo por nome

---

### Passo 6: Adicionar Destinos Google Drive

Para fazer backup dos seus arquivos no Google Drive:

1. Na seção "Destinos de Sincronização"
2. Clique **"+ Adicionar Google Drive"**
3. Digite um nome (ex: "Drive Principal", "Backup")
4. Clique **"Conectar com Google"**
5. Faça login na sua conta Google
6. Autorize o acesso
7. Popup fecha e o destino aparece

**Múltiplas contas:**
- Você pode adicionar várias contas Google
- Cada uma recebe uma cor diferente:
  - 1ª = Azul 🔵
  - 2ª = Verde 🟢
  - 3ª = Roxo 🟣
  - 4ª = Ciano 🔷

**Exemplo:**
```
🔵 Drive Principal (pessoal)
🟢 Drive Backup (segunda conta)
🟣 Drive Trabalho (empresa)
```

---

### Passo 7: Sincronizar Arquivos

#### Sincronizar 1 Arquivo

1. No explorador, marque o checkbox de 1 arquivo
2. Clique **"Sincronizar (1)"**
3. Modal abre com lista de destinos
4. Marque para onde quer sincronizar:
   - ☑️ Drive Principal
   - ☑️ Drive Backup
   - ☐ Drive Trabalho
5. Clique **"Sincronizar Selecionados"**
6. Aguarde a confirmação

**Resultado:**
- ✅ Arquivo é enviado para os destinos selecionados
- ✅ Status atualiza para 🔵✓ 🟢✓
- ✅ Badge mostra para onde está sincronizado

#### Sincronizar Múltiplos Arquivos

1. Marque vários checkboxes
2. Clique **"Sincronizar (X)"** (X = quantidade)
3. Selecione destinos
4. Confirme

Todos os arquivos selecionados serão sincronizados!

---

## 🎨 Entendendo os Indicadores

### Status de Sincronização

| Badge | Significado |
|-------|-------------|
| 🟢 | Apenas Local (não sincronizado) |
| 🔵✓ | Sincronizado com Drive Azul |
| 🟢✓ | Sincronizado com Drive Verde |
| 🔵✓ 🟢✓ | Sincronizado com 2 destinos |
| 🔵✓ 🟢✓ 🟣✓ | Sincronizado com 3 destinos |
| ⚠️ | Erro em alguns destinos |
| ❌ | Erro em todos os destinos |

### Cores dos Destinos

- 🔵 **Azul** - 1º Google Drive
- 🟢 **Verde** - 2º Google Drive
- 🟣 **Roxo** - 3º Google Drive
- 🔷 **Ciano** - 4º Google Drive
- 🟠 **Laranja** - QNAP NAS (futuro)

---

## 🔄 Atualizando Arquivos

### Adicionar Novos Arquivos

1. Adicione arquivos na pasta local do seu computador
2. No sistema, clique **"Escanear Arquivos"** novamente
3. Novos arquivos serão indexados
4. Sincronize-os para os destinos desejados

### Rescanear

- É seguro escanear múltiplas vezes
- O sistema detecta arquivos já indexados (via hash MD5)
- Apenas novos arquivos são adicionados

---

## ✨ Recursos Avançados

### Identificação Automática de Clientes

O sistema identifica clientes automaticamente:

**Padrão de pasta:** `Cliente_Nome_Sobrenome`

Exemplos:
- `Cliente_Joao_Silva` → Cliente: João Silva
- `Cliente_Maria_Santos` → Cliente: Maria Santos
- `Cliente_Pedro_Oliveira` → Cliente: Pedro Oliveira

Se o cliente já existir no sistema (cadastrado na aba Clientes), os arquivos são vinculados automaticamente!

### Categorização Automática

O sistema identifica categorias por subpasta:

| Pasta | Categoria |
|-------|-----------|
| `referencias/` | Referências |
| `fotos_finais/` | Fotos Finais |
| `documentos/` | Documentos |
| `rascunhos/` | Rascunhos |
| Outras | Geral |

### Detecção de Duplicatas

- Cada arquivo recebe um hash MD5 único
- Se você escanear o mesmo arquivo duas vezes, ele não é duplicado
- Economia de espaço e organização

---

## ❓ Perguntas Frequentes

### O botão "Selecionar" não funciona

**Causa:** Navegador não suportado

**Solução:**
- Use Chrome, Edge ou Opera
- Ou digite o caminho manualmente

### Os arquivos não aparecem após escanear

**Verificações:**
1. Tem certeza que a pasta tem arquivos?
2. A pasta está acessível (não está em rede offline)?
3. Você tem permissão de leitura?
4. Verifique o console do navegador (F12) para erros

**Solução:**
- Execute: `./diagnostico-dados-local.sh`
- Verifique os logs

### Como ver onde um arquivo está sincronizado?

1. Localize o arquivo no explorador
2. Observe os badges coloridos
3. Ou clique em "Detalhes" para ver lista completa

### Posso remover um destino?

Sim!
1. Na seção "Destinos de Sincronização"
2. Clique em "Remover" no card do destino
3. Confirme
4. O destino é removido (arquivos no Drive permanecem)

### O que acontece se eu deletar um arquivo localmente?

- O arquivo continua no Google Drive
- No próximo scan, ele desaparece do índice
- Para deletar do Drive também, use a interface do Google Drive

---

## 🔒 Segurança e Privacidade

### Seus Dados

- ✅ Arquivos **permanecem no seu computador**
- ✅ Sincronização é **opcional** e **controlada por você**
- ✅ Você escolhe **para onde** e **quando** sincronizar

### Autenticação Google

- ✅ OAuth 2.0 seguro
- ✅ Tokens armazenados localmente
- ✅ Você pode revogar acesso a qualquer momento

### Hash MD5

- ✅ Usado apenas para detectar duplicatas
- ✅ Não é compartilhado
- ✅ Armazenado localmente no banco

---

## 🎯 Casos de Uso Recomendados

### Caso 1: Backup Básico
```
1. Configure pasta local
2. Adicione 1 conta Google Drive
3. Sincronize tudo para o Drive
4. Pronto! Backup automático
```

### Caso 2: Backup Redundante
```
1. Configure pasta local
2. Adicione 2 contas Google Drive
3. Sincronize arquivos importantes para ambas
4. Dupla proteção!
```

### Caso 3: Organização por Cliente
```
1. Organize pastas: Cliente_Nome_Sobrenome
2. Escaneie
3. Sistema identifica clientes automaticamente
4. Visualize arquivos na página do cliente
```

### Caso 4: Separação Pessoal/Trabalho
```
1. Drive Principal = Arquivos pessoais
2. Drive Trabalho = Apenas fotos finais
3. Sincronização seletiva por categoria
```

---

## 🛠️ Troubleshooting

### Erro: "Caminho não existe"

- Verifique se o caminho está correto
- No macOS/Linux: começa com `/`
- No Windows: começa com letra de unidade `C:\`

### Erro: "Sem permissão de leitura"

- Verifique as permissões da pasta
- No macOS: System Preferences > Security & Privacy
- No Windows: Propriedades da pasta > Segurança

### Sincronização falhou

1. Teste a conexão do destino:
   - Clique em "Testar" no card do destino
2. Verifique sua internet
3. Verifique se a conta Google está ativa
4. Tente remover e adicionar a conta novamente

### Arquivos duplicados

- Não deve acontecer (sistema usa MD5)
- Se ocorrer, remova do índice e rescaneie
- Ou delete um dos arquivos localmente

---

## 📞 Suporte

### Ferramentas de Diagnóstico

Execute no terminal:
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR
./diagnostico-dados-local.sh
```

Mostra:
- ✅ Status de todos os componentes
- 📊 Arquivos indexados
- 🎯 Destinos configurados
- ⚠️ Problemas detectados

### Logs

**Backend:**
- Terminal onde rodou `npm start`
- Procure por `[LOCAL-STORAGE]` ou `[SYNC]`

**Frontend:**
- Console do navegador (F12)
- Aba "Console"
- Procure por erros em vermelho

---

## 🎉 Dicas Finais

1. **Backup é importante!** Configure pelo menos 1 destino
2. **Organize bem suas pastas** localmente primeiro
3. **Use nomes de cliente padronizados** para identificação automática
4. **Rescaneie periodicamente** quando adicionar arquivos
5. **Teste a sincronização** com poucos arquivos primeiro
6. **Mantenha múltiplos backups** para segurança

---

## 📚 Documentos Relacionados

- `[TESTE]_GUIA_DADOS_LOCAL_PASSO_A_PASSO.md` - Guia de testes técnicos
- `[SUCESSO]_SISTEMA_DADOS_LOCAL_VERIFICADO.md` - Detalhes técnicos
- `diagnostico-dados-local.sh` - Script de diagnóstico

---

**Última atualização:** 29 de Outubro de 2025  
**Versão:** 1.0  
**Autor:** Sistema Tattoo Photo Calendar

