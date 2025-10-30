# Agenda Híbrida - Sistema Visual para Tatuadores

## 🎨 Sobre o Projeto

Sistema completo de agenda visual especialmente desenvolvido para tatuadores, com funcionalidades híbridas de armazenamento (local + nuvem) e integrações avançadas.

## ✨ Funcionalidades Principais

### 📅 Sistema de Agendamentos
- Integração completa com Google Calendar
- Status visuais (confirmado, pendente, concluído)
- Lembretes automáticos por email e WhatsApp
- Sincronização bidirecional

### 🎨 Galeria Visual Avançada
- Upload múltiplo de imagens e vídeos
- Categorização automática (Referências, Desenhos Aprovados, Fotos Finais)
- Visualizador com zoom, rotação e navegação
- Busca e filtros inteligentes

### 💰 Sistema de Orçamentos
- Calculadora automática de preços
- Multiplicadores por complexidade, tamanho e localização
- Geração de PDFs profissionais
- Controle de aprovação e status

### ☁️ Armazenamento Híbrido
- **Local**: Acesso direto às pastas do Windows
- **Google Drive**: Backup automático na nuvem
- **QNAP NAS**: Integração com servidores locais
- **Sincronização**: Automática entre todas as fontes

## 📁 Pasta Local de Arquivos

**IMPORTANTE**: A pasta local NUNCA deve ficar dentro do repositório para não aumentar o tamanho do repositório.

### Caminho Padrão

```
/Users/{usuario}/Documents/Tatto_Photo_CAlendar_Pasta_Local
```

### Configuração

No arquivo `.env`, defina:

```env
CLIENTS_FOLDER=/Users/{usuario}/Documents/Tatto_Photo_CAlendar_Pasta_Local
```

### Estrutura de Pastas por Cliente

```
Tatto_Photo_CAlendar_Pasta_Local/
└── Cliente_{nome-slug}_{telefone}_{id}/
    ├── Tattoo/
    │   ├── 00_Briefing/
    │   ├── 01_Referencias/
    │   ├── 02_Arquivos_psd/
    │   └── 03_Fotos_e_videos/
    │       ├── Antes/
    │       ├── Durante/
    │       └── Finais/
    ├── Documentos/
    │   ├── Contratos_Assinados/
    │   ├── Termo_Consentimento/
    │   ├── Cuidados_Pos/
    │   └── Autorizacoes_Imagem/
    ├── Financeiro/
    │   ├── Orcamentos/
    │   ├── Pagamentos/
    │   └── Notas/
    ├── Agendamentos/
    └── Midia_Social/
        ├── Selecionadas/
        └── Brutas/
```

### 👥 Gestão de Clientes
- Cadastro completo com histórico
- Organização automática de arquivos por cliente
- Notas e observações personalizadas
- Relatórios de atividade

## 🚀 Instalação Rápida

### Windows
```bash
# 1. Extrair o arquivo ZIP
# 2. Executar como Administrador:
install.bat

# 3. Iniciar o sistema:
start-windows.bat
```

### Linux/Mac
```bash
# 1. Extrair o arquivo
# 2. Dar permissões:
chmod +x install.sh start-linux.sh

# 3. Instalar:
./install.sh

# 4. Iniciar:
./start-linux.sh
```

## ⚙️ Configuração

### 1. Google Calendar e Drive
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use existente
3. Ative as APIs: Google Calendar API e Google Drive API
4. Crie credenciais OAuth 2.0
5. Configure no arquivo `.env`

### 2. Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_de_app
```

### 3. WhatsApp (Opcional)
```env
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=seu_token
```

### 4. QNAP (Opcional)
```env
QNAP_HOST=192.168.1.100
QNAP_USERNAME=admin
QNAP_PASSWORD=sua_senha
QNAP_SHARE_PATH=/share/Tatuagens
```

## 📁 Estrutura do Projeto

```
agenda-hibrida-v2/
├── server.js              # Servidor principal
├── scripts/               # Scripts de automação
│   ├── sync-manager.js    # Gerenciador de sincronização
│   ├── notification-manager.js # Sistema de notificações
│   ├── test-system.js     # Testes automatizados
│   └── setup-complete.js  # Configuração inicial
├── config/                # Configurações
├── uploads/               # Armazenamento local
├── backups/              # Backups automáticos
└── logs/                 # Logs do sistema

agenda-hibrida-frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── App.jsx          # Aplicação principal
│   └── App.css          # Estilos customizados
└── public/              # Arquivos públicos
```

## 🔧 Scripts Disponíveis

### Backend
```bash
npm start          # Produção
npm run dev        # Desenvolvimento
npm run test       # Testes
npm run backup     # Backup manual
npm run sync       # Sincronização manual
```

### Frontend
```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
```

## 🧪 Testes e Monitoramento

### Executar Testes
```bash
node scripts/test-system.js
```

### Verificar Status
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:5173
- **Relatórios**: ./test-reports/

## 📊 Recursos Avançados

### Sincronização Automática
- Intervalo configurável (padrão: 15 minutos)
- Backup diário às 2h da manhã
- Limpeza automática de arquivos antigos
- Logs detalhados de todas as operações

### Notificações Inteligentes
- Lembretes 24h antes dos agendamentos
- Lembretes 2h antes (para não esquecer)
- Cuidados pós-tatuagem no dia seguinte
- Relatórios semanais por email

### Sistema de Backup
- Backup automático do banco de dados
- Compactação dos arquivos
- Retenção configurável (padrão: 30 dias)
- Sincronização com Google Drive

## 🔒 Segurança

- Variáveis de ambiente para credenciais
- Validação de uploads
- Rate limiting nas APIs
- Logs de auditoria
- Backup criptografado

## 🆘 Solução de Problemas

### Problemas Comuns

**Erro de conexão com Google:**
1. Verifique as credenciais no `.env`
2. Execute a autenticação: http://localhost:3001/auth/google
3. Verifique se as APIs estão ativas no Google Cloud

**Servidor não inicia:**
1. Verifique se a porta 3001 está livre
2. Execute `npm install` novamente
3. Verifique os logs em `./logs/`

**Upload não funciona:**
1. Verifique permissões da pasta `uploads/`
2. Verifique espaço em disco
3. Teste com arquivos menores

### Logs e Debug
- **Logs do sistema**: `./logs/combined.log`
- **Logs de erro**: `./logs/error.log`
- **Relatórios de teste**: `./test-reports/`

## 🤝 Suporte

Para suporte e dúvidas:
1. Verifique a documentação
2. Execute os testes do sistema
3. Consulte os logs de erro
4. Entre em contato com o suporte

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

**Desenvolvido com ❤️ pela equipe Manus**
