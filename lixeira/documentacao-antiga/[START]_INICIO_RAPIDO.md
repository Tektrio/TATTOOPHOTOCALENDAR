# ▶️ INÍCIO RÁPIDO - Sistema de Sincronização

## 🎉 Sistema 100% Pronto! Siga 3 Passos:

---

## 1️⃣ INICIAR BACKEND

```bash
cd agenda-hibrida-v2
npm start
```

**Aguarde ver**:

```
✅ Sync Manager inicializado
✅ File Watcher iniciado
👀 Iniciando File Watcher...
✅ File Watcher iniciado com sucesso
🚀 Servidor rodando na porta 3001
```

---

## 2️⃣ INICIAR FRONTEND

**Novo terminal**:

```bash
cd agenda-hibrida-frontend
npm run dev
```

**Aguarde ver**:

```
➜  Local:   http://localhost:5173/
```

---

## 3️⃣ USAR SISTEMA

1. **Abrir navegador**: http://localhost:5173

2. **Observar indicador**: No topo do calendário, veja o **SyncStatusIndicator**

   - 🟢 Verde = Conectado e pronto!

3. **Testar sincronização**:

   - Clique em qualquer agendamento
   - Clique "Abrir Pasta do Cliente"
   - Observe: "🔄 Sincronizando..."
   - Pasta abre no explorador

4. **Testar upload automático**:
   - Com pasta aberta, arraste uma imagem para dentro
   - Observe console backend: "📄 Novo arquivo detectado"
   - Observe indicador: 🔵 Azul → 🟢 Verde
   - Arquivo foi enviado para Google Drive automaticamente! ✅

---

## ✅ PRONTO!

Sistema de sincronização híbrida funcionando! 🎉

### O que acontece automaticamente:

- ✅ Arquivos são sincronizados ao abrir pasta
- ✅ Novos arquivos são enviados para Drive
- ✅ Conflitos são detectados e resolvidos
- ✅ Indicador mostra status em tempo real

### Se houver conflito:

1. Modal aparece mostrando versões
2. Escolha: Local, Drive ou Ambas
3. Sistema aplica sua escolha
4. Tudo sincronizado! ✅

---

## 🧪 TESTAR SISTEMA

Para verificar se tudo está funcionando:

```bash
cd agenda-hibrida-v2
node test-sync-system.js
```

Deve mostrar:

```
🎉 TODOS OS TESTES PASSARAM! Sistema está funcionando corretamente!
```

---

## 📚 MAIS INFORMAÇÕES

- **Documentação Completa**: `✅_SINCRONIZACAO_HIBRIDA_COMPLETA.md`
- **Guia de Testes**: `TESTAR_SINCRONIZACAO.md`
- **Resumo**: `🎉_SISTEMA_SINCRONIZACAO_PRONTO.md`

---

## 🐛 PROBLEMAS?

### Backend não inicia?

```bash
cd agenda-hibrida-v2
rm -rf node_modules
npm install
npm start
```

### Frontend com erro?

```bash
cd agenda-hibrida-frontend
rm -rf node_modules
pnpm install
pnpm run dev
```

### Indicador vermelho?

- Verifique se backend está rodando
- Verifique se porta 3001 está livre

---

## 🎊 BOA SORTE!

Sistema está **100% funcional e testado**!

Qualquer dúvida, consulte a documentação completa.

**Desenvolvido com ❤️ para Agenda Híbrida de Tatuagem**
