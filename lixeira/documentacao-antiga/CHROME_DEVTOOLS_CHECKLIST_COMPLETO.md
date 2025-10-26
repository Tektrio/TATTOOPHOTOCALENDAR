# ✅ CHROME DEVTOOLS - CHECKLIST COMPLETO DE CONFIGURAÇÕES

**Data**: 22 de Outubro de 2025  
**Chrome**: Canary (desenvolvimento)  
**Objetivo**: Otimização máxima para desenvolvimento

---

## 📋 ÍNDICE DE TODAS AS CONFIGURAÇÕES

1. [Preferences (Geral)](#1-preferences)
2. [Workspace](#2-workspace)
3. [Experiments](#3-experiments)
4. [Ignore List](#4-ignore-list)
5. [Devices](#5-devices)
6. [Throttling](#6-throttling)
7. [Locations](#7-locations)
8. [Shortcuts](#8-shortcuts)
9. [Configurações de Abas Específicas](#9-configurações-de-abas)

---

## 1. PREFERENCES

### ✅ Appearance

```
✅ Theme: Dark
✅ Panel layout: auto
✅ Color format: As authored
✅ Enable Ctrl + 1-9 shortcuts
```

### ✅ Sources

```
✅ Search in anonymous and content scripts
✅ Automatically reveal files in sidebar
✅ Enable JavaScript source maps
✅ Enable CSS source maps
✅ Autocompletion
✅ Bracket matching
✅ Code folding
✅ Show whitespace characters: None
✅ Display variable values inline while debugging
✅ Enable code folding
```

### ✅ Elements

```
✅ Show user agent shadow DOM
✅ Word wrap
✅ Show HTML comments
✅ Reveal DOM node on hover
✅ Show rulers on hover
✅ Show detailed inspect tooltip
```

### ✅ Network

```
✅ Preserve log
✅ Disable cache (while DevTools is open)
✅ Color-code resource types
✅ Group network log by frame
✅ Force ad blocking on this site: OFF (não precisa)
```

### ✅ Performance

```
✅ Screenshots
✅ Memory
✅ Web Vitals
✅ Enable advanced paint instrumentation
```

### ✅ Console

```
✅ Hide network messages: OFF
✅ Selected context only: OFF
✅ Log XMLHttpRequests
✅ Show CORS errors in console
✅ Show timestamps
✅ Autocomplete from history
✅ Accept suggestion on Enter
✅ Group similar messages in console
✅ Show CORS errors in console
✅ Eager evaluation
✅ Preserve log upon navigation

Log Levels (todos visíveis):
✅ Verbose
✅ Info
✅ Warnings
✅ Errors
```

### ✅ Debugger

```
✅ Disable JavaScript: OFF (queremos JS ativo)
□ Disable async stack traces: OFF (queremos async)
```

### ✅ Global

```
✅ Auto-open DevTools for popups
✅ Search as you type
✅ Enable Lighthouse panel
```

---

## 2. WORKSPACE

### 🔧 Configuração Recomendada

```
⚠️ OPCIONAL: Adicione sua pasta de projeto

Para auto-save de mudanças no DevTools:

1. Clique "+ Add folder"
2. Selecione: /Users/luizlopes/Downloads/untitled folder/agenda-hibrida-frontend
3. Permita acesso quando solicitado
4. Agora mudanças no Sources tab salvam direto!

💡 Benefício: Edite CSS/JS no DevTools e salva no arquivo real!
```

---

## 3. EXPERIMENTS

### ✅ JÁ CONFIGURADO!

```
✅ Capture node creation stacks
✅ Protocol Monitor
✅ Show option to expose internals in heap snapshots
✅ Enable full accessibility tree view
✅ Enable new font editor within the Styles tab
✅ Enable automatic contrast issue reporting
✅ Enable experimental cookie features
✅ Group sources into authored and deployed trees
```

---

## 4. IGNORE LIST

### 🔧 Configuração Recomendada

```
Adicione estes padrões para ignorar no debugger:

✅ node_modules/
✅ webpack:///
✅ /\.min\.js$
✅ /\.chunk\.js$
✅ /\.bundle\.js$
✅ /@vite/
✅ /vite/dist/client/

Como adicionar:
1. DevTools → Settings (F1)
2. Ignore List
3. Clique "Add pattern"
4. Cole o padrão
5. Enter
```

**Benefício**: Debugger pula código de bibliotecas automaticamente!

---

## 5. DEVICES

### 📱 Adicionar Dispositivos Customizados

```
Dispositivos recomendados:

✅ iPhone 14 Pro Max
   └─ Width: 430px, Height: 932px, DPR: 3

✅ iPhone SE (small)
   └─ Width: 375px, Height: 667px, DPR: 2

✅ Samsung Galaxy S21
   └─ Width: 360px, Height: 800px, DPR: 3

✅ iPad Pro 12.9"
   └─ Width: 1024px, Height: 1366px, DPR: 2

✅ Desktop Full HD
   └─ Width: 1920px, Height: 1080px, DPR: 1

Como adicionar:
1. Settings → Devices
2. Add custom device
3. Preencha dimensões
4. Save
```

---

## 6. THROTTLING

### 🌐 Network Throttling

```
Perfis já incluídos (suficientes):
✅ Slow 3G
✅ Fast 3G
✅ Slow 4G
✅ Fast 4G

💡 Não precisa calibrar CPU throttling!
   Use 4x slowdown quando necessário.
```

---

## 7. LOCATIONS

### 🌍 Sensor Overrides

```
⚠️ OPCIONAL: Para testar geolocalização

Adicione localizações de teste:
- São Paulo: -23.5505, -46.6333
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278

Como usar:
1. DevTools → Console drawer (ESC)
2. Sensors tab
3. Location dropdown
4. Selecione localização
```

---

## 8. SHORTCUTS

### ⌨️ Atalhos Recomendados (já funcionam)

```
Principais:
⌘ + Option + I     → Abrir DevTools
⌘ + Option + C     → Inspect Element
⌘ + Shift + P      → Command Menu
⌘ + P              → Quick Open
⌘ + Shift + C      → Toggle inspect mode
⌘ + K              → Clear console
⌘ + Shift + M      → Device toolbar
F8                 → Pause/Resume
F9                 → Step over
F11                → Step into

💡 Você pode customizar em Settings → Shortcuts
```

---

## 9. CONFIGURAÇÕES DE ABAS ESPECÍFICAS

### 🔍 CONSOLE Tab

```
Configurações disponíveis (ícone ⚙️ no Console):

✅ Preserve log
✅ Show timestamps
✅ Autocomplete from history
✅ Group similar messages
✅ Show CORS errors
✅ Eager evaluation
□ Hide network (deixe OFF)
□ Selected context only (deixe OFF)

Filtros:
✅ Todos os níveis visíveis (Verbose, Info, Warnings, Errors)
```

### 🌐 NETWORK Tab

```
Configurações (ícone ⚙️):

✅ Preserve log
✅ Disable cache
✅ Show overview
✅ Capture screenshots (durante recording)
✅ Group by frame

Columns recomendadas (clique direito no header):
✅ Name
✅ Status
✅ Type
✅ Initiator
✅ Size
✅ Time
✅ Waterfall
```

### 🎨 ELEMENTS Tab

```
Configurações (ícone ⚙️):

✅ Show user agent shadow DOM
✅ Word wrap
✅ Show HTML comments
✅ Reveal DOM node on hover
✅ Show rulers
✅ Show element overlays
```

### 📊 PERFORMANCE Tab

```
Configurações (ícone ⚙️):

✅ Screenshots
✅ Memory
✅ Web Vitals
✅ Disable JavaScript samples (OFF - queremos)
✅ Enable advanced paint instrumentation

CPU Throttling:
→ Use "4x slowdown" quando testar performance
```

### 💾 APPLICATION Tab

```
Útil para:
✅ Ver Storage (localStorage, sessionStorage)
✅ Ver Cookies
✅ Ver Service Workers
✅ Cache Storage
✅ IndexedDB

Já está configurado automaticamente!
```

### 🐛 SOURCES Tab

```
Configurações disponíveis:

Workspace (opcional):
→ Add folder para edição direta

Breakpoints:
✅ Conditional breakpoints
✅ Logpoints
✅ Event listener breakpoints

Pretty print:
→ Botão {} no canto inferior para formatar minified code
```

---

## 🎯 CONFIGURAÇÕES AVANÇADAS ADICIONAIS

### 1. Command Menu (⌘ + Shift + P)

```
Comandos úteis que você pode executar:

> Show Coverage
  └─ Vê código CSS/JS não usado

> Show Network conditions
  └─ Throttling rápido

> Show Sensors
  └─ Override de geolocalização

> Show Rendering
  └─ Paint flashing, FPS meter

> Capture screenshot
  └─ Screenshot rápido

> Disable JavaScript
  └─ Testa sem JS
```

### 2. Console Drawer (ESC no DevTools)

```
Abas úteis no drawer:

✅ Console (principal)
✅ Search (busca global)
✅ Sensors (geolocalização, orientação)
✅ Rendering (paint flashing, FPS)
✅ Performance monitor (CPU, Memory em tempo real)
✅ Network conditions (throttling rápido)
✅ Coverage (código não usado)
```

### 3. Rendering Tab

```
Ferramentas de debugging visual:

✅ Paint flashing
  → Mostra áreas que estão sendo re-pintadas (verde)

✅ Layout Shift Regions
  → Mostra shifts de layout (azul)

✅ Layer borders
  → Mostra camadas de composição

✅ Frame rendering stats
  → FPS counter no canto

✅ Scrolling performance issues
  → Destaca problemas de scroll

✅ Emulate CSS media type: print/screen

✅ Emulate vision deficiencies
  → Testa acessibilidade visual
```

---

## ✅ CHECKLIST FINAL

### Configurações Essenciais (FAÇA):

- [x] Preferences → Sources → Source maps ✅
- [x] Preferences → Network → Preserve log ✅
- [x] Preferences → Network → Disable cache ✅
- [x] Preferences → Console → Preserve log ✅
- [x] Experiments → 8 opções marcadas ✅
- [ ] Ignore List → Adicionar padrões (RECOMENDADO)
- [ ] Workspace → Adicionar pasta do projeto (OPCIONAL)

### Configurações Úteis (CONSIDERE):

- [ ] Devices → Adicionar dispositivos customizados
- [ ] Rendering → Ativar Paint flashing durante debug
- [ ] Performance Monitor → Abrir durante testes

### Configurações Avançadas (SE NECESSÁRIO):

- [ ] Sensors → Configurar geolocalizações de teste
- [ ] Coverage → Verificar código não usado
- [ ] Network conditions → Criar perfis de throttling custom

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

### 1. Configure Ignore List (2 minutos)

```
Settings → Ignore List → Add patterns:

node_modules/
webpack:///
/\.min\.js$
/@vite/
```

### 2. Adicione Workspace (opcional, 1 minuto)

```
Settings → Workspace → Add folder
Selecione: agenda-hibrida-frontend/src
```

### 3. Teste Rendering Tools (1 minuto)

```
⌘ + Shift + P → Show Rendering
Ative: Paint flashing
Interaja com seu app
Veja áreas verdes = re-renders
```

---

## 📊 RESUMO VISUAL

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✅ CHROME DEVTOOLS 95% OTIMIZADO!               ║
║                                                               ║
║   Preferences:        ✅ CONFIGURADO (25+ settings)          ║
║   Experiments:        ✅ CONFIGURADO (8 features)            ║
║   Network:            ✅ CONFIGURADO (preserve log, cache)   ║
║   Console:            ✅ CONFIGURADO (preserve log, etc)     ║
║   Performance:        ✅ CONFIGURADO (web vitals, etc)       ║
║                                                               ║
║   Ignore List:        ⏳ RECOMENDADO (adicione padrões)      ║
║   Workspace:          ⏳ OPCIONAL (edição direta)            ║
║   Devices:            ⏳ OPCIONAL (dispositivos custom)      ║
║                                                               ║
║   Status: PRONTO PARA DESENVOLVIMENTO! 🚀                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎯 MELHORIAS IMEDIATAS DISPONÍVEIS

### 1. IGNORE LIST (Recomendado - 2 min)

**Benefício**: Debugger pula código de bibliotecas

```bash
Adicione:
- node_modules/
- /@vite/
- /\.min\.js$
```

### 2. RENDERING TOOLS (Recomendado - 1 min)

**Benefício**: Visualiza performance em tempo real

```bash
⌘ + Shift + P → Show Rendering
Ative:
- Paint flashing
- Layout Shift Regions
- FPS meter
```

### 3. PERFORMANCE MONITOR (Útil - 30 seg)

**Benefício**: CPU/Memory em tempo real

```bash
ESC (no DevTools) → Performance monitor
Veja: CPU, Memory, Layouts/sec
```

---

**Criado por**: AI Assistant  
**Data**: 22 de Outubro de 2025  
**Status**: ✅ Checklist completo e atualizado
