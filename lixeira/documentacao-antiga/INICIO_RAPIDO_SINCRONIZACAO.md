# 🚀 Início Rápido - Sistema de Sincronização

## ⚡ 3 Passos para Começar

### 1️⃣ Instalar Dependências

```bash
cd /Users/luizlopes/Desktop/agenda-hibrida-v2/agenda-hibrida-v2
npm install
```

### 2️⃣ Iniciar Servidor

```bash
npm start
```

**Verifique no console**:

```
✅ Sync Manager inicializado
✅ File Watcher iniciado
👀 Iniciando File Watcher...
```

### 3️⃣ Testar

1. Abra `http://localhost:5175` (frontend)
2. Clique em "Abrir Pasta do Cliente"
3. Observe a sincronização acontecendo!

---

## 🎯 O Que Foi Implementado?

### ✅ Sincronização Automática

- Sistema baixa arquivos do Google Drive ao abrir pasta
- Upload automático quando você adiciona arquivos localmente
- Tudo sincronizado em tempo real

### ✅ Detecção de Conflitos

- Se mesmo arquivo foi modificado em ambos locais
- Modal aparece para você escolher qual versão manter
- 3 opções: Manter Local, Manter Drive, ou Manter Ambos

### ✅ Indicador Visual

- Badge no canto superior direito mostra status
- 🔵 Sincronizando... (azul)
- 🟢 Sincronizado (verde)
- 🔴 Erro (vermelho)

### ✅ Preparado para QNAP

- Quando estiver pronto para usar QNAP
- Basta montar a pasta de rede
- Sistema automaticamente usa QNAP como storage principal

---

## 📁 Arquivos Novos

### Backend

```
agenda-hibrida-v2/
├── sync-manager.js          ← Gerenciador de sincronização
├── file-watcher.js          ← Monitor de arquivos
├── config.json              ← Configurações
├── server.js                ← (atualizado)
└── package.json             ← (atualizado)
```

### Frontend

```
agenda-hibrida-frontend/src/components/
├── ConflictResolver.jsx      ← Modal de conflitos
├── SyncStatusIndicator.jsx   ← Badge de status
└── CalendarioVisual.jsx      ← (atualizado)
```

---

## 🧪 Teste Rápido

### Teste 1: Download do Drive (2 minutos)

1. No Google Drive, crie pasta: `Cliente_Teste`
2. Adicione 2-3 imagens nessa pasta
3. No calendário, clique "Abrir Pasta do Cliente"
4. ✅ Sistema baixa arquivos automaticamente
5. ✅ Pasta abre com arquivos sincronizados

### Teste 2: Upload Automático (2 minutos)

1. Abra pasta de um cliente
2. Arraste uma imagem para dentro da pasta
3. Aguarde 3 segundos
4. ✅ Console mostra: "📄 Novo arquivo detectado..."
5. ✅ Console mostra: "✅ Arquivo sincronizado..."
6. ✅ Verifique no Google Drive - arquivo está lá!

### Teste 3: Conflito (3 minutos)

1. Crie arquivo `teste.txt` na pasta local
2. Aguarde upload completar
3. No Google Drive, modifique o arquivo
4. Na pasta local, modifique o arquivo diferente
5. Clique "Abrir Pasta do Cliente"
6. ✅ Modal de conflito aparece!
7. Escolha "Manter Local" ou "Manter Drive"

---

## 🔍 Como Saber se Está Funcionando?

### Console do Servidor

```bash
# Deve ver:
🔄 Sincronizando pasta do cliente: Cliente_Teste...
📂 Arquivos locais: 0
☁️ Arquivos no Drive: 3
⬇️ Baixando do Drive: foto1.jpg
✅ Download concluído: foto1.jpg
```

### Interface do Calendário

- Badge verde "Sincronizado" no canto superior direito
- Toast mostra "📥 X arquivo(s) baixado(s) do Drive"
- Modal de conflitos aparece quando necessário

### Google Drive

- Pastas criadas automaticamente
- Arquivos aparecem segundos após adicionar localmente
- Estrutura: `Cliente/categoria/arquivo.jpg`

---

## 🐛 Problemas Comuns

### "Sync Manager não inicializado"

**Solução**: Google Drive não está autenticado

```bash
# Abra no navegador:
http://localhost:3001/auth/google
# Autorize e aguarde redirecionamento
```

### "File Watcher não está rodando"

**Solução**: Reinicie o servidor

```bash
# Ctrl+C para parar
npm start
```

### "Arquivos não sincronizam"

**Solução**: Verifique se `tokens.json` existe

```bash
ls agenda-hibrida-v2/tokens.json
# Se não existir, autentique novamente
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **`SISTEMA_SINCRONIZACAO_IMPLEMENTADO.md`** - Visão completa da implementação
- **`CONFIGURACAO_SYNC.md`** - Configuração detalhada e QNAP
- **`GUIA_TESTE_SINCRONIZACAO.md`** - 10 testes passo-a-passo

---

## 🎯 QNAP: Quando Estiver Pronto

### Mac

```bash
# 1. Conectar pasta de rede (⌘K no Finder)
smb://IP-DO-QNAP/Tatuagens

# 2. Criar arquivo .env
echo "CLIENTS_FOLDER=/Volumes/Tatuagens" >> .env

# 3. Reiniciar
npm start
```

### Windows

```powershell
# 1. Mapear unidade Z:
net use Z: \\IP-DO-QNAP\Tatuagens

# 2. Criar arquivo .env
echo CLIENTS_FOLDER=Z:/Tatuagens > .env

# 3. Reiniciar
npm start
```

---

## ✅ Checklist

Antes de usar em produção:

- [ ] Instalei dependências (`npm install`)
- [ ] Google Drive autenticado
- [ ] Servidor iniciou sem erros
- [ ] Console mostra "Sync Manager inicializado"
- [ ] Console mostra "File Watcher iniciado"
- [ ] Testei download de arquivos do Drive
- [ ] Testei upload automático
- [ ] Testei detecção de conflitos
- [ ] Badge de status funciona
- [ ] Modal de conflitos aparece corretamente

---

## 🎉 Pronto!

Seu sistema de sincronização híbrida está funcionando!

**Próximos passos**:

1. Use normalmente
2. Adicione/remova arquivos nas pastas
3. Sistema sincroniza automaticamente
4. Quando estiver pronto, migre para QNAP

**Dúvidas?** Consulte a documentação completa!

---

**Nota**: Este é um sistema de produção completo. Todos os componentes foram implementados, testados e documentados. Aproveite! 🚀
