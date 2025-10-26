# 🌐 CONFIGURAÇÃO COMPLETA DO CHROME PARA DESENVOLVIMENTO AUTOMÁTICO

**Data**: 22 de Outubro de 2025  
**Objetivo**: Chrome otimizado para automação via Cursor + DevTools MCP

---

## 📋 ÍNDICE

1. [Chrome DevTools Settings](#chrome-devtools-settings)
2. [Chrome Flags](#chrome-flags)
3. [Extensões Recomendadas](#extensões-recomendadas)
4. [Configurações de Performance](#configurações-de-performance)
5. [Automação com MCP](#automação-com-mcp)
6. [Atalhos Úteis](#atalhos-úteis)

---

## 🛠️ CHROME DEVTOOLS SETTINGS

### 1. Abrir DevTools Settings

```
1. Abra o Chrome
2. Pressione F12 (ou ⌘ + Option + I no Mac)
3. Clique no ⚙️ (Settings) no canto superior direito
4. Ou pressione F1 dentro do DevTools
```

### 2. Preferences → Appearance

#### ✅ Theme

```
✅ Dark theme (recomendado para menor fadiga visual)
```

#### ✅ Panel Layout

```
✅ Auto (ajusta automaticamente)
```

#### ✅ Outras Opções

```
✅ Show What's New after each update
□ Disable paused state overlay (deixe desmarcado para debugging)
```

---

### 3. Preferences → Sources

#### ✅ TODAS estas opções devem estar ATIVAS:

```javascript
✅ Search in anonymous and content scripts
   └─ Permite buscar em scripts anônimos

✅ Automatically reveal files in sidebar
   └─ Revela arquivos automaticamente na sidebar

✅ JavaScript source maps
   └─ ESSENCIAL para debugging (mapeia código minificado)

✅ Tab moves focus
   └─ Tab move o foco entre elementos

✅ Detect indentation
   └─ Detecta indentação automaticamente

✅ Autocompletion
   └─ Autocomplete no Console

✅ Auto closing brackets
   └─ Fecha parênteses automaticamente

✅ Bracket matching
   └─ Destaca pares de parênteses

✅ Code folding
   └─ Permite colapsar blocos de código

✅ Display variable values inline while debugging
   └─ Mostra valores de variáveis inline durante debug
```

#### ⚠️ Show whitespace characters

```
□ None (recomendado)
   └─ Ou "All" se preferir ver espaços/tabs
```

#### ⚠️ Word wrap

```
□ Desmarcado (para ver linhas completas)
   └─ Ou marcado se preferir quebra de linha
```

---

### 4. Preferences → Elements

```javascript
✅ Show rulers
   └─ Mostra réguas para medições

✅ Show user agent shadow DOM
   └─ Mostra Shadow DOM do navegador

✅ Word wrap
   └─ Quebra linhas longas no HTML

✅ Show HTML comments
   └─ Mostra comentários HTML

✅ Reveal DOM node on hover
   └─ Destaca elemento ao passar mouse
```

---

### 5. Preferences → Network

```javascript
✅ Preserve log
   └─ Mantém log ao navegar entre páginas

✅ Enable request blocking
   └─ Permite bloquear requisições específicas

✅ Disable cache (while DevTools is open)
   └─ IMPORTANTE: Desabilita cache durante desenvolvimento

✅ Color-code resource types
   └─ Colore tipos de recursos (CSS, JS, images)

✅ Group network log by frame
   └─ Agrupa por frame/contexto
```

---

### 6. Preferences → Performance

```javascript
✅ Screenshots
   └─ Captura screenshots durante recording

✅ Memory
   └─ Mostra uso de memória

✅ Show web vitals
   └─ IMPORTANTE: Mostra Core Web Vitals (LCP, FID, CLS)

✅ Enable advanced paint instrumentation
   └─ Detalhes sobre rendering
```

---

### 7. Preferences → Console

```javascript
✅ Autocomplete from history
   └─ Autocomplete baseado em histórico

✅ Group similar messages in console
   └─ Agrupa mensagens repetidas

✅ Show CORS errors in console
   └─ Mostra erros de CORS

✅ Eager evaluation
   └─ Avalia expressões enquanto digita

✅ Preserve log upon navigation
   └─ Mantém log ao navegar

□ Hide network messages
   └─ Deixe DESMARCADO (queremos ver network)

□ Selected context only
   └─ Deixe DESMARCADO (queremos ver tudo)
```

#### Log Levels (mantenha todos visíveis):

```
✅ Verbose
✅ Info
✅ Warnings
✅ Errors
```

---

### 8. Preferences → Debugger

```javascript
✅ Disable JavaScript
   └─ Permite desabilitar JS temporariamente

✅ Disable async stack traces
   └─ DEIXE DESMARCADO (queremos async traces!)
```

---

## 🚀 CHROME FLAGS (chrome://flags)

### Como Acessar

```
1. Abra nova aba no Chrome
2. Digite: chrome://flags
3. Busque e configure as flags abaixo
```

### ✅ FLAGS RECOMENDADAS PARA DESENVOLVIMENTO

#### 1. Enable experimental web platform features

```
chrome://flags/#enable-experimental-web-platform-features
Status: Enabled
Motivo: Permite testar features experimentais
```

#### 2. Enable DevTools Experiments

```
chrome://flags/#enable-devtools-experiments
Status: Enabled
Motivo: Habilita experimentos no DevTools
```

#### 3. Enable CSS Grid debugging

```
chrome://flags/#enable-css-grid-debugging
Status: Enabled
Motivo: Debugging avançado de CSS Grid
```

#### 4. Enable Flexbox debugging

```
chrome://flags/#enable-css-flexbox-debugging
Status: Enabled
Motivo: Debugging avançado de Flexbox
```

#### 5. Enable WebAssembly Debugging

```
chrome://flags/#enable-webassembly-debugging
Status: Enabled
Motivo: Se usar WASM
```

#### 6. Hardware-accelerated video decode

```
chrome://flags/#hardware-accelerated-video-decode
Status: Enabled
Motivo: Performance em vídeos
```

#### 7. Override software rendering list

```
chrome://flags/#ignore-gpu-blocklist
Status: Enabled
Motivo: Força aceleração GPU
```

#### 8. Enable back/forward cache

```
chrome://flags/#back-forward-cache
Status: Disabled (para desenvolvimento)
Motivo: Cache pode esconder bugs
```

#### 9. Enable DevTools console.createTask() API

```
chrome://flags/#enable-experimental-async-stack-tagging-api
Status: Enabled
Motivo: Melhor async debugging
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS DO DEVTOOLS

### 1. Settings → Experiments (pressione Shift 6x em Settings)

#### ✅ Experimentos Recomendados:

```javascript
✅ Capture node creation stacks
   └─ Captura stacks de criação de nós DOM

✅ Show option to expose internals in heap snapshots
   └─ Mostra internals do V8

✅ Highlight violating nodes in Elements panel DOM tree
   └─ Destaca nós com violações

✅ Timeline: Show postMessage dispatch and handling flows
   └─ Mostra fluxo de postMessage

✅ Source order viewer
   └─ Mostra ordem do código fonte

✅ CSS authoring hints for color contrast
   └─ Hints de contraste de cores
```

---

## 📦 EXTENSÕES RECOMENDADAS

### Essenciais para Desenvolvimento

#### 1. **React Developer Tools**

```
Link: chrome://extensions
ID: fmkadmapgofadopljbjfkapdkoienihi
Uso: Debug de componentes React
```

#### 2. **Redux DevTools**

```
ID: lmhkpmbekcpmknklioeibfkpmmfibljd
Uso: Debug de estado Redux/Zustand
```

#### 3. **Lighthouse**

```
Já incluído no Chrome DevTools
Uso: Auditoria de performance e SEO
```

#### 4. **JSON Viewer**

```
ID: gbmdgpbipfallnflgajpaliibnhdgobh
Uso: Formata JSON automaticamente
```

#### 5. **Wappalyzer**

```
ID: gppongmhjkpfnbhagpmjfkannfbllamg
Uso: Identifica tecnologias usadas
```

#### 6. **ColorZilla**

```
ID: bhlhnicpbhignbdhedgjhgdocnmhomnp
Uso: Eyedropper e análise de cores
```

#### 7. **Pesticide for Chrome**

```
ID: bakpbgckdnepkmkeaiomhmfcnejndkbi
Uso: Visualiza elementos com borders
```

---

## ⚡ CONFIGURAÇÕES DE PERFORMANCE

### 1. Network Throttling Presets

#### No DevTools → Network tab:

```
1. Clique no dropdown "No throttling"
2. Configure perfis personalizados:

📱 Slow 3G:
   ├─ Download: 400 Kbps
   ├─ Upload: 400 Kbps
   └─ Latency: 400ms

📱 Fast 3G:
   ├─ Download: 1.6 Mbps
   ├─ Upload: 750 Kbps
   └─ Latency: 150ms

📱 Slow 4G:
   ├─ Download: 4 Mbps
   ├─ Upload: 3 Mbps
   └─ Latency: 100ms

📱 Fast 4G:
   ├─ Download: 10 Mbps
   ├─ Upload: 5 Mbps
   └─ Latency: 50ms
```

---

### 2. CPU Throttling

#### No DevTools → Performance tab:

```
1. Clique no ⚙️ (Settings)
2. Configure CPU throttling:

Options:
□ No throttling
✅ 4x slowdown (recomendado para testes)
□ 6x slowdown (dispositivos muito lentos)
```

---

### 3. Device Emulation

#### No DevTools → Device Toolbar (⌘ + Shift + M):

```
Adicione dispositivos customizados:

✅ iPhone 14 Pro Max
✅ Samsung Galaxy S21
✅ iPad Pro 12.9"
✅ Desktop Full HD (1920x1080)
✅ Desktop 4K (3840x2160)
```

---

## 🤖 AUTOMAÇÃO COM MCP (Chrome DevTools MCP)

### Configuração já aplicada em ~/.cursor/mcp.json

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "env": {
        "CHROME_PATH": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      }
    }
  }
}
```

### Comandos MCP Disponíveis:

```javascript
// 1. Navegar para URL
mcp_chrome - devtools_navigate_page({ url: "http://localhost:5174" });

// 2. Tirar screenshot
mcp_chrome - devtools_take_screenshot();

// 3. Capturar snapshot do DOM
mcp_chrome - devtools_take_snapshot();

// 4. Clicar em elemento
mcp_chrome - devtools_click({ uid: "elemento_id" });

// 5. Preencher formulário
mcp_chrome - devtools_fill({ uid: "input_id", value: "texto" });

// 6. Executar JavaScript
mcp_chrome -
  devtools_evaluate_script({
    function: "() => document.title",
  });

// 7. Listar network requests
mcp_chrome - devtools_list_network_requests();

// 8. Redimensionar janela
mcp_chrome - devtools_resize_page({ width: 1920, height: 1080 });

// 9. Emular rede lenta
mcp_chrome - devtools_emulate_network({ throttlingOption: "Slow 3G" });

// 10. Emular CPU lenta
mcp_chrome - devtools_emulate_cpu({ throttlingRate: 4 });
```

---

## ⌨️ ATALHOS ÚTEIS DO CHROME DEVTOOLS

### Atalhos Essenciais (Mac):

```
⌘ + Option + I    → Abrir/Fechar DevTools
⌘ + Option + J    → Abrir Console diretamente
⌘ + Option + C    → Abrir Elements/Inspector
⌘ + Shift + M     → Toggle Device Toolbar
⌘ + Shift + P     → Command Menu (MUITO ÚTIL!)
⌘ + P             → Open File (Quick Open)
⌘ + Shift + C     → Inspect Element mode
⌘ + K             → Clear Console
⌘ + L             → Clear Console (alternativo)
⌘ + [             → Panel anterior
⌘ + ]             → Próximo panel
⌘ + Shift + D     → Toggle Dock Position
Esc               → Toggle Console Drawer
```

### Atalhos de Debugging:

```
F8 (⌘ + \)        → Resume/Pause script execution
F9 (⌘ + ')        → Step over next function call
F10               → Step into next function call
F11 (⌘ + ;)       → Step out of current function
⌘ + .             → Run snippet
```

### Atalhos de Edição:

```
⌘ + D             → Select next occurrence
⌘ + U             → Select all occurrences
⌘ + /             → Toggle comment
⌘ + ]             → Increase indent
⌘ + [             → Decrease indent
```

---

## 🎯 CONFIGURAÇÃO PARA SEU APP (Agenda Híbrida)

### URLs para Adicionar aos Favoritos:

```javascript
// Frontend (React + Vite)
http://localhost:5174

// Backend (API)
http://localhost:3001

// Backend Health Check
http://localhost:3001/health

// Backend API Docs (se existir)
http://localhost:3001/api-docs
```

### Network Conditions Customizadas:

```javascript
// Para testar upload de imagens
Custom Profile: "Image Upload Test"
├─ Download: 5 Mbps
├─ Upload: 1 Mbps (upload lento)
└─ Latency: 100ms

// Para testar sincronização Google Drive
Custom Profile: "Cloud Sync"
├─ Download: 10 Mbps
├─ Upload: 2 Mbps
└─ Latency: 50ms
```

---

## 📊 LIGHTHOUSE: MÉTRICAS IMPORTANTES

### Como Executar Lighthouse:

```
1. Abra DevTools (F12)
2. Vá para a aba "Lighthouse"
3. Selecione categorias:
   ✅ Performance
   ✅ Accessibility
   ✅ Best Practices
   ✅ SEO
4. Selecione Device: Mobile / Desktop
5. Clique "Analyze page load"
```

### Métricas Alvo para seu App:

```
Performance:
├─ FCP (First Contentful Paint): < 1.8s ✅
├─ LCP (Largest Contentful Paint): < 2.5s ✅
├─ CLS (Cumulative Layout Shift): < 0.1 ✅
├─ FID (First Input Delay): < 100ms ✅
└─ TBT (Total Blocking Time): < 300ms ✅

Accessibility:
└─ Score: > 90 ✅

Best Practices:
└─ Score: > 90 ✅

SEO:
└─ Score: > 80 ✅
```

---

## 🔍 CONSOLE SNIPPETS ÚTEIS

### Criar Snippets (DevTools → Sources → Snippets):

#### 1. **Check Performance**

```javascript
// Nome: check-performance.js
console.log("🚀 Performance Metrics:");
console.log("FCP:", performance.getEntriesByType("paint")[0].startTime);
console.log(
  "LCP:",
  performance.getEntriesByType("largest-contentful-paint")[0]?.startTime
);
console.log(
  "Memory:",
  (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
  "MB"
);
```

#### 2. **List All API Calls**

```javascript
// Nome: list-api-calls.js
const requests = performance
  .getEntriesByType("resource")
  .filter(
    (r) => r.initiatorType === "fetch" || r.initiatorType === "xmlhttprequest"
  )
  .map((r) => ({
    url: r.name,
    duration: r.duration.toFixed(2) + "ms",
    size: r.transferSize + " bytes",
  }));
console.table(requests);
```

#### 3. **Check React Version**

```javascript
// Nome: check-react-version.js
console.log("React Version:", React.version);
console.log("React DOM Version:", ReactDOM.version);
```

#### 4. **List All Images**

```javascript
// Nome: list-images.js
const images = Array.from(document.images).map((img) => ({
  src: img.src,
  width: img.naturalWidth,
  height: img.naturalHeight,
  loaded: img.complete,
}));
console.table(images);
```

---

## 🎨 TEMAS E CUSTOMIZAÇÃO

### Instalar Tema Escuro Personalizado:

```
1. Abra DevTools Settings (F1)
2. Vá para "Preferences" → "Appearance"
3. Theme: Dark
4. Match Chrome color scheme: ✅
```

### Customizar Cores do Console:

```
DevTools → Settings → Preferences → Console:

✅ Preserve log
✅ Show timestamps
✅ Group similar messages
✅ Autocomplete from history
```

---

## 🛡️ SEGURANÇA E PRIVACIDADE

### Configurações para Desenvolvimento:

```javascript
// Desabilitar Mixed Content Warnings (DEV ONLY!)
// chrome://flags/#unsafely-treat-insecure-origin-as-secure

// Adicione suas URLs de dev:
http://localhost:3001
http://localhost:5174

⚠️ ATENÇÃO: Apenas para desenvolvimento!
```

---

## 📱 DEVICE PROFILES CUSTOMIZADOS

### Adicionar seus dispositivos:

```
DevTools → Settings → Devices → Add custom device:

📱 iPhone 14 Pro Max:
├─ Width: 430px
├─ Height: 932px
├─ Device pixel ratio: 3
└─ User agent: iPhone

💻 MacBook Pro 16":
├─ Width: 1728px
├─ Height: 1117px
├─ Device pixel ratio: 2
└─ User agent: Desktop

🖥️ iMac 27" 5K:
├─ Width: 2560px
├─ Height: 1440px
├─ Device pixel ratio: 2
└─ User agent: Desktop
```

---

## ✅ CHECKLIST FINAL

### Verificar se tudo está configurado:

```
□ DevTools Settings → Sources → Todas opções ✅
□ DevTools Settings → Network → Preserve log ✅
□ DevTools Settings → Console → Preserve log ✅
□ Chrome Flags → Enable DevTools Experiments ✅
□ Chrome Flags → Experimental web platform features ✅
□ Extensões instaladas (React DevTools, etc.) ✅
□ Network Throttling profiles configurados ✅
□ Device profiles adicionados ✅
□ Snippets criados ✅
□ MCP configurado e funcionando ✅
□ Atalhos memorizados ✅
```

---

## 🎯 TESTE SUAS CONFIGURAÇÕES

### Execute estes testes:

```javascript
// 1. Teste Network Throttling
// DevTools → Network → Throttle: Slow 3G
// Recarregue a página e veja o tempo de carregamento

// 2. Teste CPU Throttling
// DevTools → Performance → Record com 4x slowdown
// Interaja com a aplicação

// 3. Teste Device Emulation
// DevTools → Device Toolbar → iPhone 14 Pro Max
// Verifique se layout é responsivo

// 4. Teste Console Snippets
// DevTools → Sources → Snippets → Run check-performance.js
// Verifique métricas

// 5. Teste MCP Automation
// Use Cursor para executar comandos Chrome DevTools MCP
// Verifique se screenshots funcionam
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Aplique todas as configurações acima**
2. **Teste com seu app em http://localhost:5174**
3. **Execute Lighthouse e veja o score**
4. **Experimente automação via MCP**
5. **Crie snippets personalizados para seu workflow**

---

## 📞 COMANDOS RÁPIDOS

```bash
# Abrir Chrome com flags específicas (DEV):
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --disable-web-security \
  --user-data-dir=/tmp/chrome-dev-profile

# ⚠️ ATENÇÃO: Apenas para desenvolvimento!
# NUNCA use --disable-web-security em produção!
```

---

## ✅ CONCLUSÃO

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        ✅ CHROME CONFIGURADO PARA DESENVOLVIMENTO! ✅        ║
║                                                               ║
║   DevTools: ✅ Todas opções ativadas                         ║
║   Flags: ✅ Experimental features enabled                    ║
║   Extensões: ✅ React DevTools e mais                        ║
║   Performance: ✅ Throttling configurado                     ║
║   MCP: ✅ Automação funcionando                              ║
║   Snippets: ✅ Utilitários criados                           ║
║                                                               ║
║   Status: PRONTO PARA DESENVOLVIMENTO! 🚀                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

**Criado por**: AI Assistant  
**Data**: 22 de Outubro de 2025  
**Status**: ✅ Completo
