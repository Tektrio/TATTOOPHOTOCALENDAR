# 🚀 Configurações Otimizadas - Chrome DevTools & Cursor

## 📊 Especificações do Sistema

- **CPU**: 10 cores
- **RAM**: 8 GB
- **Conexão**: 4G (10 Mbps)
- **Plataforma**: Mac Intel

---

## ⚙️ CURSOR IDE - Settings Otimizados

### 1. Preferences ✅

```yaml
✅ MANTER ATIVO:
  - Automatically reveal files in sidebar
  - JavaScript source maps
  - CSS source maps
  - Detect indentation
  - Autocompletion
  - Auto closing brackets
  - Bracket matching
  - Code folding
  - Display variable values inline while debugging
  - Focus Sources panel when triggering a breakpoint
  - Automatically pretty print minified sources

❌ MANTER DESATIVADO (Performance):
  - Search in anonymous and content scripts
  - Word wrap (para arquivos grandes)

⚠️ OPCIONAL:
  - Show what's new after each update (preferência)
  - Enable ⌘ + 1-9 shortcut to switch panels
```

### 2. Workspace

```yaml
✅ ATIVAR:
  - Enable CSS source maps
  - Enable JavaScript source maps
  - Auto-save files after delay (opcional)

❌ DESATIVAR:
  - Search in anonymous content scripts (performance)
```

### 3. AI Innovations

```yaml
✅ ATIVAR:
  - Features de AI que você usa regularmente
  - Code completion
  - Inline suggestions

⚠️ CUIDADO:
  - Pode consumir mais CPU/RAM
```

### 4. Experiments 🧪

```yaml
❌ DESATIVAR:
  - Experimentos que você NÃO usa
  - Features beta instáveis

✅ ATIVAR APENAS:
  - Experimentos que você testa ativamente
```

### 5. Ignore List

```yaml
✅ ADICIONAR:
- node_modules/*
- build/*
- dist/*
- .next/*
- coverage/*
- *.min.js
```

### 6. Devices 📱

```yaml
✅ DISPOSITIVOS ÚTEIS:
  - iPhone 6/7/8 (375x667)
  - iPhone X (375x812)
  - iPad (768x1024)
  - Pixel 2 (411x731)
  - Desktop (1920x1080)
```

### 7. Throttling 🌐

```yaml
PARA DESENVOLVIMENTO:
  - No throttling (velocidade máxima)

PARA TESTES REALISTAS:
  - Fast 3G (1.6 Mbps) - Usuários em 3G
  - Slow 3G (400 Kbps) - Conexões ruins
  - Fast 4G (9 Mbps) - Maioria dos usuários mobile

EMULAÇÃO DE CPU:
  - No throttling (desenvolvimento)
  - 4x slowdown (dispositivos médios)
  - 6x slowdown (dispositivos fracos)
```

---

## 🎨 CHROME DEVTOOLS - Configurações Recomendadas

### Console

```yaml
✅ ATIVAR:
  - Preserve log (mantém logs entre navegações)
  - Show timestamps (útil para debug)
  - Autocomplete from history
  - Group similar messages in console

❌ DESATIVAR (Performance):
  - Log XMLHttpRequests (se não precisar)
  - Eager evaluation (pode deixar lento em grandes objetos)
```

### Network

```yaml
✅ ATIVAR:
  - Preserve log
  - Disable cache (durante desenvolvimento)
  - Show overview (visualizar timeline)

⚠️ FILTROS ÚTEIS:
  - XHR/Fetch (APIs)
  - JS (scripts)
  - CSS (estilos)
  - Img (imagens)
  - Doc (páginas)
```

### Performance

```yaml
✅ ATIVAR:
  - Screenshots (ver mudanças visuais)
  - Memory (monitorar vazamentos)
  - Web Vitals (LCP, FID, CLS)

⚠️ THROTTLING PARA TESTES:
  - CPU: 4x slowdown (simular dispositivos médios)
  - Network: Fast 3G (simular mobile)
```

### Application

```yaml
✅ MONITORAR:
  - Local Storage
  - Session Storage
  - Cookies
  - Cache Storage
  - Service Workers

⚠️ LIMPAR REGULARMENTE:
  - Clear storage ao testar (evitar cache)
```

### Memory

```yaml
✅ USAR QUANDO:
  - Detectar memory leaks
  - App está lento
  - Tab consome muita RAM

🎯 HEAP SNAPSHOTS:
  - Antes e depois de ações
  - Comparar diferenças
```

### Lighthouse (Audits)

```yaml
✅ RODAR REGULARMENTE:
  - Performance
  - Accessibility
  - Best Practices
  - SEO

⚠️ CONFIGURAÇÃO:
  - Mobile (prioritário)
  - Desktop (secundário)
  - Simulated Throttling
```

---

## 🔧 CONFIGURAÇÕES DE SISTEMA - Mac

### Chrome Flags (chrome://flags/)

```yaml
⚠️ EXPERIMENTAL - Use com cuidado:

✅ ATIVAR para performance:
  -  #enable-gpu-rasterization (usa GPU)
  -  #enable-zero-copy (melhor uso de memória)
  -  #enable-parallel-downloading (downloads mais rápidos)

❌ DESATIVAR se tiver problemas:
  -  #enable-webgl-draft-extensions (pode causar bugs)
```

### Extensões do Chrome

```yaml
✅ MANTER ATIVAS:
  - React DevTools (se usa React)
  - Redux DevTools (se usa Redux)
  - Vue DevTools (se usa Vue)

❌ DESATIVAR quando não usar:
  - AdBlockers (podem interferir em testes)
  - Extensões pesadas (consumem RAM)
```

---

## 📈 MONITORAMENTO DE PERFORMANCE

### Métricas Importantes

```yaml
✅ Core Web Vitals:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

✅ Outras métricas:
  - TTFB (Time to First Byte): < 600ms
  - FCP (First Contentful Paint): < 1.8s
  - TTI (Time to Interactive): < 3.8s
```

### Comandos Úteis no Console

```javascript
// Verificar performance
performance.timing;

// Memory usage
performance.memory;

// Recursos carregados
performance.getEntriesByType("resource");

// Navigation timing
performance.getEntriesByType("navigation")[0];

// Limpar console
console.clear();

// Profiling
console.profile("MyProfile");
// ... código a testar
console.profileEnd("MyProfile");
```

---

## 🎯 WORKFLOW OTIMIZADO

### Durante Desenvolvimento:

1. ✅ Throttling: OFF
2. ✅ Cache: Disabled
3. ✅ Preserve Log: ON
4. ✅ DevTools: Docked to bottom/right

### Durante Testes:

1. ✅ Throttling: Fast 3G / 4x CPU
2. ✅ Cache: Enabled
3. ✅ Lighthouse: Rodar audits
4. ✅ Network: Verificar todas as requests

### Durante Debug:

1. ✅ Breakpoints: Use conditional breakpoints
2. ✅ Console: Preserve log ON
3. ✅ Network: Preserve log ON
4. ✅ Source Maps: Enabled

---

## 💡 DICAS FINAIS

### Performance Geral:

- Feche abas não usadas (economia de RAM)
- Reinicie o Chrome periodicamente
- Limpe cache regularmente
- Use perfis separados (pessoal vs desenvolvimento)

### Debugging Eficiente:

- Use `debugger;` no código ao invés de console.log
- Conditional breakpoints para logs específicos
- Watch expressions para monitorar variáveis
- Call stack para entender fluxo

### Network Optimization:

- Minimize requests (bundle, sprite sheets)
- Use HTTP/2 (multiplexing)
- Lazy load images e componentes
- Cache agressivo para assets estáticos

---

## 📚 Recursos Úteis

- [Chrome DevTools Tips](https://developer.chrome.com/docs/devtools/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/fast/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

**Última atualização**: 22 de Outubro de 2025
**Sistema**: Mac Intel, 10 cores, 8GB RAM
**Conta testada**: tattoophotocalendar@gmail.com ✅
