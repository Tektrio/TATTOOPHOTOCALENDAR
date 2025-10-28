# 🚀 Guia de Início Rápido - Google API

**⏱️ Tempo estimado: 5 minutos**

---

## 📦 O que foi feito

✅ Conta criada: **photocalendar25@gmail.com**  
✅ Projeto Google Cloud: **My First Project**  
✅ APIs habilitadas: **Google Drive + Calendar**  
✅ OAuth Client criado: **TATTOO_PHOTO_CALENDAR_Desktop**  
✅ Usuário de teste autorizado: **photocalendar25@gmail.com**  
✅ Escopos do Google Drive adicionados ao código  

---

## 🎯 3 Passos para Começar

### 1️⃣ Localizar o Arquivo de Credenciais

Procure na pasta **Downloads** por um arquivo chamado:
- `client_secret_*.json` ou
- `credentials_*.json` ou
- Arquivo JSON baixado do Google Cloud Console

**Este arquivo contém o Client Secret que você precisa!**

---

### 2️⃣ Configurar as Credenciais

Execute o script automático:

```bash
cd agenda-hibrida-v2
node configurar-novas-credenciais-google.js
```

O script vai pedir o **Client Secret** (que está no arquivo JSON).

**📝 Exemplo de Client Secret:**
```
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45
```

---

### 3️⃣ Autenticar pela Primeira Vez

Depois de configurar, execute:

```bash
node reautenticar-google.js
```

**O que vai acontecer:**
1. Um link vai aparecer no terminal
2. Copie e cole no navegador
3. Faça login com: **photocalendar25@gmail.com**
4. Aceite as permissões
5. Copie o código que aparece
6. Cole no terminal

✅ Pronto! Seu app está conectado ao Google!

---

## 🧪 Testar a Conexão

### Testar Google Drive:
```bash
node test-gdrive-connection.js
```

### Testar Google Calendar:
```bash
node test-sync-system.js
```

---

## 📋 Informações Importantes

### **Client ID** (já configurado no código):
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

### **Client Secret**:
- Encontre no arquivo JSON baixado
- Procure pela chave `"client_secret"` no JSON

### **Exemplo do arquivo JSON:**
```json
{
  "installed": {
    "client_id": "1073557089506-5hk...",
    "client_secret": "GOCSPX-abc123...",
    "redirect_uris": [
      "http://localhost:3001/auth/google/callback"
    ]
  }
}
```

---

## ❓ Problemas Comuns

### ❌ "Não encontrei o arquivo JSON"

**Solução:**
1. Abra o navegador
2. Vá para: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
3. Clique no cliente **TATTOO_PHOTO_CALENDAR_Desktop**
4. Clique em **Download JSON** novamente

---

### ❌ "Erro ao autenticar"

**Possíveis causas:**
1. Client Secret incorreto → Verifique no arquivo JSON
2. Servidor não está rodando → Inicie com `npm start`
3. Porta diferente → Verifique se está usando 3001

---

### ❌ "Este app não foi verificado"

**É normal!** Clique em:
1. "Avançado" ou "Advanced"
2. "Ir para TATTOO_PHOTO_CALENDAR (não seguro)"
3. Continue normalmente

---

## 📚 Documentação Completa

Para mais detalhes, veja: `🔐_CREDENCIAIS_GOOGLE_API.md`

---

## 🔗 Links Úteis

- **Google Cloud Console**: https://console.cloud.google.com/
- **Seu Projeto**: https://console.cloud.google.com/auth/overview?project=polar-program-476423-i0
- **Download Credenciais**: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0

---

## ✅ Checklist Final

Antes de começar, certifique-se de:

- [ ] Ter o arquivo JSON de credenciais
- [ ] Saber o Client Secret (está no JSON)
- [ ] Email de teste: photocalendar25@gmail.com
- [ ] Servidor parado (se estiver rodando)

Depois de configurar:

- [ ] Executar `configurar-novas-credenciais-google.js`
- [ ] Executar `reautenticar-google.js`
- [ ] Testar com `test-gdrive-connection.js`
- [ ] Iniciar servidor: `npm start`

---

**🎉 Tudo pronto para usar o Google Drive e Calendar!**

---

**Criado em**: 26/10/2025 às 20:40  
**Atualizado**: Após configuração completa do OAuth  
**Próxima revisão**: Quando precisar renovar tokens

