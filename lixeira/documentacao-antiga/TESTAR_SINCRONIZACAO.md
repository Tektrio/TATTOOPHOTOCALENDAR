# 🧪 GUIA RÁPIDO: Testar Sistema de Sincronização

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Iniciar Aplicação

```bash
# Terminal 1 - Backend
cd agenda-hibrida-v2
npm start

# Terminal 2 - Frontend
cd agenda-hibrida-frontend
npm run dev
```

Aguarde ver no console do backend:

```
✅ Sync Manager inicializado
✅ File Watcher iniciado
👀 Iniciando File Watcher...
✅ File Watcher iniciado com sucesso
```

### 2️⃣ Acessar Interface

Abra o navegador: **http://localhost:5173**

Observe no canto superior do calendário: **SyncStatusIndicator** (ícone de nuvem)

### 3️⃣ Testar Sincronização

**Opção A: Abrir Pasta do Cliente**

1. Clique em qualquer agendamento no calendário
2. Clique no botão "Abrir Pasta do Cliente"
3. Observe:
   - Toast: "🔄 Sincronizando arquivos..."
   - Console backend mostra análise de sincronização
   - SyncStatusIndicator pisca (azul = sincronizando)
   - Pasta abre no explorador

**Opção B: Upload Automático**

1. Abra uma pasta de cliente manualmente em `agenda-hibrida-v2/uploads/`
2. Arraste uma imagem para dentro
3. Observe:
   - Console backend: "📄 Novo arquivo detectado"
   - Console backend: "⬆️ Iniciando upload automático"
   - SyncStatusIndicator atualiza (verde = sincronizado)
   - Toast no frontend mostra arquivo sincronizado

---

## 🔍 O Que Observar

### No Console do Backend:

```
🔄 Iniciando sincronização: ClienteFolder
📂 Arquivos locais: 5
☁️ Arquivos no Drive: 3
📊 Análise de sincronização:
   ✅ Sincronizados: 3
   ⬇️ Apenas no Drive (baixar): 0
   ⬆️ Apenas local (enviar): 2
   ⚠️ Conflitos: 0
```

### No Frontend:

- **SyncStatusIndicator**: Estados visuais

  - 🔵 Azul = Sincronizando
  - 🟢 Verde = Sincronizado
  - 🔴 Vermelho = Erro
  - ⚪ Cinza = Aguardando

- **Toasts**:
  - "📥 X arquivo(s) baixado(s) do Drive"
  - "✅ Y arquivo(s) já sincronizado(s)"
  - "⚠️ Z conflito(s) detectado(s)!"

---

## 🎭 Testar Conflitos (Opcional)

### Criar Conflito Manual:

1. **No Google Drive**:

   - Acesse sua pasta do cliente no Drive
   - Faça upload de uma imagem com nome `teste.png`

2. **Localmente**:
   - Crie um arquivo diferente com o mesmo nome `teste.png` na pasta do cliente
3. **No App**:
   - Clique "Abrir Pasta do Cliente"
4. **Resultado Esperado**:
   - Toast: "⚠️ 1 conflito(s) detectado(s)!"
   - Modal **ConflictResolver** abre
   - Mostra comparação:
     ```
     📂 Versão Local     |  ☁️ Versão Drive
     Tamanho: 150 KB    |  Tamanho: 200 KB
     Modificado: Hoje   |  Modificado: Ontem
     ```
   - Três botões:
     - 🔵 **Manter Versão Local** → Sobrescreve Drive
     - 🟢 **Manter Versão do Drive** → Sobrescreve Local
     - 🟣 **Manter Ambas as Versões** → Renomeia local para `teste_local_timestamp.png`

---

## ✅ Checklist de Verificação

### Sistema Funcionando:

- [ ] Backend iniciou sem erros
- [ ] Frontend carrega sem erros
- [ ] SyncStatusIndicator aparece no calendário
- [ ] Socket.IO conectado (verde no indicador)

### Sincronização Básica:

- [ ] Botão "Abrir Pasta" funciona
- [ ] Console mostra análise de sincronização
- [ ] Pasta abre no explorador
- [ ] Toast mostra estatísticas

### Upload Automático:

- [ ] Adicionar arquivo localmente é detectado
- [ ] Console mostra "📄 Novo arquivo detectado"
- [ ] Upload para Drive é iniciado
- [ ] SyncStatusIndicator atualiza

### Conflitos:

- [ ] Modal ConflictResolver aparece quando há conflito
- [ ] Comparação lado a lado funciona
- [ ] Três opções de resolução funcionam
- [ ] Toast confirma resolução
- [ ] Dados são atualizados após resolver

---

## 🐛 Problemas Comuns

### 1. "socket.io-client" não encontrado

**Solução**: Já foi instalado! Se aparecer:

```bash
cd agenda-hibrida-frontend
pnpm add socket.io-client
```

### 2. SyncStatusIndicator sempre vermelho

**Causa**: WebSocket não conectou
**Solução**: Verifique se o backend está rodando na porta 3001

### 3. "Google Drive não está disponível"

**Causa**: Credenciais não configuradas ou token expirado
**Solução**:

1. Verifique `.env` tem `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
2. Verifique `tokens.json` existe
3. Se necessário, faça login novamente no sistema

### 4. FileWatcher não detecta mudanças

**Causa**: Pasta `uploads/` não existe
**Solução**:

```bash
mkdir -p agenda-hibrida-v2/uploads
```

---

## 📊 Logs Detalhados

### Habilitar Debug Mode:

No `.env`:

```bash
LOG_LEVEL=debug
DEBUG_MODE=true
```

Reinicie o backend para ver logs detalhados de:

- Comparação de hashes
- Requests ao Google Drive API
- Eventos do FileWatcher
- WebSocket events

---

## 🎉 Teste de Sucesso

Se você viu:

1. ✅ "File Watcher iniciado com sucesso"
2. ✅ SyncStatusIndicator verde no frontend
3. ✅ Pasta do cliente abre com sincronização
4. ✅ Upload automático funciona
5. ✅ Modal de conflitos aparece quando necessário

**PARABÉNS! Sistema está 100% funcional!** 🚀

---

## 📞 Próximos Testes

### Teste de Estresse:

1. Adicione 50 arquivos de uma vez na pasta local
2. Observe: Uploads acontecem em paralelo (max 2 simultâneos)

### Teste de Rede Lenta:

1. Adicione arquivo grande (> 10MB)
2. Observe: Upload em chunks de 5MB

### Teste Multi-Cliente:

1. Abra pastas de múltiplos clientes
2. Observe: Sincronização independente por cliente

---

**Sistema de Sincronização Híbrida - 100% Operacional!** ✨
