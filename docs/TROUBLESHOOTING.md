# 🔧 Troubleshooting Guide

Guia completo de resolução de problemas do TattooScheduler.

## 📋 Índice

- [Problemas Comuns](#problemas-comuns)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Google APIs](#google-apis)
  - [Banco de Dados](#banco-de-dados)
  - [Upload de Arquivos](#upload-de-arquivos)
- [Ferramentas de Diagnóstico](#ferramentas-de-diagnóstico)
- [Logs](#logs)
- [Performance](#performance)
- [Segurança](#segurança)

---

## 🔥 Problemas Comuns

### Backend

#### Problema: Servidor não inicia

**Sintoma**:
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**Causa**: Porta 3001 já está em uso por outro processo.

**Solução**:

```bash
# 1. Encontrar o processo usando a porta
lsof -i :3001

# 2. Matar o processo (substitua PID pelo ID mostrado)
kill -9 PID

# 3. Ou use uma porta diferente no .env
PORT=3002
```

---

#### Problema: Erro de módulo não encontrado

**Sintoma**:
```bash
Error: Cannot find module 'express'
```

**Causa**: Dependências não instaladas corretamente.

**Solução**:

```bash
cd agenda-hibrida-v2

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar instalação
npm list express
```

---

#### Problema: Erro ao conectar com banco de dados

**Sintoma**:
```bash
Error: SQLITE_CANTOPEN: unable to open database file
```

**Causa**: Permissões incorretas ou caminho inválido.

**Solução**:

```bash
# 1. Verificar se o arquivo existe
ls -la agenda_hibrida.db

# 2. Dar permissões corretas
chmod 664 agenda_hibrida.db

# 3. Se não existir, criar novamente
node scripts/setup-complete.js
```

---

#### Problema: Variáveis de ambiente não carregadas

**Sintoma**: `undefined` ao acessar `process.env.GOOGLE_CLIENT_ID`

**Causa**: Arquivo `.env` não existe ou está mal configurado.

**Solução**:

```bash
# 1. Verificar se .env existe
ls -la .env

# 2. Criar .env se necessário
cp .env.example .env

# 3. Editar e adicionar valores reais
nano .env

# 4. Verificar se dotenv está carregando
node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

---

### Frontend

#### Problema: Frontend não compila

**Sintoma**:
```bash
Error: Could not resolve '@/components/ui/button'
```

**Causa**: Alias `@` não configurado ou componente faltando.

**Solução**:

```bash
# 1. Verificar vite.config.js
cat vite.config.js | grep resolve

# Deve conter:
# resolve: {
#   alias: {
#     "@": path.resolve(__dirname, "./src"),
#   },
# }

# 2. Verificar se o componente existe
ls -la src/components/ui/button.jsx

# 3. Se não existir, criar componentes shadcn
npx shadcn@latest add button
```

---

#### Problema: Erro de CORS

**Sintoma**:
```
Access to fetch at 'http://localhost:3001/api/clients' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Causa**: Backend não está configurado para aceitar requisições do frontend.

**Solução**:

```javascript
// Em agenda-hibrida-v2/server.js

const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

#### Problema: Hot Module Replacement (HMR) não funciona

**Sintoma**: Mudanças no código não refletem automaticamente.

**Solução**:

```bash
# 1. Limpar cache do Vite
rm -rf node_modules/.vite

# 2. Reiniciar servidor
# Ctrl+C, depois:
npm run dev

# 3. Se ainda não funcionar, tentar em outro navegador
# Ou desabilitar extensions do navegador
```

---

#### Problema: Build de produção falha

**Sintoma**:
```bash
Build failed with 1 error:
error: Could not resolve "react"
```

**Causa**: Dependências de produção faltando.

**Solução**:

```bash
# 1. Verificar se React está em dependencies (não devDependencies)
cat package.json | grep react

# 2. Reinstalar
npm install react react-dom --save

# 3. Tentar build novamente
npm run build
```

---

### Google APIs

#### Problema: Autenticação Google falha

**Sintoma**:
```
Error: invalid_client
The OAuth client was not found.
```

**Causa**: Credenciais OAuth incorretas ou não configuradas.

**Solução**:

1. **Verificar Google Cloud Console**:
   - Acesse https://console.cloud.google.com
   - Navegue para "APIs & Services" → "Credentials"
   - Verifique se o OAuth 2.0 Client ID existe

2. **Verificar Redirect URI**:
   ```
   Authorized redirect URIs:
   http://localhost:3001/auth/google/callback
   ```

3. **Atualizar .env**:
   ```env
   GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   ```

4. **Testar autenticação**:
   ```bash
   # Abrir no navegador:
   http://localhost:3001/auth/google
   ```

---

#### Problema: APIs do Google desabilitadas

**Sintoma**:
```
Error: Google Calendar API has not been used in project XXXXXX
```

**Causa**: APIs não estão habilitadas no projeto.

**Solução**:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto
3. Navegue para "APIs & Services" → "Library"
4. Habilite:
   - Google Calendar API
   - Google Drive API
5. Aguarde alguns minutos para propagar
6. Teste novamente

---

#### Problema: Token expirado

**Sintoma**:
```
Error: invalid_grant
Token has been expired or revoked.
```

**Causa**: Token de acesso expirou.

**Solução**:

```bash
# 1. Remover token antigo
rm token.json

# 2. Reautenticar
curl http://localhost:3001/auth/google

# 3. Seguir fluxo OAuth no navegador
```

**Solução Automática**:
O sistema já implementa refresh automático. Verifique se `refresh_token` existe no `token.json`.

---

#### Problema: Quota excedida

**Sintoma**:
```
Error: Quota exceeded for quota metric 'Queries' and limit 'Queries per day'
```

**Causa**: Muitas requisições à API do Google.

**Solução**:

1. **Verificar quota no Console**:
   - "APIs & Services" → "Dashboard" → "Google Calendar API" → "Quotas"

2. **Reduzir frequência de sincronização**:
   ```javascript
   // Em server.js, mudar intervalo de sincronização
   cron.schedule('0 */1 * * *', syncAll); // A cada 1 hora ao invés de 15 min
   ```

3. **Implementar cache**:
   O sistema já tem cache implementado. Verificar se está ativo:
   ```javascript
   // Usar middleware de cache nas rotas
   app.get('/api/appointments', cacheMiddleware(5 * 60 * 1000), ...);
   ```

4. **Solicitar aumento de quota** (se necessário):
   - "APIs & Services" → "Quotas" → "Request Increase"

---

### Banco de Dados

#### Problema: Banco corrompido

**Sintoma**:
```
Error: database disk image is malformed
```

**Causa**: Arquivo do banco de dados corrompido.

**Solução**:

```bash
# 1. Fazer backup do banco atual (mesmo corrompido)
cp agenda_hibrida.db agenda_hibrida_corrupted_backup.db

# 2. Tentar recuperar
sqlite3 agenda_hibrida.db ".recover" > recovered.sql
sqlite3 agenda_hibrida_new.db < recovered.sql

# 3. Se recuperação funcionar, substituir
mv agenda_hibrida.db agenda_hibrida_old.db
mv agenda_hibrida_new.db agenda_hibrida.db

# 4. Se não funcionar, restaurar de backup
ls -la backups/
cp backups/backup-YYYYMMDD-HHMMSS.db agenda_hibrida.db
```

---

#### Problema: Duplicatas no banco

**Sintoma**: Clientes ou agendamentos duplicados.

**Causa**: Falta de constraints UNIQUE ou falha na validação.

**Solução**:

```bash
# Usar script de limpeza
node scripts/fix-tattoo-types-duplication.js

# Para outras tabelas, inspecionar manualmente
sqlite3 agenda_hibrida.db

# Encontrar duplicatas de clientes
SELECT email, COUNT(*) as count 
FROM clients 
GROUP BY email 
HAVING count > 1;

# Remover duplicatas (mantenha o mais recente)
DELETE FROM clients 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM clients 
  GROUP BY email
);
```

---

#### Problema: Migrações não aplicadas

**Sintoma**: Tabelas ou colunas faltando.

**Causa**: Migrations não foram executadas.

**Solução**:

```bash
# Verificar tabelas existentes
sqlite3 agenda_hibrida.db ".tables"

# Aplicar migrations
node scripts/apply-performance-indexes.js

# Verificar schema
sqlite3 agenda_hibrida.db ".schema tattoo_types"
```

---

### Upload de Arquivos

#### Problema: Upload falha

**Sintoma**:
```
Error: ENOENT: no such file or directory, open '/uploads/...'
```

**Causa**: Pasta de uploads não existe ou sem permissões.

**Solução**:

```bash
# 1. Criar pasta se não existir
mkdir -p uploads/clients

# 2. Dar permissões corretas
chmod 755 uploads
chmod 775 uploads/clients

# 3. Verificar se o servidor tem permissão de escrita
touch uploads/test.txt
ls -la uploads/test.txt
rm uploads/test.txt
```

---

#### Problema: Arquivo muito grande

**Sintoma**:
```
Error: PayloadTooLargeError: request entity too large
```

**Causa**: Limite de upload excedido.

**Solução**:

```javascript
// Em server.js, aumentar limite
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ou usar upload em chunks para arquivos grandes
// (já implementado em src/utils/advancedUpload.js)
```

---

#### Problema: Compressão de imagem falha

**Sintoma**: Erro ao fazer upload de imagens grandes.

**Causa**: Biblioteca de compressão não instalada ou erro no processamento.

**Solução**:

```bash
# 1. Verificar se browser-image-compression está instalado (frontend)
npm list browser-image-compression

# 2. Se não estiver, instalar
npm install browser-image-compression --save

# 3. Verificar se Sharp está instalado (backend)
cd agenda-hibrida-v2
npm list sharp

# 4. Reinstalar Sharp se necessário
npm install sharp --save
```

---

## 🛠️ Ferramentas de Diagnóstico

### Verificar Status do Sistema

```bash
# Backend
curl http://localhost:3001/health

# Esperado:
# {"status":"ok","uptime":123.45}
```

### Testar Conectividade com Google

```bash
# 1. Verificar autenticação
curl http://localhost:3001/auth/status

# 2. Listar eventos do calendário
curl http://localhost:3001/api/google-calendar/events

# 3. Listar arquivos do Drive
curl http://localhost:3001/api/google-drive/files
```

### Verificar Banco de Dados

```bash
# Conectar ao banco
sqlite3 agenda_hibrida.db

# Comandos úteis
.tables                     # Listar tabelas
.schema tablename          # Ver estrutura de tabela
SELECT COUNT(*) FROM clients;  # Contar registros
.quit                      # Sair
```

### Testar Upload

```bash
# Upload simples via cURL
curl -X POST http://localhost:3001/api/files/upload \
  -F "file=@test-image.jpg" \
  -F "client_id=1" \
  -F "category=fotos_finais"
```

### Verificar Permissões

```bash
# Permissões de arquivos
ls -la agenda_hibrida.db
ls -la uploads/
ls -la .env

# Processos rodando
ps aux | grep node

# Portas em uso
lsof -i :3001
lsof -i :5173
```

---

## 📊 Logs

### Localização dos Logs

```bash
# Backend
agenda-hibrida-v2/logs/combined.log    # Todos os logs
agenda-hibrida-v2/logs/error.log       # Apenas erros

# Relatórios de teste
test-reports/
```

### Ver Logs em Tempo Real

```bash
# Todos os logs
tail -f agenda-hibrida-v2/logs/combined.log

# Apenas erros
tail -f agenda-hibrida-v2/logs/error.log

# Filtrar por palavra-chave
tail -f logs/combined.log | grep "ERROR"
```

### Limpar Logs Antigos

```bash
# Limpar logs com mais de 30 dias
find logs/ -name "*.log" -mtime +30 -delete

# Ou rodar script de limpeza
node scripts/cleanup-old-logs.js
```

---

## ⚡ Performance

### Problema: API Lenta

**Sintoma**: Requisições demoram mais de 2 segundos.

**Diagnóstico**:

```bash
# Testar tempo de resposta
time curl http://localhost:3001/api/appointments
```

**Soluções**:

1. **Verificar índices do banco**:
```bash
node scripts/apply-performance-indexes.js
```

2. **Ativar cache**:
```javascript
// Já implementado em server.js
// Verificar se está funcionando nos logs
```

3. **Reduzir payload**:
```javascript
// Usar paginação
GET /api/clients?limit=50&offset=0

// Selecionar apenas campos necessários
GET /api/appointments?fields=id,start_datetime,client_name
```

4. **Ativar compressão Gzip** (já implementado):
```javascript
// Em server.js, verificar se compression está ativo
app.use(compression());
```

---

### Problema: Frontend Lento

**Sintoma**: Aplicação trava ao carregar.

**Diagnóstico**:

```bash
# Analisar bundle
npm run build:analyze

# Verificar tamanho dos chunks
ls -lh dist/assets/js/
```

**Soluções**:

1. **Code Splitting** (já implementado):
Verificar `vite.config.js` → `rollupOptions.output.manualChunks`

2. **Lazy Loading de Rotas**:
```javascript
const CalendarioVisual = lazy(() => import('./components/CalendarioVisual'));
```

3. **Memoização**:
```javascript
const MemoizedComponent = memo(MyComponent);
```

4. **Virtual Scrolling** para listas longas:
```bash
npm install react-window
```

---

## 🔒 Segurança

### Problema: Credenciais expostas

**Sintoma**: `.env` commitado no git.

**Solução**:

```bash
# 1. Remover do histórico (ATENÇÃO: Reescreve histórico)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Adicionar ao .gitignore
echo ".env" >> .gitignore

# 3. Regenerar credenciais no Google Cloud Console

# 4. Atualizar .env com novas credenciais
```

---

### Problema: Rate Limiting Ativado

**Sintoma**:
```
Error 429: Too Many Requests
```

**Causa**: Muitas requisições em pouco tempo.

**Solução**:

```javascript
// Aumentar limite em server.js (use com cautela)
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // 200 requisições por minuto (aumentado de 100)
});

app.use('/api/', limiter);
```

---

## 📞 Suporte

### Checklist de Diagnóstico

Antes de solicitar suporte, execute:

```bash
# 1. Verificar versões
node --version
npm --version

# 2. Testar backend
curl http://localhost:3001/health

# 3. Verificar logs
tail -n 50 logs/error.log

# 4. Testar conectividade Google
curl http://localhost:3001/auth/status

# 5. Verificar banco
sqlite3 agenda_hibrida.db ".tables"

# 6. Executar testes
node scripts/test-system.js
```

### Informações para Reportar Problema

Ao abrir uma issue, inclua:

1. **Sistema Operacional**: macOS, Windows, Linux
2. **Versões**:
   - Node.js: `node --version`
   - npm: `npm --version`
3. **Logs de Erro**: Últimas 50 linhas de `logs/error.log`
4. **Passos para Reproduzir**: Detalhados
5. **Comportamento Esperado vs Atual**
6. **Screenshots** (se aplicável)

---

## 🔄 Resetar Sistema Completo

**⚠️ ATENÇÃO: Isso apagará todos os dados!**

```bash
# 1. Fazer backup primeiro
cp agenda_hibrida.db backups/backup-$(date +%Y%m%d-%H%M%S).db

# 2. Parar servidores
# Ctrl+C nos terminais

# 3. Limpar banco
rm agenda_hibrida.db

# 4. Limpar uploads
rm -rf uploads/*

# 5. Limpar cache
rm -rf node_modules/.cache
rm -rf agenda-hibrida-frontend/node_modules/.vite

# 6. Reiniciar setup
cd agenda-hibrida-v2
node scripts/setup-complete.js

# 7. Reiniciar servidores
npm start  # Backend
cd ../agenda-hibrida-frontend && npm run dev  # Frontend
```

---

## 📚 Recursos Adicionais

- [README Principal](README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Frontend README](agenda-hibrida-frontend/README.md)
- [Otimizações de Performance](OTIMIZACOES_PERFORMANCE.md)
- [Limpeza de Código](agenda-hibrida-v2/LIMPEZA_CODIGO.md)

---

**Guia mantido pela equipe de desenvolvimento**

*Última atualização: Outubro 2025*

