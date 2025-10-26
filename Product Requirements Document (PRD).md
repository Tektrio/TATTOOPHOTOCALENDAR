# Product Requirements Document (PRD)
## TattooScheduler Visual System - Sistema de Agenda Visual para Tatuadores

---

### **Documento de Requisitos do Produto**
- **Produto**: TattooScheduler Visual System
- **Versão**: 1.0
- **Data**: Outubro 2025
- **Autor**: Equipe de Desenvolvimento
- **Status**: Desenvolvimento

---

## 📋 **1. VISÃO GERAL DO PRODUTO**

### **1.1 Resumo Executivo**
O TattooScheduler Visual System é uma aplicação híbrida revolucionária que combina as funcionalidades do Mylio Photos com um sistema de agenda específico para tatuadores. O sistema organiza automaticamente fotos de tatuagens por data e cliente, integra com Google Calendar e Google Drive, e apresenta uma interface visual temporal similar ao Mylio para navegação intuitiva do histórico de trabalhos.

### **1.2 Problema a Resolver**
- **Desorganização**: Tatuadores possuem milhares de fotos sem organização temporal
- **Agenda Desconectada**: Agendamentos separados das fotos dos trabalhos
- **Busca Ineficiente**: Dificuldade para encontrar trabalhos específicos por data/cliente
- **Backup Manual**: Risco de perda de portfólio por falta de backup automático
- **Interface Inadequada**: Ferramentas genéricas não atendem necessidades específicas

### **1.3 Solução Proposta**
Sistema visual temporal que:
- **Organiza automaticamente** fotos por data e cliente
- **Integra agenda** com visualização das fotos no calendário
- **Sincroniza** com Google Drive e Google Calendar
- **Interface temporal** similar ao Mylio Photos
- **Busca inteligente** por cliente, data, tipo de trabalho
- **Backup automático** e sincronização em nuvem

---

## 🎯 **2. OBJETIVOS DO PRODUTO**

### **2.1 Objetivos Primários**
1. **Organização Temporal Automática**: Sistema que organiza fotos automaticamente por data, similar ao Mylio
2. **Integração Agenda-Fotos**: Conectar agendamentos do Google Calendar com fotos correspondentes
3. **Interface Visual Intuitiva**: Navegação temporal por anos, meses e dias com preview das fotos
4. **Sincronização Automática**: Backup e organização automática no Google Drive
5. **Busca Eficiente**: Encontrar rapidamente trabalhos por cliente, data ou características

### **2.2 Objetivos Secundários**
1. **Sistema de Orçamentos**: Calculadora integrada para precificação
2. **Notificações Automáticas**: Lembretes e cuidados pós-tatuagem
3. **Relatórios Visuais**: Analytics do portfólio e produtividade
4. **Compartilhamento**: Envio fácil de fotos para clientes
5. **Portfólio Automático**: Geração automática de portfólio organizado

---

## 👥 **3. PERSONAS E CASOS DE USO**

### **3.1 Persona Principal: Tatuador Profissional**
- **Perfil**: Tatuador com 2-10 anos de experiência
- **Necessidades**: Organizar portfólio, agendar clientes, precificar trabalhos
- **Dores**: Fotos desorganizadas, agenda manual, dificuldade de busca
- **Tecnologia**: Smartphone, computador, Google Account

### **3.2 Casos de Uso Principais**

#### **UC1: Visualização Temporal do Portfólio**
- **Ator**: Tatuador
- **Objetivo**: Navegar visualmente pelo histórico de trabalhos
- **Fluxo**: 
  1. Abre o sistema
  2. Visualiza timeline por anos (como Mylio)
  3. Clica em um ano para ver meses
  4. Clica em mês para ver dias
  5. Visualiza fotos do dia selecionado

#### **UC2: Criação Automática de Pastas por Cliente**
- **Ator**: Sistema
- **Objetivo**: Organizar automaticamente fotos por cliente
- **Fluxo**:
  1. Sistema detecta novo agendamento no Google Calendar
  2. Extrai nome e telefone do cliente
  3. Cria pasta no Google Drive: "Cliente_Nome_Telefone"
  4. Organiza subpastas: Referencias, Desenhos, Fotos_Finais
  5. Sincroniza estrutura localmente

#### **UC3: Agendamento com Visualização de Histórico**
- **Ator**: Tatuador
- **Objetivo**: Agendar cliente vendo trabalhos anteriores
- **Fluxo**:
  1. Cria agendamento no Google Calendar
  2. Sistema identifica cliente pelo nome/telefone
  3. Busca pasta existente do cliente
  4. Exibe fotos anteriores no calendário
  5. Permite adicionar novas fotos à pasta

#### **UC4: Busca Inteligente por Cliente**
- **Ator**: Tatuador
- **Objetivo**: Encontrar rapidamente trabalhos de um cliente
- **Fluxo**:
  1. Digite nome ou telefone na busca
  2. Sistema localiza pasta do cliente
  3. Exibe timeline das fotos do cliente
  4. Permite navegação temporal específica
  5. Mostra agendamentos futuros

---

## 🏗️ **4. ARQUITETURA E FUNCIONALIDADES**

### **4.1 Arquitetura do Sistema**

#### **4.1.1 Frontend (React + Electron)**
```
TattooScheduler/
├── src/
│   ├── components/
│   │   ├── Timeline/
│   │   │   ├── YearView.jsx          # Vista por anos (como Mylio)
│   │   │   ├── MonthView.jsx         # Vista por meses
│   │   │   ├── DayView.jsx           # Vista por dias
│   │   │   └── PhotoGrid.jsx         # Grid de fotos
│   │   ├── Calendar/
│   │   │   ├── CalendarView.jsx      # Calendário com fotos
│   │   │   ├── EventCard.jsx         # Card de agendamento
│   │   │   └── PhotoPreview.jsx      # Preview das fotos
│   │   ├── Search/
│   │   │   ├── SearchBar.jsx         # Barra de busca
│   │   │   ├── FilterPanel.jsx       # Filtros avançados
│   │   │   └── ResultsGrid.jsx       # Resultados da busca
│   │   └── Client/
│   │       ├── ClientProfile.jsx     # Perfil do cliente
│   │       ├── ClientTimeline.jsx    # Timeline do cliente
│   │       └── ClientFolders.jsx     # Pastas do cliente
│   ├── services/
│   │   ├── GoogleCalendar.js         # Integração Google Calendar
│   │   ├── GoogleDrive.js            # Integração Google Drive
│   │   ├── PhotoOrganizer.js         # Organizador de fotos
│   │   └── SyncManager.js            # Gerenciador de sincronização
│   └── utils/
│       ├── DateUtils.js              # Utilitários de data
│       ├── PhotoUtils.js             # Utilitários de foto
│       └── ClientMatcher.js          # Matching de clientes
```

#### **4.1.2 Backend (Node.js + Express)**
```
server/
├── routes/
│   ├── calendar.js                   # Rotas do calendário
│   ├── photos.js                     # Rotas das fotos
│   ├── clients.js                    # Rotas dos clientes
│   └── sync.js                       # Rotas de sincronização
├── services/
│   ├── GoogleCalendarService.js      # Serviço Google Calendar
│   ├── GoogleDriveService.js         # Serviço Google Drive
│   ├── PhotoOrganizerService.js      # Organizador de fotos
│   ├── ClientMatchingService.js      # Matching de clientes
│   └── FolderManagerService.js       # Gerenciador de pastas
├── models/
│   ├── Client.js                     # Modelo de cliente
│   ├── Appointment.js                # Modelo de agendamento
│   ├── Photo.js                      # Modelo de foto
│   └── Folder.js                     # Modelo de pasta
└── utils/
    ├── DateParser.js                 # Parser de datas
    ├── NameMatcher.js                # Matcher de nomes
    └── PhoneNormalizer.js            # Normalizador de telefones
```

### **4.2 Funcionalidades Principais**

#### **4.2.1 Sistema de Organização Temporal (Inspirado no Mylio)**

##### **Timeline por Anos**
- **Interface**: Grid de anos com foto representativa de cada ano
- **Navegação**: Clique em ano para expandir meses
- **Indicadores**: Quantidade de fotos por ano
- **Filtros**: Por tipo de trabalho, cliente, localização corporal

##### **Timeline por Meses**
- **Interface**: Grid de meses com fotos representativas
- **Navegação**: Clique em mês para expandir dias
- **Indicadores**: Agendamentos do mês, fotos por mês
- **Preview**: Hover mostra preview das fotos principais

##### **Timeline por Dias**
- **Interface**: Calendário com fotos nos dias
- **Detalhes**: Nome do cliente, tipo de trabalho, fotos
- **Navegação**: Clique no dia para ver galeria completa
- **Agendamentos**: Integração com Google Calendar

#### **4.2.2 Sistema de Pastas Automáticas**

##### **Estrutura de Pastas no Google Drive**
```
TattooScheduler_Portfolio/
├── 2024/
│   ├── Janeiro/
│   │   ├── Cliente_João_Silva_11999999999/
│   │   │   ├── 01_Referencias/
│   │   │   ├── 02_Desenhos_Aprovados/
│   │   │   ├── 03_Processo/
│   │   │   ├── 04_Fotos_Finais/
│   │   │   └── 05_Cuidados_Pos_Tatuagem/
│   │   └── Cliente_Maria_Santos_11888888888/
│   │       ├── 01_Referencias/
│   │       ├── 02_Desenhos_Aprovados/
│   │       ├── 03_Processo/
│   │       ├── 04_Fotos_Finais/
│   │       └── 05_Cuidados_Pos_Tatuagem/
│   └── Fevereiro/
└── 2025/
```

##### **Criação Automática de Pastas**
1. **Trigger**: Novo evento no Google Calendar
2. **Extração**: Nome e telefone do cliente
3. **Normalização**: Remove caracteres especiais, padroniza formato
4. **Verificação**: Checa se pasta já existe
5. **Criação**: Cria estrutura completa de pastas
6. **Sincronização**: Replica estrutura localmente

#### **4.2.3 Integração Google Calendar**

##### **Sincronização Bidirecional**
- **Leitura**: Importa eventos existentes
- **Escrita**: Cria novos agendamentos
- **Atualização**: Sincroniza mudanças em tempo real
- **Detecção**: Identifica novos clientes automaticamente

##### **Enriquecimento de Eventos**
- **Fotos**: Adiciona fotos do cliente no evento
- **Histórico**: Mostra trabalhos anteriores
- **Orçamento**: Integra calculadora de preços
- **Lembretes**: Configura notificações automáticas

#### **4.2.4 Sistema de Busca Inteligente**

##### **Busca por Cliente**
- **Input**: Nome parcial ou telefone
- **Matching**: Algoritmo fuzzy para nomes similares
- **Resultados**: Timeline específica do cliente
- **Filtros**: Por período, tipo de trabalho

##### **Busca por Data**
- **Navegação**: Calendário interativo
- **Período**: Busca por range de datas
- **Visualização**: Grid de fotos do período
- **Detalhes**: Informações dos agendamentos

##### **Busca por Características**
- **Tags**: Sistema de tags automáticas
- **Localização**: Parte do corpo tatuada
- **Estilo**: Realismo, tradicional, aquarela, etc.
- **Cores**: Preto e cinza, colorida

### **4.3 Interface do Usuário**

#### **4.3.1 Tela Principal - Timeline (Inspirada no Mylio)**

##### **Vista por Anos**
```
┌─────────────────────────────────────────────────────────────────┐
│ TattooScheduler                                    [Busca] [⚙️] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                  │
│  │2020 │  │2021 │  │2022 │  │2023 │  │2024 │                  │
│  │ 45  │  │ 127 │  │ 203 │  │ 189 │  │ 156 │                  │
│  │fotos│  │fotos│  │fotos│  │fotos│  │fotos│                  │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                  │
│                                                                 │
│  [Foto representativa de cada ano como background]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### **Vista por Meses (Ao clicar em um ano)**
```
┌─────────────────────────────────────────────────────────────────┐
│ ← 2024                                             [Busca] [⚙️] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │
│ │Jan │ │Fev │ │Mar │ │Abr │ │Mai │ │Jun │                     │
│ │ 12 │ │ 18 │ │ 15 │ │ 22 │ │ 19 │ │ 14 │                     │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                     │
│                                                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │
│ │Jul │ │Ago │ │Set │ │Out │ │Nov │ │Dez │                     │
│ │ 16 │ │ 20 │ │ 13 │ │ 17 │ │ 11 │ │  9 │                     │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                     │
│                                                                 │
│ [Fotos representativas de cada mês como background]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### **Vista Calendário (Ao clicar em um mês)**
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Fevereiro 2024                                   [Busca] [⚙️] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Dom    Seg    Ter    Qua    Qui    Sex    Sab              │
│                                    1      2      3              │
│                               [📷]   [📷]                       │
│                                                                 │
│      4      5      6      7      8      9     10              │
│    [📷]          [📷]   [📷]                  [📷]              │
│   João           Maria   Pedro              Ana                │
│                                                                 │
│     11     12     13     14     15     16     17              │
│          [📷]          [📷]   [📷]                              │
│         Carlos         Lucas   Sofia                           │
│                                                                 │
│ [Fotos dos trabalhos aparecem nos dias correspondentes]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **4.3.2 Tela de Busca**

##### **Busca por Cliente**
```
┌─────────────────────────────────────────────────────────────────┐
│ Buscar Cliente: [João Silva                    ] [🔍]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Resultados para "João Silva":                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📱 João Silva - (11) 99999-9999                            │ │
│ │ 📅 Último trabalho: 15/02/2024                             │ │
│ │ 🎨 Trabalhos: 3 | 📷 Fotos: 45                             │ │
│ │                                                             │ │
│ │ Timeline do Cliente:                                        │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐                                    │ │
│ │ │Jan  │ │Fev  │ │Mar  │                                    │ │
│ │ │2024 │ │2024 │ │2024 │                                    │ │
│ │ │ 15  │ │ 20  │ │ 10  │                                    │ │
│ │ │fotos│ │fotos│ │fotos│                                    │ │
│ │ └─────┘ └─────┘ └─────┘                                    │ │
│ │                                                             │ │
│ │ [Ver Pasta no Drive] [Novo Agendamento] [Histórico]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **4.3.3 Tela de Agendamento com Histórico**

```
┌─────────────────────────────────────────────────────────────────┐
│ Novo Agendamento                                    [Salvar]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Cliente: [João Silva                              ] [📋]        │
│ Telefone: [(11) 99999-9999                       ]             │
│ Data: [15/03/2024] Hora: [14:00] Duração: [3h]                │
│                                                                 │
│ ┌─── Histórico do Cliente ────────────────────────────────────┐ │
│ │                                                             │ │
│ │ Trabalhos Anteriores:                                       │ │
│ │                                                             │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │ │
│ │ │15/01/24 │ │22/02/24 │ │         │                        │ │
│ │ │Braço    │ │Perna    │ │ Novo    │                        │ │
│ │ │Direito  │ │Esquerda │ │Trabalho │                        │ │
│ │ │[📷📷📷] │ │[📷📷📷] │ │   ?     │                        │ │
│ │ └─────────┘ └─────────┘ └─────────┘                        │ │
│ │                                                             │ │
│ │ [Ver Pasta Completa] [Adicionar Referências]               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Tipo: [Colorida ▼] Localização: [Braço Esquerdo ▼]            │
│ Orçamento: [R$ 800,00] Status: [Confirmado ▼]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **5. ESPECIFICAÇÕES TÉCNICAS**

### **5.1 Tecnologias**

#### **5.1.1 Frontend**
- **Framework**: React 18+ com TypeScript
- **Desktop**: Electron para aplicação desktop
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: Zustand para gerenciamento de estado
- **Roteamento**: React Router
- **Imagens**: React Image Gallery, React Zoom Pan Pinch
- **Calendário**: FullCalendar.js
- **Timeline**: Custom components inspirados no Mylio

#### **5.1.2 Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Banco**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **ORM**: Prisma
- **Autenticação**: OAuth2 (Google)
- **APIs**: Google Calendar API, Google Drive API
- **Upload**: Multer para upload de arquivos
- **Processamento**: Sharp para otimização de imagens

#### **5.1.3 Integrações**
- **Google Calendar API**: Sincronização de eventos
- **Google Drive API**: Armazenamento e organização
- **Google Photos API**: Backup adicional (opcional)
- **WhatsApp Business API**: Notificações (opcional)
- **SMTP**: Envio de emails

### **5.2 Banco de Dados**

#### **5.2.1 Esquema Principal**
```sql
-- Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    google_drive_folder_id VARCHAR(255),
    first_appointment DATE,
    last_appointment DATE,
    total_appointments INTEGER DEFAULT 0,
    total_photos INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    google_event_id VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location_body VARCHAR(100),
    tattoo_type VARCHAR(50),
    estimated_price DECIMAL(10,2),
    actual_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fotos
CREATE TABLE photos (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    appointment_id UUID REFERENCES appointments(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    google_drive_file_id VARCHAR(255),
    local_path VARCHAR(500),
    cloud_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    category VARCHAR(50) DEFAULT 'final', -- referencias, desenhos, processo, final
    taken_at TIMESTAMP,
    file_size INTEGER,
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    tags TEXT[], -- Array de tags
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pastas
CREATE TABLE folders (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    google_drive_folder_id VARCHAR(255) UNIQUE,
    folder_name VARCHAR(255) NOT NULL,
    folder_path VARCHAR(500),
    category VARCHAR(50), -- referencias, desenhos, processo, final
    photo_count INTEGER DEFAULT 0,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Timeline Cache (para performance)
CREATE TABLE timeline_cache (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER,
    day INTEGER,
    client_count INTEGER DEFAULT 0,
    photo_count INTEGER DEFAULT 0,
    appointment_count INTEGER DEFAULT 0,
    representative_photo_id UUID REFERENCES photos(id),
    last_updated TIMESTAMP DEFAULT NOW()
);
```

### **5.3 APIs e Integrações**

#### **5.3.1 Google Calendar API**
```javascript
// Exemplo de integração
class GoogleCalendarService {
    async syncEvents() {
        const events = await this.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime'
        });
        
        for (const event of events.data.items) {
            await this.processEvent(event);
        }
    }
    
    async processEvent(event) {
        const clientInfo = this.extractClientInfo(event);
        if (clientInfo) {
            await this.createOrUpdateClient(clientInfo);
            await this.createFolderStructure(clientInfo);
        }
    }
    
    extractClientInfo(event) {
        // Extrai nome e telefone do título ou descrição
        const title = event.summary;
        const description = event.description || '';
        
        const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
        const phone = title.match(phoneRegex) || description.match(phoneRegex);
        
        const name = title.replace(phoneRegex, '').trim();
        
        return { name, phone: phone?.[0] };
    }
}
```

#### **5.3.2 Google Drive API**
```javascript
class GoogleDriveService {
    async createClientFolder(clientName, clientPhone) {
        const folderName = `Cliente_${clientName}_${clientPhone}`;
        const year = new Date().getFullYear();
        const month = new Date().toLocaleString('pt-BR', { month: 'long' });
        
        // Estrutura: TattooScheduler_Portfolio/2024/Janeiro/Cliente_Nome_Telefone/
        const yearFolder = await this.ensureFolder(`${year}`, this.rootFolderId);
        const monthFolder = await this.ensureFolder(month, yearFolder.id);
        const clientFolder = await this.ensureFolder(folderName, monthFolder.id);
        
        // Criar subpastas
        const subfolders = [
            '01_Referencias',
            '02_Desenhos_Aprovados', 
            '03_Processo',
            '04_Fotos_Finais',
            '05_Cuidados_Pos_Tatuagem'
        ];
        
        for (const subfolder of subfolders) {
            await this.ensureFolder(subfolder, clientFolder.id);
        }
        
        return clientFolder;
    }
    
    async syncPhotos(clientId) {
        const client = await this.db.clients.findById(clientId);
        const folder = await this.drive.files.list({
            q: `'${client.google_drive_folder_id}' in parents`,
            fields: 'files(id, name, mimeType, createdTime, size)'
        });
        
        for (const file of folder.data.files) {
            if (file.mimeType.startsWith('image/')) {
                await this.processPhoto(file, clientId);
            }
        }
    }
}
```

### **5.4 Sistema de Organização Temporal**

#### **5.4.1 Timeline Generator**
```javascript
class TimelineGenerator {
    async generateYearView() {
        const years = await this.db.query(`
            SELECT 
                EXTRACT(YEAR FROM taken_at) as year,
                COUNT(*) as photo_count,
                COUNT(DISTINCT client_id) as client_count,
                MIN(taken_at) as first_photo,
                MAX(taken_at) as last_photo
            FROM photos 
            WHERE taken_at IS NOT NULL
            GROUP BY EXTRACT(YEAR FROM taken_at)
            ORDER BY year DESC
        `);
        
        for (const year of years) {
            year.representative_photo = await this.getRepresentativePhoto(year.year);
        }
        
        return years;
    }
    
    async generateMonthView(year) {
        const months = await this.db.query(`
            SELECT 
                EXTRACT(MONTH FROM taken_at) as month,
                COUNT(*) as photo_count,
                COUNT(DISTINCT client_id) as client_count
            FROM photos 
            WHERE EXTRACT(YEAR FROM taken_at) = $1
            GROUP BY EXTRACT(MONTH FROM taken_at)
            ORDER BY month
        `, [year]);
        
        return months.map(month => ({
            ...month,
            name: new Date(year, month.month - 1).toLocaleString('pt-BR', { month: 'long' }),
            representative_photo: this.getRepresentativePhoto(year, month.month)
        }));
    }
    
    async generateDayView(year, month) {
        const days = await this.db.query(`
            SELECT 
                DATE(taken_at) as date,
                COUNT(*) as photo_count,
                ARRAY_AGG(DISTINCT client_id) as clients,
                ARRAY_AGG(id ORDER BY taken_at) as photos
            FROM photos 
            WHERE EXTRACT(YEAR FROM taken_at) = $1 
            AND EXTRACT(MONTH FROM taken_at) = $2
            GROUP BY DATE(taken_at)
            ORDER BY date
        `, [year, month]);
        
        return days;
    }
}
```

---

## 📱 **6. INTERFACE E EXPERIÊNCIA DO USUÁRIO**

### **6.1 Princípios de Design**

#### **6.1.1 Visual Timeline First**
- **Inspiração**: Mylio Photos - navegação temporal intuitiva
- **Hierarquia**: Anos → Meses → Dias → Fotos
- **Contexto**: Sempre mostrar onde o usuário está na timeline
- **Transições**: Animações suaves entre níveis

#### **6.1.2 Photo-Centric Interface**
- **Protagonismo**: Fotos são o elemento principal
- **Preview**: Hover para preview rápido
- **Zoom**: Zoom nativo nas fotos
- **Navegação**: Setas para navegar entre fotos

#### **6.1.3 Client-Aware System**
- **Reconhecimento**: Sistema reconhece clientes automaticamente
- **Histórico**: Sempre mostra trabalhos anteriores
- **Contexto**: Informações do cliente sempre visíveis

### **6.2 Fluxos de Usuário**

#### **6.2.1 Fluxo Principal: Navegação Temporal**
```
Início → Timeline Anos → Seleciona Ano → Timeline Meses → 
Seleciona Mês → Calendário Dias → Seleciona Dia → 
Galeria Fotos → Visualização Individual
```

#### **6.2.2 Fluxo Secundário: Busca por Cliente**
```
Busca → Digite Nome → Resultados → Seleciona Cliente → 
Timeline Cliente → Seleciona Período → Galeria Fotos
```

#### **6.2.3 Fluxo de Agendamento**
```
Novo Agendamento → Preenche Dados → Sistema Busca Cliente → 
Mostra Histórico → Confirma Agendamento → Cria Pastas → 
Sincroniza Google Calendar
```

### **6.3 Componentes de Interface**

#### **6.3.1 Timeline Component**
```jsx
const TimelineView = ({ level, data, onNavigate }) => {
    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <BreadcrumbNav path={currentPath} />
                <SearchBar />
                <ViewControls />
            </div>
            
            <div className="timeline-grid">
                {data.map(item => (
                    <TimelineCard 
                        key={item.id}
                        data={item}
                        onClick={() => onNavigate(item)}
                        representativePhoto={item.representative_photo}
                        stats={item.stats}
                    />
                ))}
            </div>
        </div>
    );
};
```

#### **6.3.2 Calendar Component**
```jsx
const CalendarView = ({ year, month, appointments, photos }) => {
    return (
        <div className="calendar-container">
            <CalendarHeader year={year} month={month} />
            
            <div className="calendar-grid">
                {generateCalendarDays(year, month).map(day => (
                    <CalendarDay
                        key={day.date}
                        date={day.date}
                        appointments={getAppointmentsForDay(day.date)}
                        photos={getPhotosForDay(day.date)}
                        onClick={() => openDayView(day.date)}
                    />
                ))}
            </div>
        </div>
    );
};
```

#### **6.3.3 Photo Gallery Component**
```jsx
const PhotoGallery = ({ photos, client, date }) => {
    return (
        <div className="gallery-container">
            <GalleryHeader client={client} date={date} />
            
            <div className="gallery-grid">
                {photos.map(photo => (
                    <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => openPhotoViewer(photo)}
                        onTag={() => openTagEditor(photo)}
                    />
                ))}
            </div>
            
            <PhotoViewer 
                photos={photos}
                currentIndex={selectedPhotoIndex}
                onClose={() => setSelectedPhotoIndex(-1)}
            />
        </div>
    );
};
```

---

## 🔄 **7. INTEGRAÇÕES E SINCRONIZAÇÃO**

### **7.1 Google Calendar Integration**

#### **7.1.1 Webhook Configuration**
```javascript
// Configuração de webhook para mudanças no calendário
const setupCalendarWebhook = async () => {
    const webhook = await calendar.events.watch({
        calendarId: 'primary',
        requestBody: {
            id: uuidv4(),
            type: 'web_hook',
            address: `${process.env.WEBHOOK_URL}/calendar/webhook`
        }
    });
    
    return webhook;
};

// Handler do webhook
app.post('/calendar/webhook', async (req, res) => {
    const { headers } = req;
    
    if (headers['x-goog-resource-state'] === 'sync') {
        await syncAllEvents();
    } else if (headers['x-goog-resource-state'] === 'exists') {
        await syncRecentEvents();
    }
    
    res.status(200).send('OK');
});
```

#### **7.1.2 Event Processing**
```javascript
class EventProcessor {
    async processEvent(event) {
        const clientInfo = this.extractClientInfo(event);
        
        if (!clientInfo.name || !clientInfo.phone) {
            console.log('Evento sem informações de cliente:', event.summary);
            return;
        }
        
        // Busca ou cria cliente
        let client = await this.findClientByPhone(clientInfo.phone);
        if (!client) {
            client = await this.createClient(clientInfo);
        }
        
        // Cria ou atualiza agendamento
        const appointment = await this.createOrUpdateAppointment(event, client);
        
        // Cria estrutura de pastas se necessário
        if (!client.google_drive_folder_id) {
            await this.createClientFolderStructure(client);
        }
        
        return { client, appointment };
    }
    
    extractClientInfo(event) {
        const title = event.summary || '';
        const description = event.description || '';
        const text = `${title} ${description}`;
        
        // Regex para telefone brasileiro
        const phoneRegex = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)(?:9\s?)?\d{4,5}[-\s]?\d{4}/g;
        const phones = text.match(phoneRegex);
        
        // Remove telefone do texto para extrair nome
        let name = title.replace(phoneRegex, '').trim();
        
        // Remove palavras comuns de agendamento
        const commonWords = ['tatuagem', 'tattoo', 'sessao', 'sessão', 'retoque'];
        commonWords.forEach(word => {
            name = name.replace(new RegExp(word, 'gi'), '').trim();
        });
        
        return {
            name: name || 'Cliente',
            phone: phones?.[0]?.replace(/\D/g, '') || null,
            originalTitle: title
        };
    }
}
```

### **7.2 Google Drive Integration**

#### **7.2.1 Folder Structure Management**
```javascript
class FolderManager {
    async createClientFolderStructure(client) {
        const rootFolder = await this.ensureRootFolder();
        const yearFolder = await this.ensureYearFolder(new Date().getFullYear());
        const monthFolder = await this.ensureMonthFolder(new Date());
        
        const clientFolderName = this.generateClientFolderName(client);
        const clientFolder = await this.createFolder(clientFolderName, monthFolder.id);
        
        // Criar subpastas
        const subfolders = [
            { name: '01_Referencias', description: 'Imagens de referência enviadas pelo cliente' },
            { name: '02_Desenhos_Aprovados', description: 'Desenhos finalizados e aprovados' },
            { name: '03_Processo', description: 'Fotos durante o processo de tatuagem' },
            { name: '04_Fotos_Finais', description: 'Fotos finais da tatuagem concluída' },
            { name: '05_Cuidados_Pos_Tatuagem', description: 'Instruções e acompanhamento' }
        ];
        
        const createdSubfolders = {};
        for (const subfolder of subfolders) {
            const folder = await this.createFolder(subfolder.name, clientFolder.id);
            createdSubfolders[subfolder.name] = folder;
        }
        
        // Atualizar cliente com ID da pasta
        await this.db.clients.update(client.id, {
            google_drive_folder_id: clientFolder.id,
            folder_structure: createdSubfolders
        });
        
        return clientFolder;
    }
    
    generateClientFolderName(client) {
        const name = client.name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const phone = client.phone || 'SemTelefone';
        return `Cliente_${name}_${phone}`;
    }
    
    async syncFolderContents(clientId) {
        const client = await this.db.clients.findById(clientId);
        if (!client.google_drive_folder_id) return;
        
        const files = await this.drive.files.list({
            q: `'${client.google_drive_folder_id}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, mimeType, createdTime, size, parents, imageMediaMetadata)'
        });
        
        for (const file of files.data.files) {
            await this.processImageFile(file, client);
        }
    }
}
```

### **7.3 Real-time Synchronization**

#### **7.3.1 Sync Manager**
```javascript
class SyncManager {
    constructor() {
        this.syncInterval = 5 * 60 * 1000; // 5 minutos
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.syncLoop();
    }
    
    async syncLoop() {
        while (this.isRunning) {
            try {
                await this.performSync();
            } catch (error) {
                console.error('Erro na sincronização:', error);
            }
            
            await this.sleep(this.syncInterval);
        }
    }
    
    async performSync() {
        console.log('Iniciando sincronização...');
        
        // 1. Sincronizar eventos do Google Calendar
        await this.syncCalendarEvents();
        
        // 2. Sincronizar arquivos do Google Drive
        await this.syncDriveFiles();
        
        // 3. Atualizar cache da timeline
        await this.updateTimelineCache();
        
        // 4. Notificar frontend sobre mudanças
        this.notifyFrontend('sync_completed');
        
        console.log('Sincronização concluída');
    }
    
    async syncCalendarEvents() {
        const lastSync = await this.getLastSyncTime('calendar');
        const events = await this.calendar.events.list({
            calendarId: 'primary',
            updatedMin: lastSync,
            maxResults: 100
        });
        
        for (const event of events.data.items) {
            await this.eventProcessor.processEvent(event);
        }
        
        await this.updateLastSyncTime('calendar');
    }
}
```

---

## 📊 **8. ANALYTICS E RELATÓRIOS**

### **8.1 Dashboard Analytics**

#### **8.1.1 Métricas Principais**
- **Produtividade**: Tatuagens por mês/semana
- **Clientes**: Novos vs recorrentes
- **Portfólio**: Crescimento do número de fotos
- **Receita**: Faturamento por período
- **Tempo**: Tempo médio por tatuagem

#### **8.1.2 Visualizações**
```jsx
const AnalyticsDashboard = () => {
    return (
        <div className="analytics-dashboard">
            <div className="metrics-grid">
                <MetricCard 
                    title="Tatuagens este mês"
                    value={monthlyTattoos}
                    trend={monthlyTrend}
                    icon="🎨"
                />
                
                <MetricCard 
                    title="Novos clientes"
                    value={newClients}
                    trend={clientTrend}
                    icon="👥"
                />
                
                <MetricCard 
                    title="Fotos no portfólio"
                    value={totalPhotos}
                    trend={photoTrend}
                    icon="📷"
                />
                
                <MetricCard 
                    title="Faturamento"
                    value={monthlyRevenue}
                    trend={revenueTrend}
                    icon="💰"
                />
            </div>
            
            <div className="charts-grid">
                <Chart 
                    type="line"
                    title="Produtividade Mensal"
                    data={productivityData}
                />
                
                <Chart 
                    type="pie"
                    title="Tipos de Tatuagem"
                    data={tattooTypesData}
                />
                
                <Chart 
                    type="bar"
                    title="Clientes por Mês"
                    data={clientsData}
                />
            </div>
        </div>
    );
};
```

---

## 🔒 **9. SEGURANÇA E PRIVACIDADE**

### **9.1 Proteção de Dados**

#### **9.1.1 Criptografia**
- **Em trânsito**: HTTPS/TLS 1.3
- **Em repouso**: Criptografia AES-256
- **Tokens**: JWT com rotação automática
- **Senhas**: Bcrypt com salt

#### **9.1.2 Backup e Recuperação**
```javascript
class BackupManager {
    async createBackup() {
        const timestamp = new Date().toISOString();
        const backupData = {
            clients: await this.db.clients.findAll(),
            appointments: await this.db.appointments.findAll(),
            photos: await this.db.photos.findAll(),
            metadata: {
                version: process.env.APP_VERSION,
                timestamp,
                total_records: 0
            }
        };
        
        // Criptografar backup
        const encrypted = await this.encrypt(JSON.stringify(backupData));
        
        // Salvar localmente e no Google Drive
        await this.saveBackup(encrypted, timestamp);
        
        return { success: true, timestamp };
    }
    
    async restoreBackup(backupFile) {
        const decrypted = await this.decrypt(backupFile);
        const data = JSON.parse(decrypted);
        
        // Validar integridade
        if (!this.validateBackup(data)) {
            throw new Error('Backup corrompido');
        }
        
        // Restaurar dados
        await this.db.transaction(async (trx) => {
            await trx('clients').del();
            await trx('appointments').del();
            await trx('photos').del();
            
            await trx('clients').insert(data.clients);
            await trx('appointments').insert(data.appointments);
            await trx('photos').insert(data.photos);
        });
        
        return { success: true };
    }
}
```

---

## 🚀 **10. ROADMAP E FASES DE DESENVOLVIMENTO**

### **10.1 Fase 1: MVP (Meses 1-2)**

#### **Funcionalidades Essenciais**
- ✅ Timeline básica (Anos → Meses → Dias)
- ✅ Integração Google Calendar (leitura)
- ✅ Criação automática de pastas no Google Drive
- ✅ Upload e organização básica de fotos
- ✅ Busca simples por cliente
- ✅ Interface desktop (Electron)

#### **Critérios de Sucesso**
- Sistema organiza fotos automaticamente por data
- Cria pastas para novos clientes do Google Calendar
- Interface permite navegação temporal intuitiva
- Backup básico funcionando

### **10.2 Fase 2: Funcionalidades Avançadas (Meses 3-4)**

#### **Novas Funcionalidades**
- 🔄 Sincronização bidirecional Google Calendar
- 🏷️ Sistema de tags automáticas
- 🔍 Busca avançada com filtros
- 📊 Dashboard com analytics básicos
- 📱 Notificações automáticas
- 💰 Sistema de orçamentos

#### **Melhorias**
- Performance otimizada para grandes volumes
- Cache inteligente da timeline
- Sincronização em tempo real
- Interface aprimorada

### **10.3 Fase 3: Recursos Premium (Meses 5-6)**

#### **Funcionalidades Premium**
- 📱 Aplicativo mobile (React Native)
- 🤖 IA para categorização automática
- 📈 Relatórios avançados
- 🌐 Portfólio público automático
- 💳 Integração com pagamentos
- 📧 Marketing automático

#### **Integrações Adicionais**
- Instagram/Facebook para portfólio
- WhatsApp Business para comunicação
- Sistemas de pagamento (PIX, cartão)
- APIs de terceiros

---

## 🎯 **11. CRITÉRIOS DE SUCESSO**

### **11.1 Métricas de Produto**

#### **11.1.1 Usabilidade**
- **Tempo para primeira organização**: < 5 minutos
- **Taxa de adoção**: > 80% dos usuários usam semanalmente
- **Satisfação**: NPS > 50
- **Retenção**: > 70% após 3 meses

#### **11.1.2 Performance**
- **Carregamento inicial**: < 3 segundos
- **Navegação entre telas**: < 1 segundo
- **Upload de fotos**: < 10 segundos para 10 fotos
- **Sincronização**: < 30 segundos para 100 eventos

#### **11.1.3 Confiabilidade**
- **Uptime**: > 99.5%
- **Perda de dados**: 0%
- **Falhas de sincronização**: < 1%
- **Backup bem-sucedido**: > 99%

### **11.2 Métricas de Negócio**

#### **11.2.1 Adoção**
- **Usuários ativos mensais**: Meta inicial 100 tatuadores
- **Crescimento mensal**: 20%
- **Tempo de onboarding**: < 15 minutos
- **Conversão trial → pago**: > 30%

#### **11.2.2 Valor Entregue**
- **Tempo economizado**: 2+ horas/semana por tatuador
- **Organização**: 100% das fotos organizadas automaticamente
- **Backup**: 0% de perda de portfólio
- **Produtividade**: 15% mais agendamentos organizados

---

## 📝 **12. CONSIDERAÇÕES FINAIS**

### **12.1 Diferenciais Competitivos**

#### **12.1.1 Únicos no Mercado**
1. **Timeline Visual**: Primeiro sistema com navegação temporal como Mylio
2. **Organização Automática**: Cria pastas automaticamente baseado no calendário
3. **Integração Completa**: Google Calendar + Google Drive + Interface visual
4. **Específico para Tatuadores**: Funcionalidades pensadas especificamente para o setor

#### **12.1.2 Vantagens Técnicas**
- **Híbrido**: Funciona offline e online
- **Escalável**: Arquitetura preparada para crescimento
- **Extensível**: Fácil adição de novas funcionalidades
- **Multiplataforma**: Desktop, web e mobile

### **12.2 Riscos e Mitigações**

#### **12.2.1 Riscos Técnicos**
- **API Limits**: Google APIs têm limites de uso
  - *Mitigação*: Cache inteligente e otimização de chamadas
- **Performance**: Muitas fotos podem impactar performance
  - *Mitigação*: Lazy loading e compressão inteligente
- **Sincronização**: Conflitos entre local e nuvem
  - *Mitigação*: Sistema de resolução de conflitos

#### **12.2.2 Riscos de Produto**
- **Adoção**: Tatuadores podem resistir a mudanças
  - *Mitigação*: Onboarding simplificado e suporte dedicado
- **Concorrência**: Grandes players podem copiar
  - *Mitigação*: Foco na experiência específica do setor

### **12.3 Próximos Passos**

#### **12.3.1 Desenvolvimento**
1. **Setup inicial**: Configurar ambiente de desenvolvimento
2. **Protótipo**: Criar protótipo da timeline visual
3. **Integrações**: Implementar Google Calendar e Drive APIs
4. **MVP**: Desenvolver versão mínima viável
5. **Testes**: Validar com tatuadores reais

#### **12.3.2 Validação**
1. **Beta Testing**: 10 tatuadores por 1 mês
2. **Feedback**: Coleta e análise de feedback
3. **Iteração**: Melhorias baseadas no uso real
4. **Launch**: Lançamento para mercado

---

## 📞 **13. CONTATOS E RECURSOS**

### **13.1 Documentação Técnica**
- **API Reference**: Documentação completa das APIs
- **Architecture Guide**: Guia de arquitetura do sistema
- **Deployment Guide**: Guia de deploy e configuração
- **User Manual**: Manual do usuário final

### **13.2 Recursos de Desenvolvimento**
- **GitHub Repository**: Código-fonte e documentação
- **Design System**: Componentes e padrões visuais
- **Test Suite**: Testes automatizados
- **CI/CD Pipeline**: Pipeline de integração contínua

---

**Este PRD serve como base para o desenvolvimento do TattooScheduler Visual System, um produto inovador que revolucionará como tatuadores organizam e gerenciam seu trabalho e portfólio.**
