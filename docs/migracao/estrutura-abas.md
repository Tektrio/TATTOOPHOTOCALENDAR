# Estrutura das 11 Abas do Sistema

## Layout Geral

```jsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="...">
    {/* 11 TabsTrigger aqui */}
  </TabsList>
  
  <TabsContent value="dashboard">...</TabsContent>
  <TabsContent value="calendar">...</TabsContent>
  {/* ... demais abas */}
</Tabs>
```

## Especificações de Cada Aba

### 1. Dashboard
- **Value:** `"dashboard"`
- **Ícone:** `<Monitor className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-purple-600`
- **Label:** "Dashboard"

### 2. Calendário
- **Value:** `"calendar"`
- **Ícone:** `<Calendar className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-blue-600`
- **Label:** "Calendário"

### 3. Agendamentos
- **Value:** `"appointments"`
- **Ícone:** `<Clock className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-green-600`
- **Label:** "Agendamentos"

### 4. Clientes
- **Value:** `"clients"`
- **Ícone:** `<Users className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-orange-600`
- **Label:** "Clientes"

### 5. Importar
- **Value:** `"import"`
- **Ícone:** `<Upload className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-indigo-600`
- **Label:** "Importar"

### 6. Galeria
- **Value:** `"gallery"`
- **Ícone:** `<Image className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-pink-600`
- **Label:** "Galeria"

### 7. Drive
- **Value:** `"drive"`
- **Ícone:** `<Cloud className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-sky-600`
- **Label:** "Drive"

### 8. Dados Local
- **Value:** `"localstorage"`
- **Ícone:** `<HardDrive className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-teal-600`
- **Label:** "Dados Local"

### 9. Financeiro
- **Value:** `"financial"`
- **Ícone:** `<DollarSign className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-emerald-600`
- **Label:** "Financeiro"

### 10. Funcionários
- **Value:** `"employees"`
- **Ícone:** `<Users className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-violet-600`
- **Label:** "Funcionários"

### 11. Configurações
- **Value:** `"settings"`
- **Ícone:** `<Settings className="w-3.5 h-3.5" />`
- **Cor Active:** `bg-slate-600`
- **Label:** "Config"

## Classes Padrão de TabsTrigger

```jsx
className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium 
  text-white/70 
  hover:text-white hover:bg-white/10 
  data-[state=active]:bg-[COR-DA-ABA] 
  data-[state=active]:text-white 
  transition-all"
```

## Container das Abas

```jsx
<div className={`backdrop-blur-md rounded-lg border overflow-x-auto ${
  isDark 
    ? 'bg-gray-800/50 border-gray-700/50' 
    : 'bg-white/5 border-white/10'
}`}>
```

## Espaçamento

- **Gap entre abas:** `gap-1`
- **Padding do TabsList:** `p-1.5`
- **Padding de cada trigger:** `px-3 py-1.5`
- **Gap entre ícone e texto:** `gap-1.5`
- **Margin top do content:** `mt-6`

