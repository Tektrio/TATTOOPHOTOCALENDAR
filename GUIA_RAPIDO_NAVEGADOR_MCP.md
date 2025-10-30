# Guia Rápido: Usando o Navegador via MCP

## O Que Descobrimos

✅ O navegador interno está funcionando perfeitamente
❌ A janela visual não aparece no Cursor
✅ Você pode usar o navegador através de comandos e screenshots

## Como Usar Agora

### 1. Pedir para IA Navegar

Simplesmente peça:
```
"Abra localhost:5173 no navegador"
"Navegue para google.com"
"Abra a aplicação frontend"
```

### 2. Ver a Página

Peça um screenshot:
```
"Tire um screenshot da página"
"Me mostre como está a tela"
"Capture a página inteira"
```

### 3. Interagir com Elementos

Peça para clicar, digitar, etc:
```
"Clique no botão Dashboard"
"Digite 'teste' no campo de busca"
"Preencha o formulário com: nome='João', email='joao@email.com'"
```

### 4. Ver Informações da Página

Peça para ver o conteúdo:
```
"Me mostre a estrutura da página"
"Liste os elementos disponíveis"
"Quais botões existem na tela?"
```

## Exemplos Práticos

### Exemplo 1: Testar a Aplicação

```
Você: Abra a aplicação em localhost:5173 e tire um screenshot

IA: [navega e mostra screenshot]

Você: Clique no menu Clientes

IA: [clica e mostra resultado]

Você: Me mostre quantos clientes aparecem

IA: [analisa e responde com base no snapshot]
```

### Exemplo 2: Testar um Formulário

```
Você: Abra localhost:5173/clientes e preencha o formulário de novo cliente

IA: [navega, preenche e mostra resultado]

Você: Clique em salvar e me mostre se deu certo

IA: [clica, aguarda resposta e mostra resultado]
```

### Exemplo 3: Debugar um Problema

```
Você: Abra a página X e veja se tem erros no console

IA: [navega e mostra erros do console]

Você: Tire um screenshot da página

IA: [mostra screenshot]

Você: Clique no elemento Y e veja o que acontece

IA: [interage e reporta resultado]
```

## Comandos Úteis para Você Saber

Quando você pede algo, por trás a IA usa:

- `browser_navigate(url)` - Navegar para URL
- `browser_snapshot()` - Ver estrutura da página
- `browser_take_screenshot()` - Capturar imagem
- `browser_click(element, ref)` - Clicar em elemento
- `browser_type(element, ref, text)` - Digitar texto
- `browser_console_messages()` - Ver logs do console
- `browser_network_requests()` - Ver requisições de rede

## Limitações

❌ Você não vê a janela do navegador em tempo real
✅ Você vê screenshots sempre que pedir
✅ Você pode fazer TUDO que faria manualmente
✅ A IA vê a página em tempo real e pode reportar

## Vantagens

✅ Automação completa
✅ Testes E2E funcionam
✅ Debug via console/network
✅ Screenshots de alta qualidade
✅ Não precisa sair do Cursor

## Próximos Passos

Se você REALMENTE precisa ver a janela visual:

1. Use Chrome externo com CDP:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug
```

2. No Cursor:
   - Painel Browser Automation
   - Connection Type → `CDP Connection`
   - Conectar ao `ws://localhost:9222`

3. O Chrome abrirá visualmente, mas você controla via MCP

---
**Última atualização:** 30 de outubro de 2025

