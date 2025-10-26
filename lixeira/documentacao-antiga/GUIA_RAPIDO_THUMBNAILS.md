# 🚀 Guia Rápido - Thumbnails

## Como Ver os Thumbnails Funcionando

### 1️⃣ Iniciar o Sistema

```bash
# Terminal 1 - Backend
cd agenda-hibrida-v2
node server.js

# Terminal 2 - Frontend
cd agenda-hibrida-frontend
npm run dev
```

### 2️⃣ Acessar a Interface

Abra no navegador: **http://localhost:5173**

### 3️⃣ Ver Thumbnails

#### No Google Drive Explorer:

1. Clique em "Google Drive" no menu lateral
2. As imagens aparecerão com thumbnails automaticamente
3. **Clique em qualquer imagem** para ver em tela cheia

#### No Calendário Visual:

1. Vá para "Calendário"
2. Agendamentos com fotos mostram miniaturas
3. Duplo clique na miniatura para abrir a pasta

### 4️⃣ Recursos do Visualizador

Quando você clicar em uma imagem:

- **← →** - Navegar entre imagens
- **+ / -** - Zoom in/out
- **0** - Reset zoom
- **ESC** - Fechar
- **Arrastar** - Mover imagem (quando com zoom)
- **🔽** - Botão download

## 🎨 Modos de Visualização

### Grid (Grade)

- Clique no ícone de grade
- Thumbnails grandes (300x300)
- Melhor para galeria

### Lista

- Clique no ícone de lista
- Thumbnails pequenos (ao lado)
- Melhor para detalhes

## ⚡ Performance

### Cache Automático

- Primeiro acesso: 200-500ms (gera thumbnail)
- Acessos seguintes: <50ms (usa cache)
- Cache permanente até limpar

### Limpar Cache

```bash
cd agenda-hibrida-v2
rm -rf thumbnails_cache/*
```

## 🧪 Testar

Execute o script de teste:

```bash
./TESTE_THUMBNAILS.sh
```

## 📊 Exemplos de Uso

### API - Pegar thumbnail

```bash
# Thumbnail padrão (300x300)
curl http://localhost:3001/api/files/1/thumbnail

# Thumbnail customizado
curl http://localhost:3001/api/files/1/thumbnail?size=500
```

### Frontend - Usar componente

```jsx
import ImagePreview from './ImagePreview.jsx'

// No seu componente
<img
  src={`${API_URL}${file.thumbnail_url}`}
  onClick={() => abrirPreview(file)}
/>

<ImagePreview
  open={true}
  image={file}
  onClose={fechar}
/>
```

## 🐛 Problemas Comuns

### Thumbnails não aparecem?

**Verifique:**

1. ✅ Servidor rodando?
2. ✅ Sharp instalado? `npm list sharp`
3. ✅ Arquivo é uma imagem?
4. ✅ Permissões da pasta OK?

**Solução:**

```bash
cd agenda-hibrida-v2
npm install sharp
node server.js
```

### Imagem quebrada?

**Console do navegador mostrará:**

- URL da imagem
- Erro específico

**Verificar:**

- Arquivo existe?
- Formato suportado?
- API_URL correto?

## 💡 Dicas

1. **Upload de Imagens**

   - Arraste e solte no Google Drive Explorer
   - Thumbnails gerados automaticamente

2. **Google Drive**

   - Thumbnails vêm direto do Google
   - Sem necessidade de geração

3. **Arquivos Locais**

   - Primeira visualização gera cache
   - Cache fica em `thumbnails_cache/`

4. **Formatos**
   - JPEG/PNG: Melhor compressão
   - WebP: Menor tamanho
   - GIF: Mostra primeiro frame

## 🎯 Atalhos do Visualizador

| Tecla     | Ação            |
| --------- | --------------- |
| `←`       | Imagem anterior |
| `→`       | Próxima imagem  |
| `+` / `=` | Zoom in         |
| `-`       | Zoom out        |
| `0`       | Reset zoom      |
| `ESC`     | Fechar          |

## 📱 Compatibilidade

✅ Chrome / Edge
✅ Firefox  
✅ Safari
✅ Mobile (touch)

## 🔧 Configurações Avançadas

### Mudar tamanho padrão

`server.js` linha ~1050:

```javascript
const size = req.query.size || "300"; // <- mudar aqui
```

### Mudar qualidade

`server.js` linha ~984:

```javascript
const q = quality ? parseInt(quality) : 80; // <- mudar aqui
```

### Cache headers

`server.js` linha ~1103:

```javascript
res.set("Cache-Control", "public, max-age=31536000"); // 1 ano
```

---

**✨ Pronto! Agora você tem thumbnails rápidos e bonitos! ✨**

Dúvidas? Veja: `THUMBNAILS_IMPLEMENTADOS.md`
