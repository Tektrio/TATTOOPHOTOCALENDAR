# 🧪 **Testes Unitários - TattooScheduler Backend**

## 📋 **Resumo**

Sistema completo de testes unitários implementado para os serviços principais do backend.

---

## ✅ **O Que Foi Implementado**

### 1. **Configuração do Jest**
- ✅ `jest.config.js` - Configuração completa com coverage
- ✅ `__tests__/setup.js` - Setup global para todos os testes
- ✅ Scripts npm configurados em `package.json`

### 2. **Testes de Serviços**

#### **Phone Normalizer Service** (`__tests__/unit/phoneNormalizer.test.js`)
- ✅ **25 testes** cobrindo:
  - `normalizePhone()` - 10 testes
  - `isPhoneValid()` - 3 testes
  - `formatPhone()` - 4 testes
  - `normalizePhones()` - 4 testes
  - `comparePhones()` - 4 testes

#### **Dedup Service** (`__tests__/unit/dedupService.test.js`)
- ✅ **22 testes** cobrindo:
  - `generateAppointmentHash()` - 5 testes
  - `calculateNameSimilarity()` - 7 testes
  - `findDuplicateClient()` - 5 testes (com mock db)
  - `findDuplicateAppointment()` - 5 testes (com mock db)

### 3. **Cobertura de Código**
- ✅ Threshold configurado: 70% para branches, functions, lines, statements
- ✅ `collectCoverageFrom` configurado para `services/**/*.js`
- ✅ Relatório de coverage gerado em `coverage/`

---

## 🚀 **Como Executar os Testes**

### **Instalar Dependências**
```bash
cd agenda-hibrida-v2
npm install
```

### **Executar Todos os Testes**
```bash
npm test
```

### **Executar com Coverage**
```bash
npm test -- --coverage
```

### **Executar em Modo Watch**
```bash
npm run test:watch
```

### **Executar Apenas Testes Unitários**
```bash
npm run test:unit
```

### **Executar Teste Específico**
```bash
npm test -- phoneNormalizer
```

---

## 📊 **Estrutura de Diretórios**

```
agenda-hibrida-v2/
├── __tests__/
│   ├── setup.js                          # Setup global
│   ├── unit/
│   │   ├── phoneNormalizer.test.js       # 25 testes
│   │   └── dedupService.test.js          # 22 testes
│   └── integration/                      # (próxima fase)
├── services/
│   ├── phoneNormalizer.js                # Testado ✅
│   ├── dedupService.js                   # Testado ✅
│   ├── googleAuthService.js              # TODO
│   ├── googleCalendarService.js          # TODO
│   └── vagaroExcelImportService.js       # TODO
├── jest.config.js                        # Configuração Jest
├── coverage/                             # Relatórios de coverage
└── package.json                          # Scripts de teste
```

---

## 🧪 **Detalhes dos Testes**

### **Phone Normalizer Service**

#### **Casos Testados:**
1. ✅ Normalização de telefone brasileiro (11) 99999-9999 → +5511999999999
2. ✅ Telefone sem formatação: 11999999999 → +5511999999999
3. ✅ Telefone com código do país: +5511999999999 (mantém)
4. ✅ Telefone com espaços e traços
5. ✅ Validação de telefones inválidos (retorna null)
6. ✅ Tratamento de null/undefined
7. ✅ Telefones fixos brasileiros
8. ✅ Telefones internacionais (US, etc)
9. ✅ Formatação nacional e internacional
10. ✅ Array de telefones (filtrando inválidos)
11. ✅ Comparação de telefones com diferentes formatações

#### **Exemplo de Teste:**
```javascript
test('deve normalizar telefone brasileiro com DDD e 9 dígitos', () => {
  const result = normalizePhone('(11) 99999-9999');
  expect(result).toBe('+5511999999999');
});
```

### **Dedup Service**

#### **Casos Testados:**
1. ✅ Geração de hash MD5 consistente para mesmos dados
2. ✅ Hashes diferentes para dados diferentes
3. ✅ Hash case-insensitive
4. ✅ Uso de `client_name` quando `client_id` não disponível
5. ✅ Cálculo de similaridade de nomes (algoritmo de palavras comuns)
6. ✅ Busca de duplicatas por múltiplos critérios:
   - External ID
   - Telefone normalizado
   - Email
   - Google Event ID
   - iCal UID
   - Hash de agendamento
7. ✅ Mocking de banco de dados SQLite

#### **Exemplo de Teste:**
```javascript
test('deve gerar hash consistente para mesmos dados', () => {
  const appointment1 = {
    client_id: 1,
    date: '2025-11-01',
    time: '14:00',
    service: 'Tatuagem Grande'
  };
  
  const appointment2 = {
    client_id: 1,
    date: '2025-11-01',
    time: '14:00',
    service: 'Tatuagem Grande'
  };
  
  const hash1 = generateAppointmentHash(appointment1);
  const hash2 = generateAppointmentHash(appointment2);
  
  expect(hash1).toBe(hash2);
  expect(hash1).toHaveLength(32); // MD5
});
```

---

## 📈 **Métricas de Qualidade**

### **Estatísticas Atuais:**
- ✅ **47 testes unitários** implementados
- ✅ **2 serviços** completamente testados
- ✅ **Coverage esperado**: > 70% em todos os aspectos
- ✅ **Tempo de execução**: < 5s para todos os testes

### **Próximos Serviços a Testar:**
1. `googleAuthService.js` - Autenticação OAuth
2. `googleCalendarService.js` - Integração Calendar
3. `icsImportService.js` - Importação ICS
4. `vagaroExcelImportService.js` - Importação Excel

---

## 🔍 **Boas Práticas Implementadas**

### **1. Arrange-Act-Assert (AAA)**
Todos os testes seguem o padrão AAA:
```javascript
test('description', () => {
  // Arrange: preparar dados
  const input = '(11) 99999-9999';
  
  // Act: executar função
  const result = normalizePhone(input);
  
  // Assert: verificar resultado
  expect(result).toBe('+5511999999999');
});
```

### **2. Testes Descritivos**
- ✅ Nomes de teste claros e em português
- ✅ Agrupamento lógico com `describe()`
- ✅ Um assert por conceito

### **3. Mock de Dependências**
- ✅ Mock de banco de dados SQLite
- ✅ Mock de console.warn (para evitar poluição de logs)
- ✅ Isolamento de testes

### **4. Coverage Configurado**
- ✅ Threshold mínimo de 70%
- ✅ Relatórios HTML e JSON
- ✅ Exclusão de node_modules e __tests__

### **5. Setup Centralizado**
- ✅ Timeout global configurado
- ✅ Variáveis de ambiente para testes
- ✅ Mocks globais

---

## 🐛 **Troubleshooting**

### **Erro: Jest não encontrado**
```bash
# Reinstalar dependências
npm install
```

### **Testes falhando por timeout**
Aumentar timeout em `jest.config.js`:
```javascript
testTimeout: 15000 // 15 segundos
```

### **Coverage baixo**
Verificar quais arquivos não têm cobertura:
```bash
npm test -- --coverage --verbose
```

### **Erro de módulo não encontrado**
Verificar paths em `jest.config.js` e `package.json`.

---

## 📚 **Recursos**

- [Jest Documentation](https://jestjs.io/)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Testing Node.js Applications](https://nodejs.org/en/docs/guides/test-runner/)

---

*Última atualização: Outubro 2025*

