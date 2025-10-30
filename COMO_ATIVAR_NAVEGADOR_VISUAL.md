# Como Ativar o Navegador Visual no Cursor

## Situação Atual

✅ Navegador MCP está funcionando (2 abas abertas)
❌ Painel visual não está aparecendo no editor

## Soluções para Ver o Navegador no Cursor

### Solução 1: Verificar Configurações (FAÇA ISSO PRIMEIRO)

1. **Abrir Settings**
   - Pressione `Cmd + ,` (macOS)
   - Ou: Menu → Cursor → Settings

2. **Buscar por "Browser"**
   - Digite "browser" na caixa de busca

3. **Procurar e Ativar estas opções:**
   ```
   ✓ Cursor Browser: Show Panel
   ✓ Cursor Browser: Open In Editor
   ✓ Cursor Browser: Auto Show
   ```

4. **Depois de ativar:**
   - `Cmd + Shift + P` → "Developer: Reload Window"

### Solução 2: Resetar Views

1. **Command Palette** (`Cmd + Shift + P`)
2. Digite: `Views: Reset View Locations`
3. Confirme
4. Digite: `Developer: Reload Window`

### Solução 3: Mostrar Painel Manualmente

1. **Command Palette** (`Cmd + Shift + P`)
2. Digite: `Cursor Browser: Show Panel`
3. Ou: `View: Toggle Panel` (`Cmd + J`)
4. Procure a aba "Browser" ou "Browser Automation" no painel inferior

### Solução 4: Abrir em Janela Separada

Se o editor não mostrar, pode estar configurado para janela externa:

1. **Command Palette** (`Cmd + Shift + P`)
2. Digite: `Cursor Browser: Open Browser Window`
3. Ou: `Cursor Browser: Show External Window`

### Solução 5: Verificar Layout

O painel pode estar minimizado ou escondido:

1. Pressione `Cmd + J` (Toggle Panel)
2. Pressione `Cmd + B` (Toggle Sidebar)
3. Procure por ícone de navegador nas barras laterais
4. Clique nas abas do painel inferior (pode ter "Browser" escondida)

### Solução 6: Usar Chrome com CDP (Alternativa Visual)

Se nada funcionar, use Chrome externo controlado pelo Cursor:

1. **Abrir Chrome com debugging:**
```bash
# No terminal (copie e cole):
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-cursor-debug \
  --window-size=1280,720
```

2. **No Cursor:**
   - Vá no painel "Browser Automation"
   - Connection Type → Selecione `CDP Connection`
   - Endpoint: `ws://localhost:9222`

3. **Resultado:**
   - Chrome abre em janela separada (VISÍVEL)
   - Você controla pelo Cursor via IA
   - Melhor dos dois mundos!

### Solução 7: Atualizar Cursor

Se sua versão é antiga:

1. Menu → Cursor → Check for Updates
2. Instale a última versão
3. Reinicie o Cursor

## Status Atual do Navegador

**Já está funcionando!**
- ✅ 2 abas abertas via MCP
- ✅ Aba 0: Sua aplicação (localhost:5173)
- ✅ Aba 1: Página em branco (about:blank)
- ✅ Posso navegar, clicar, digitar, tirar screenshots

**Só falta aparecer visualmente!**

## Comando Rápido para Testar

Depois de aplicar as soluções acima, teste:

1. `Cmd + Shift + P`
2. Digite: `Cursor Browser: Navigate To URL`
3. Digite uma URL (ex: `google.com`)
4. O navegador deve abrir/aparecer

## Atalhos Úteis

- `Cmd + J` - Toggle Panel (mostrar/esconder painel inferior)
- `Cmd + B` - Toggle Sidebar (mostrar/esconder barra lateral)
- `Cmd + Shift + P` - Command Palette
- `Cmd + ,` - Settings

## Verificação

Se ainda não aparecer, verifique:

1. **Versão do Cursor**
   - Menu → Cursor → About Cursor
   - Verifique se é uma versão recente (2024+)

2. **Extensão instalada**
   - Command Palette → "Extensions: Show Installed Extensions"
   - Procure por "Browser" ou "Automation"

3. **MCP Status**
   - Command Palette → "Cursor Browser: Get Browser Automation Status"
   - Deve mostrar "Ready (Chrome detected)"

## Se Nada Funcionar

**Use a Solução 6 (Chrome com CDP)**

É a forma mais confiável de ter um navegador VISUAL controlado pelo Cursor:
- Você VÊ a janela do Chrome
- A IA controla automaticamente
- Funciona 100% das vezes

---
**Última atualização:** 30 de outubro de 2025
**Status do MCP:** ✅ Funcionando (2 abas abertas)

