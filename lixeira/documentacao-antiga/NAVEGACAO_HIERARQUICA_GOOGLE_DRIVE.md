# 🚀 Navegação Hierárquica no Google Drive Explorer

## ✅ Funcionalidade Implementada

### Problema Resolvido

Antes, ao mover arquivos/pastas no Google Drive Explorer, você só podia mover para pastas de nível superior. Agora você pode mover para **qualquer pasta** do seu Google Drive, incluindo subpastas profundas.

### 🎯 Como Funciona

#### 1. **Navegação Hierárquica Completa**

- **Breadcrumbs**: Navegue facilmente entre pastas usando o caminho de navegação
- **Entrar em Pastas**: Clique na seta `>` ao lado de qualquer pasta para entrar nela
- **Voltar**: Clique em qualquer parte do breadcrumb para voltar a essa pasta

#### 2. **Interface Melhorada**

- **Dialog Maior**: Interface expandida para melhor visualização
- **Loading States**: Indicadores de carregamento durante navegação
- **Seleção Visual**: Destino selecionado fica destacado em roxo

#### 3. **Funcionalidades Disponíveis**

- ✅ Mover para a **raiz** (Meu Drive)
- ✅ Mover para **qualquer pasta** do Drive
- ✅ Navegar **profundamente** em subpastas
- ✅ **Breadcrumbs** para navegação rápida
- ✅ **Loading** durante carregamento de pastas

### 🎮 Como Usar

1. **Clique com botão direito** em qualquer arquivo/pasta
2. Selecione **"Mover para..."**
3. **Navegue** pelas pastas:
   - Clique na seta `>` para entrar em uma pasta
   - Clique no breadcrumb para voltar
   - Clique na pasta para selecioná-la como destino
4. Clique **"Mover"** para confirmar

### 🔧 Implementação Técnica

#### Novos Estados Adicionados:

```javascript
const [moveDialogBreadcrumbs, setMoveDialogBreadcrumbs] = useState([
  { id: null, name: "Meu Drive" },
]);
const [moveDialogCurrentFolder, setMoveDialogCurrentFolder] = useState(null);
const [moveDialogFolders, setMoveDialogFolders] = useState([]);
const [moveDialogLoading, setMoveDialogLoading] = useState(false);
```

#### Funções Implementadas:

- `loadMoveDialogFolders()` - Carrega pastas da pasta atual
- `navigateMoveDialogToFolder()` - Entra em uma pasta
- `navigateMoveDialogToBreadcrumb()` - Volta para uma pasta via breadcrumb
- `openMoveDialog()` - Abre o dialog com navegação hierárquica

### 🎨 Interface Visual

#### Breadcrumbs:

```
Meu Drive / Pasta 1 / Subpasta A / Subpasta B
```

#### Lista de Pastas:

```
📁 Pasta 1                    >
📁 Pasta 2                    >
📁 Pasta 3                    >
```

#### Seleção:

- **Destino selecionado**: Fundo roxo com borda
- **Hover**: Fundo branco translúcido
- **Loading**: Spinner animado

### 🚀 Benefícios

1. **Organização Completa**: Mova arquivos para qualquer localização
2. **Navegação Intuitiva**: Como no Google Drive real
3. **Eficiência**: Breadcrumbs para navegação rápida
4. **Visual**: Interface clara e responsiva
5. **Flexibilidade**: Acesso a toda estrutura de pastas

### 📝 Exemplo de Uso

**Cenário**: Você tem a estrutura:

```
Meu Drive/
├── Pasta 1/
│   ├── Subpasta A/
│   └── Subpasta B/
├── Pasta 2/
└── Pasta 3/
    └── Subpasta C/
```

**Antes**: Só podia mover para Pasta 1, Pasta 2, Pasta 3
**Agora**: Pode mover para qualquer pasta, incluindo:

- Subpasta A
- Subpasta B
- Subpasta C
- E qualquer subpasta mais profunda!

### 🎉 Resultado

Agora você tem **controle total** sobre a organização dos seus arquivos no Google Drive, exatamente como no Google Drive real! 🚀
