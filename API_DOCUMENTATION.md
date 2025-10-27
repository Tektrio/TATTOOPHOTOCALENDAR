# 📚 API Documentation

Documentação completa das APIs REST do TattooScheduler Backend.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Agendamentos](#agendamentos)
  - [Clientes](#clientes)
  - [Arquivos](#arquivos)
  - [Tipos de Tatuagem](#tipos-de-tatuagem)
  - [Orçamentos](#orçamentos)
  - [Google Calendar](#google-calendar)
  - [Google Drive](#google-drive)
  - [Importação](#importação)
  - [Sincronização](#sincronização)
- [Códigos de Erro](#códigos-de-erro)
- [Rate Limiting](#rate-limiting)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🌐 Visão Geral

### Base URL
```
http://localhost:3001
```

### Headers Padrão
```http
Content-Type: application/json
Accept: application/json
```

### Formato de Resposta

#### Sucesso (200-299)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

#### Erro (400-599)
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 🔐 Autenticação

### OAuth 2.0 (Google)

#### 1. Iniciar Fluxo OAuth
```http
GET /auth/google
```

**Resposta**: Redireciona para página de login do Google

#### 2. Callback OAuth
```http
GET /auth/google/callback?code={auth_code}
```

**Resposta**:
```json
{
  "success": true,
  "tokens": {
    "access_token": "ya29.a0...",
    "refresh_token": "1//...",
    "expiry_date": 1234567890000
  },
  "user": {
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "picture": "https://..."
  }
}
```

#### 3. Verificar Status de Autenticação
```http
GET /auth/status
```

**Resposta**:
```json
{
  "authenticated": true,
  "email": "user@example.com",
  "expiresAt": "2025-10-28T12:00:00Z"
}
```

---

## 📅 Agendamentos

### Listar Agendamentos

```http
GET /api/appointments
```

**Query Parameters**:
- `startDate` (opcional): Data inicial (ISO 8601)
- `endDate` (opcional): Data final (ISO 8601)
- `status` (opcional): `pending`, `confirmed`, `completed`, `cancelled`
- `clientId` (opcional): ID do cliente

**Exemplo**:
```http
GET /api/appointments?startDate=2025-10-01&endDate=2025-10-31&status=confirmed
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_id": 5,
      "client_name": "João Silva",
      "start_datetime": "2025-10-28T14:00:00Z",
      "end_datetime": "2025-10-28T16:00:00Z",
      "tattoo_type_id": 2,
      "tattoo_type_name": "Média",
      "description": "Dragão no braço",
      "status": "confirmed",
      "notes": "Cliente pediu cores vibrantes",
      "google_event_id": "abc123...",
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "perPage": 50
}
```

### Criar Agendamento

```http
POST /api/appointments
```

**Body**:
```json
{
  "client_id": 5,
  "start_datetime": "2025-10-28T14:00:00Z",
  "end_datetime": "2025-10-28T16:00:00Z",
  "tattoo_type_id": 2,
  "description": "Dragão no braço",
  "status": "confirmed",
  "notes": "Cliente pediu cores vibrantes",
  "price": 800.00
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 16,
    "client_id": 5,
    "start_datetime": "2025-10-28T14:00:00Z",
    "end_datetime": "2025-10-28T16:00:00Z",
    "tattoo_type_id": 2,
    "description": "Dragão no braço",
    "status": "confirmed",
    "notes": "Cliente pediu cores vibrantes",
    "google_event_id": "xyz789...",
    "created_at": "2025-10-27T10:00:00Z"
  },
  "message": "Agendamento criado com sucesso"
}
```

### Atualizar Agendamento

```http
PUT /api/appointments/:id
```

**Body** (campos opcionais):
```json
{
  "start_datetime": "2025-10-28T15:00:00Z",
  "status": "completed",
  "notes": "Cliente muito satisfeito"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 16,
    "start_datetime": "2025-10-28T15:00:00Z",
    "status": "completed",
    "updated_at": "2025-10-27T11:00:00Z"
  },
  "message": "Agendamento atualizado com sucesso"
}
```

### Excluir Agendamento

```http
DELETE /api/appointments/:id
```

**Resposta**:
```json
{
  "success": true,
  "message": "Agendamento excluído com sucesso"
}
```

---

## 👥 Clientes

### Listar Clientes

```http
GET /api/clients
```

**Query Parameters**:
- `search` (opcional): Busca por nome, email ou telefone
- `orderBy` (opcional): `name`, `created_at` (default: `name`)
- `order` (opcional): `ASC`, `DESC` (default: `ASC`)

**Exemplo**:
```http
GET /api/clients?search=João&orderBy=created_at&order=DESC
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "(11) 99999-9999",
      "notes": "Cliente preferencial",
      "total_appointments": 8,
      "last_appointment": "2025-10-15T14:00:00Z",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "perPage": 50
}
```

### Criar Cliente

```http
POST /api/clients
```

**Body**:
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "(11) 98888-8888",
  "notes": "Alergica a tinta vermelha"
}
```

**Validações**:
- `name`: Obrigatório, mínimo 3 caracteres
- `email`: Opcional, formato válido
- `phone`: Opcional, formato válido (br: `(XX) XXXXX-XXXX`)
- `notes`: Opcional

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 43,
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "(11) 98888-8888",
    "notes": "Alergica a tinta vermelha",
    "created_at": "2025-10-27T12:00:00Z"
  },
  "message": "Cliente criado com sucesso"
}
```

### Obter Cliente por ID

```http
GET /api/clients/:id
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "notes": "Cliente preferencial",
    "appointments": [
      {
        "id": 10,
        "start_datetime": "2025-10-15T14:00:00Z",
        "description": "Dragão no braço",
        "status": "completed"
      }
    ],
    "files": [
      {
        "id": 20,
        "filename": "referencia_dragao.jpg",
        "url": "http://localhost:3001/uploads/clients/5/referencia_dragao.jpg",
        "created_at": "2025-10-10T10:00:00Z"
      }
    ],
    "total_spent": 3200.00,
    "created_at": "2024-01-10T10:00:00Z"
  }
}
```

### Atualizar Cliente

```http
PUT /api/clients/:id
```

**Body** (campos opcionais):
```json
{
  "name": "João Pedro Silva",
  "notes": "Cliente VIP"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "João Pedro Silva",
    "notes": "Cliente VIP",
    "updated_at": "2025-10-27T13:00:00Z"
  },
  "message": "Cliente atualizado com sucesso"
}
```

### Excluir Cliente

```http
DELETE /api/clients/:id
```

**Resposta**:
```json
{
  "success": true,
  "message": "Cliente excluído com sucesso"
}
```

**Nota**: Exclui também todos os agendamentos e arquivos associados.

---

## 📁 Arquivos

### Fazer Upload

```http
POST /api/files/upload
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo (obrigatório)
- `client_id`: ID do cliente (opcional)
- `appointment_id`: ID do agendamento (opcional)
- `category`: `referencias`, `desenhos_aprovados`, `processo`, `fotos_finais`, `pos_tatuagem` (opcional)

**Exemplo com Fetch**:
```javascript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('client_id', 5);
formData.append('category', 'fotos_finais');

const response = await fetch('http://localhost:3001/api/files/upload', {
  method: 'POST',
  body: formData
});
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 25,
    "filename": "tatuagem_dragao_final.jpg",
    "original_name": "IMG_20251027_140530.jpg",
    "mimetype": "image/jpeg",
    "size": 2048576,
    "path": "/uploads/clients/5/fotos_finais/tatuagem_dragao_final.jpg",
    "url": "http://localhost:3001/uploads/clients/5/fotos_finais/tatuagem_dragao_final.jpg",
    "thumbnail_url": "http://localhost:3001/uploads/clients/5/fotos_finais/thumbs/tatuagem_dragao_final_thumb.jpg",
    "client_id": 5,
    "category": "fotos_finais",
    "created_at": "2025-10-27T14:05:30Z"
  },
  "message": "Upload realizado com sucesso"
}
```

### Upload em Chunks (Arquivos Grandes)

#### 1. Enviar Chunk

```http
POST /api/files/upload/chunk
```

**Form Data**:
- `chunk`: Parte do arquivo
- `fileName`: Nome do arquivo original
- `fileType`: MIME type
- `fileSize`: Tamanho total do arquivo
- `chunkIndex`: Índice do chunk atual (0-based)
- `totalChunks`: Total de chunks
- `metadata`: JSON com metadados (client_id, category, etc)

#### 2. Finalizar Upload

```http
POST /api/files/finalize
```

**Body**:
```json
{
  "fileName": "video_grande.mp4",
  "fileSize": 104857600,
  "fileType": "video/mp4",
  "totalChunks": 100,
  "metadata": {
    "client_id": 5,
    "category": "processo"
  }
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 26,
    "filename": "video_grande.mp4",
    "size": 104857600,
    "url": "http://localhost:3001/uploads/clients/5/processo/video_grande.mp4"
  },
  "message": "Upload finalizado com sucesso"
}
```

### Listar Arquivos

```http
GET /api/files
```

**Query Parameters**:
- `client_id` (opcional): Filtrar por cliente
- `appointment_id` (opcional): Filtrar por agendamento
- `category` (opcional): Filtrar por categoria
- `limit` (opcional): Limite de resultados (default: 50)
- `offset` (opcional): Offset para paginação

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "filename": "tatuagem_dragao_final.jpg",
      "url": "http://localhost:3001/uploads/clients/5/fotos_finais/tatuagem_dragao_final.jpg",
      "thumbnail_url": "http://localhost:3001/uploads/clients/5/fotos_finais/thumbs/tatuagem_dragao_final_thumb.jpg",
      "size": 2048576,
      "mimetype": "image/jpeg",
      "client_id": 5,
      "client_name": "João Silva",
      "category": "fotos_finais",
      "created_at": "2025-10-27T14:05:30Z"
    }
  ],
  "total": 120,
  "limit": 50,
  "offset": 0
}
```

### Excluir Arquivo

```http
DELETE /api/files/:id
```

**Resposta**:
```json
{
  "success": true,
  "message": "Arquivo excluído com sucesso"
}
```

---

## 🎨 Tipos de Tatuagem

### Listar Tipos

```http
GET /api/tattoo-types
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pequena",
      "duration_hours": 2,
      "base_price": 200.00,
      "color": "#10B981",
      "description": "Tatuagens pequenas até 5cm"
    },
    {
      "id": 2,
      "name": "Média",
      "duration_hours": 4,
      "base_price": 400.00,
      "color": "#F59E0B",
      "description": "Tatuagens médias de 5-15cm"
    },
    {
      "id": 3,
      "name": "Grande",
      "duration_hours": 6,
      "base_price": 800.00,
      "color": "#EF4444",
      "description": "Tatuagens grandes acima de 15cm"
    }
  ]
}
```

### Criar Tipo

```http
POST /api/tattoo-types
```

**Body**:
```json
{
  "name": "Extra Grande",
  "duration_hours": 10,
  "base_price": 1500.00,
  "color": "#8B5CF6",
  "description": "Tatuagens full sleeve ou back piece"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Extra Grande",
    "duration_hours": 10,
    "base_price": 1500.00,
    "color": "#8B5CF6",
    "description": "Tatuagens full sleeve ou back piece"
  },
  "message": "Tipo de tatuagem criado com sucesso"
}
```

### Atualizar Tipo

```http
PUT /api/tattoo-types/:id
```

**Body** (campos opcionais):
```json
{
  "base_price": 1800.00,
  "description": "Tatuagens grandes e complexas"
}
```

### Excluir Tipo

```http
DELETE /api/tattoo-types/:id
```

**Resposta**:
```json
{
  "success": true,
  "message": "Tipo de tatuagem excluído com sucesso"
}
```

---

## 💰 Orçamentos

### Criar Orçamento

```http
POST /api/budgets
```

**Body**:
```json
{
  "client_id": 5,
  "tattoo_type_id": 2,
  "description": "Dragão japonês colorido",
  "base_price": 400.00,
  "multipliers": {
    "complexity": 1.5,
    "size": 1.2,
    "location": 1.1
  },
  "final_price": 792.00,
  "notes": "Requer 2 sessões",
  "status": "pending"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "client_id": 5,
    "tattoo_type_id": 2,
    "description": "Dragão japonês colorido",
    "base_price": 400.00,
    "multipliers": {
      "complexity": 1.5,
      "size": 1.2,
      "location": 1.1
    },
    "final_price": 792.00,
    "notes": "Requer 2 sessões",
    "status": "pending",
    "created_at": "2025-10-27T15:00:00Z"
  },
  "message": "Orçamento criado com sucesso"
}
```

### Listar Orçamentos

```http
GET /api/budgets
```

**Query Parameters**:
- `client_id` (opcional)
- `status` (opcional): `pending`, `approved`, `rejected`

### Atualizar Status de Orçamento

```http
PUT /api/budgets/:id
```

**Body**:
```json
{
  "status": "approved"
}
```

---

## 📆 Google Calendar

### Listar Eventos

```http
GET /api/google-calendar/events
```

**Query Parameters**:
- `timeMin` (opcional): Data mínima (ISO 8601)
- `timeMax` (opcional): Data máxima (ISO 8601)
- `maxResults` (opcional): Limite de resultados (default: 100)

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123...",
      "summary": "Sessão com João Silva",
      "description": "Dragão no braço",
      "start": {
        "dateTime": "2025-10-28T14:00:00-03:00",
        "timeZone": "America/Sao_Paulo"
      },
      "end": {
        "dateTime": "2025-10-28T16:00:00-03:00",
        "timeZone": "America/Sao_Paulo"
      },
      "location": "Studio de Tatuagem",
      "status": "confirmed"
    }
  ]
}
```

### Criar Evento

```http
POST /api/google-calendar/events
```

**Body**:
```json
{
  "summary": "Sessão com Maria Santos",
  "description": "Flor de lótus nas costas",
  "start": {
    "dateTime": "2025-10-29T10:00:00-03:00",
    "timeZone": "America/Sao_Paulo"
  },
  "end": {
    "dateTime": "2025-10-29T14:00:00-03:00",
    "timeZone": "America/Sao_Paulo"
  },
  "reminders": {
    "useDefault": false,
    "overrides": [
      {"method": "email", "minutes": 1440},
      {"method": "popup", "minutes": 120}
    ]
  }
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "xyz789...",
    "summary": "Sessão com Maria Santos",
    "htmlLink": "https://calendar.google.com/event?eid=xyz789...",
    "created": "2025-10-27T15:30:00Z"
  },
  "message": "Evento criado com sucesso"
}
```

### Atualizar Evento

```http
PUT /api/google-calendar/events/:eventId
```

**Body** (campos opcionais):
```json
{
  "summary": "Sessão com Maria Santos - REMARCADO",
  "start": {
    "dateTime": "2025-10-30T10:00:00-03:00"
  },
  "end": {
    "dateTime": "2025-10-30T14:00:00-03:00"
  }
}
```

### Excluir Evento

```http
DELETE /api/google-calendar/events/:eventId
```

**Resposta**:
```json
{
  "success": true,
  "message": "Evento excluído com sucesso"
}
```

---

## ☁️ Google Drive

### Listar Arquivos/Pastas

```http
GET /api/google-drive/files
```

**Query Parameters**:
- `folderId` (opcional): ID da pasta pai (default: root)
- `pageSize` (opcional): Limite de resultados (default: 100)
- `pageToken` (opcional): Token para próxima página
- `mimeType` (opcional): Filtrar por tipo MIME

**Exemplo**:
```http
GET /api/google-drive/files?folderId=1abc...&pageSize=50
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "1abc123...",
        "name": "João Silva",
        "mimeType": "application/vnd.google-apps.folder",
        "createdTime": "2025-10-10T10:00:00Z",
        "modifiedTime": "2025-10-27T14:00:00Z",
        "size": null,
        "webViewLink": "https://drive.google.com/drive/folders/1abc123...",
        "thumbnailLink": null
      },
      {
        "id": "2def456...",
        "name": "tatuagem_dragao.jpg",
        "mimeType": "image/jpeg",
        "createdTime": "2025-10-27T14:05:30Z",
        "modifiedTime": "2025-10-27T14:05:30Z",
        "size": 2048576,
        "webViewLink": "https://drive.google.com/file/d/2def456...",
        "thumbnailLink": "https://lh3.googleusercontent.com/..."
      }
    ],
    "nextPageToken": "CAESBggC...",
    "incompleteSearch": false
  }
}
```

### Criar Pasta

```http
POST /api/google-drive/folders
```

**Body**:
```json
{
  "name": "Maria Santos",
  "parentId": "1xyz789..."
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "3ghi012...",
    "name": "Maria Santos",
    "mimeType": "application/vnd.google-apps.folder",
    "webViewLink": "https://drive.google.com/drive/folders/3ghi012...",
    "createdTime": "2025-10-27T16:00:00Z"
  },
  "message": "Pasta criada com sucesso"
}
```

### Fazer Upload para Drive

```http
POST /api/google-drive/upload
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo (obrigatório)
- `folderId`: ID da pasta de destino (opcional, default: root)
- `name`: Nome do arquivo (opcional, usa o nome original se não fornecido)

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "4jkl345...",
    "name": "tatuagem_flor.jpg",
    "mimeType": "image/jpeg",
    "size": 1500000,
    "webViewLink": "https://drive.google.com/file/d/4jkl345...",
    "webContentLink": "https://drive.google.com/uc?id=4jkl345...",
    "createdTime": "2025-10-27T16:10:00Z"
  },
  "message": "Upload realizado com sucesso"
}
```

### Download de Arquivo

```http
GET /api/google-drive/download/:fileId
```

**Resposta**: Stream do arquivo (binary)

**Headers de Resposta**:
```http
Content-Type: image/jpeg (ou outro MIME type)
Content-Disposition: attachment; filename="tatuagem_flor.jpg"
Content-Length: 1500000
```

### Excluir Arquivo/Pasta

```http
DELETE /api/google-drive/files/:fileId
```

**Resposta**:
```json
{
  "success": true,
  "message": "Arquivo excluído com sucesso"
}
```

---

## 📥 Importação

### Importar de Excel

```http
POST /api/imports/excel
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo Excel (.xlsx, .xls)
- `type`: `appointments`, `clients`, `budgets`
- `mode`: `create` (apenas criar novos), `update` (apenas atualizar), `upsert` (criar ou atualizar)

**Formato Esperado (Appointments)**:
| Nome Cliente | Email | Telefone | Data Início | Data Fim | Tipo Tatuagem | Descrição | Status |
|--------------|-------|----------|-------------|----------|---------------|-----------|--------|
| João Silva | joao@example.com | (11) 99999-9999 | 2025-10-28 14:00 | 2025-10-28 16:00 | Média | Dragão | confirmed |

**Resposta**:
```json
{
  "success": true,
  "data": {
    "import_id": "imp_abc123",
    "records_processed": 50,
    "records_created": 45,
    "records_updated": 3,
    "records_skipped": 2,
    "records_failed": 0,
    "errors": [],
    "duration_ms": 2500
  },
  "message": "Importação concluída com sucesso"
}
```

### Importar de ICS (Calendar)

```http
POST /api/imports/ics
```

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Arquivo ICS (.ics)
- `mode`: `create`, `update`, `upsert`

**Resposta**: Similar ao Excel

### Obter Histórico de Importações

```http
GET /api/imports/logs
```

**Query Parameters**:
- `limit` (opcional): Limite de resultados (default: 50)
- `offset` (opcional): Offset para paginação
- `type` (opcional): Filtrar por tipo de importação

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "import_id": "imp_abc123",
      "import_type": "excel_appointments",
      "import_source": "agenda_outubro.xlsx",
      "status": "completed",
      "records_processed": 50,
      "records_created": 45,
      "records_updated": 3,
      "records_skipped": 2,
      "records_failed": 0,
      "error_details": null,
      "timestamp": "2025-10-27T17:00:00Z"
    }
  ],
  "total": 25
}
```

---

## 🔄 Sincronização

### Sincronizar Manualmente

```http
POST /api/sync/trigger
```

**Body** (opcional):
```json
{
  "sources": ["google_calendar", "google_drive"],
  "fullSync": false
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "sync_id": "sync_xyz789",
    "status": "in_progress",
    "sources": ["google_calendar", "google_drive"],
    "started_at": "2025-10-27T17:30:00Z"
  },
  "message": "Sincronização iniciada"
}
```

### Verificar Status de Sincronização

```http
GET /api/sync/status/:syncId
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "sync_id": "sync_xyz789",
    "status": "completed",
    "sources": ["google_calendar", "google_drive"],
    "results": {
      "google_calendar": {
        "status": "success",
        "events_synced": 12,
        "errors": 0
      },
      "google_drive": {
        "status": "success",
        "files_synced": 25,
        "errors": 0
      }
    },
    "started_at": "2025-10-27T17:30:00Z",
    "completed_at": "2025-10-27T17:32:15Z",
    "duration_ms": 135000
  }
}
```

### Obter Histórico de Sincronizações

```http
GET /api/sync/history
```

**Query Parameters**:
- `limit` (opcional)
- `offset` (opcional)

---

## ❌ Códigos de Erro

| Código | Status HTTP | Descrição |
|--------|-------------|-----------|
| `INVALID_REQUEST` | 400 | Requisição malformada ou dados inválidos |
| `VALIDATION_ERROR` | 400 | Erro de validação de campos |
| `UNAUTHORIZED` | 401 | Não autenticado ou token inválido |
| `FORBIDDEN` | 403 | Sem permissão para acessar o recurso |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `CONFLICT` | 409 | Conflito (ex: email duplicado) |
| `UPLOAD_ERROR` | 400 | Erro no upload de arquivo |
| `GOOGLE_API_ERROR` | 500 | Erro na API do Google |
| `DATABASE_ERROR` | 500 | Erro no banco de dados |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

### Exemplo de Erro

```json
{
  "success": false,
  "error": "Email já cadastrado",
  "code": "CONFLICT",
  "details": {
    "field": "email",
    "value": "joao@example.com",
    "existingId": 5
  }
}
```

---

## ⏱️ Rate Limiting

### Limites
- **Requisições gerais**: 100 requisições/minuto por IP
- **Upload de arquivos**: 20 uploads/minuto por IP
- **Importações**: 5 importações/hora por IP

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698419400
```

### Resposta quando Limite Excedido

```json
{
  "success": false,
  "error": "Taxa de requisições excedida. Tente novamente em 60 segundos.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60
  }
}
```

**Status HTTP**: 429 Too Many Requests

---

## 💡 Exemplos de Uso

### JavaScript (Fetch)

```javascript
// Criar agendamento
const createAppointment = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: 5,
        start_datetime: '2025-10-28T14:00:00Z',
        end_datetime: '2025-10-28T16:00:00Z',
        tattoo_type_id: 2,
        description: 'Dragão no braço',
        status: 'confirmed'
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Agendamento criado:', data.data);
    } else {
      console.error('Erro:', data.error);
    }
  } catch (error) {
    console.error('Erro de rede:', error);
  }
};
```

### JavaScript (Com Retry da Lib)

```javascript
import { apiPost } from '@/utils/api';

// Criar agendamento com retry automático
const createAppointment = async () => {
  try {
    const appointment = await apiPost('/api/appointments', {
      client_id: 5,
      start_datetime: '2025-10-28T14:00:00Z',
      end_datetime: '2025-10-28T16:00:00Z',
      tattoo_type_id: 2,
      description: 'Dragão no braço',
      status: 'confirmed'
    });
    
    console.log('Agendamento criado:', appointment);
    // Toast de sucesso já foi exibido automaticamente
  } catch (error) {
    // Toast de erro já foi exibido automaticamente
    console.error('Falha após tentativas:', error);
  }
};
```

### cURL

```bash
# Criar agendamento
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 5,
    "start_datetime": "2025-10-28T14:00:00Z",
    "end_datetime": "2025-10-28T16:00:00Z",
    "tattoo_type_id": 2,
    "description": "Dragão no braço",
    "status": "confirmed"
  }'

# Upload de arquivo
curl -X POST http://localhost:3001/api/files/upload \
  -F "file=@/path/to/image.jpg" \
  -F "client_id=5" \
  -F "category=fotos_finais"
```

### Python (requests)

```python
import requests

# Criar agendamento
url = 'http://localhost:3001/api/appointments'
data = {
    'client_id': 5,
    'start_datetime': '2025-10-28T14:00:00Z',
    'end_datetime': '2025-10-28T16:00:00Z',
    'tattoo_type_id': 2,
    'description': 'Dragão no braço',
    'status': 'confirmed'
}

response = requests.post(url, json=data)
if response.status_code == 200:
    print('Sucesso:', response.json())
else:
    print('Erro:', response.json())
```

---

## 📊 WebSocket Events

### Conexão

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Conectado ao WebSocket');
});
```

### Eventos Disponíveis

#### `file_synced`
Emitido quando um arquivo é sincronizado com Google Drive.

```javascript
socket.on('file_synced', (data) => {
  console.log('Arquivo sincronizado:', data);
  // { action: 'added', fileName: 'foto.jpg', fileId: '1abc...' }
});
```

#### `sync_progress`
Emitido durante a sincronização.

```javascript
socket.on('sync_progress', (data) => {
  console.log('Progresso:', data);
  // { message: 'Sincronizando calendário...', progress: 50 }
});
```

#### `sync_complete`
Emitido quando a sincronização é concluída.

```javascript
socket.on('sync_complete', (data) => {
  console.log('Sincronização completa:', data);
  // { message: 'Sincronização concluída', totalFiles: 25 }
});
```

#### `sync_error`
Emitido quando ocorre erro na sincronização.

```javascript
socket.on('sync_error', (data) => {
  console.error('Erro de sincronização:', data);
  // { message: 'Falha ao conectar com Google Drive', error: '...' }
});
```

---

## 🔒 Segurança

### Headers de Segurança Recomendados

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS

O backend está configurado para aceitar requisições de:
- `http://localhost:5173` (frontend dev)
- `http://localhost:4173` (frontend preview)

Para configurar outros domínios, edite `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://seu-dominio.com'],
  credentials: true
}));
```

---

## 📞 Suporte

Para dúvidas ou problemas com a API:

1. Consulte esta documentação
2. Verifique os logs em `./logs/`
3. Teste com as ferramentas de exemplo
4. Abra uma issue no repositório

---

**API desenvolvida com ❤️ usando Node.js + Express**

*Última atualização: Outubro 2025*

