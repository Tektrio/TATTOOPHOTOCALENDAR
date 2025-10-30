# Documentação de Testes Unitários

## Visão Geral

O projeto utiliza **Vitest** para testes unitários, oferecendo alta performance e integração perfeita com Vite.

## Estrutura

```
src/
├── __tests__/
│   ├── setup.js                    # Configuração global
│   └── unit/
│       ├── validation.test.js      # Testes de validação (74 testes)
│       └── ValidatedInput.test.jsx # Testes de componentes (20 testes)
```

## Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
pnpm test

# Executar com interface UI
pnpm test:ui

# Executar com cobertura
pnpm test:coverage

# Executar apenas testes unitários
pnpm test:unit

# Executar em modo watch
pnpm test:watch
```

## Cobertura

**Meta de Cobertura:** > 80%

### Status Atual
- ✅ `utils/validation.js`: 100% coberto (74 testes)
- ✅ `components/ValidatedInput.jsx`: 90% coberto (20 testes)

## Escrevendo Testes

### Estrutura de Um Teste

```javascript
import { describe, it, expect, vi } from 'vitest'
import { validateEmail } from '@/utils/validation'

describe('validateEmail', () => {
  it('deve aceitar email válido', () => {
    const result = validateEmail('usuario@email.com')
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar email inválido', () => {
    const result = validateEmail('emailinvalido')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('inválido')
  })
})
```

### Testes de Componentes

```javascript
import { render, screen, fireEvent } from '@testing-library/react'

describe('ValidatedInput', () => {
  it('deve renderizar corretamente', () => {
    render(
      <ValidatedInput
        id="test"
        label="Email"
        value=""
        onChange={() => {}}
      />
    )
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})
```

## Boas Práticas

1. **Nome descritivo:** Use "deve..." para descrever comportamentos
2. **Um conceito por teste:** Cada teste deve verificar apenas uma coisa
3. **Arrange, Act, Assert:** Organize seus testes em 3 fases
4. **Mock apenas o necessário:** Evite mocks excessivos
5. **Testes determinísticos:** Devem passar sempre, sem dependência de tempo/rede

## Casos de Teste por Função

### Validações
- Casos válidos
- Casos inválidos
- Edge cases (vazio, null, undefined)
- Limites (min/max)
- Formatos especiais

### Componentes
- Renderização inicial
- Interações do usuário (click, input, blur)
- Estados (loading, error, success)
- Props opcionais
- Acessibilidade

## Ferramentas

- **Vitest**: Framework de testes
- **@testing-library/react**: Testes de componentes
- **@testing-library/jest-dom**: Matchers adicionais
- **@testing-library/user-event**: Simulação de eventos

## Troubleshooting

### Problema: Testes não encontram módulos

**Solução:** Verificar alias em `vitest.config.js`

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Problema: Testes falham com timeout

**Solução:** Aumentar timeout em testes assíncronos

```javascript
it('teste assíncrono', async () => {
  await waitFor(() => {
    expect(screen.getByText('Carregado')).toBeInTheDocument()
  }, { timeout: 5000 })
})
```

## CI/CD Integration

Os testes são executados automaticamente em pull requests e commits na branch principal.

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test:unit -- --run
```

## Métricas

- **Total de testes:** 94
- **Taxa de sucesso:** 100%
- **Tempo médio:** < 2 segundos
- **Cobertura global:** > 80%

