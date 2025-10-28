# 📖 Guia do Usuário - Sistema de Agenda Híbrida para Tatuadores

**Versão**: 2.0  
**Data**: 27 de outubro de 2025  
**Sistema**: Agenda Híbrida - Gerenciamento Visual e Inteligente

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Gerenciamento de Clientes](#gerenciamento-de-clientes)
4. [Agendamentos](#agendamentos)
5. [Calendário Visual](#calendário-visual)
6. [Sincronização com Google Calendar](#sincronização-com-google-calendar)
7. [Importação de Dados](#importação-de-dados)
8. [Google Drive e Galeria](#google-drive-e-galeria)
9. [Dicas e Truques](#dicas-e-truques)
10. [Solução de Problemas](#solução-de-problemas)
11. [FAQ](#faq)

---

## 📌 Introdução

O **Sistema de Agenda Híbrida** foi desenvolvido especialmente para tatuadores profissionais que precisam gerenciar agendamentos, clientes, fotos de trabalhos e documentos de forma integrada e eficiente.

### Características Principais

- ✅ **Gerenciamento de Clientes**: Cadastro completo com histórico, fotos e anotações
- ✅ **Agendamentos Inteligentes**: Criação, edição e exclusão com sincronização automática
- ✅ **Calendário Visual**: Interface drag-and-drop para reorganizar agendamentos
- ✅ **Google Calendar Sync**: Sincronização bidirecional automática a cada 5 minutos
- ✅ **Importação de Dados**: Suporte para Excel, CSV e iCalendar (.ics)
- ✅ **Galeria Inteligente**: Organização automática de fotos por cliente
- ✅ **Google Drive Integration**: Acesso direto aos arquivos na nuvem
- ✅ **Armazenamento Híbrido**: Local + Google Drive + QNAP NAS (opcional)

---

## 🚀 Primeiros Passos

### 1. Acessando o Sistema

Abra o navegador e acesse:
```
http://localhost:5173
```

Se o sistema estiver em produção, use o endereço fornecido pelo administrador.

### 2. Conectar Google Calendar (Recomendado)

1. Clique no botão **"Conectar Google"** no canto superior direito
2. Faça login com sua conta Google
3. Autorize o acesso ao Google Calendar e Google Drive
4. Aguarde a confirmação de conexão

> **Nota**: A sincronização com Google Calendar é **altamente recomendada** para backup automático e acesso em múltiplos dispositivos.

### 3. Interface Principal - Dashboard

O **Dashboard** é sua tela inicial e exibe:

- 📊 **Total de Clientes**: Número de clientes cadastrados
- 📅 **Próximos Agendamentos**: Quantidade de agendamentos futuros
- 🗂️ **Arquivos Totais**: Fotos e documentos armazenados
- 💾 **Armazenamento**: Espaço utilizado no Google Drive
- 🔄 **Status do Sistema**: Monitoramento de armazenamento local, Google Drive e QNAP NAS
- 📋 **Próximos Agendamentos**: Lista dos 5 próximos agendamentos

---

## 👥 Gerenciamento de Clientes

### Cadastrar Novo Cliente

1. Clique na aba **"Clientes"** no menu superior
2. Clique no botão **"Novo Cliente"** (roxo, com ícone +)
3. Preencha os dados obrigatórios:
   - **Nome completo** *
   - **Telefone** *
   - **Email** (opcional mas recomendado)
   - **Endereço** (opcional)
   - **Data de Nascimento** (opcional)
   - **Anotações** (histórico, preferências, etc.)

4. Clique em **"Criar Cliente"**

> **Dica**: Preencha o email para enviar lembretes automáticos via Google Calendar!

### Editar Cliente

1. Na lista de clientes, clique no **ícone de lápis** ao lado do nome
2. Atualize as informações desejadas
3. Clique em **"Salvar Alterações"**

### Deletar Cliente

1. Clique no **ícone de lixeira** ao lado do cliente
2. Confirme a exclusão no modal

> **Atenção**: Clientes com agendamentos ativos **NÃO podem ser deletados**. Delete os agendamentos primeiro.

### Pastas no Google Drive

Cada cliente cadastrado **automaticamente** recebe uma pasta no Google Drive:
```
📁 Google Drive/Clientes/[Nome do Cliente]_[ID]
```

Você pode acessar esta pasta pela aba **"Google Drive"** ou diretamente no Google Drive web.

---

## 📅 Agendamentos

### Criar Novo Agendamento

1. Clique na aba **"Agendamentos"** 
2. Clique no botão **"Novo Agendamento"**
3. Preencha os dados obrigatórios:
   - **Título** *: Ex: "Tatuagem - Braço Direito"
   - **Cliente** *: Selecione da lista
   - **Data e Hora de Início** *
   - **Data e Hora de Término** *
   - **Descrição** (opcional): Detalhes, observações, etc.

4. Clique em **"Criar Agendamento"**

✅ **O agendamento será automaticamente sincronizado com o Google Calendar!**

### Deletar Agendamento

1. Na lista de agendamentos, clique no **ícone de lixeira**
2. Confirme a exclusão no modal
3. O evento será **removido automaticamente do Google Calendar**

### Status de Sincronização

No canto superior direito, você verá um badge indicando:
- 🟢 **"Sincronizado • há X minutos"**: Tudo em dia
- 🟡 **"Sincronizando..."**: Processando sync
- 🔴 **"Erro ao sincronizar"**: Verifique a conexão

> **Sincronização Automática**: O sistema sincroniza com Google Calendar **a cada 5 minutos automaticamente**.

---

## 📆 Calendário Visual

### Visualizar Agendamentos

1. Clique na aba **"Calendário Visual"**
2. Escolha a visualização:
   - **Mês**: Visão geral do mês inteiro
   - **Semana**: Detalhes da semana
   - **Dia**: Visão detalhada do dia

### Arrastar e Reagendar (Drag and Drop)

1. Clique e **segure** um agendamento no calendário
2. **Arraste** para a nova data/horário
3. Solte para confirmar
4. A alteração será **automaticamente sincronizada com o Google Calendar**

> **Nota**: Funcionalidade de edição por modal está em desenvolvimento.

---

## 🔄 Sincronização com Google Calendar

### Como Funciona

O sistema realiza **sincronização bidirecional** com Google Calendar:

**Do Sistema → Google Calendar**:
- ✅ Criar agendamento → Cria evento no Google
- ✅ Deletar agendamento → Remove evento do Google

**Do Google Calendar → Sistema**:
- ✅ Criar evento no Google → Importa para o sistema (após cron job)
- ✅ Editar evento no Google → Atualiza no sistema (após cron job)
- ✅ Deletar evento no Google → Remove do sistema (após cron job)

### Cron Job Automático

O sistema executa sincronização automática **a cada 5 minutos**:
- Busca novos eventos no Google Calendar
- Atualiza agendamentos existentes
- Remove agendamentos deletados
- Emite notificações via WebSocket

### Forçar Sincronização Manual

Atualmente, a sincronização automática ocorre a cada 5 minutos. Para forçar manualmente, recarregue a página (F5).

---

## 📥 Importação de Dados

O sistema suporta **3 formatos de importação**:

### 1. Excel Vagaro

Para importar dados de **planilhas Excel do Vagaro**:

1. Clique na aba **"Importar Dados"**
2. Selecione **"Excel Vagaro"**
3. Clique em **"Selecionar Arquivo"** e escolha o `.xlsx`
4. Aguarde o **preview automático**

#### Preview e Validação

O sistema mostra:
- ✅ **Total de registros**: Quantidade total de linhas
- ✅ **Válidos**: Linhas sem erros
- ❌ **Com erros**: Linhas com problemas (email inválido, telefone errado, etc.)
- ⚠️ **Duplicatas**: Registros que já existem no sistema

#### Editar Antes de Importar

1. Clique no **ícone de lápis** na linha com erro
2. Corrija os dados diretamente no preview
3. A validação será **refeita em tempo real**

#### Confirmar Importação

1. Revise o relatório: `X válidos | Y erros | Z duplicatas`
2. Clique em **"Importar Dados"**
3. Aguarde a confirmação

### 2. ICS/iCalendar

Para importar agendamentos de **arquivos .ics**:

1. Selecione **"ICS/iCalendar"**
2. Faça upload do arquivo `.ics`
3. O sistema importará automaticamente:
   - Título do evento
   - Data e hora
   - Descrição
   - Participantes

### 3. Google Calendar Direto

1. Selecione **"Google Calendar"**
2. Clique em **"Importar do Google Calendar"**
3. Todos os eventos serão importados automaticamente

---

## 🗂️ Google Drive e Galeria

### Acessar Google Drive

1. Clique na aba **"Google Drive"**
2. Navegue pelas pastas usando o **breadcrumb** (caminho no topo)
3. Clique em uma pasta para abrir
4. Clique em **"Voltar"** ou no breadcrumb para retornar

### Upload de Arquivo

1. Na pasta desejada, clique em **"Upload Arquivo"**
2. Selecione o arquivo do seu computador
3. Aguarde o upload completo
4. O arquivo aparecerá na lista

### Download de Arquivo

1. Localize o arquivo na lista
2. Clique no **ícone de download**
3. O arquivo será baixado para seu computador

### Criar Nova Pasta

1. Clique em **"Nova Pasta"**
2. Digite o nome da pasta
3. Clique em **"Criar"**

### Galeria de Fotos

1. Clique na aba **"Galeria"**
2. Visualize todas as fotos organizadas por cliente
3. Clique em uma foto para ampliar
4. Use os filtros para buscar por cliente ou data

---

## 💡 Dicas e Truques

### 1. Organização de Pastas no Google Drive

Estrutura recomendada:
```
📁 Clientes/
  📁 João Silva_001/
    📁 Tatuagens/
      🖼️ braço_direito_001.jpg
      🖼️ braço_direito_002.jpg
    📁 Documentos/
      📄 termo_responsabilidade.pdf
      📄 orçamento.pdf
```

### 2. Backup Regular

O sistema já faz backup automático no Google Drive, mas **recomendamos**:
- Exportar agendamentos semanalmente (Excel/CSV)
- Fazer backup manual do banco SQLite (`agenda_hibrida.db`)

### 3. Atalhos de Teclado

- `Ctrl/Cmd + N`: Novo agendamento (na aba Agendamentos)
- `Ctrl/Cmd + R`: Atualizar página
- `F5`: Recarregar dados

### 4. Performance

Para melhor performance:
- Mantenha menos de 1000 agendamentos ativos
- Arquive agendamentos antigos (exportar e deletar)
- Limpe fotos antigas do Google Drive

---

## 🔧 Solução de Problemas

### Problema: Agendamentos não sincronizam com Google Calendar

**Possíveis causas e soluções**:

1. **Não conectou o Google**:
   - Clique em **"Conectar Google"** no canto superior direito
   - Autorize o acesso

2. **Token expirado**:
   - Desconecte e reconecte o Google
   - Entre em contato com o administrador se o problema persistir

3. **Cron job parado**:
   - Verifique se o backend está rodando (`http://localhost:3001/health`)
   - Aguarde até 5 minutos para a próxima sincronização automática

### Problema: Importação de Excel falha

**Possíveis causas**:

1. **Formato de arquivo inválido**:
   - Use apenas `.xlsx` (Excel 2007+)
   - Evite arquivos `.xls` (Excel antigo)

2. **Colunas incorretas**:
   - Verifique se o arquivo segue o formato Vagaro
   - Consulte o template de exemplo

3. **Dados inválidos**:
   - Revise o preview antes de importar
   - Corrija linhas com erros manualmente

### Problema: Google Drive não carrega

**Soluções**:

1. Verifique a conexão com Google (botão "Conectar Google")
2. Recarregue a página (F5)
3. Limpe o cache do navegador
4. Verifique se o backend está rodando

### Problema: Fotos não aparecem na Galeria

**Soluções**:

1. Verifique se as fotos estão nas pastas dos clientes no Google Drive
2. Formatos suportados: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. Aguarde até 1 minuto para o sistema processar thumbnails

---

## ❓ FAQ

### 1. Posso usar o sistema offline?

**Parcialmente**. O sistema funciona localmente, mas as seguintes funcionalidades exigem internet:
- Sincronização com Google Calendar
- Acesso ao Google Drive
- Importação de eventos do Google Calendar

### 2. Quantos clientes posso cadastrar?

Não há limite técnico, mas recomendamos:
- Até 500 clientes ativos para melhor performance
- Arquive clientes inativos (exportar e deletar)

### 3. Os dados são seguros?

Sim! Os dados são armazenados:
- **Localmente**: Banco SQLite criptografado
- **Google Drive**: Proteção do Google (2FA recomendado)
- **QNAP NAS**: Opcional para backup redundante

### 4. Posso acessar de múltiplos dispositivos?

Sim, mas com limitações:
- **Google Calendar**: Acesso em qualquer dispositivo via app Google Calendar
- **Sistema completo**: Atualmente apenas no dispositivo onde está instalado
- **Em desenvolvimento**: Versão cloud para acesso remoto

### 5. Como faço backup dos dados?

**Backup Automático**:
- Google Calendar: Sincronização automática a cada 5 minutos
- Google Drive: Upload automático de pastas de clientes

**Backup Manual**:
- Copie o arquivo `agenda-hibrida-v2/agenda_hibrida.db`
- Exporte agendamentos para Excel
- Baixe as pastas do Google Drive

### 6. O sistema funciona em Mac/Windows/Linux?

Sim! O sistema é multiplataforma e funciona em:
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora, Arch, etc.)

### 7. Posso personalizar as cores e o tema?

Atualmente, o sistema usa um tema escuro otimizado para reduzir cansaço visual. Personalização de tema está em desenvolvimento.

### 8. Como adiciono campos personalizados?

Entre em contato com o desenvolvedor para adicionar campos customizados. Exemplos comuns:
- Tipo de tatuagem
- Cor predominante
- Tamanho (P/M/G)
- Estilo (Realismo, Old School, etc.)

---

## 📞 Suporte

Para suporte técnico, entre em contato:
- **Email**: luiz@exemplo.com
- **Telefone**: (XX) XXXX-XXXX
- **Issues GitHub**: [Link do repositório]

---

**Desenvolvido com ❤️ para a comunidade de tatuadores profissionais**

Versão 2.0 - Outubro 2025
