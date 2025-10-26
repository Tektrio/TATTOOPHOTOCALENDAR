# ⚙️ Configuração do Sistema de Sincronização

## 📋 Visão Geral

O sistema de sincronização híbrida permite que você mantenha seus arquivos sincronizados entre:

- **Local/QNAP** (armazenamento principal)
- **Google Drive** (backup secundário/acesso remoto)

## 🔧 Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configuração do Servidor
PORT=3001
NODE_ENV=development

# Configuração do Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Configuração de Armazenamento
STORAGE_MODE=hybrid

# Pasta de Armazenamento Local
# Se estiver usando QNAP, monte a pasta de rede e configure aqui
CLIENTS_FOLDER=./uploads

# Configuração QNAP (preparado para futuro)
QNAP_HOST=
QNAP_USERNAME=
QNAP_PASSWORD=
QNAP_SHARE_PATH=/share/Tatuagens

# Sincronização
SYNC_ENABLED=true
SYNC_AUTO=true
SYNC_INTERVAL=300000
```

## 📁 Estrutura de Pastas

```
uploads/
├── Cliente_Joao_Silva/
│   ├── referencias/
│   ├── desenhos_aprovados/
│   ├── fotos_finais/
│   └── outros/
├── Cliente_Maria_Santos/
│   ├── referencias/
│   ├── desenhos_aprovados/
│   └── fotos_finais/
...
```

## 🔄 Como Funciona a Sincronização

### 1. Sincronização ao Abrir Pasta

Quando você clica em "Abrir Pasta do Cliente":

1. Sistema verifica arquivos locais
2. Lista arquivos no Google Drive
3. Compara e baixa arquivos faltantes
4. Detecta conflitos (mesmo arquivo modificado em ambos locais)
5. Abre a pasta sincronizada

### 2. Monitoramento Automático

O File Watcher monitora mudanças na pasta local:

- **Novo arquivo adicionado** → Upload automático para Google Drive
- **Arquivo modificado** → Atualiza versão no Google Drive
- **Arquivo deletado** → Marca como deletado (soft delete)

### 3. Detecção de Conflitos

Um conflito ocorre quando:

- Arquivo existe em ambos (local e Drive)
- Timestamps diferem em mais de 60 segundos
- Tamanhos ou hashes são diferentes

### 4. Resolução de Conflitos

Quando há conflitos, um modal é exibido com 3 opções:

- **Manter Local**: Sobrescreve versão do Drive
- **Manter Drive**: Sobrescreve versão local
- **Manter Ambos**: Renomeia arquivo local e baixa versão do Drive

## 🗄️ Integração com QNAP

### Preparação Atual

O sistema já está preparado para usar QNAP. Atualmente usa pasta local (`./uploads`).

### Quando Estiver Pronto para QNAP

#### No Mac:

1. Abra o Finder
2. Vá em "Go" → "Connect to Server" (⌘K)
3. Digite: `smb://ip-do-qnap/Tatuagens`
4. Monte a pasta de rede
5. Atualize `.env`: `CLIENTS_FOLDER=/Volumes/Tatuagens`

#### No Windows:

1. Mapeie unidade de rede (Z:, por exemplo)
2. Aponte para `\\ip-do-qnap\Tatuagens`
3. Atualize `.env`: `CLIENTS_FOLDER=Z:/Tatuagens`

#### No Linux:

1. Monte via CIFS/SMB: `sudo mount -t cifs //ip-do-qnap/Tatuagens /mnt/qnap`
2. Atualize `.env`: `CLIENTS_FOLDER=/mnt/qnap`

### Fluxo com QNAP

```
Usuário adiciona arquivo
    ↓
Arquivo salvo no QNAP (via pasta de rede montada)
    ↓
File Watcher detecta novo arquivo
    ↓
Upload automático para Google Drive (backup)
    ↓
Arquivo disponível em:
  - QNAP (storage principal)
  - Google Drive (backup/acesso remoto)
```

## 📊 Configuração Avançada (config.json)

O arquivo `config.json` contém configurações detalhadas:

```json
{
  "sync": {
    "enabled": true,
    "mode": "hybrid",
    "autoSync": true,
    "syncInterval": 300000,
    "watchLocalChanges": true,
    "conflictResolution": "manual"
  },
  "storage": {
    "primary": "local",
    "backup": ["google-drive"]
  },
  "qnap": {
    "enabled": false,
    "mode": "future",
    "notes": "QNAP será integrado quando pasta de rede for montada"
  }
}
```

## 🚀 Iniciando o Sistema

1. Instale dependências:

```bash
cd agenda-hibrida-v2
npm install
```

2. Configure variáveis de ambiente (crie arquivo `.env`)

3. Inicie o servidor:

```bash
npm start
```

4. O sistema automaticamente:
   - Inicializa Google Drive (se tokens.json existir)
   - Inicia Sync Manager
   - Ativa File Watcher para monitoramento
   - Conecta WebSocket para notificações em tempo real

## 🔍 Monitoramento

### Indicador de Status

No canto superior direito do calendário, você verá um badge indicando:

- 🔄 **Sincronizando** (azul) - Upload/download em progresso
- ✅ **Sincronizado** (verde) - Tudo atualizado
- ❌ **Erro** (vermelho) - Problema na sincronização

### Logs

O servidor exibe logs detalhados:

```
🔄 Sincronizando pasta do cliente: João Silva...
📂 Arquivos locais: 15
☁️ Arquivos no Drive: 12
📊 Análise de sincronização:
   ✅ Sincronizados: 10
   ⬇️ Apenas no Drive (baixar): 2
   ⬆️ Apenas local (enviar): 5
   ⚠️ Conflitos: 0
⬇️ Baixando do Drive: foto_referencia.jpg
✅ Download concluído: foto_referencia.jpg
```

## 🛠️ Troubleshooting

### Sincronização não está funcionando

1. Verifique se Google Drive está autenticado
2. Confira se `tokens.json` existe
3. Verifique logs do servidor

### Conflitos frequentes

- Certifique-se de que relógio do sistema está sincronizado
- Evite modificar arquivos diretamente no Drive e localmente
- Use sempre o sistema para adicionar/modificar arquivos

### QNAP não conecta

1. Verifique conectividade de rede
2. Confirme credenciais QNAP
3. Teste ping: `ping ip-do-qnap`
4. Verifique permissões da pasta compartilhada

## 📞 Suporte

Para problemas ou dúvidas, verifique:

1. Logs do servidor
2. Console do navegador (F12)
3. Arquivo `config.json` e `.env`
