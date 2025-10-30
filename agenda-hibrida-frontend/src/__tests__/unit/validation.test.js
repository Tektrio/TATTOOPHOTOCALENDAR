import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validateName,
  validateFutureDate,
  validateDateRange,
  validateBusinessHours,
  validateRequired,
  validatePrice,
  validateFile,
  validateClientForm,
  validateAppointmentForm,
  formatPhone,
  formatPrice,
  normalizePhone,
} from '@/utils/validation.js'

describe('validateEmail', () => {
  it('deve aceitar email vazio (campo opcional)', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
  })

  it('deve aceitar email válido', () => {
    const result = validateEmail('usuario@dominio.com')
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
  })

  it('deve aceitar email com subdomínio', () => {
    const result = validateEmail('usuario@mail.dominio.com.br')
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar email sem @', () => {
    const result = validateEmail('usuariodominio.com')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('inválido')
  })

  it('deve rejeitar email sem domínio', () => {
    const result = validateEmail('usuario@')
    expect(result.valid).toBe(false)
  })

  it('deve rejeitar email com espaços', () => {
    const result = validateEmail('usuario @dominio.com')
    expect(result.valid).toBe(false)
  })
})

describe('validatePhone', () => {
  it('deve aceitar telefone vazio (campo opcional)', () => {
    const result = validatePhone('')
    expect(result.valid).toBe(true)
  })

  it('deve aceitar telefone fixo com 10 dígitos', () => {
    const result = validatePhone('1134567890')
    expect(result.valid).toBe(true)
  })

  it('deve aceitar telefone celular com 11 dígitos', () => {
    const result = validatePhone('11987654321')
    expect(result.valid).toBe(true)
  })

  it('deve aceitar telefone formatado', () => {
    const result = validatePhone('(11) 98765-4321')
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar telefone com menos de 10 dígitos', () => {
    const result = validatePhone('119876543')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('inválido')
  })

  it('deve rejeitar telefone com mais de 11 dígitos', () => {
    const result = validatePhone('119876543210')
    expect(result.valid).toBe(false)
  })
})

describe('normalizePhone', () => {
  it('deve normalizar telefone fixo para E.164', () => {
    const result = normalizePhone('1134567890')
    expect(result).toBe('+551134567890')
  })

  it('deve normalizar telefone celular para E.164', () => {
    const result = normalizePhone('11987654321')
    expect(result).toBe('+5511987654321')
  })

  it('deve normalizar telefone formatado', () => {
    const result = normalizePhone('(11) 98765-4321')
    expect(result).toBe('+5511987654321')
  })

  it('deve retornar original se inválido', () => {
    const result = normalizePhone('123')
    expect(result).toBe('123')
  })
})

describe('validateName', () => {
  it('deve rejeitar nome vazio', () => {
    const result = validateName('')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('obrigatório')
  })

  it('deve rejeitar nome com apenas espaços', () => {
    const result = validateName('   ')
    expect(result.valid).toBe(false)
  })

  it('deve rejeitar nome com menos de 2 caracteres', () => {
    const result = validateName('A')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('pelo menos 2')
  })

  it('deve aceitar nome válido', () => {
    const result = validateName('João Silva')
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
  })

  it('deve aceitar nome com acentos', () => {
    const result = validateName('José María')
    expect(result.valid).toBe(true)
  })
})

describe('validateFutureDate', () => {
  it('deve rejeitar data vazia', () => {
    const result = validateFutureDate('')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('obrigatória')
  })

  it('deve rejeitar data no passado', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    const result = validateFutureDate(pastDate.toISOString())
    expect(result.valid).toBe(false)
    expect(result.message).toContain('passado')
  })

  it('deve aceitar data de hoje', () => {
    const today = new Date()
    const result = validateFutureDate(today.toISOString())
    expect(result.valid).toBe(true)
  })

  it('deve aceitar data futura', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const result = validateFutureDate(futureDate.toISOString())
    expect(result.valid).toBe(true)
  })
})

describe('validateDateRange', () => {
  it('deve rejeitar datas vazias', () => {
    const result = validateDateRange('', '')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('obrigatórias')
  })

  it('deve rejeitar quando fim é antes do início', () => {
    const start = new Date('2025-11-01T10:00:00')
    const end = new Date('2025-11-01T09:00:00')
    const result = validateDateRange(start.toISOString(), end.toISOString())
    expect(result.valid).toBe(false)
    expect(result.message).toContain('posterior')
  })

  it('deve rejeitar duração menor que 30 minutos', () => {
    const start = new Date('2025-11-01T10:00:00')
    const end = new Date('2025-11-01T10:20:00')
    const result = validateDateRange(start.toISOString(), end.toISOString())
    expect(result.valid).toBe(false)
    expect(result.message).toContain('30 minutos')
  })

  it('deve rejeitar duração maior que 12 horas', () => {
    const start = new Date('2025-11-01T08:00:00')
    const end = new Date('2025-11-01T21:00:00')
    const result = validateDateRange(start.toISOString(), end.toISOString())
    expect(result.valid).toBe(false)
    expect(result.message).toContain('12 horas')
  })

  it('deve aceitar duração válida de 1 hora', () => {
    const start = new Date('2025-11-01T10:00:00')
    const end = new Date('2025-11-01T11:00:00')
    const result = validateDateRange(start.toISOString(), end.toISOString())
    expect(result.valid).toBe(true)
  })

  it('deve aceitar duração de exatamente 30 minutos', () => {
    const start = new Date('2025-11-01T10:00:00')
    const end = new Date('2025-11-01T10:30:00')
    const result = validateDateRange(start.toISOString(), end.toISOString())
    expect(result.valid).toBe(true)
  })
})

describe('validateBusinessHours', () => {
  it('deve aceitar datetime vazio', () => {
    const result = validateBusinessHours('')
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar horário antes das 8h', () => {
    const datetime = new Date('2025-11-01T07:30:00')
    const result = validateBusinessHours(datetime.toISOString())
    expect(result.valid).toBe(false)
    expect(result.message).toContain('8h-22h')
  })

  it('deve rejeitar horário às 22h ou depois', () => {
    const datetime = new Date('2025-11-01T22:00:00')
    const result = validateBusinessHours(datetime.toISOString())
    expect(result.valid).toBe(false)
  })

  it('deve aceitar horário às 8h', () => {
    const datetime = new Date('2025-11-01T08:00:00')
    const result = validateBusinessHours(datetime.toISOString())
    expect(result.valid).toBe(true)
  })

  it('deve aceitar horário às 21h59', () => {
    const datetime = new Date('2025-11-01T21:59:00')
    const result = validateBusinessHours(datetime.toISOString())
    expect(result.valid).toBe(true)
  })

  it('deve aceitar horário no meio do dia', () => {
    const datetime = new Date('2025-11-01T14:00:00')
    const result = validateBusinessHours(datetime.toISOString())
    expect(result.valid).toBe(true)
  })
})

describe('validateRequired', () => {
  it('deve rejeitar valor vazio', () => {
    const result = validateRequired('', 'Nome')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Nome')
    expect(result.message).toContain('obrigatório')
  })

  it('deve rejeitar null', () => {
    const result = validateRequired(null, 'Email')
    expect(result.valid).toBe(false)
  })

  it('deve rejeitar undefined', () => {
    const result = validateRequired(undefined, 'Telefone')
    expect(result.valid).toBe(false)
  })

  it('deve rejeitar string com apenas espaços', () => {
    const result = validateRequired('   ', 'Campo')
    expect(result.valid).toBe(false)
  })

  it('deve aceitar string válida', () => {
    const result = validateRequired('João', 'Nome')
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
  })

  it('deve aceitar número zero', () => {
    const result = validateRequired(0, 'Quantidade')
    expect(result.valid).toBe(true)
  })
})

describe('validatePrice', () => {
  it('deve aceitar preço vazio (campo opcional)', () => {
    const result = validatePrice('')
    expect(result.valid).toBe(true)
  })

  it('deve aceitar preço válido', () => {
    const result = validatePrice(500)
    expect(result.valid).toBe(true)
  })

  it('deve aceitar preço zero', () => {
    const result = validatePrice(0)
    expect(result.valid).toBe(true)
  })

  it('deve aceitar preço como string', () => {
    const result = validatePrice('350.50')
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar preço negativo', () => {
    const result = validatePrice(-100)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('negativo')
  })

  it('deve rejeitar preço acima de 100.000', () => {
    const result = validatePrice(150000)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('100.000')
  })

  it('deve rejeitar valor não numérico', () => {
    const result = validatePrice('abc')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('inválido')
  })
})

describe('validateFile', () => {
  it('deve rejeitar arquivo vazio', () => {
    const result = validateFile(null)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Nenhum arquivo')
  })

  it('deve aceitar arquivo válido sem restrições', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
    const result = validateFile(file)
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar tipo de arquivo não permitido', () => {
    const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })
    const result = validateFile(file, ['image/jpeg', 'image/png'])
    expect(result.valid).toBe(false)
    expect(result.message).toContain('inválido')
  })

  it('deve aceitar tipo de arquivo permitido', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
    const result = validateFile(file, ['image/jpeg', 'image/png'])
    expect(result.valid).toBe(true)
  })

  it('deve rejeitar arquivo muito grande', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 }) // 25MB
    const result = validateFile(file, [], 20)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('grande')
  })
})

describe('validateClientForm', () => {
  it('deve rejeitar formulário com nome vazio', () => {
    const clientData = { name: '', email: '', phone: '' }
    const result = validateClientForm(clientData, [])
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeDefined()
  })

  it('deve rejeitar email inválido', () => {
    const clientData = { name: 'João', email: 'emailinvalido', phone: '' }
    const result = validateClientForm(clientData, [])
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBeDefined()
  })

  it('deve rejeitar telefone inválido', () => {
    const clientData = { name: 'João', email: '', phone: '123' }
    const result = validateClientForm(clientData, [])
    expect(result.valid).toBe(false)
    expect(result.errors.phone).toBeDefined()
  })

  it('deve detectar telefone duplicado', () => {
    const clientData = { name: 'João', email: '', phone: '11987654321' }
    const existingClients = [{ id: 1, phone: '11987654321' }]
    const result = validateClientForm(clientData, existingClients)
    expect(result.valid).toBe(false)
    expect(result.errors.phone).toContain('existe')
  })

  it('deve aceitar formulário válido completo', () => {
    const clientData = {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '11987654321',
    }
    const result = validateClientForm(clientData, [])
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })

  it('deve aceitar formulário válido apenas com nome', () => {
    const clientData = { name: 'João Silva', email: '', phone: '' }
    const result = validateClientForm(clientData, [])
    expect(result.valid).toBe(true)
  })
})

describe('validateAppointmentForm', () => {
  it('deve rejeitar formulário com título vazio', () => {
    const appointmentData = {
      title: '',
      client_id: '1',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 3600000).toISOString(),
    }
    const result = validateAppointmentForm(appointmentData)
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBeDefined()
  })

  it('deve rejeitar formulário sem cliente', () => {
    const appointmentData = {
      title: 'Sessão',
      client_id: '',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 3600000).toISOString(),
    }
    const result = validateAppointmentForm(appointmentData)
    expect(result.valid).toBe(false)
    expect(result.errors.client).toBeDefined()
  })

  it('deve rejeitar formulário sem data de início', () => {
    const appointmentData = {
      title: 'Sessão',
      client_id: '1',
      start_datetime: '',
      end_datetime: new Date().toISOString(),
    }
    const result = validateAppointmentForm(appointmentData)
    expect(result.valid).toBe(false)
    expect(result.errors.start).toBeDefined()
  })

  it('deve rejeitar formulário sem data de término', () => {
    const appointmentData = {
      title: 'Sessão',
      client_id: '1',
      start_datetime: new Date().toISOString(),
      end_datetime: '',
    }
    const result = validateAppointmentForm(appointmentData)
    expect(result.valid).toBe(false)
    expect(result.errors.end).toBeDefined()
  })

  it('deve aceitar formulário válido', () => {
    const start = new Date('2025-11-01T10:00:00')
    const end = new Date('2025-11-01T12:00:00')
    const appointmentData = {
      title: 'Sessão de Tatuagem',
      client_id: '1',
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      estimated_price: 500,
    }
    const result = validateAppointmentForm(appointmentData)
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
  })
})

describe('formatPhone', () => {
  it('deve formatar telefone fixo', () => {
    const result = formatPhone('1134567890')
    expect(result).toBe('(11) 3456-7890')
  })

  it('deve formatar telefone celular', () => {
    const result = formatPhone('11987654321')
    expect(result).toBe('(11) 98765-4321')
  })

  it('deve retornar original se não corresponder aos formatos', () => {
    const result = formatPhone('123456')
    expect(result).toBe('123456')
  })

  it('deve remover caracteres não numéricos antes de formatar', () => {
    const result = formatPhone('(11) 98765-4321')
    expect(result).toBe('(11) 98765-4321')
  })
})

describe('formatPrice', () => {
  it('deve formatar preço corretamente', () => {
    const result = formatPrice(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toContain('R$')
  })

  it('deve formatar preço inteiro', () => {
    const result = formatPrice(500)
    expect(result).toContain('500,00')
    expect(result).toContain('R$')
  })

  it('deve formatar preço zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0,00')
    expect(result).toContain('R$')
  })

  it('deve formatar preço grande', () => {
    const result = formatPrice(99999.99)
    expect(result).toContain('99.999,99')
    expect(result).toContain('R$')
  })
})

