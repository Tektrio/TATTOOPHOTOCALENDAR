# 🚀 Teste Rápido: Upload para Google Drive

## ✅ O QUE FOI CORRIGIDO

**Antes**: ❌ Criava pastas mas não enviava arquivos  
**Agora**: ✅ Cria pastas E envia arquivos com sucesso

---

## 📋 PASSO A PASSO PARA TESTAR

### 1️⃣ Verifique os Servidores

```bash
# Backend (deve estar na porta 3001)
curl http://localhost:3001/health

# Frontend (deve estar na porta 5174)
curl http://localhost:5174
```

**Status Atual:**

- ✅ Backend: http://localhost:3001 (rodando)
- ✅ Frontend: http://localhost:5174 (rodando)

---

### 2️⃣ Acesse o Sistema

Abra no navegador: **http://localhost:5174**

---

### 3️⃣ Vá para o Google Drive Explorer

1. No menu lateral, clique em **"Google Drive"** ou **"Galeria"**
2. Certifique-se de estar autenticado no Google Drive

---

### 4️⃣ Faça um Teste de Upload

#### Opção A: Upload na Raiz

1. Clique no botão **"Upload"** (ícone 📤)
2. Selecione um arquivo de teste (imagem PNG, JPG ou qualquer tipo)
3. Aguarde a barra de progresso
4. Veja o arquivo aparecer na lista

#### Opção B: Upload em Pasta Específica

1. Navegue até uma pasta existente (ou crie uma nova)
2. Clique no botão **"Upload"** (ícone 📤)
3. Selecione um arquivo
4. Aguarde a confirmação
5. Veja o arquivo dentro da pasta

---

### 5️⃣ Monitore os Logs (Opcional)

Em um terminal separado:

```bash
tail -f /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2/backend.log
```

**Você deve ver:**

```
📤 Fazendo upload de teste.png para Google Drive...
   Tamanho: 45.23 KB
   Tipo: image/png
   Pasta destino: root
✅ Upload concluído: teste.png
```

---

## ✅ SINAIS DE SUCESSO

- ✅ Toast verde: "✅ teste.png enviado com sucesso!"
- ✅ Barra de progresso completa (100%)
- ✅ Arquivo aparece na lista imediatamente
- ✅ É possível visualizar/baixar o arquivo
- ✅ Logs mostram "✅ Upload concluído"

---

## ❌ SE DER ERRO

### Erro: "Google Drive não autenticado"

**Solução:**

```bash
# 1. Verificar se tokens.json existe
ls -la /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2/tokens.json

# 2. Se não existir, fazer login novamente
# Acesse: http://localhost:5174
# Clique em "Conectar Google Drive"
```

### Erro: "Nenhum arquivo enviado"

**Causa:** Problema no formulário do frontend  
**Solução:** Verifique se o campo de upload está funcionando

### Upload fica em 0%

**Causa:** Arquivo muito grande ou problema de rede  
**Solução:**

1. Tente com arquivo menor (< 5 MB)
2. Verifique os logs do backend
3. Confirme conexão com internet

---

## 🔬 TESTE AVANÇADO

### Testar com cURL

```bash
# 1. Prepare um arquivo de teste
echo "Conteúdo de teste" > /tmp/teste.txt

# 2. Faça upload via API
curl -X POST http://localhost:3001/api/drive/upload \
  -F "file=@/tmp/teste.txt" \
  -F "folderId="

# 3. Esperado: JSON com success: true
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (CÓDIGO COM BUG)

```javascript
const media = {
  mimeType: file.mimetype,
  body: fs.createReadStream(file.path), // ❌ file.path não existe!
};

// Resultado: ERRO
// TypeError: ENOENT: no such file or directory
```

### ✅ DEPOIS (CÓDIGO CORRIGIDO)

```javascript
const media = {
  mimeType: file.mimetype,
  body: require("stream").Readable.from(file.buffer), // ✅ Usa buffer
};

// Resultado: SUCESSO
// Upload completo para Google Drive
```

---

## 🎯 CHECKLIST DE TESTE

- [ ] Sistema aberto no navegador
- [ ] Autenticado no Google Drive
- [ ] Upload de arquivo pequeno (< 1 MB) funcionou
- [ ] Upload de imagem funcionou
- [ ] Upload em pasta específica funcionou
- [ ] Arquivo visível no Google Drive web
- [ ] Logs mostram mensagem de sucesso
- [ ] Toast de confirmação apareceu

---

## 🆘 SUPORTE

Se ainda houver problemas:

1. **Reinicie os servidores:**

   ```bash
   cd /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2
   pkill -f "node.*server.js"
   node server.js > backend.log 2>&1 &

   cd /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-frontend
   pkill -f "vite.*agenda"
   pnpm run dev > vite.dev.log 2>&1 &
   ```

2. **Verifique tokens do Google:**

   ```bash
   cat /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2/tokens.json
   ```

3. **Teste conectividade:**
   ```bash
   curl -I https://www.googleapis.com/drive/v3/about
   ```

---

**Última Atualização**: 24/10/2025 ✅
