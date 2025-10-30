import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '@/components/ValidatedInput'
import { validateEmail, validateName } from '@/utils/validation'

describe('ValidatedInput', () => {
  it('deve renderizar corretamente com label', () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Nome"
        value=""
        onChange={() => {}}
      />
    )
    
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('deve mostrar asterisco quando required=true', () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Email"
        value=""
        onChange={() => {}}
        required={true}
      />
    )
    
    const label = screen.getByText('Email')
    expect(label.parentElement).toHaveTextContent('*')
  })

  it('deve chamar onChange quando valor mudar', () => {
    const handleChange = vi.fn()
    render(
      <ValidatedInput
        id="test-input"
        label="Nome"
        value=""
        onChange={handleChange}
      />
    )
    
    const input = screen.getByLabelText('Nome')
    fireEvent.change(input, { target: { value: 'João' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('deve executar validação ao perder foco', async () => {
    const validationFn = vi.fn().mockReturnValue({
      valid: false,
      message: 'Email inválido'
    })
    
    render(
      <ValidatedInput
        id="test-input"
        label="Email"
        value="emailinvalido"
        onChange={() => {}}
        validationFn={validationFn}
      />
    )
    
    const input = screen.getByLabelText('Email')
    fireEvent.blur(input)
    
    await waitFor(() => {
      expect(validationFn).toHaveBeenCalledWith('emailinvalido')
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem de sucesso quando validação passar', async () => {
    const validationFn = vi.fn().mockReturnValue({
      valid: true,
      message: ''
    })
    
    render(
      <ValidatedInput
        id="test-input"
        label="Email"
        value="usuario@email.com"
        onChange={() => {}}
        validationFn={validationFn}
      />
    )
    
    const input = screen.getByLabelText('Email')
    fireEvent.blur(input)
    
    await waitFor(() => {
      expect(screen.getByText('✓ Campo válido')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro externo quando fornecido', () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Nome"
        value="ab"
        onChange={() => {}}
        error="Nome muito curto"
      />
    )
    
    const input = screen.getByLabelText('Nome')
    fireEvent.blur(input)
    
    expect(screen.getByText('Nome muito curto')).toBeInTheDocument()
  })

  it('deve estar desabilitado quando disabled=true', () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Nome"
        value=""
        onChange={() => {}}
        disabled={true}
      />
    )
    
    const input = screen.getByLabelText('Nome')
    expect(input).toBeDisabled()
  })

  it('deve limpar erro local ao digitar', async () => {
    const validationFn = vi.fn()
      .mockReturnValueOnce({ valid: false, message: 'Email inválido' })
      .mockReturnValueOnce({ valid: true, message: '' })
    
    const { rerender } = render(
      <ValidatedInput
        id="test-input"
        label="Email"
        value="emailinvalido"
        onChange={() => {}}
        validationFn={validationFn}
      />
    )
    
    const input = screen.getByLabelText('Email')
    
    // Primeiro blur - mostra erro
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
    
    // Digitar algo - deve limpar o erro
    fireEvent.change(input, { target: { value: 'emailvalido@email.com' } })
    
    // O erro não deve mais aparecer até próximo blur
    expect(screen.queryByText('Email inválido')).not.toBeInTheDocument()
  })

  it('deve aceitar placeholder', () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Nome"
        value=""
        onChange={() => {}}
        placeholder="Digite seu nome"
      />
    )
    
    const input = screen.getByPlaceholderText('Digite seu nome')
    expect(input).toBeInTheDocument()
  })
})

describe('ValidatedTextarea', () => {
  it('deve renderizar textarea corretamente', () => {
    render(
      <ValidatedTextarea
        id="test-textarea"
        label="Descrição"
        value=""
        onChange={() => {}}
      />
    )
    
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
  })

  it('deve chamar onChange quando texto mudar', () => {
    const handleChange = vi.fn()
    render(
      <ValidatedTextarea
        id="test-textarea"
        label="Descrição"
        value=""
        onChange={handleChange}
      />
    )
    
    const textarea = screen.getByLabelText('Descrição')
    fireEvent.change(textarea, { target: { value: 'Texto de teste' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('deve mostrar erro após blur com validação falha', async () => {
    const validationFn = vi.fn().mockReturnValue({
      valid: false,
      message: 'Texto muito curto'
    })
    
    render(
      <ValidatedTextarea
        id="test-textarea"
        label="Descrição"
        value="abc"
        onChange={() => {}}
        validationFn={validationFn}
      />
    )
    
    const textarea = screen.getByLabelText('Descrição')
    fireEvent.blur(textarea)
    
    await waitFor(() => {
      expect(screen.getByText('Texto muito curto')).toBeInTheDocument()
    })
  })

  it('deve respeitar rows customizado', () => {
    render(
      <ValidatedTextarea
        id="test-textarea"
        label="Descrição"
        value=""
        onChange={() => {}}
        rows={5}
      />
    )
    
    const textarea = screen.getByLabelText('Descrição')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})

describe('ValidatedSelect', () => {
  const options = [
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' },
    { value: '3', label: 'Opção 3' },
  ]

  it('deve renderizar select com opções', () => {
    render(
      <ValidatedSelect
        id="test-select"
        label="Escolha"
        value=""
        onChange={() => {}}
        options={options}
      />
    )
    
    expect(screen.getByLabelText('Escolha')).toBeInTheDocument()
    expect(screen.getByText('Opção 1')).toBeInTheDocument()
    expect(screen.getByText('Opção 2')).toBeInTheDocument()
    expect(screen.getByText('Opção 3')).toBeInTheDocument()
  })

  it('deve chamar onChange quando seleção mudar', () => {
    const handleChange = vi.fn()
    render(
      <ValidatedSelect
        id="test-select"
        label="Escolha"
        value=""
        onChange={handleChange}
        options={options}
      />
    )
    
    const select = screen.getByLabelText('Escolha')
    fireEvent.change(select, { target: { value: '2' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('deve mostrar placeholder customizado', () => {
    render(
      <ValidatedSelect
        id="test-select"
        label="Escolha"
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Escolha uma opção..."
      />
    )
    
    expect(screen.getByText('Escolha uma opção...')).toBeInTheDocument()
  })

  it('deve mostrar erro quando fornecido', () => {
    render(
      <ValidatedSelect
        id="test-select"
        label="Escolha"
        value=""
        onChange={() => {}}
        options={options}
        error="Seleção obrigatória"
      />
    )
    
    const select = screen.getByLabelText('Escolha')
    fireEvent.blur(select)
    
    expect(screen.getByText('Seleção obrigatória')).toBeInTheDocument()
  })

  it('deve estar desabilitado quando disabled=true', () => {
    render(
      <ValidatedSelect
        id="test-select"
        label="Escolha"
        value=""
        onChange={() => {}}
        options={options}
        disabled={true}
      />
    )
    
    const select = screen.getByLabelText('Escolha')
    expect(select).toBeDisabled()
  })
})

describe('Integração com validações reais', () => {
  it('ValidatedInput com validateEmail real', async () => {
    let inputValue = 'emailinvalido'
    
    const { rerender } = render(
      <ValidatedInput
        id="email-input"
        label="Email"
        value={inputValue}
        onChange={(e) => { inputValue = e.target.value }}
        validationFn={validateEmail}
      />
    )
    
    const input = screen.getByLabelText('Email')
    
    // Testar email inválido
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByText(/inválido/i)).toBeInTheDocument()
    })
    
    // Atualizar para email válido
    inputValue = 'usuario@email.com'
    rerender(
      <ValidatedInput
        id="email-input"
        label="Email"
        value={inputValue}
        onChange={(e) => { inputValue = e.target.value }}
        validationFn={validateEmail}
      />
    )
    
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByText('✓ Campo válido')).toBeInTheDocument()
    })
  })

  it('ValidatedInput com validateName real', async () => {
    render(
      <ValidatedInput
        id="name-input"
        label="Nome"
        value="A"
        onChange={() => {}}
        validationFn={validateName}
      />
    )
    
    const input = screen.getByLabelText('Nome')
    fireEvent.blur(input)
    
    await waitFor(() => {
      expect(screen.getByText(/pelo menos 2/i)).toBeInTheDocument()
    })
  })
})

