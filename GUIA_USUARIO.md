# 📘 Guia do Usuário - TattooScheduler

**Versão:** 1.0.0  
**Data:** 27 de outubro de 2025  
**Sistema Pronto para Produção** ✅

---

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Conectar Google Calendar](#conectar-google-calendar)
3. [Gerenciar Clientes](#gerenciar-clientes)
4. [Gerenciar Agendamentos](#gerenciar-agendamentos)
5. [Sincronização Google Calendar](#sincronização-google-calendar)
6. [Importar Dados](#importar-dados)
7. [Google Drive](#google-drive)
8. [Calendário Visual](#calendário-visual)
9. [Dúvidas Frequentes](#dúvidas-frequentes)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Primeiros Passos

### 1. Acesse o Sistema

Abra seu navegador e acesse: `http://localhost:5173`

### 2. Tela Inicial

Você verá o **Dashboard** com:
- 📊 **Estatísticas**: Total de clientes, próximos agendamentos, arquivos
- 📅 **Calendário**: Visualização rápida dos próximos compromissos
- 🔗 **Status de Conexão**: Google Calendar e Google Drive

### 3. Menu Principal

Use as abas no topo para navegar:
- **Dashboard** - Visão geral
- **Calendário Visual** - Calendário interativo
- **Agendamentos** - Lista de compromissos
- **Clientes** - Gerenciar clientes
- **Importar Dados** - Importar Excel/ICS
- **Galeria** - Fotos de trabalhos
- **Google Drive** - Arquivos na nuvem
- **Configurações** - Ajustes do sistema

---

## 🔗 Conectar Google Calendar

### Passo 1: Clique em "Conectar Google"

No **header** (topo da página), você verá um botão:
```
[WifiOff] Conectar Google
```

Clique nele.

### Passo 2: Autorize o Acesso

1. Você será redirecionado para a página de login do Google
2. Escolha sua conta Google
3. Revise as permissões solicitadas:
   - ✅ Ver, editar e criar eventos no Google Calendar
   - ✅ Ver, criar e organizar arquivos no Google Drive
4. Clique em **"Permitir"**

### Passo 3: Aguarde o Retorno

Você será redirecionado de volta para o sistema.

**Status de conexão mudará para:**
```
[Cloud] Google Calendar • há poucos segundos
```

🎉 **Pronto!** Seu Google Calendar está conectado.

---

## 👥 Gerenciar Clientes

### Criar Novo Cliente

1. Clique na aba **"Clientes"**
2. Clique no botão **"Novo Cliente"**
3. Preencha o formulário:

**Campos obrigatórios:**
- **Nome** * - Mínimo 2 caracteres

**Campos opcionais:**
- **Email** - Validação automática de formato
- **Telefone** - Formato brasileiro (11) 99999-9999
- **Notas** - Observações adicionais

4. Clique em **"Salvar"**

**Feedback Visual:**
- ✅ **Verde:** Campo válido
- ❌ **Vermelho:** Campo com erro
- ⚠️ **Amarelo:** Aviso (ex: cliente duplicado)

### Validações Automáticas

**Email:**
- Formato válido: `exemplo@dominio.com`
- Detecção de domínios temporários

**Telefone:**
- Formato aceito: `(11) 98765-4321` ou `1198765432`
- Normalização automática para +55 11 98765-4321
- Detecção de números suspeitos (todos iguais)

**Duplicatas:**
- Sistema avisa se já existe cliente com:
  - Mesmo telefone
  - Mesmo email
- Você pode prosseguir ou cancelar

### Editar Cliente

1. Na lista de clientes, clique no ícone de **"Editar"** (lápis)
2. Altere os campos desejados
3. Clique em **"Salvar"**

### Deletar Cliente

1. Clique no ícone de **"Excluir"** (lixeira)
2. Confirme a exclusão no dialog
3. **Atenção:** Esta ação não pode ser desfeita

---

## 📅 Gerenciar Agendamentos

### Criar Novo Agendamento

1. Clique na aba **"Agendamentos"**
2. Clique em **"Novo Agendamento"**
3. Preencha o formulário:

**Campos obrigatórios:**
- **Cliente** * - Selecione da lista
- **Data** * - Não pode ser no passado
- **Horário** * - Formato 24h (14:00)

**Campos opcionais:**
- **Horário Fim** - Cálculo automático de duração
- **Serviço** - Tipo de trabalho
- **Notas** - Observações

4. Clique em **"Salvar"**

**O que acontece:**
1. ✅ Agendamento é salvo localmente
2. ✅ **Automaticamente criado no Google Calendar**
3. ✅ Email enviado ao cliente (se tiver email)
4. ✅ Pasta criada no Google Drive (se não existir)

### Editar Agendamento

1. Clique no ícone de **"Editar"** no agendamento
2. Altere os campos desejados
3. Clique em **"Salvar"**

**O que acontece:**
1. ✅ Agendamento é atualizado localmente
2. ✅ **Automaticamente atualizado no Google Calendar**
3. ✅ Notificação de atualização enviada ao cliente

### Deletar Agendamento

1. Clique no ícone de **"Excluir"**
2. Confirme a exclusão

**O que acontece:**
1. ✅ Agendamento é removido localmente
2. ✅ **Automaticamente removido do Google Calendar**
3. ✅ Notificação de cancelamento enviada ao cliente

---

## 🔄 Sincronização Google Calendar

### Badge de Sincronização

No **header** você verá o badge de sincronização:

**Estados possíveis:**

1. **Conectado (Idle)**
   ```
   [Cloud] Google Calendar • há 5 minutos
   ```
   - Cor: Roxo
   - Clicável: Sim (clique para sincronizar manualmente)

2. **Sincronizando**
   ```
   [RefreshCw] Sincronizando...
   ```
   - Cor: Azul
   - Animação: Spinner girando

3. **Sincronizado com Sucesso**
   ```
   [CheckCircle] Sincronizado (12 eventos)
   ```
   - Cor: Verde
   - Duração: 3 segundos (depois volta para Idle)

4. **Erro na Sincronização**
   ```
   [AlertCircle] Erro na sincronização
   ```
   - Cor: Vermelho
   - Duração: 3 segundos

5. **Desconectado**
   ```
   [CloudOff] Google desconectado
   ```
   - Cor: Cinza
   - Ação: Clique em "Conectar Google"

### Sincronização Automática

O sistema sincroniza automaticamente:
- ⏰ **A cada 5 minutos** - Importa eventos do Google
- 📤 **Em tempo real** - Ao criar/editar/deletar agendamentos

**Período de sincronização:**
- Últimos 7 dias
- Próximos 30 dias

### Sincronização Manual

Para forçar uma sincronização imediata:
1. Clique no **badge de sincronização**
2. Aguarde o processo (geralmente < 2 segundos)
3. Badge mostrará "Sincronizado" com quantidade de eventos

---

## 📥 Importar Dados

### Tipos de Importação Suportados

1. **Excel Vagaro** - Clientes e Agendamentos
2. **ICS/iCalendar** - Eventos de calendário
3. **Google Calendar** - Sincronização direta

### Importar Excel (Clientes)

1. Vá para aba **"Importar Dados"**
2. Selecione aba **"Excel Vagaro"**
3. Escolha tipo: **"Clientes"**
4. Clique em **"Escolher arquivo"** ou arraste arquivo

**O que acontece:**

#### Etapa 1: Preview

Você verá uma tabela com:
- **Estatísticas:**
  - 🔵 Total de linhas
  - 🟢 Linhas válidas
  - 🟡 Avisos (duplicatas)
  - 🔴 Erros
  - 🟠 Duplicatas detectadas

- **Mapeamento de Colunas:**
  - Sistema detecta automaticamente
  - Você pode ajustar manualmente
  - Campos obrigatórios marcados com *

- **Validação em Tempo Real:**
  - ✅ Linha válida: fundo verde
  - ⚠️ Linha com aviso: fundo amarelo (ex: duplicata)
  - ❌ Linha com erro: fundo vermelho

#### Etapa 2: Filtros e Busca

Use os botões para filtrar:
- **Todos** - Ver todas as linhas
- **Válidos** - Apenas linhas sem problemas
- **Avisos** - Linhas com avisos (duplicatas)
- **Erros** - Linhas com erros críticos

Use a **busca** para encontrar linhas específicas.

#### Etapa 3: Corrigir Erros (Opcional)

Se houver linhas com erro:
1. Clique em **"Corrigir"** na linha
2. Edite os campos com problema
3. Clique em **"Salvar"**
4. Validação acontece novamente

#### Etapa 4: Confirmar Importação

1. Revise as estatísticas finais
2. Clique em **"Importar X Clientes"**
3. Se houver duplicatas, sistema perguntará se deseja continuar
4. Se houver erros, sistema importará apenas linhas válidas

**Relatório Final:**

Após importação, você verá:
- ✅ Total processados
- ✅ Criados
- ✅ Atualizados
- ✅ Ignorados
- ❌ Erros (com lista detalhada)

### Importar ICS (Calendário)

1. Vá para aba **"Importar Dados"**
2. Selecione aba **"ICS/iCalendar"**
3. Escolha arquivo `.ics` ou `.ical`

**Preview mostrará:**
- Total de eventos encontrados
- Lista de eventos com:
  - Título
  - Data e hora
  - Cliente detectado (se encontrado)

4. Clique em **"Importar X Eventos"**

**O sistema:**
- ✅ Vincula automaticamente a clientes existentes
- ✅ Detecta duplicatas por `ical_uid`
- ✅ Extrai informações (local, descrição, participantes)

---

## ☁️ Google Drive

### Navegar Pastas

1. Vá para aba **"Google Drive"**
2. Visualize estrutura de pastas:

```
📁 Clients/
  └─ 📁 João Silva/
      ├─ 📁 referencias/
      ├─ 📁 desenhos_aprovados/
      └─ 📁 fotos_finais/
```

3. Clique em pastas para navegar
4. Use **breadcrumbs** (topo) para voltar

### Upload de Arquivos

**Método 1: Drag & Drop**
1. Arraste arquivo para a área de upload
2. Barra de progresso aparecerá
3. Arquivo aparece na lista

**Método 2: Botão Upload**
1. Clique em **"Upload"**
2. Selecione arquivo(s)
3. Aguarde upload

**Formatos suportados:**
- Imagens: JPG, PNG, GIF, WEBP
- Documentos: PDF, DOC, DOCX
- Outros: todos suportados pelo Google Drive

### Download de Arquivos

1. Clique no ícone de **"Download"** no arquivo
2. Arquivo será baixado automaticamente

### Mover Arquivos

**Drag & Drop entre pastas:**
1. Arraste arquivo da lista
2. Solte em pasta de destino
3. Confirmação automática

**Ou use o menu:**
1. Clique nos **3 pontos** no arquivo
2. Selecione **"Mover"**
3. Escolha pasta de destino
4. Confirme

### Outras Ações

- **Renomear** - Alterar nome do arquivo
- **Compartilhar** - Gerar link de compartilhamento
- **Excluir** - Mover para lixeira (recuperável)
- **Detalhes** - Ver metadados completos

---

## 📆 Calendário Visual

### Visualizações

1. **Mês** - Visualização mensal completa
2. **Semana** - Semana com horários
3. **Dia** - Dia completo hora a hora

Alterne entre visualizações com os botões no topo.

### Navegar no Calendário

- **← Anterior** - Mês/semana/dia anterior
- **Hoje** - Retornar para hoje
- **Próximo →** - Mês/semana/dia seguinte

### Agendamentos no Calendário

**Cores por Status:**
- 🟦 **Azul:** Agendado
- 🟩 **Verde:** Confirmado
- 🟧 **Laranja:** Em andamento
- 🟥 **Vermelho:** Cancelado

### Drag & Drop (Arrastar e Soltar)

**Mudar data de agendamento:**
1. Clique e segure no agendamento
2. Arraste para nova data
3. Solte
4. Sistema atualiza:
   - ✅ Banco de dados local
   - ✅ Google Calendar automaticamente

**Feedback Visual:**
- Cursor muda para "grabbing"
- Agendamento fica semi-transparente
- Data de destino fica destacada

---

## ❓ Dúvidas Frequentes

### 1. Preciso estar conectado ao Google o tempo todo?

**Não!** O sistema funciona offline localmente.

**Com Google conectado:**
- ✅ Sincronização automática
- ✅ Backup em nuvem
- ✅ Acesso de múltiplos dispositivos

**Sem Google:**
- ✅ CRUD de clientes funciona normalmente
- ✅ CRUD de agendamentos funciona normalmente
- ❌ Sem sincronização com Google Calendar
- ❌ Sem acesso ao Google Drive

### 2. O que acontece se eu criar agendamento no Google Calendar?

O sistema **importa automaticamente** a cada 5 minutos.

**Processo:**
1. Você cria evento no Google Calendar (app mobile, web, etc.)
2. Sistema detecta na próxima sincronização
3. Evento aparece automaticamente no sistema
4. Se encontrar cliente pelo nome, vincula automaticamente

### 3. Posso importar milhares de linhas de uma vez?

**Sim!** O sistema suporta importação em lote.

**Limites:**
- Arquivo Excel: até 20 MB
- Performance testada: 1000+ linhas

**Dicas:**
- Use preview para validar antes
- Corrija erros antes de importar
- Importação processa ~100 linhas/segundo

### 4. Como desfazer uma importação?

**Não há undo automático.**

**Recomendações:**
1. Sempre use **preview** antes
2. Faça **backup do banco** antes de grandes importações
3. Teste com arquivo pequeno primeiro

**Para reverter manualmente:**
- Delete registros criados pela importação
- Use filtro por data de criação

### 5. Posso usar em múltiplos dispositivos?

**Sim,** via Google Calendar!

**Como funciona:**
1. Conecte Google em cada dispositivo
2. Sincronização automática mantém tudo atualizado
3. Banco local em cada dispositivo
4. Google Calendar é a fonte da verdade

**Limitação atual:**
- Banco SQLite é local (não há DB em nuvem)
- Cada dispositivo tem seu próprio banco
- Google Calendar sincroniza agendamentos
- Google Drive sincroniza arquivos

### 6. E se minha internet cair durante upload?

**Sistema é resiliente:**

**Durante upload:**
- Upload pausa automaticamente
- Ao reconectar, upload retoma
- Barra de progresso atualiza

**Durante sincronização:**
- Sincronização falha silenciosamente
- Próxima tentativa em 5 minutos
- Badge mostra "Erro na sincronização" (3s)
- Dados locais permanecem íntegros

---

## 🔧 Troubleshooting

### Problema: "Google desconectado"

**Causas possíveis:**
1. Token expirado
2. Permissões revogadas
3. Credenciais inválidas

**Solução:**
1. Clique em "Conectar Google" novamente
2. Re-autorize o acesso
3. Sistema renova token automaticamente

### Problema: "Erro ao sincronizar"

**Causas possíveis:**
1. Sem internet
2. Google Calendar API offline
3. Quota excedida (raro)

**Solução:**
1. Verifique conexão com internet
2. Aguarde 5 minutos (próxima tentativa automática)
3. Ou clique no badge para sincronizar manualmente

### Problema: "Arquivo não foi importado"

**Causas possíveis:**
1. Formato de arquivo inválido
2. Colunas não mapeadas corretamente
3. Todas as linhas têm erros críticos

**Solução:**
1. Verifique se arquivo é `.xlsx`, `.xls` ou `.ics`
2. Revise mapeamento de colunas no preview
3. Corrija erros nas linhas antes de importar
4. Veja lista de erros no relatório final

### Problema: Upload para Google Drive falha

**Causas possíveis:**
1. Arquivo muito grande (>100 MB)
2. Quota do Google Drive esgotada
3. Permissões insuficientes

**Solução:**
1. Comprima arquivo antes de upload
2. Verifique espaço disponível no Google Drive
3. Reconecte Google e re-autorize permissões

### Problema: Duplicatas não foram detectadas

**Causas possíveis:**
1. Telefones em formatos diferentes
2. Emails com maiúsculas/minúsculas diferentes
3. Nomes escritos diferente

**Como o sistema detecta:**
- **Telefone:** Normalizado para +55 XX XXXXX-XXXX
- **Email:** Normalizado para lowercase
- **Nome:** Comparação case-insensitive + similaridade

**Dica:**
- Padronize dados antes de importar
- Use preview para ver avisos de duplicatas
- Sistema normaliza automaticamente

### Problema: Performance lenta

**Causas possíveis:**
1. Muitos arquivos/registros
2. Sincronização em background
3. Upload em andamento

**Soluções:**
1. Feche abas não utilizadas
2. Aguarde sincronização completar
3. Limpe cache do navegador
4. Reinicie servidor se necessário

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

1. Verifique a [Documentação Técnica](RELATORIO_FINAL_EXECUCAO_AUTONOMA.md)
2. Consulte os [Relatórios de Fase](FASE_1_VALIDACAO_COMPLETA.md)
3. Abra uma issue no GitHub

---

## 🎓 Resumo de Atalhos

| Ação | Como Fazer |
|------|------------|
| **Novo Cliente** | Clientes → Novo Cliente |
| **Novo Agendamento** | Agendamentos → Novo Agendamento |
| **Sincronizar Manualmente** | Clique no badge de sincronização |
| **Importar Excel** | Importar Dados → Excel → Upload |
| **Upload Google Drive** | Google Drive → Upload ou Drag & Drop |
| **Mudar Data de Agendamento** | Calendário → Arrastar agendamento |
| **Ver Histórico de Cliente** | Clientes → Clique no nome |

---

**🎉 Pronto! Você está preparado para usar o TattooScheduler.**

**Aproveite a organização automática e a sincronização perfeita com Google! 🚀**

