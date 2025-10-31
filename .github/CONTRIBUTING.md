# 🤝 Guia de Contribuição - TattooScheduler

Obrigado por considerar contribuir para o TattooScheduler! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Convenções de Commit](#convenções-de-commit)
- [Testes](#testes)
- [Documentação](#documentação)

---

## 📜 Código de Conduta

Este projeto segue um Código de Conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

**Comportamentos esperados:**

- ✅ Ser respeitoso com outros colaboradores
- ✅ Aceitar críticas construtivas
- ✅ Focar no que é melhor para a comunidade
- ✅ Mostrar empatia com outros membros

**Comportamentos não aceitáveis:**

- ❌ Linguagem ou imagens sexualizadas
- ❌ Comentários ofensivos ou depreciativos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas de terceiros

---

## 🎯 Como Posso Contribuir?

### Reportar Bugs

Encontrou um bug? Ajude-nos a corrigi-lo!

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/tattoo-scheduler/issues)
2. Se não foi, abra uma nova issue usando o template de **Bug Report**
3. Inclua o máximo de detalhes possível:
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (OS, browser, versão)
   - Logs de erro

### Sugerir Melhorias

Tem uma ideia para melhorar o sistema?

1. Verifique se a sugestão já existe nas [Issues](https://github.com/seu-usuario/tattoo-scheduler/issues)
2. Abra uma nova issue usando o template de **Feature Request**
3. Descreva claramente:
   - O problema que sua sugestão resolve
   - Como você imagina a solução
   - Alternativas que você considerou

### Contribuir com Código

Quer implementar uma feature ou corrigir um bug?

1. Escolha ou crie uma issue
2. Comente na issue indicando que você vai trabalhar nela
3. Faça fork do repositório
4. Crie uma branch para sua feature/fix
5. Implemente suas mudanças
6. Adicione/atualize testes
7. Garanta que todos os testes passam
8. Submeta um Pull Request

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos

```bash
Node.js >= 22.x
npm >= 10.x
pnpm >= 10.x
Git
```

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USUARIO/tattoo-scheduler.git
cd tattoo-scheduler

# Adicione o repositório original como upstream
git remote add upstream https://github.com/usuario-original/tattoo-scheduler.git
```

### 2. Instalar Dependências

```bash
# Backend
cd agenda-hibrida-v2
npm install

# Frontend
cd ../agenda-hibrida-frontend
pnpm install

# Instalar Playwright browsers
pnpm run playwright:install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Backend
cd agenda-hibrida-v2
cp .env.example .env
# Edite .env com suas configurações
```

### 4. Inicializar Banco de Dados

```bash
cd agenda-hibrida-v2
node database/migrate.js
```

### 5. Executar Localmente

```bash
# Terminal 1 - Backend
cd agenda-hibrida-v2
npm start

# Terminal 2 - Frontend
cd agenda-hibrida-frontend
pnpm run dev
```

Acesse: `http://localhost:5173`

### 6. Configurar Git Hooks (Recomendado)

```bash
# Na raiz do projeto
chmod +x scripts/setup-git-hooks.sh
./scripts/setup-git-hooks.sh
```

Isso instalará hooks que validam seu código antes de commit e push.

---

## 📝 Padrões de Código

### JavaScript/JSX

- **ESLint**: Seguimos as regras do ESLint configuradas no projeto
- **Formatação**: Prettier para formatação consistente
- **Nomenclatura**:
  - `camelCase` para variáveis e funções
  - `PascalCase` para componentes React
  - `UPPER_SNAKE_CASE` para constantes
- **Comentários**: Documente código complexo

```javascript
// ✅ Bom
const fetchUserData = async (userId) => {
  // Busca dados do usuário do backend
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ❌ Evite
const FetchUserData = async (user_id) => {
  const response = await api.get("/users/" + user_id);
  return response.data;
};
```

### React

- **Componentes funcionais** com hooks
- **Props destructuring** no parâmetro
- **Prop types** ou TypeScript (quando aplicável)
- **Handlers** prefixados com `handle`

```jsx
// ✅ Bom
const UserCard = ({ name, email, onDelete }) => {
  const handleDelete = () => {
    if (confirm("Tem certeza?")) {
      onDelete();
    }
  };

  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <button onClick={handleDelete}>Deletar</button>
    </div>
  );
};
```

### Backend/API

- **RESTful APIs**: Verbos HTTP corretos
- **Tratamento de erros**: Sempre capture e trate erros
- **Validação**: Valide inputs do usuário
- **Logs**: Use logs apropriados

```javascript
// ✅ Bom
app.post("/api/clients", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validação
    if (!name || !email) {
      return res.status(400).json({
        error: "Nome e email são obrigatórios",
      });
    }

    // Lógica
    const client = await createClient({ name, email, phone });

    res.status(201).json(client);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});
```

### CSS/Tailwind

- **Tailwind CSS** para styling
- **Classes utilitárias** primeiro
- **Componentes customizados** quando necessário
- **Responsivo** sempre

```jsx
// ✅ Bom
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors md:px-6">
  Salvar
</button>
```

---

## 🔄 Processo de Pull Request

### 1. Criar Branch

Use nomes descritivos:

```bash
git checkout -b feature/adicionar-filtro-clientes
git checkout -b bugfix/corrigir-calendario-mobile
git checkout -b refactor/melhorar-validacao
```

### 2. Fazer Mudanças

- Faça commits pequenos e focados
- Siga as [Convenções de Commit](#convenções-de-commit)
- Escreva testes para suas mudanças
- Atualize documentação se necessário

### 3. Testar Localmente

```bash
# Backend
cd agenda-hibrida-v2
npm run lint
npm run test

# Frontend
cd agenda-hibrida-frontend
pnpm run lint
pnpm run build
pnpm run test:e2e
```

### 4. Push e PR

```bash
# Push sua branch
git push origin feature/sua-feature

# Abra PR no GitHub
# Preencha o template completamente
# Aguarde review
```

### 5. Review e Merge

- Responda aos comentários do review
- Faça ajustes solicitados
- Aguarde aprovação
- Merge será feito pelo mantenedor

### Checklist do PR

Antes de submeter, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam
- [ ] Nenhum warning de lint
- [ ] Documentação atualizada
- [ ] Screenshots adicionados (se UI)
- [ ] Sem console.log em produção
- [ ] Sem secrets expostos

---

## 💬 Convenções de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adicionar ou corrigir testes
- `chore`: Manutenção, configs, etc
- `perf`: Melhorias de performance

### Exemplos

```bash
# Feature
git commit -m "feat(clientes): adicionar filtro por cidade"

# Bug fix
git commit -m "fix(calendario): corrigir exibição em mobile"

# Documentação
git commit -m "docs: atualizar guia de instalação"

# Refactor
git commit -m "refactor(api): simplificar validação de email"

# Breaking change
git commit -m "feat(auth)!: alterar estrutura de tokens

BREAKING CHANGE: tokens agora expiram em 1 hora"
```

---

## 🧪 Testes

### Backend

```bash
cd agenda-hibrida-v2

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Todos os testes com coverage
npm run test
```

### Frontend

```bash
cd agenda-hibrida-frontend

# Testes unitários
pnpm run test:unit

# Testes E2E
pnpm run test:e2e

# Testes E2E com UI
pnpm run test:e2e:ui

# Coverage
pnpm run test:coverage
```

### Escrever Testes

**Para cada mudança:**

- ✅ Adicione testes para novas features
- ✅ Atualize testes existentes se necessário
- ✅ Garanta que todos os testes passam
- ✅ Mantenha coverage acima de 80% (frontend) e 50% (backend)

---

## 📚 Documentação

### Quando Atualizar

- ✅ Nova funcionalidade → Atualizar README e docs
- ✅ Mudança de API → Atualizar API_DOCUMENTATION.md
- ✅ Nova configuração → Atualizar guias de setup
- ✅ Breaking change → Atualizar CHANGELOG

### Onde Documentar

- `README.md` - Visão geral do projeto
- `docs/` - Documentação técnica detalhada
- `CONTRIBUTING.md` - Este arquivo
- Comentários no código - Lógica complexa
- JSDoc - Funções e componentes importantes

---

## ❓ Dúvidas?

- 📖 Leia a [Documentação](https://github.com/seu-usuario/tattoo-scheduler/tree/main/docs)
- 💬 Abra uma [Discussion](https://github.com/seu-usuario/tattoo-scheduler/discussions)
- 🐛 Reporte na [Issue](https://github.com/seu-usuario/tattoo-scheduler/issues)

---

## 🙏 Obrigado!

Sua contribuição ajuda a tornar o TattooScheduler melhor para todos! 🎉

---

**Dica**: Configure os git hooks para garantir que seu código sempre passe nas validações:

```bash
./scripts/setup-git-hooks.sh
```
