# 🧪 Como Testar o Calendário Visual Melhorado

## 🚀 Passo a Passo para Testar

### 1️⃣ Iniciar o Sistema

```bash
# Terminal 1 - Backend
cd agenda-hibrida-v2
npm start

# Terminal 2 - Frontend
cd agenda-hibrida-frontend
npm run dev
```

Acesse: http://localhost:5173

---

### 2️⃣ Navegar para o Calendário Visual

1. Abra o sistema no navegador
2. Clique na aba **"Calendário Visual"** no menu superior
3. Você verá o calendário do mês atual

---

### 3️⃣ O Que Você Deve Ver

#### ✅ Para cada agendamento no calendário:

**CABEÇALHO (sempre visível):**

- 👤 Nome do cliente (em branco)
- 📞 Telefone do cliente (em verde)
- 📝 Descrição do agendamento (em azul)

**ÁREA DE IMAGENS:**

- 🖼️ Grid 2x2 com até 4 imagens
- 🏷️ Badge com categoria (referencias, desenhos_aprovados, etc.)
- 🔢 Badge "+X mais" se houver mais de 4 imagens

---

### 4️⃣ Testar Duplo Clique para Abrir Pasta

#### Teste 1: Com cliente que tem telefone e pasta

1. Localize um agendamento que tenha imagens
2. Passe o mouse sobre qualquer imagem
3. Você verá:
   - 📁 Ícone de pasta
   - Texto "Duplo clique para abrir pasta"
4. **Dê DUPLO CLIQUE** na imagem
5. ✅ A pasta do cliente deve abrir no seu explorador de arquivos
6. ✅ Notificação verde: "📁 Pasta do cliente [Nome] aberta com sucesso!"

#### Teste 2: Com cliente sem telefone

1. Se tentar abrir pasta de cliente sem telefone
2. ❌ Notificação vermelha: "Cliente sem telefone cadastrado"

---

### 5️⃣ Verificar Informações Sempre Visíveis

**NÃO é necessário passar o mouse** para ver:

- Nome do cliente
- Telefone
- Descrição

Essas informações estão **SEMPRE VISÍVEIS** no topo de cada card de agendamento!

---

### 6️⃣ Testar Navegação do Calendário

- ⬅️ Botão "←" → Mês anterior
- ➡️ Botão "→" → Próximo mês
- 📅 Botão "Hoje" → Volta para o mês atual

---

### 7️⃣ Verificar Responsividade

1. Redimensione a janela do navegador
2. O calendário deve se adaptar
3. As informações devem permanecer legíveis

---

## 🎯 Checklist de Funcionalidades

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 5173
- [ ] Calendário visual carregando
- [ ] Agendamentos aparecendo nos dias corretos
- [ ] **Nome do cliente SEMPRE VISÍVEL**
- [ ] **Telefone do cliente SEMPRE VISÍVEL** (se cadastrado)
- [ ] **Descrição SEMPRE VISÍVEL** (se preenchida)
- [ ] Imagens carregando automaticamente
- [ ] Grid 2x2 de imagens funcionando
- [ ] Overlay ao passar mouse nas imagens
- [ ] **Duplo clique abre pasta do cliente**
- [ ] Notificação de sucesso ao abrir pasta
- [ ] Notificação de erro se não tiver telefone
- [ ] Badges de categoria nas imagens
- [ ] Badge "+X mais" se houver muitas imagens
- [ ] Legenda explicativa no final
- [ ] Navegação entre meses funcionando

---

## 🐛 Problemas Comuns e Soluções

### ❌ "Cliente sem telefone cadastrado"

**Causa**: Cliente não tem telefone no cadastro  
**Solução**:

1. Vá na aba "Clientes"
2. Adicione o telefone do cliente
3. Recarregue o calendário

### ❌ "Pasta do cliente não encontrada"

**Causa**: A pasta física não existe no servidor  
**Solução**:

1. Verifique se a pasta existe em `agenda-hibrida-v2/uploads/`
2. O nome da pasta deve corresponder ao `folder_path` do cliente no banco
3. Crie a pasta manualmente se necessário

### ❌ Imagens não aparecem

**Causa**: Cliente pode não ter arquivos ou telefone não está cadastrado  
**Solução**:

1. Verifique se o cliente tem telefone
2. Envie imagens para o cliente na aba "Galeria"
3. Recarregue a página

### ❌ Duplo clique não funciona

**Causa**: Backend pode não estar rodando ou problema de permissões  
**Solução**:

1. Verifique se o backend está rodando (`npm start`)
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique os logs do backend no terminal

---

## 📊 Dados de Teste

### Criar Cliente de Teste

1. Vá na aba "Clientes"
2. Clique em "Novo Cliente"
3. Preencha:
   - Nome: João da Silva
   - Telefone: (11) 98765-4321
   - Email: joao@email.com
4. Clique em "Cadastrar Cliente"

### Criar Agendamento de Teste

1. Vá na aba "Agendamentos"
2. Clique em "Novo Agendamento"
3. Preencha:
   - Título: Tatuagem de Dragão
   - Cliente: João da Silva
   - Descrição: Tatuagem colorida no braço direito
   - Data/Hora: Escolha uma data futura
4. Clique em "Criar Agendamento"

### Adicionar Imagens de Teste

1. Vá na aba "Galeria"
2. Selecione o cliente "João da Silva"
3. Clique em "Upload"
4. Selecione imagens do seu computador
5. Escolha a categoria (referencias, desenhos_aprovados, etc.)
6. Faça upload

### Verificar no Calendário

1. Volte para "Calendário Visual"
2. Navegue até a data do agendamento
3. Você deve ver:
   - Nome: João da Silva
   - Telefone: (11) 98765-4321
   - Descrição: Tatuagem colorida no braço direito
   - Imagens que você fez upload
4. Dê duplo clique nas imagens para abrir a pasta!

---

## 🎉 Sucesso!

Se tudo funcionar conforme descrito acima, o Calendário Visual Melhorado está **100% funcional**!

**Aproveite as novas funcionalidades:**

- ✅ Visualização completa de informações
- ✅ Acesso rápido às pastas dos clientes
- ✅ Interface visual moderna e intuitiva
- ✅ Busca automática de imagens

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do backend no terminal
2. Abra o console do navegador (F12)
3. Consulte o arquivo `CALENDARIO_VISUAL_MELHORADO.md` para detalhes técnicos
