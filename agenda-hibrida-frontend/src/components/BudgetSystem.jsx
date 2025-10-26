import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  Send, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Clock,
  Palette,
  Ruler,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  PieChart
} from 'lucide-react'

const API_URL = 'http://localhost:5000'

export default function BudgetSystem({ clientId = null, appointmentId = null }) {
  const [budgets, setBudgets] = useState([])
  const [clients, setClients] = useState([])
  const [tattooTypes, setTattooTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewBudget, setShowNewBudget] = useState(false)
  
  const [newBudget, setNewBudget] = useState({
    client_id: clientId || '',
    appointment_id: appointmentId || '',
    title: '',
    description: '',
    tattoo_type_id: '',
    size_cm: '',
    complexity: 'medium',
    body_location: '',
    colors_count: 1,
    sessions_count: 1,
    base_price: 0,
    complexity_multiplier: 1,
    size_multiplier: 1,
    location_multiplier: 1,
    color_multiplier: 1,
    session_multiplier: 1,
    materials_cost: 0,
    additional_costs: 0,
    discount: 0,
    final_price: 0,
    notes: '',
    valid_until: ''
  })

  const complexityOptions = {
    simple: { label: 'Simples', multiplier: 0.8, color: '#10B981' },
    medium: { label: 'Médio', multiplier: 1.0, color: '#F59E0B' },
    complex: { label: 'Complexo', multiplier: 1.5, color: '#EF4444' },
    masterpiece: { label: 'Obra de Arte', multiplier: 2.0, color: '#8B5CF6' }
  }

  const bodyLocationMultipliers = {
    'braço': 1.0,
    'perna': 1.0,
    'costas': 1.2,
    'peito': 1.2,
    'barriga': 1.1,
    'pescoço': 1.5,
    'mão': 1.8,
    'pé': 1.6,
    'rosto': 2.0,
    'costela': 1.4,
    'coluna': 1.3
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculatePrice()
  }, [
    newBudget.tattoo_type_id,
    newBudget.size_cm,
    newBudget.complexity,
    newBudget.body_location,
    newBudget.colors_count,
    newBudget.sessions_count,
    newBudget.materials_cost,
    newBudget.additional_costs,
    newBudget.discount
  ])

  const loadData = async () => {
    try {
      setLoading(true)
      const [budgetsRes, clientsRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/api/budgets`),
        fetch(`${API_URL}/api/clients`),
        fetch(`${API_URL}/api/tattoo-types`)
      ])
      
      setBudgets(await budgetsRes.json())
      setClients(await clientsRes.json())
      setTattooTypes(await typesRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!newBudget.tattoo_type_id) return

    const selectedType = tattooTypes.find(t => t.id.toString() === newBudget.tattoo_type_id)
    if (!selectedType) return

    // Preço base do tipo de tatuagem
    let basePrice = selectedType.base_price

    // Multiplicador de complexidade
    const complexityMult = complexityOptions[newBudget.complexity]?.multiplier || 1

    // Multiplicador de tamanho (baseado em cm²)
    const size = parseFloat(newBudget.size_cm) || 0
    const sizeMult = size <= 5 ? 1 : size <= 10 ? 1.2 : size <= 20 ? 1.5 : size <= 50 ? 2 : 3

    // Multiplicador de localização
    const locationMult = bodyLocationMultipliers[newBudget.body_location] || 1

    // Multiplicador de cores (cada cor adicional +10%)
    const colorMult = 1 + ((parseInt(newBudget.colors_count) - 1) * 0.1)

    // Multiplicador de sessões (desconto para múltiplas sessões)
    const sessionMult = parseInt(newBudget.sessions_count) > 1 ? 0.9 : 1

    // Cálculo do preço
    const calculatedPrice = basePrice * complexityMult * sizeMult * locationMult * colorMult * sessionMult
    const materialsAndAdditional = parseFloat(newBudget.materials_cost) + parseFloat(newBudget.additional_costs)
    const discount = parseFloat(newBudget.discount) || 0
    const finalPrice = Math.max(0, calculatedPrice + materialsAndAdditional - discount)

    setNewBudget(prev => ({
      ...prev,
      base_price: basePrice,
      complexity_multiplier: complexityMult,
      size_multiplier: sizeMult,
      location_multiplier: locationMult,
      color_multiplier: colorMult,
      session_multiplier: sessionMult,
      final_price: Math.round(finalPrice)
    }))
  }

  const createBudget = async () => {
    try {
      const response = await fetch(`${API_URL}/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget)
      })
      
      if (response.ok) {
        setShowNewBudget(false)
        resetNewBudget()
        loadData()
      }
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
    }
  }

  const resetNewBudget = () => {
    setNewBudget({
      client_id: clientId || '',
      appointment_id: appointmentId || '',
      title: '',
      description: '',
      tattoo_type_id: '',
      size_cm: '',
      complexity: 'medium',
      body_location: '',
      colors_count: 1,
      sessions_count: 1,
      base_price: 0,
      complexity_multiplier: 1,
      size_multiplier: 1,
      location_multiplier: 1,
      color_multiplier: 1,
      session_multiplier: 1,
      materials_cost: 0,
      additional_costs: 0,
      discount: 0,
      final_price: 0,
      notes: '',
      valid_until: ''
    })
  }

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getBudgetStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sistema de Orçamentos</h2>
          <p className="text-purple-200">Calcule preços precisos para seus trabalhos</p>
        </div>
        <Button onClick={() => setShowNewBudget(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        {/* Lista de Orçamentos */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Card key={budget.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{budget.title}</h3>
                      <p className="text-purple-200">{budget.client_name}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          R$ {budget.final_price?.toFixed(2)}
                        </p>
                        <Badge className={getBudgetStatusColor(budget.status)}>
                          {getBudgetStatusIcon(budget.status)}
                          <span className="ml-1">{budget.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Ruler className="w-4 h-4 text-blue-400" />
                        <span className="text-purple-200 text-sm">Tamanho</span>
                      </div>
                      <p className="text-white font-medium">{budget.size_cm} cm</p>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Palette className="w-4 h-4 text-green-400" />
                        <span className="text-purple-200 text-sm">Complexidade</span>
                      </div>
                      <p className="text-white font-medium">
                        {complexityOptions[budget.complexity]?.label}
                      </p>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="text-purple-200 text-sm">Local</span>
                      </div>
                      <p className="text-white font-medium capitalize">{budget.body_location}</p>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200 text-sm">Sessões</span>
                      </div>
                      <p className="text-white font-medium">{budget.sessions_count}x</p>
                    </div>
                  </div>

                  {budget.description && (
                    <p className="text-purple-200 mb-4">{budget.description}</p>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {budgets.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum orçamento encontrado</h3>
                  <p className="text-purple-200 mb-6">Crie seu primeiro orçamento para começar</p>
                  <Button onClick={() => setShowNewBudget(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Orçamento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Calculadora Rápida */}
        <TabsContent value="calculator" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calculadora Rápida de Preços
              </CardTitle>
              <CardDescription className="text-purple-200">
                Calcule rapidamente o preço de uma tatuagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Tipo de Tatuagem</Label>
                    <Select onValueChange={(value) => setNewBudget({...newBudget, tattoo_type_id: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tattooTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} - R$ {type.base_price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Tamanho (cm)</Label>
                    <Input
                      type="number"
                      value={newBudget.size_cm}
                      onChange={(e) => setNewBudget({...newBudget, size_cm: e.target.value})}
                      placeholder="Ex: 10"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Complexidade</Label>
                    <Select 
                      value={newBudget.complexity}
                      onValueChange={(value) => setNewBudget({...newBudget, complexity: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(complexityOptions).map(([key, option]) => (
                          <SelectItem key={key} value={key}>
                            {option.label} ({(option.multiplier * 100)}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Local do Corpo</Label>
                    <Select onValueChange={(value) => setNewBudget({...newBudget, body_location: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione o local" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(bodyLocationMultipliers).map(([location, multiplier]) => (
                          <SelectItem key={location} value={location}>
                            {location.charAt(0).toUpperCase() + location.slice(1)} ({(multiplier * 100)}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Número de Cores</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newBudget.colors_count}
                      onChange={(e) => setNewBudget({...newBudget, colors_count: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Número de Sessões</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newBudget.sessions_count}
                      onChange={(e) => setNewBudget({...newBudget, sessions_count: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Custo de Materiais (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBudget.materials_cost}
                      onChange={(e) => setNewBudget({...newBudget, materials_cost: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Desconto (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newBudget.discount}
                      onChange={(e) => setNewBudget({...newBudget, discount: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Breakdown do Cálculo */}
              {newBudget.final_price > 0 && (
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-lg border border-purple-500/20">
                  <h4 className="text-white font-semibold mb-4">Breakdown do Cálculo</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Preço Base</p>
                      <p className="text-white font-bold">R$ {newBudget.base_price}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Complexidade</p>
                      <p className="text-white font-bold">{(newBudget.complexity_multiplier * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Tamanho</p>
                      <p className="text-white font-bold">{(newBudget.size_multiplier * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Localização</p>
                      <p className="text-white font-bold">{(newBudget.location_multiplier * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Cores</p>
                      <p className="text-white font-bold">{(newBudget.color_multiplier * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-sm">Sessões</p>
                      <p className="text-white font-bold">{(newBudget.session_multiplier * 100)}%</p>
                    </div>
                  </div>

                  <Separator className="my-4 bg-white/20" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-white">Preço Final:</span>
                    <span className="text-3xl font-bold text-green-400">
                      R$ {newBudget.final_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios e Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Orçamentos Este Mês</CardTitle>
                <FileText className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">12</div>
                <p className="text-xs text-purple-200">+20% em relação ao mês anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Taxa de Aprovação</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">85%</div>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Valor Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ 650</div>
                <p className="text-xs text-purple-200">Baseado nos últimos 30 dias</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Distribuição por Tipo de Tatuagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tattooTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-white">{type.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">35%</p>
                      <p className="text-purple-200 text-sm">R$ {type.base_price} médio</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para Novo Orçamento */}
      <Dialog open={showNewBudget} onOpenChange={setShowNewBudget}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Orçamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crie um orçamento detalhado para seu cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Cliente</Label>
                <Select 
                  value={newBudget.client_id}
                  onValueChange={(value) => setNewBudget({...newBudget, client_id: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Título do Orçamento</Label>
                <Input
                  value={newBudget.title}
                  onChange={(e) => setNewBudget({...newBudget, title: e.target.value})}
                  placeholder="Ex: Tatuagem de Dragão no Braço"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Descrição</Label>
              <Textarea
                value={newBudget.description}
                onChange={(e) => setNewBudget({...newBudget, description: e.target.value})}
                placeholder="Descreva detalhes da tatuagem..."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Campos da calculadora já implementados acima */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Custos Adicionais (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newBudget.additional_costs}
                  onChange={(e) => setNewBudget({...newBudget, additional_costs: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Válido Até</Label>
                <Input
                  type="date"
                  value={newBudget.valid_until}
                  onChange={(e) => setNewBudget({...newBudget, valid_until: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Observações</Label>
              <Textarea
                value={newBudget.notes}
                onChange={(e) => setNewBudget({...newBudget, notes: e.target.value})}
                placeholder="Observações adicionais..."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {newBudget.final_price > 0 && (
              <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-semibold">Valor Total do Orçamento:</span>
                  <span className="text-2xl font-bold text-green-400">
                    R$ {newBudget.final_price.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={createBudget} className="flex-1" disabled={!newBudget.client_id || !newBudget.title}>
                <Calculator className="w-4 h-4 mr-2" />
                Criar Orçamento
              </Button>
              <Button variant="outline" onClick={() => setShowNewBudget(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
