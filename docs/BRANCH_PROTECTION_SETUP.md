# 🛡️ Guia: Configurar Branch Protection Rules no GitHub

Este guia mostra como configurar regras de proteção para a branch `main` no GitHub, garantindo que todo código seja revisado e testado antes do merge.

---

## 📋 Pré-requisitos

- ✅ Repositório criado no GitHub
- ✅ Workflows de CI/CD commitados (`.github/workflows/`)
- ✅ Permissões de administrador no repositório

---

## 🚀 Passo a Passo

### 1. Acessar Configurações do Repositório

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Branches**

![Settings > Branches](https://docs.github.com/assets/cb-27528/images/help/repository/repo-settings-branches.png)

---

### 2. Adicionar Regra de Proteção

1. Clique em **Add rule** (Adicionar regra) ou **Add branch protection rule**
2. No campo **Branch name pattern**, digite: `main`

![Branch Pattern](https://docs.github.com/assets/cb-47888/images/help/branches/branch-protection-rule-name.png)

---

### 3. Configurar Opções de Proteção

#### ✅ **Require a pull request before merging**

Marque esta opção para exigir Pull Requests.

**Sub-opções recomendadas:**

- [x] **Require approvals**:
  - Se você trabalha sozinho: `0` aprovações
  - Se tem equipe: `1` ou mais aprovações
- [x] **Dismiss stale pull request approvals when new commits are pushed**
  - Força nova aprovação se houver novos commits
- [ ] **Require review from Code Owners** (opcional)
  - Só se você tiver um arquivo `CODEOWNERS`

---

#### ✅ **Require status checks to pass before merging**

**IMPORTANTE**: Esta é a configuração mais crítica!

1. Marque a opção **Require status checks to pass before merging**

2. Marque também: **Require branches to be up to date before merging**

3. Na caixa de busca **Search for status checks in the last week for this repository**, adicione os seguintes checks:

   **Obrigatórios (bloqueiam merge):**

   - `backend-lint`
   - `backend-tests`
   - `frontend-lint`
   - `frontend-build`
   - `e2e-tests`
   - `summary` (do workflow ci.yml)

   **Recomendados:**

   - `security-summary` (do workflow security.yml)
   - `quality-summary` (do workflow code-quality.yml)

**Nota**: Os checks só aparecerão na lista após a primeira execução dos workflows!

**Como fazer a primeira execução:**

1. Faça um commit na branch `main` com os workflows
2. O GitHub executará os workflows automaticamente
3. Após a primeira execução, os checks aparecerão disponíveis
4. Volte aqui e configure-os como obrigatórios

---

#### ✅ **Require conversation resolution before merging**

Marque esta opção para garantir que todos os comentários no PR sejam resolvidos antes do merge.

- [x] **Require conversation resolution before merging**

---

#### ⚠️ **Require signed commits** (Opcional)

Se você quer exigir commits assinados (GPG):

- [ ] **Require signed commits**

---

#### ✅ **Require linear history** (Opcional mas Recomendado)

Para manter um histórico de commits limpo:

- [x] **Require linear history**

Isso força uso de squash merge ou rebase, evitando merge commits.

---

#### ⚠️ **Require deployments to succeed** (Não aplicável)

Deixe desmarcado (não temos deploys automáticos).

---

#### ✅ **Lock branch**

Deixe desmarcado. Esta opção torna a branch read-only.

---

#### ✅ **Do not allow bypassing the above settings**

**MUITO IMPORTANTE**: Marque esta opção!

- [x] **Do not allow bypassing the above settings**

Isso garante que nem mesmo administradores possam fazer push direto, pulando as proteções.

Se você quiser permitir exceções para administradores em emergências, deixe desmarcado.

---

#### ✅ **Restrict who can push to matching branches**

Se você quer controlar quem pode fazer push para `main`:

1. Marque **Restrict who can push to matching branches**
2. Adicione usuários ou equipes permitidos
3. Ou deixe vazio para permitir apenas via Pull Requests

**Recomendação**: Deixe vazio ou adicione apenas mantenedores principais.

---

### 4. Configurações Adicionais (Opcional)

#### **Allow force pushes**

- [ ] **Do NOT allow force pushes** (mantenha desmarcado)

Force push pode reescrever histórico e causar problemas.

---

#### **Allow deletions**

- [ ] **Do NOT allow deletions** (mantenha desmarcado)

Previne deleção acidental da branch `main`.

---

### 5. Salvar Regras

1. Role até o final da página
2. Clique em **Create** ou **Save changes**

![Save Button](https://docs.github.com/assets/cb-30926/images/help/repository/save-branch-protection-rule.png)

---

## ✅ Verificar Configuração

Após salvar, você verá algo assim na lista de regras:

```
Branch protection rules

main
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
     • backend-lint
     • backend-tests
     • frontend-lint
     • frontend-build
     • e2e-tests
     • summary
  ✅ Require conversation resolution before merging
  ✅ Do not allow bypassing the above settings
```

---

## 🧪 Testar Proteção

### Teste 1: Push Direto (Deve Falhar)

```bash
# Na branch main
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test"
git push origin main
```

**Resultado esperado**: ❌ Push bloqueado

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: At least 1 approving review is required by reviewers with write access.
```

### Teste 2: Via Pull Request (Deve Funcionar)

```bash
# Criar branch
git checkout -b test/protection
echo "test" >> test.txt
git add test.txt
git commit -m "test: verificar proteção"
git push origin test/protection

# Abrir PR no GitHub
# Aguardar CI passar
# Fazer merge (se CI passou)
```

**Resultado esperado**: ✅ PR criado, CI roda, merge permitido após CI passar

---

## 🔧 Ajustar Configuração

Para modificar as regras:

1. **Settings** → **Branches**
2. Encontre a regra `main`
3. Clique em **Edit**
4. Faça as mudanças necessárias
5. Clique em **Save changes**

---

## 🚨 Troubleshooting

### Problema: Status checks não aparecem

**Solução**:

1. Faça um commit na `main` para executar os workflows pela primeira vez
2. Aguarde a conclusão
3. Volte e configure os checks como obrigatórios

### Problema: Não consigo fazer push mesmo via PR

**Verificar:**

1. Todos os status checks passaram?
2. Há comentários não resolvidos?
3. Branch está atualizada com main?

### Problema: Preciso fazer push urgente

**Opções:**

1. Se "Do not allow bypassing" está desmarcado:
   - Administradores podem fazer push direto
2. Se está marcado:
   - Desabilite temporariamente a regra
   - Faça o push
   - Reabilite a regra
   - **NÃO RECOMENDADO** (use apenas em emergências)

---

## 📊 Exemplo de Configuração Completa

```yaml
Branch: main

Protection Rules:
  ✅ Require pull request before merging
     - Required approvals: 0 (ou 1+ para equipes)
     - Dismiss stale reviews: true

  ✅ Require status checks to pass
     - Require branches to be up to date: true
     - Required checks:
       • backend-lint
       • backend-tests
       • frontend-lint
       • frontend-build
       • e2e-tests
       • summary
       • security-summary
       • quality-summary

  ✅ Require conversation resolution: true
  ✅ Require linear history: true
  ✅ Do not allow bypassing: true
  ✅ Restrict pushes: Empty (apenas PRs)
  ❌ Allow force pushes: false
  ❌ Allow deletions: false
```

---

## 🎯 Benefícios

Após configurar Branch Protection:

- ✅ **Código revisado**: Todo código passa por PR
- ✅ **Testes automáticos**: CI roda em todo PR
- ✅ **Qualidade garantida**: Lint, tests, build devem passar
- ✅ **Segurança**: Secrets e vulnerabilidades detectados
- ✅ **Histórico limpo**: Sem commits quebrados na main
- ✅ **Trabalho em equipe**: Processo padronizado

---

## 📚 Referências

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Required Reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)

---

**✅ Configuração completa!** Sua branch `main` agora está protegida e segura.
