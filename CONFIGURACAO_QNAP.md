# Configuração QNAP - Guia Completo

**Data:** 31 de Outubro de 2025  
**Versão:** 2.0.0  
**Objetivo:** Configurar integração com QNAP File Station

---

## Introdução

Este guia explica como configurar o acesso ao QNAP NAS diretamente da aplicação, permitindo que usuários abram pastas de clientes no QNAP File Station com um clique.

---

## Pré-requisitos

1. **QNAP NAS** configurado e acessível na rede
2. **Acesso administrativo** ao servidor backend
3. **Compartilhamento (Share)** criado no QNAP para armazenar pastas de clientes
4. **Acesso de rede** entre servidor backend e QNAP

---

## Passo 1: Verificar Configuração do QNAP

### 1.1 Acessar QNAP Admin

1. Abrir navegador
2. Navegar para: `http://[IP_DO_QNAP]:8080` ou `http://[IP_DO_QNAP]`
3. Fazer login com credenciais de administrador

### 1.2 Verificar File Station

1. No menu principal, clicar em "File Station"
2. Verificar se o compartilhamento desejado existe (ex: `Tatuagens`)
3. Anotar o caminho completo: `/share/Tatuagens`

### 1.3 Confirmar Acesso de Rede

No servidor backend, executar:

```bash
# Verificar se QNAP está acessível
ping [IP_DO_QNAP]

# Exemplo
ping 192.168.1.100
```

**Resultado esperado:** Resposta com tempos de ping (< 10ms em rede local)

---

## Passo 2: Configurar Variáveis de Ambiente

### 2.1 Localizar Arquivo `.env`

No diretório do backend:

```bash
cd agenda-hibrida-v2
ls -la | grep .env
```

**Se não existir:**

```bash
touch .env
```

### 2.2 Adicionar Variáveis QNAP

Abrir `.env` com editor de texto e adicionar:

```env
# ==========================================
# CONFIGURAÇÃO QNAP
# ==========================================

# Habilitar funcionalidade QNAP (true ou false)
QNAP_ENABLED=true

# IP ou hostname do QNAP (sem http://)
QNAP_HOST=192.168.1.100

# Caminho do compartilhamento onde ficam as pastas dos clientes
# Formato: /share/[NOME_DO_SHARE]
QNAP_SHARE_PATH=/share/Tatuagens

# Opcional: Porta do QNAP (padrão: 80 para HTTP, 443 para HTTPS)
# QNAP_PORT=8080
```

### 2.3 Exemplo Completo

```env
# Backend
PORT=3001
DATABASE_PATH=./database.db

# Google Drive
GOOGLE_DRIVE_ENABLED=true
DRIVE_CLIENT_ID=seu-client-id
DRIVE_CLIENT_SECRET=seu-client-secret
DRIVE_REDIRECT_URI=http://localhost:3001/oauth2callback

# QNAP
QNAP_ENABLED=true
QNAP_HOST=192.168.1.100
QNAP_SHARE_PATH=/share/Tatuagens
```

### 2.4 Variáveis Explicadas

| Variável | Obrigatória | Descrição | Exemplo |
|----------|------------|-----------|---------|
| `QNAP_ENABLED` | ✅ Sim | Habilitar/desabilitar QNAP | `true` |
| `QNAP_HOST` | ✅ Sim | IP ou hostname do QNAP | `192.168.1.100` ou `qnap.local` |
| `QNAP_SHARE_PATH` | ✅ Sim | Caminho do compartilhamento | `/share/Tatuagens` |
| `QNAP_PORT` | ❌ Não | Porta customizada (opcional) | `8080` |

---

## Passo 3: Reiniciar Backend

Após salvar o `.env`:

```bash
# Parar servidor (se estiver rodando)
# Pressionar Ctrl+C no terminal

# Ou matar processo
pkill -f "node server.js"

# Iniciar servidor novamente
cd agenda-hibrida-v2
node server.js
```

**Verificar logs:**

```
✅ Servidor rodando na porta 3001
✅ QNAP habilitado: http://192.168.1.100
✅ Caminho QNAP: /share/Tatuagens
```

---

## Passo 4: Testar Configuração

### 4.1 Testar Endpoint Diretamente

```bash
# Substituir 7 pelo ID de um cliente existente
curl -X POST http://localhost:3001/api/clients/7/open-qnap-folder
```

**Resposta esperada (sucesso):**

```json
{
  "success": true,
  "url": "http://192.168.1.100",
  "path": "/share/Tatuagens/Luiz Lopes/11999999999",
  "message": "URL do QNAP File Station gerada com sucesso",
  "note": "Navegue manualmente até a pasta: /share/Tatuagens/Luiz Lopes/11999999999"
}
```

**Resposta esperada (erro - cliente sem pasta):**

```json
{
  "error": "Cliente não possui pasta configurada",
  "message": "Crie a pasta do cliente primeiro"
}
```

### 4.2 Testar no Frontend

1. Abrir aplicação: `http://localhost:5173`
2. Navegar para um cliente com pasta configurada
3. Clicar na aba "Arquivos"
4. Localizar botão "QNAP"
5. **Verificar estado do botão:**
   - ✅ Habilitado (cor normal) = Configurado corretamente
   - ❌ Desabilitado (cinza) = Erro na configuração

6. **Passar mouse sobre o botão:**
   - Tooltip deve mostrar mensagem relevante

7. **Clicar no botão:**
   - Nova aba deve abrir com QNAP File Station
   - Mensagem de sucesso deve aparecer com caminho

---

## Passo 5: Criar Estrutura de Pastas no QNAP

### 5.1 Via File Station (Manual)

1. Acessar File Station
2. Navegar para `/share/Tatuagens`
3. Criar estrutura para cada cliente:

```
/share/Tatuagens/
  └── [Nome Cliente]/
       └── [Telefone]/
            ├── referencias/
            ├── inspiracoes/
            ├── fotos_sessao/
            ├── fotos_finais/
            └── documentos/
```

**Exemplo:**

```
/share/Tatuagens/
  └── Luiz Lopes/
       └── 11999999999/
            ├── referencias/
            ├── inspiracoes/
            ├── fotos_sessao/
            ├── fotos_finais/
            └── documentos/
```

### 5.2 Via Aplicação (Automático)

Se o cliente já tiver `folder_path` configurado no banco:

1. A aplicação sincroniza automaticamente
2. Pastas são criadas conforme necessário
3. Arquivos são organizados por categoria

---

## Troubleshooting

### Problema 1: Botão QNAP Desabilitado

**Sintomas:**
- Botão aparece cinza
- Não clicável

**Soluções:**

1. **Verificar variáveis `.env`:**
   ```bash
   cat agenda-hibrida-v2/.env | grep QNAP
   ```
   Confirmar que todas estão presentes.

2. **Verificar servidor backend:**
   ```bash
   # Logs devem mostrar:
   # ✅ QNAP habilitado: http://[IP]
   ```

3. **Reiniciar backend:**
   ```bash
   pkill -f "node server.js"
   cd agenda-hibrida-v2 && node server.js
   ```

4. **Verificar cliente tem `folder_path`:**
   ```sql
   -- Executar no banco de dados
   SELECT id, name, folder_path FROM clients WHERE id = 7;
   ```
   Se `folder_path` for `NULL`, criar pasta primeiro.

---

### Problema 2: Erro 400 ao Clicar no Botão

**Sintomas:**
- Erro no console: "QNAP não está habilitado"

**Soluções:**

1. Verificar `QNAP_ENABLED=true` no `.env`
2. Reiniciar backend
3. Limpar cache do navegador (Ctrl+Shift+R)

---

### Problema 3: Erro 404 - Cliente Não Encontrado

**Sintomas:**
- Erro ao tentar abrir QNAP

**Soluções:**

1. Confirmar que cliente existe:
   ```bash
   curl http://localhost:3001/api/clients/7
   ```

2. Verificar ID correto na URL do frontend

---

### Problema 4: Nova Aba Não Abre

**Sintomas:**
- Botão clica mas nada acontece
- Popup blocker pode estar ativo

**Soluções:**

1. **Desabilitar bloqueador de popups:**
   - Chrome: Configurações > Privacidade > Configurações de site > Pop-ups
   - Adicionar exceção para `localhost:5173`

2. **Verificar console do navegador:**
   - F12 > Console
   - Procurar erros relacionados a `window.open`

3. **Testar em modo anônimo:**
   - Ctrl+Shift+N (Chrome)
   - Desabilita extensões que podem bloquear

---

### Problema 5: Caminho Incorreto no QNAP

**Sintomas:**
- QNAP abre mas pasta não existe

**Soluções:**

1. **Verificar `QNAP_SHARE_PATH`:**
   ```bash
   cat agenda-hibrida-v2/.env | grep QNAP_SHARE_PATH
   ```
   Deve corresponder ao caminho real no QNAP.

2. **Verificar `folder_path` do cliente:**
   ```sql
   SELECT folder_path FROM clients WHERE id = 7;
   ```
   Deve ser relativo (ex: `Luiz Lopes/11999999999`)

3. **Criar pasta manualmente no QNAP:**
   - Via File Station
   - Navegue para `/share/Tatuagens`
   - Crie pasta do cliente

---

### Problema 6: Timeout ou Sem Resposta

**Sintomas:**
- Botão clica mas demora muito
- Erro de timeout

**Soluções:**

1. **Verificar conectividade:**
   ```bash
   ping [QNAP_HOST]
   telnet [QNAP_HOST] 80
   ```

2. **Verificar firewall:**
   - QNAP deve permitir conexões HTTP na porta 80
   - Backend deve ter acesso à rede do QNAP

3. **Verificar QNAP está ligado:**
   - Pingar IP do QNAP
   - Acessar manualmente pelo navegador

---

## Configurações Avançadas

### Porta Customizada

Se QNAP usa porta diferente de 80:

```env
QNAP_HOST=192.168.1.100
QNAP_PORT=8080
```

Backend irá gerar URL: `http://192.168.1.100:8080`

### HTTPS (SSL)

Para QNAP com certificado SSL:

```env
QNAP_HOST=qnap.meudominio.com
QNAP_PORT=443
QNAP_USE_HTTPS=true
```

**Nota:** Requer modificação no código do backend para suportar HTTPS.

### Múltiplos Compartilhamentos

Para clientes em diferentes compartilhamentos:

**Opção 1:** Criar campo `qnap_share` no banco de dados por cliente

**Opção 2:** Usar caminho completo em `folder_path`:
```sql
UPDATE clients SET folder_path = 'share1/Cliente1/telefone' WHERE id = 1;
UPDATE clients SET folder_path = 'share2/Cliente2/telefone' WHERE id = 2;
```

---

## Checklist de Configuração

Use esta checklist para garantir que tudo está configurado:

- [ ] QNAP acessível na rede
- [ ] File Station habilitado no QNAP
- [ ] Compartilhamento criado (ex: `/share/Tatuagens`)
- [ ] Variáveis adicionadas ao `.env`
- [ ] Backend reiniciado
- [ ] Logs confirmam QNAP habilitado
- [ ] Endpoint testado com `curl`
- [ ] Botão habilitado no frontend
- [ ] Tooltip mostra mensagem correta
- [ ] Nova aba abre ao clicar
- [ ] Caminho da pasta está correto

---

## Referências Rápidas

### Variáveis Mínimas

```env
QNAP_ENABLED=true
QNAP_HOST=192.168.1.100
QNAP_SHARE_PATH=/share/Tatuagens
```

### Teste Rápido

```bash
# 1. Verificar variáveis
cat agenda-hibrida-v2/.env | grep QNAP

# 2. Testar conectividade
ping 192.168.1.100

# 3. Testar endpoint
curl -X POST http://localhost:3001/api/clients/7/open-qnap-folder

# 4. Verificar logs do backend
# Procurar por: "✅ QNAP habilitado"
```

### Estrutura de Pasta Padrão

```
/share/Tatuagens/
  └── [Nome Cliente]/
       └── [Telefone]/
            ├── referencias/
            ├── inspiracoes/
            ├── fotos_sessao/
            ├── fotos_finais/
            └── documentos/
```

---

## Suporte

Se os problemas persistirem:

1. Verificar logs do backend: `tail -f agenda-hibrida-v2/server.log`
2. Verificar console do navegador: F12 > Console
3. Testar acesso manual ao QNAP: `http://[IP_DO_QNAP]`
4. Consultar documentação oficial do QNAP File Station

---

**Configuração concluída! O botão QNAP agora deve funcionar perfeitamente! 🎉**

