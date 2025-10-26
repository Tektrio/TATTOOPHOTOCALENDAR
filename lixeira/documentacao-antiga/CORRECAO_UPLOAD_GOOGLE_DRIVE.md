# 🔧 Correção: Upload de Arquivos para Google Drive

## ❌ Problema Identificado

O sistema estava criando pastas no Google Drive corretamente, mas o **upload de arquivos estava falho**.

### Causa Raiz

No endpoint `/api/drive/upload` (linha 1931 do `server.js`), o código estava tentando usar:

```javascript
const media = {
  mimeType: file.mimetype,
  body: fs.createReadStream(file.path), // ❌ ERRO!
};
```

**Por que não funcionava:**

- O multer está configurado com `memoryStorage()` (linha 361)
- Com `memoryStorage`, arquivos são mantidos na **memória RAM** como `buffer`
- O arquivo **não é salvo em disco**, portanto não tem `file.path`
- Tentar fazer `fs.createReadStream(file.path)` resulta em erro

---

## ✅ Solução Implementada

### Mudança Principal

```javascript
// ✅ CORRETO: Usar buffer da memória
const media = {
  mimeType: file.mimetype,
  body: require("stream").Readable.from(file.buffer),
};
```

### Melhorias Adicionais

1. **Remoção de prefixo**: Agora remove `gdrive_` do `folderId` automaticamente
2. **Logs detalhados**: Mostra tamanho, tipo e pasta de destino
3. **Tratamento de erros**: Exibe detalhes completos do erro quando disponível
4. **Código limpo**: Removido código desnecessário (delete de arquivo temporário)

---

## 📝 Código Corrigido Completo

```javascript
app.post("/api/drive/upload", upload.single("file"), async (req, res) => {
  try {
    let { folderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Remover prefixo gdrive_ se existir
    if (folderId && folderId.startsWith("gdrive_")) {
      folderId = folderId.replace("gdrive_", "");
    }

    if (!driveClient) {
      if (fs.existsSync("./tokens.json")) {
        const tokens = fs.readJsonSync("./tokens.json");
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: "v3", auth: oauth2Client });
      } else {
        return res.status(401).json({ error: "Google Drive não autenticado" });
      }
    }

    console.log(
      `📤 Fazendo upload de ${file.originalname} para Google Drive...`
    );
    console.log(`   Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`   Tipo: ${file.mimetype}`);
    console.log(`   Pasta destino: ${folderId || "root"}`);

    const fileMetadata = {
      name: file.originalname,
      parents: folderId ? [folderId] : [],
    };

    // ✅ Usar buffer em vez de createReadStream
    const media = {
      mimeType: file.mimetype,
      body: require("stream").Readable.from(file.buffer),
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields:
        "id, name, mimeType, size, createdTime, webViewLink, thumbnailLink",
    });

    console.log(`✅ Upload concluído: ${response.data.name}`);
    res.json({
      success: true,
      file: response.data,
    });
  } catch (error) {
    console.error("❌ Erro no upload:", error.message);
    if (error.response) {
      console.error("   Detalhes:", error.response.data);
    }
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🧪 Como Testar

1. **Acesse o sistema**:

   - Frontend: http://localhost:5174
   - Backend: http://localhost:3001

2. **Abra o Google Drive Explorer**

3. **Tente fazer upload**:

   - Navegue até uma pasta (ou crie uma nova)
   - Clique em "Upload"
   - Selecione um arquivo
   - Aguarde a barra de progresso

4. **Verificar logs**:
   ```bash
   tail -f /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2/backend.log
   ```

---

## 📊 Resultado Esperado

✅ Arquivo aparece na pasta do Google Drive  
✅ Logs mostram: "📤 Fazendo upload..." → "✅ Upload concluído"  
✅ Frontend mostra notificação de sucesso  
✅ Arquivo visível na lista imediatamente

---

## 🔍 Troubleshooting

### Erro: "Google Drive não autenticado"

**Solução**: Faça login no Google Drive primeiro

### Erro: "Nenhum arquivo enviado"

**Solução**: Verifique se o campo do formulário está nomeado como `file`

### Upload fica travado

**Solução**:

1. Verifique os logs do backend
2. Confirme que `tokens.json` existe e é válido
3. Teste com arquivo menor (< 1MB)

---

## 📚 Conceitos Técnicos

### Multer Memory Storage

O multer oferece dois modos principais de storage:

1. **diskStorage** (salva em disco):

   ```javascript
   storage: multer.diskStorage({...})
   // file.path existe ✅
   ```

2. **memoryStorage** (mantém na RAM):
   ```javascript
   storage: multer.memoryStorage();
   // file.path NÃO existe ❌
   // file.buffer existe ✅
   ```

**Por que usar memoryStorage?**

- ✅ Mais rápido (não escreve em disco)
- ✅ Não deixa arquivos temporários
- ✅ Ideal para cloud storage direto
- ⚠️ Consome mais RAM
- ⚠️ Limitar tamanho dos arquivos

### Stream no Node.js

Para fazer upload no Google Drive API, precisamos de um Stream:

```javascript
// De arquivo em disco:
fs.createReadStream(filePath);

// De buffer na memória:
require("stream").Readable.from(buffer);

// De string:
require("stream").Readable.from(Buffer.from("texto"));
```

---

## ✅ Status Final

- [x] Problema identificado
- [x] Código corrigido
- [x] Servidor reiniciado
- [x] Logs melhorados
- [x] Documentação criada
- [ ] Testado pelo usuário

---

**Data da Correção**: 24 de Outubro de 2025  
**Arquivo Modificado**: `agenda-hibrida-v2/server.js`  
**Linhas Alteradas**: 1930-1989
