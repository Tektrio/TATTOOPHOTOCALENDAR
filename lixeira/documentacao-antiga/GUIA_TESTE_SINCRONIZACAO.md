# 🧪 Guia de Testes - Sistema de Sincronização Híbrida

## 📋 Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ Backend está rodando: `cd agenda-hibrida-v2 && npm start`
2. ✅ Frontend está rodando: `cd agenda-hibrida-frontend && npm run dev`
3. ✅ Google Drive está autenticado (arquivo `tokens.json` existe)
4. ✅ Há pelo menos um cliente cadastrado com agendamento

## 🔍 Checklist de Testes

### ✅ Teste 1: Sincronização Básica (Download do Drive)

**Objetivo**: Verificar se arquivos do Google Drive são baixados ao abrir pasta

**Passos**:

1. No Google Drive, crie manualmente uma pasta de cliente (ex: "Cliente_Teste")
2. Adicione algumas imagens na pasta
3. No calendário, clique em "Abrir Pasta do Cliente" para esse cliente
4. **Resultado Esperado**:
   - Toast: "🔄 Sincronizando arquivos..."
   - Toast: "📥 X arquivo(s) baixado(s) do Drive"
   - Pasta local abre com os arquivos sincronizados
   - Console do servidor mostra logs de download

**Log Esperado**:

```
🔄 Sincronizando pasta do cliente: Cliente_Teste...
📂 Arquivos locais: 0
☁️ Arquivos no Drive: 3
⬇️ Baixando do Drive: foto1.jpg
✅ Download concluído: foto1.jpg
⬇️ Baixando do Drive: foto2.jpg
✅ Download concluído: foto2.jpg
```

---

### ✅ Teste 2: Upload Automático (File Watcher)

**Objetivo**: Verificar se arquivos adicionados localmente são enviados ao Drive

**Passos**:

1. Abra a pasta de um cliente
2. Adicione manualmente uma nova imagem na pasta (via explorador de arquivos)
3. Aguarde 3 segundos
4. **Resultado Esperado**:
   - Console do servidor: "📄 Novo arquivo detectado: ..."
   - Console do servidor: "⬆️ Iniciando upload automático para Drive: ..."
   - Console do servidor: "✅ Arquivo sincronizado: ..."
   - Badge de status no calendário muda para "Sincronizando" (azul)
   - Depois volta para "Sincronizado" (verde)
   - Arquivo aparece no Google Drive

**Log Esperado**:

```
📄 Novo arquivo detectado: Cliente_Teste/referencias/nova_foto.jpg
⬆️ Iniciando upload automático para Drive: nova_foto.jpg
📁 Pasta encontrada no Drive: Cliente_Teste (1a2b3c4d5e)
⬆️ Enviando para Drive: nova_foto.jpg
✅ Upload concluído: nova_foto.jpg
✅ Arquivo sincronizado: nova_foto.jpg
```

---

### ✅ Teste 3: Detecção de Conflitos

**Objetivo**: Verificar se conflitos são detectados e modal é exibido

**Passos**:

1. Crie um arquivo `teste_conflito.txt` na pasta local de um cliente
2. Aguarde o upload automático completar
3. **No Google Drive**: Modifique o arquivo diretamente (edite o conteúdo)
4. **Na pasta local**: Modifique o mesmo arquivo de forma diferente
5. Aguarde alguns segundos para modificações salvarem
6. No calendário, clique em "Abrir Pasta do Cliente"
7. **Resultado Esperado**:
   - Toast: "⚠️ 1 conflito(s) detectado(s)!"
   - Modal de resolução de conflitos aparece
   - Modal mostra:
     - Nome do arquivo
     - Versão local (tamanho, data)
     - Versão Drive (tamanho, data)
     - Diferenças detectadas
     - 3 botões de resolução

**Modal Esperado**:

```
🚨 Conflito de Sincronização
O arquivo "teste_conflito.txt" foi modificado tanto localmente quanto no Google Drive.

┌─────────────────────────┐  ┌─────────────────────────┐
│  💻 Versão Local         │  │  ☁️ Versão Drive         │
│  Tamanho: 1.2 KB        │  │  Tamanho: 1.5 KB        │
│  Modificado: 14:30      │  │  Modificado: 14:35      │
└─────────────────────────┘  └─────────────────────────┘

⚠️ Diferenças detectadas:
  • Tamanho diferente: 300 B
  • Modificado com 5 minutos de diferença

[Manter Versão Local]
[Manter Versão do Drive]
[Manter Ambas as Versões]
```

---

### ✅ Teste 4: Resolução de Conflito - Manter Local

**Objetivo**: Testar opção "Manter Local"

**Passos**:

1. Com o modal de conflito aberto (do teste anterior)
2. Clique em "Manter Versão Local"
3. **Resultado Esperado**:
   - Toast: "✅ Conflito resolvido: Versão local mantida"
   - Modal fecha
   - Versão local sobrescreve versão do Drive
   - Console: "🔧 Resolvendo conflito: teste_conflito.txt (keep_local)"

---

### ✅ Teste 5: Resolução de Conflito - Manter Drive

**Objetivo**: Testar opção "Manter Drive"

**Passos**:

1. Crie novo conflito (repita passos do Teste 3)
2. Clique em "Manter Versão do Drive"
3. **Resultado Esperado**:
   - Toast: "✅ Conflito resolvido: Versão do Drive mantida"
   - Arquivo local é sobrescrito com versão do Drive
   - Console: "🔧 Resolvendo conflito: ... (keep_drive)"

---

### ✅ Teste 6: Resolução de Conflito - Manter Ambos

**Objetivo**: Testar opção "Manter Ambos"

**Passos**:

1. Crie novo conflito
2. Clique em "Manter Ambas as Versões"
3. **Resultado Esperado**:
   - Toast: "✅ Conflito resolvido: Ambas as versões mantidas"
   - Arquivo local é renomeado (ex: `teste_conflito_local_1635789012345.txt`)
   - Versão do Drive é baixada com nome original
   - Ambos os arquivos existem na pasta local

---

### ✅ Teste 7: Múltiplos Conflitos

**Objetivo**: Testar resolução sequencial de múltiplos conflitos

**Passos**:

1. Crie 3 arquivos com conflitos
2. Abra pasta do cliente
3. **Resultado Esperado**:
   - Toast: "⚠️ 3 conflito(s) detectado(s)!"
   - Modal mostra "Conflito 1 de 3"
   - Barra de progresso mostra 33%
   - Badge: "2 restantes"
   - Ao resolver cada conflito, avança automaticamente para o próximo
   - Após resolver todos: "🎉 Todos os conflitos foram resolvidos!"

---

### ✅ Teste 8: Indicador de Status em Tempo Real

**Objetivo**: Verificar se o badge de status funciona

**Passos**:

1. Observe o badge no canto superior direito do calendário
2. Adicione arquivo manualmente na pasta
3. **Resultado Esperado**:
   - Badge inicial: 🟢 "Sincronizado"
   - Durante upload: 🔵 "Sincronizando..." (ícone girando)
   - Após completar: 🟢 "Sincronizado há Xmin"
   - Hover no badge mostra tooltip com detalhes

---

### ✅ Teste 9: Sincronização de Subpastas

**Objetivo**: Verificar se categorias (subpastas) são sincronizadas

**Passos**:

1. No Google Drive, adicione arquivos em `Cliente/referencias/`
2. Abra pasta do cliente
3. **Resultado Esperado**:
   - Sistema cria subpasta `referencias/` localmente
   - Arquivos são baixados na subpasta correta
   - Estrutura mantida: `Cliente/referencias/arquivo.jpg`

---

### ✅ Teste 10: Comportamento sem Internet

**Objetivo**: Verificar graceful degradation sem conexão

**Passos**:

1. Desconecte internet
2. Tente abrir pasta do cliente
3. Adicione arquivo manualmente
4. **Resultado Esperado**:
   - Sistema funciona em modo offline
   - Pasta abre normalmente (apenas arquivos locais)
   - File Watcher detecta arquivo mas não consegue fazer upload
   - Logs: "⚠️ Erro na sincronização: ..."
   - Badge: ❌ "Erro na sincronização"
   - Ao reconectar, sincronização automática retoma

---

## 🎯 Cenários Avançados

### Teste A: Grande Volume de Arquivos

**Cenário**: Cliente com 100+ imagens

**Resultado Esperado**:

- Sistema baixa arquivos em lote
- Progress é exibido no console
- Não trava a interface
- Download concorrente (máx 3 simultâneos por padrão)

### Teste B: Arquivos Grandes

**Cenário**: Arquivo de 50MB

**Resultado Esperado**:

- Upload/download funciona sem travar
- Progress é logado
- Timeout configurável (60s por padrão)

### Teste C: Caracteres Especiais

**Cenário**: Arquivo com nome `Foto #1 - João's work (2025).jpg`

**Resultado Esperado**:

- Sistema trata caracteres especiais corretamente
- Nome preservado em ambos os locais

---

## 📊 Verificação de Logs

### Logs Importantes no Console do Servidor

```bash
# Inicialização
✅ Sync Manager inicializado
✅ File Watcher iniciado
👀 Iniciando File Watcher...

# Sincronização
🔄 Sincronizando pasta do cliente: ...
📂 Arquivos locais: X
☁️ Arquivos no Drive: Y
📊 Análise de sincronização:
   ✅ Sincronizados: Z
   ⬇️ Apenas no Drive (baixar): A
   ⬆️ Apenas local (enviar): B
   ⚠️ Conflitos: C

# File Watcher
📄 Novo arquivo detectado: ...
⬆️ Iniciando upload automático para Drive: ...
✅ Arquivo sincronizado: ...
```

### Verificação no Google Drive

1. Abra [Google Drive](https://drive.google.com)
2. Procure pela pasta do cliente
3. Verifique se arquivos foram criados/atualizados
4. Timestamps devem estar corretos

### Verificação no Banco de Dados

```bash
cd agenda-hibrida-v2
sqlite3 agenda_hibrida.db
```

```sql
-- Ver arquivos registrados
SELECT * FROM files WHERE client_id = 1 ORDER BY created_at DESC;

-- Ver clientes
SELECT * FROM clients;
```

---

## 🐛 Troubleshooting

### Problema: Arquivos não são sincronizados

**Possíveis Causas**:

- Google Drive não autenticado
- File Watcher não está rodando
- Pasta não está sendo monitorada

**Solução**:

1. Verifique logs do servidor
2. Confirme que `tokens.json` existe
3. Reinicie o servidor

### Problema: Conflitos não são detectados

**Possíveis Causas**:

- Diferença de timestamp < 60s
- Arquivos são idênticos (mesmo hash)

**Solução**:

- Aguarde mais tempo entre modificações
- Modifique conteúdo de forma significativa

### Problema: Modal de conflito não aparece

**Possíveis Causas**:

- Frontend não está conectado ao backend
- Estado do React não atualizou

**Solução**:

1. Verifique console do navegador (F12)
2. Confirme que requisição retorna `needsConflictResolution: true`
3. Recarregue a página

---

## ✅ Checklist Final

Antes de considerar o sistema pronto:

- [ ] Todos os 10 testes básicos passam
- [ ] Logs são claros e informativos
- [ ] Sem erros no console do navegador
- [ ] Sem erros no console do servidor
- [ ] Badge de status funciona corretamente
- [ ] Modal de conflitos é exibido corretamente
- [ ] Arquivos são sincronizados em ambas direções
- [ ] File Watcher detecta mudanças locais
- [ ] Sistema funciona offline (modo degradado)
- [ ] Performance é aceitável (< 5s para sincronizar pasta média)

---

## 📞 Próximos Passos

Após os testes:

1. Documente quaisquer bugs encontrados
2. Ajuste configurações em `config.json` se necessário
3. Prepare para integração QNAP quando estiver pronto
4. Considere adicionar testes automatizados

**Pronto para integrar QNAP?** Veja `CONFIGURACAO_SYNC.md` seção "Integração com QNAP"
