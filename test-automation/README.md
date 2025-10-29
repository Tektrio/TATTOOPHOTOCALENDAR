# 🌙 Sistema de Testes Autônomos Noturnos

Sistema completo de testes automatizados que roda durante a noite, corrige bugs simples automaticamente e gera relatórios detalhados.

## 🎯 Funcionalidades

- ✅ **Testes E2E Completos** - Executa todos os testes Playwright
- 🔧 **Correção Automática** - Corrige bugs simples (timeouts, seletores, CSS, validações)
- 🔒 **Proteção Google API** - Monitora e bloqueia operações de risco
- 🏥 **Monitoramento de Saúde** - Verifica backend e frontend continuamente
- 📊 **Relatórios Detalhados** - Gera relatórios completos em Markdown
- 🔄 **Múltiplos Ciclos** - Executa testes repetidamente durante a noite
- 📈 **Métricas de Performance** - Coleta dados de performance e uso

## 🚀 Como Usar

### Método 1: Script Automático (Recomendado)

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/test-automation
./start-night-tests.sh
```

Ou com duração customizada:

```bash
./start-night-tests.sh 6h   # Rodar por 6 horas
./start-night-tests.sh 10h  # Rodar por 10 horas
```

### Método 2: Node.js Direto

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/test-automation
node test-automation-night.js --duration=8h --start-servers
```

#### Opções Disponíveis:

- `--duration=Xh` - Duração em horas (ex: 8h, 12h)
- `--duration=Xm` - Duração em minutos (ex: 30m, 120m)
- `--no-start-servers` - Não iniciar servidores automaticamente
- `--browser-tests` - Habilitar testes manuais de navegador

## 📁 Estrutura de Arquivos

```
test-automation/
├── test-automation-night.js      # Orquestrador principal
├── health-monitor.js             # Monitor de saúde dos servidores
├── google-safety-checker.js      # Verificador de segurança Google
├── auto-fix.js                   # Sistema de correção automática
├── report-generator.js           # Gerador de relatórios
├── config.json                   # Configurações
├── start-night-tests.sh          # Script para iniciar testes
├── README.md                     # Este arquivo
└── logs/                         # Logs de execução

RELATORIOS_NOTURNO/
├── _BOM_DIA_LEIA_PRIMEIRO.md     # Notificação matinal
├── RELATORIO_TESTES_NOTURNO_[DATA].md
├── BUGS_CORRIGIDOS_AUTO_[DATA].md
├── PLANO_CORRECOES_MANHA_[DATA].md
├── OPERACOES_GOOGLE_PULADAS_[DATA].md
├── HEALTH_REPORT_[DATA].md
├── screenshots/                   # Screenshots de falhas
├── videos/                        # Vídeos de testes falhados
└── logs/                          # Logs detalhados
```

## 🔄 Fluxo de Execução

### Fase 1: Inicialização (5 min)
1. Verifica e inicia servidores (backend + frontend)
2. Valida configurações
3. Cria estrutura de pastas
4. Inicia monitores de saúde

### Fase 2: Ciclos de Testes (repetir até 6h da manhã)
Para cada ciclo (1-1.5h):
1. **Testes E2E Playwright** (30-45 min)
   - Executa todos os testes
   - Captura screenshots e vídeos de falhas
   - Coleta logs de console

2. **Análise de Falhas** (5 min)
   - Classifica bugs (simples vs complexos)
   - Identifica operações de risco Google

3. **Correção Automática** (10 min)
   - Aplica correções para bugs simples
   - Re-executa testes das correções
   - Documenta alterações

4. **Testes de Navegador** (15 min - opcional)
   - Usa browser tools do MCP
   - Navega por todas as páginas
   - Verifica responsividade

5. **Coleta de Métricas** (5 min)
   - Performance
   - Cobertura de código
   - Bugs encontrados vs corrigidos

6. **Pausa Estratégica** (5 min)
   - Evita sobrecarga
   - Limpa recursos

### Fase 3: Geração de Relatórios (10 min)
1. Consolida todos os ciclos
2. Gera relatório executivo
3. Cria plano de correção priorizado
4. Organiza evidências (screenshots, vídeos, logs)

## 🔒 Proteção Google API

O sistema monitora e **BLOQUEIA** automaticamente operações de risco:

### ❌ Operações Bloqueadas

**Google Calendar:**
- Criar >10 eventos por minuto
- Sincronização bidirecional completa
- Listagem repetitiva de calendários

**Google Drive:**
- Upload >5 arquivos por minuto
- Listagem recursiva de todas pastas
- Modificação de permissões em lote
- Criação de múltiplas pastas

**Geral:**
- Qualquer operação >50 requests/hora por API

### ✅ Operações Permitidas

- Criar 1-2 eventos de teste
- Ler eventos existentes (max 5 requests/ciclo)
- Validar tokens e conexões
- Ler metadados de 1-2 arquivos

Todas as operações bloqueadas são **documentadas** no relatório `OPERACOES_GOOGLE_PULADAS_[DATA].md`.

## 🔧 Correções Automáticas

O sistema pode corrigir automaticamente:

### CSS/UI
✅ Ajustes de margin/padding  
✅ Cores de contraste  
✅ Responsividade básica  
✅ Conflitos de z-index  
✅ Problemas de overflow  

### JavaScript/Validação
✅ Regex de validação  
✅ Mensagens de erro/sucesso  
✅ Tratamento de null/undefined  
✅ Timeouts aumentados  
✅ Loading states  

### Testes
✅ Aumentar timeouts  
✅ Adicionar waits estratégicos  
✅ Melhorar seletores  
✅ Adicionar retry logic  

## 📊 Relatórios Gerados

Ao acordar, você encontrará:

### 1. `_BOM_DIA_LEIA_PRIMEIRO.md`
Resumo rápido com status geral e próximas ações

### 2. `RELATORIO_TESTES_NOTURNO_[DATA].md`
Relatório principal com:
- Resumo executivo
- Detalhamento dos ciclos
- Correções aplicadas
- Operações Google bloqueadas
- Saúde do sistema
- Cobertura de testes
- Métricas de performance

### 3. `BUGS_CORRIGIDOS_AUTO_[DATA].md`
Lista detalhada de todas as correções automáticas aplicadas

### 4. `PLANO_CORRECOES_MANHA_[DATA].md`
Plano de ação priorizado para aprovação:
- Correções já aplicadas (para revisar)
- Problemas que requerem atenção manual
- Operações Google bloqueadas
- Prioridades de correção

### 5. `OPERACOES_GOOGLE_PULADAS_[DATA].md`
Detalhes de todas as operações Google bloqueadas por segurança

### 6. `HEALTH_REPORT_[DATA].md`
Relatório de saúde dos servidores durante a noite

## 🎯 Testes Executados

### Testes Existentes (10)
1. **01-navigation.spec.js** - Navegação entre abas
2. **02-clients.spec.js** - CRUD de clientes
3. **03-appointments.spec.js** - CRUD de agendamentos
4. **04-integration-flow.spec.js** - Fluxo completo integrado
5. **05-google-sync.spec.js** - Sincronização Google Calendar
6. **06-import-preview.spec.js** - Importação de dados
7. **07-drag-and-drop.spec.js** - Funcionalidades de arrastar
8. **08-complete-navigation-test.spec.js** - Navegação completa
9. **09-test-all-tabs.spec.js** - Teste de todas abas
10. **10-test-corrections.spec.js** - Correções

### Novos Testes (5)
11. **11-google-drive-integration.spec.js** - Integração Google Drive (segura)
12. **12-import-vagaro.spec.js** - Importação Vagaro
13. **13-gallery-advanced.spec.js** - Galeria de fotos avançado
14. **14-data-local-operations.spec.js** - Operações com dados locais
15. **15-stress-test.spec.js** - Testes de stress e performance

## ⚙️ Configuração

Edite `config.json` para customizar:

```json
{
  "duration": 28800000,        // 8 horas em ms
  "startServers": true,        // Iniciar servidores automaticamente
  "cyclePause": 300000,        // 5 minutos entre ciclos
  "healthMonitor": {
    "checkInterval": 30000,    // Verificar saúde a cada 30s
    "maxMemoryMB": 1024       // Limite de memória
  },
  "autoFix": {
    "enabled": true,           // Habilitar correções automáticas
    "reTestAfterFix": true     // Re-testar após correção
  }
}
```

## 📈 Métricas Esperadas

Após 8 horas de execução:

- **Testes executados:** 150-300 (dependendo dos ciclos)
- **Cobertura:** >85%
- **Bugs simples corrigidos:** 10-30
- **Bugs complexos identificados:** 5-15
- **Operações Google puladas:** Documentadas no relatório
- **Ciclos completados:** 4-6

## 🛠️ Troubleshooting

### Servidores não iniciam

```bash
# Verificar portas
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Matar processos se necessário
kill -9 <PID>
```

### Testes falhando muito

1. Verifique logs em `test-automation/logs/`
2. Veja screenshots em `RELATORIOS_NOTURNO/screenshots/`
3. Revise correções em `BUGS_CORRIGIDOS_AUTO_[DATA].md`

### Memória alta

Edite `config.json` e reduza:
- `cyclePause` - Aumentar pausa entre ciclos
- `playwright.workers` - Reduzir workers paralelos

## 🔍 Monitoramento em Tempo Real

Para acompanhar execução:

```bash
# Ver logs em tempo real
tail -f test-automation/logs/night-test-*.log

# Ver saúde do sistema
tail -f test-automation/logs/health-monitor-*.log

# Ver operações Google
tail -f test-automation/logs/google-safety-*.log
```

## 🌅 Após a Execução

1. ✅ Leia `_BOM_DIA_LEIA_PRIMEIRO.md`
2. 📊 Revise `RELATORIO_TESTES_NOTURNO_[DATA].md`
3. 🔧 Aprove correções em `PLANO_CORRECOES_MANHA_[DATA].md`
4. 🔒 Revise operações bloqueadas (se houver)
5. 📸 Veja screenshots/vídeos de problemas
6. ✅ Aplique correções manuais necessárias

## 📞 Suporte

Para problemas ou dúvidas:
1. Revise logs em `test-automation/logs/`
2. Verifique configuração em `config.json`
3. Consulte relatórios gerados

## 📝 Changelog

### v1.0.0 (2025-10-29)
- ✅ Sistema inicial completo
- ✅ 15 testes E2E
- ✅ Correção automática de bugs
- ✅ Proteção Google API
- ✅ Relatórios detalhados
- ✅ Monitoramento de saúde

---

**Versão:** 1.0.0  
**Última Atualização:** 29 de Outubro de 2025  
**Autor:** Manus AI

