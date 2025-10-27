# 🔍 Como Encontrar o Client Secret

## 📁 Passo 1: Localizar o Arquivo JSON

O arquivo foi baixado automaticamente pelo navegador quando você clicou em "Download JSON".

### Onde procurar:
```
📂 /Users/luizlopes/Downloads/
   └── client_secret_1073557089506-*.json
```

**Dica:** Procure por arquivos JSON baixados recentemente (hoje, 26/10/2025)

### Comando para encontrar:
```bash
find ~/Downloads -name "*.json" -type f -mtime -1
```

---

## 📄 Passo 2: Abrir o Arquivo JSON

O arquivo tem esta estrutura:

```json
{
  "installed": {
    "client_id": "1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com",
    "project_id": "polar-program-476423-i0",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-xxxxxxxxxxxxxxxxxx",
    "redirect_uris": [
      "http://localhost"
    ]
  }
}
```

---

## 🔑 Passo 3: Copiar o Client Secret

**Procure pela linha:**
```json
"client_secret": "GOCSPX-xxxxxxxxxxxxxxxxxx"
```

**Copie apenas o valor entre aspas**, exemplo:
```
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45
```

**NÃO copie:**
- As aspas `"`
- A vírgula `,` no final
- A palavra `client_secret:`

---

## ✅ Exemplo Completo

### ❌ ERRADO:
```
"client_secret": "GOCSPX-abc123def456",
```

### ✅ CORRETO:
```
GOCSPX-abc123def456
```

---

## 🚀 Usar o Client Secret

Depois de copiar, execute:

```bash
cd agenda-hibrida-v2
node configurar-novas-credenciais-google.js
```

Cole o Client Secret quando solicitado.

---

## 🔄 Se Não Encontrar o Arquivo

### Opção 1: Baixar Novamente

1. Acesse: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
2. Encontre: **TATTOO_PHOTO_CALENDAR_Desktop**
3. Clique no nome do cliente
4. Clique em **Download JSON** (ícone de download)
5. O arquivo será baixado novamente

### Opção 2: Copiar Diretamente do Console

1. No Google Cloud Console
2. Vá para: **OAuth Clients**
3. Clique em **TATTOO_PHOTO_CALENDAR_Desktop**
4. O **Client Secret** aparece na tela
5. Clique no ícone de copiar 📋

---

## 📸 Referência Visual

O arquivo JSON deve estar assim:

```
Arquivo: client_secret_1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com.json
Tamanho: ~500 bytes
Data: 26/10/2025
Local: Downloads
```

---

## ⚠️ Segurança

**NUNCA compartilhe:**
- ❌ O Client Secret
- ❌ O arquivo JSON completo
- ❌ Screenshots do arquivo

**Mantenha seguro:**
- ✅ Faça backup em local seguro
- ✅ Não commite no Git
- ✅ Adicione ao .gitignore

---

## 🆘 Ainda com Dúvidas?

### Verificar se o arquivo existe:
```bash
ls -lh ~/Downloads/client_secret_*.json
```

### Ver conteúdo do arquivo:
```bash
cat ~/Downloads/client_secret_*.json | grep client_secret
```

### Copiar diretamente para uso:
```bash
cat ~/Downloads/client_secret_*.json | grep client_secret | cut -d'"' -f4
```

---

**Próximo passo:** Executar `node configurar-novas-credenciais-google.js`

