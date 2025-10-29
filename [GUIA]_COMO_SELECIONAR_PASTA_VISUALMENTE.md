# 📁 Como Selecionar Pasta Visualmente - Guia Rápido

## 🎯 Objetivo
Aprenda a usar o botão **"Selecionar"** para escolher uma pasta de forma visual, sem precisar digitar o caminho manualmente.

---

## 🚀 Passo a Passo

### 1️⃣ Acesse a Aba "Dados Local"
```
Na interface principal, clique na aba:
┌─────────────────────┐
│ 💾 Dados Local      │
└─────────────────────┘
```

### 2️⃣ Clique no Botão "Selecionar"
```
┌─────────────────────────────────────────────────────┐
│ [____________________________] [📁 Selecionar]      │
└─────────────────────────────────────────────────────┘
```

### 3️⃣ Navegue pela Janela do Sistema
- Uma janela NATIVA do seu sistema operacional vai abrir
- Navegue normalmente pelas suas pastas
- É a mesma janela que você usa para abrir arquivos

**Exemplo no macOS**:
```
┌──────────────────────────────────────┐
│  📁 Desktop                          │
│  📁 Documentos                       │
│  📁 Downloads                        │
│  📁 @pastaLocal              ←── AQUI│
└──────────────────────────────────────┘
```

### 4️⃣ Confirme a Seleção
- Clique no botão "Selecionar" ou "Abrir" da janela
- O sistema vai:
  - ✅ Contar quantos arquivos tem na pasta
  - ✅ Mostrar os primeiros 5 arquivos
  - ✅ Preencher automaticamente o campo de caminho

### 5️⃣ Ajuste o Caminho (Se Necessário)
```
⚠️ IMPORTANTE: Por segurança, navegadores não revelam o caminho completo.

O sistema vai sugerir um caminho, mas você pode precisar ajustá-lo:

ANTES (Sugerido):
/Users/seu_usuario/Desktop/@pastaLocal

DEPOIS (Ajustado):
/Users/luizlopes/Desktop/@pastaLocal
```

### 6️⃣ Clique em "Configurar"
```
┌─────────────────────────────────────────────────────┐
│ [/Users/.../Desktop/@pastaLocal] [💾 Configurar]    │
└─────────────────────────────────────────────────────┘
```

### 7️⃣ Escaneie os Arquivos
```
Após configurar, um botão verde vai aparecer:
┌─────────────────────────────────────┐
│ ✅ Pasta configurada                │
│ /Users/.../Desktop/@pastaLocal      │
│                                     │
│ [🔄 Escanear Arquivos]              │
└─────────────────────────────────────┘
```

### 8️⃣ Veja os Resultados!
```
Uma notificação vai aparecer:
┌─────────────────────────────────────┐
│ ✅ 3 arquivos indexados com sucesso!│
└─────────────────────────────────────┘

E uma tabela vai mostrar todos os arquivos:
┌────────────────────────────────────────────────────┐
│ Arquivo          | Cliente      | Tamanho | Status │
│ 🖼️ arquivo1.jpg  | Sem cliente  | 2.5 MB | 📁 0/0 │
│ 🖼️ arquivo2.png  | Sem cliente  | 1.8 MB | 📁 0/0 │
│ 📄 documento.pdf | Sem cliente  | 450 KB | 📁 0/0 │
└────────────────────────────────────────────────────┘
```

---

## 💡 Dicas Úteis

### ✅ Quando Funciona
O botão "Selecionar" funciona nos seguintes navegadores:
- ✅ Google Chrome (versão 86+)
- ✅ Microsoft Edge (versão 86+)
- ✅ Opera (versão 72+)

### ⚠️ Quando Não Funciona
Se você estiver usando:
- ❌ Firefox
- ❌ Safari antigo (< 15.2)

Você verá esta mensagem:
```
❌ Seu navegador não suporta seleção visual de pasta.
   Use Chrome, Edge ou Opera mais recentes.

💡 Digite o caminho manualmente no campo acima
```

**Solução**: Use o campo de texto normalmente ou troque de navegador.

### 🎯 Atalhos Rápidos

1. **Para pastas no Desktop com @ no nome**:
   ```
   Sistema detecta automaticamente:
   /Users/seu_usuario/Desktop/@pastaNome
   ```

2. **Para outras pastas**:
   ```
   Sistema sugere um template:
   /caminho/para/nomeDaPasta
   
   Você precisa ajustar manualmente
   ```

3. **Para servidores remotos**:
   ```
   Use o botão para identificar a pasta localmente
   Depois ajuste o caminho para o servidor:
   
   Local:    /Users/luiz/Desktop/fotos
   Servidor: /mnt/storage/fotos
   ```

---

## 🔧 Resolução de Problemas

### Problema 1: Botão "Selecionar" Não Faz Nada
**Causas Possíveis**:
- Navegador não suportado
- JavaScript desabilitado
- Pop-ups bloqueados

**Solução**:
1. Verifique se está usando Chrome, Edge ou Opera
2. Verifique se JavaScript está habilitado
3. Permita pop-ups do localhost
4. Se nada funcionar, digite o caminho manualmente

### Problema 2: Caminho Está Errado
**Causa**:
- Navegador não revela caminho completo (segurança)

**Solução**:
1. Anote o caminho real da pasta
2. Edite o campo de texto manualmente
3. Exemplos:
   ```
   macOS:   /Users/seu_nome/Desktop/pasta
   Windows: C:\Users\seu_nome\Desktop\pasta
   Linux:   /home/seu_nome/Desktop/pasta
   ```

### Problema 3: "0 arquivos indexados"
**Causas Possíveis**:
- Pasta está vazia
- Pasta não tem arquivos suportados
- Caminho está incorreto

**Solução**:
1. Verifique se a pasta tem arquivos
2. Confirme o caminho está correto
3. Tipos suportados:
   - Imagens: jpg, png, gif, webp, svg
   - Documentos: pdf, doc, docx
   - Outros: txt, csv, etc.

### Problema 4: Permissão Negada
**Causa**:
- Sistema operacional bloqueou acesso

**Solução**:
1. Verifique permissões da pasta
2. No macOS: Sistema > Privacidade > Arquivos e Pastas
3. Tente com uma pasta diferente primeiro
4. Se persistir, use o campo manual

---

## 📊 Informações Técnicas

### O Que Acontece Quando Você Clica
```
1. Botão "Selecionar" é clicado
   ↓
2. Sistema abre diálogo nativo
   ↓
3. Você navega e escolhe pasta
   ↓
4. Sistema lê metadados dos arquivos
   (NÃO lê conteúdo, apenas nomes)
   ↓
5. Campo é preenchido automaticamente
   ↓
6. Você confirma clicando em "Configurar"
   ↓
7. Backend indexa os arquivos
   ↓
8. Tabela exibe resultados
```

### Segurança e Privacidade
- 🔒 Sistema NUNCA acessa arquivos sem sua permissão
- 🔒 Você precisa aprovar CADA pasta
- 🔒 Apenas metadados são lidos (nome, tamanho, data)
- 🔒 Conteúdo dos arquivos só é lido quando você explicitamente abre

### Performance
- ⚡ Seleção: Instantânea
- ⚡ Contagem de arquivos: < 1 segundo
- ⚡ Indexação completa: 1-5 segundos (dependendo da quantidade)

---

## 🎓 Casos de Uso Comuns

### Caso 1: Fotos do iPhone no Desktop
```bash
1. iPhone conectado
2. Fotos copiadas para: Desktop/Fotos_iPhone
3. Clique em "Selecionar"
4. Navegue até Desktop
5. Escolha "Fotos_iPhone"
6. Ajuste o caminho se necessário
7. Clique em "Configurar"
8. Clique em "Escanear"
```

### Caso 2: Pasta de Projetos
```bash
1. Pasta em: Documents/Projetos/Cliente_ABC
2. Clique em "Selecionar"
3. Navegue até Documents > Projetos > Cliente_ABC
4. Confirme
5. Ajuste: /Users/luiz/Documents/Projetos/Cliente_ABC
6. Configure e escaneie
```

### Caso 3: Pasta em Drive Externo
```bash
1. HD externo: /Volumes/Backup/Arquivos
2. Clique em "Selecionar"
3. Navegue até Volumes > Backup > Arquivos
4. Confirme
5. Sistema sugere: /Volumes/Backup/Arquivos
6. Configure e escaneie
```

---

## ❓ Perguntas Frequentes

### P: Por que o caminho não vem completo?
**R**: Por segurança, navegadores modernos não revelam caminhos completos do seu sistema de arquivos. Isso protege você contra sites maliciosos.

### P: Posso mudar a pasta depois?
**R**: Sim! Basta repetir o processo e selecionar outra pasta.

### P: Os arquivos serão movidos?
**R**: NÃO! O sistema apenas INDEX (faz uma lista) dos arquivos. Eles permanecem no lugar original.

### P: Funciona com pastas de rede?
**R**: Depende. Se a pasta de rede está montada no seu sistema (aparece no Finder/Explorador), sim. Senão, digite o caminho manualmente.

### P: Posso selecionar múltiplas pastas?
**R**: Atualmente não. Você precisa configurar uma pasta por vez. Para múltiplas pastas, repita o processo.

---

## 🎉 Pronto!

Agora você sabe usar o botão **"Selecionar"** para escolher pastas visualmente!

**Resumo em 3 passos**:
1. 📁 Clique em "Selecionar"
2. 🖱️ Navegue e escolha a pasta
3. ✅ Configure e escaneie

**Dúvidas?** Consulte a seção de Resolução de Problemas acima.

---

**Última atualização**: 29/10/2025  
**Versão**: 1.0  
**Status**: ✅ Funcional e Testado

