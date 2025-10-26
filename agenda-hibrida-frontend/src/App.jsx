import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { toast } from 'sonner'
import InputMask from 'react-input-mask'
import GaleriaCorrigida from './components/GaleriaCorrigida.jsx'
import CalendarioVisual from './components/CalendarioVisual.jsx'
import SeletorHorarioMelhorado from './components/SeletorHorarioMelhorado.jsx'
import GoogleDriveExplorer from './components/GoogleDriveExplorer.jsx'
import CustomerManagement from './components/CustomerManagement.jsx'
import { 
  Calendar, 
  Users, 
  User,
  Mail,
  Phone,
  Image, 
  Settings, 
  Upload, 
  Download, 
  Cloud, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Clock,
  DollarSign,
  FileImage,
  FileText,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Palette,
  Camera,
  Smartphone,
  Monitor,
  Server
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function App() {
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [systemConfig, setSystemConfig] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [tattooTypes, setTattooTypes] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  
  // Estados para modais e formulários
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [showNewTattooType, setShowNewTattooType] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewingCustomerId, setViewingCustomerId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Estados para loading e feedback
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  
  // Estados para validação
  const [errors, setErrors] = useState({})
  
  // Estados para confirmação de exclusão
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [tattooTypeToDelete, setTattooTypeToDelete] = useState(null)
  
  // Estados para formulários
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    client_id: '',
    tattoo_type_id: '',
    estimated_price: 0
  })
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  // Debug useEffect para modais
  useEffect(() => {
    console.log('showNewAppointment changed:', showNewAppointment);
    console.log('showNewClient changed:', showNewClient);
  }, [showNewAppointment, showNewClient]);

  // Função para agendar a partir de um cliente
  const handleScheduleFromClient = (clientId) => {
    setNewAppointment({...newAppointment, client_id: clientId});
    setActiveTab('appointments');
    setShowNewAppointment(true);
  };
  
  const [newTattooType, setNewTattooType] = useState({
    name: '',
    duration_hours: 2,
    base_price: 200,
    color: '#10B981',
    description: ''
  })

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Verificar autenticação
      const authResponse = await fetch(`${API_URL}/auth/status`)
      const authData = await authResponse.json()
      setIsAuthenticated(authData.authenticated)
      
      // Carregar configuração do sistema
      const configResponse = await fetch(`${API_URL}/api/config`)
      const configData = await configResponse.json()
      setSystemConfig(configData)
      
      // Carregar dados paralelos
      const [appointmentsRes, clientsRes, typesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments`),
        fetch(`${API_URL}/api/clients`),
        fetch(`${API_URL}/api/tattoo-types`),
        fetch(`${API_URL}/api/stats`)
      ])
      
      setAppointments(await appointmentsRes.json())
      setClients(await clientsRes.json())
      setTattooTypes(await typesRes.json())
      setStats(await statsRes.json())
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/auth/google`)
      const data = await response.json()
      
      // Abrir popup OAuth
      const authWindow = window.open(data.authUrl, 'GoogleAuth', 'width=600,height=700,left=200,top=100')
      
      if (!authWindow) {
        alert('⚠️ Popup bloqueado! Por favor, permita popups para este site e tente novamente.')
        setLoading(false)
        return
      }
      
      // Polling para verificar autenticação com timeout
      let attempts = 0
      const maxAttempts = 60 // 2 minutos (60 * 2 segundos)
      
      const checkAuth = setInterval(async () => {
        attempts++
        
        // Verificar se popup foi fechado
        if (authWindow.closed) {
          clearInterval(checkAuth)
          setLoading(false)
          
          // Verificar uma última vez se autenticou
          try {
            const authResponse = await fetch(`${API_URL}/auth/status`)
            const authData = await authResponse.json()
            if (!authData.authenticated) {
              alert('❌ Autenticação cancelada ou falhou.\n\nSe você viu erro "403: access_denied", significa que:\n\n• O app está em modo de TESTE no Google Cloud\n• Você precisa ser adicionado como testador autorizado\n• OU o app precisa ser publicado em PRODUÇÃO\n\nConsulte o guia "GOOGLE_OAUTH_SOLUCAO_COMPLETA.md" para resolver.')
            }
          } catch (e) {
            console.error('Erro ao verificar status:', e)
          }
          return
        }
        
        // Timeout
        if (attempts >= maxAttempts) {
          clearInterval(checkAuth)
          setLoading(false)
          if (!authWindow.closed) {
            authWindow.close()
          }
          alert('⏱️ Tempo esgotado! A autenticação demorou muito. Por favor, tente novamente.')
          return
        }
        
        // Verificar autenticação
        try {
          const authResponse = await fetch(`${API_URL}/auth/status`)
          const authData = await authResponse.json()
          
          if (authData.authenticated) {
            setIsAuthenticated(true)
            clearInterval(checkAuth)
            setLoading(false)
            if (!authWindow.closed) {
              authWindow.close()
            }
            
            // Mostrar mensagem de sucesso
            alert('✅ Conectado ao Google com sucesso!\n\n• Google Calendar sincronizado\n• Google Drive conectado\n• Pronto para usar!')
            
            loadInitialData()
          } else if (authData.error) {
            // Erro retornado pelo backend
            clearInterval(checkAuth)
            setLoading(false)
            if (!authWindow.closed) {
              authWindow.close()
            }
            
            if (authData.error.includes('403') || authData.error.includes('access_denied')) {
              alert(`❌ ERRO: Acesso Negado (403)\n\nO Google bloqueou o acesso porque:\n\n• O app está em modo de TESTE\n• Você não está na lista de testadores autorizados\n• O app precisa completar a verificação do Google\n\nSOLUÇÃO:\n1. Acesse: console.cloud.google.com\n2. Vá em "OAuth consent screen"\n3. Adicione seu email em "Test users"\n4. OU publique o app em produção\n\nConsulte: GOOGLE_OAUTH_SOLUCAO_COMPLETA.md`)
            } else {
              alert(`❌ Erro na autenticação:\n\n${authData.error}\n\nTente novamente ou consulte os logs.`)
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error)
        }
      }, 2000)
      
    } catch (error) {
      console.error('Erro na autenticação:', error)
      setLoading(false)
      alert(`❌ Erro ao iniciar autenticação:\n\n${error.message}\n\nVerifique se o backend está rodando em ${API_URL}`)
    }
  }

  const handleGoogleDisconnect = async () => {
    try {
      setLoading(true)
      await fetch(`${API_URL}/auth/disconnect`, { method: 'POST' })
      setIsAuthenticated(false)
      toast.success('Desconectado do Google')
      await loadInitialData()
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      toast.error('Falha ao desconectar do Google')
    } finally {
      setLoading(false)
    }
  }

  // Funções de validação
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 10 || cleanPhone.length === 11
  }

  const validateAppointmentForm = () => {
    const newErrors = {}
    
    if (!newAppointment.title || newAppointment.title.trim() === '') {
      newErrors.title = 'O título do agendamento é obrigatório'
    }
    
    if (!newAppointment.client_id) {
      newErrors.client = 'Você precisa selecionar um cliente para este agendamento'
    }
    
    if (!newAppointment.start_datetime) {
      newErrors.start = 'A data e hora de início são obrigatórias'
    } else {
      // Validar se a data não é no passado
      const startDate = new Date(newAppointment.start_datetime)
      const now = new Date()
      if (startDate < now) {
        newErrors.start = 'A data de início não pode ser no passado'
      }
    }
    
    if (!newAppointment.end_datetime) {
      newErrors.end = 'A data e hora de término são obrigatórias'
    }
    
    if (newAppointment.start_datetime && newAppointment.end_datetime) {
      if (new Date(newAppointment.end_datetime) <= new Date(newAppointment.start_datetime)) {
        newErrors.end = 'O horário de término deve ser posterior ao horário de início'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateClientForm = () => {
    const newErrors = {}
    
    if (!newClient.name || newClient.name.trim() === '') {
      newErrors.name = 'O nome do cliente é obrigatório'
    } else if (newClient.name.trim().length < 2) {
      newErrors.name = 'O nome deve ter pelo menos 2 caracteres'
    }
    
    if (newClient.email && !validateEmail(newClient.email)) {
      newErrors.email = 'Por favor, insira um email válido (ex: nome@email.com)'
    }
    
    if (newClient.phone && !validatePhone(newClient.phone)) {
      newErrors.phone = 'Telefone inválido. Use o formato: (11) 98765-4321'
    }
    
    // Verificar se já existe cliente com mesmo telefone
    if (newClient.phone && clients.some(c => c.phone === newClient.phone && c.id !== newClient.id)) {
      newErrors.phone = 'Já existe um cliente cadastrado com este telefone'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createAppointment = async () => {
    if (!validateAppointmentForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios corretamente')
      return
    }

    setIsLoading(true)
    setLoadingMessage('Criando agendamento...')

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      })
      
      if (response.ok) {
        toast.success('✅ Agendamento criado com sucesso!')
        setShowNewAppointment(false)
        setNewAppointment({
          title: '',
          description: '',
          start_datetime: '',
          end_datetime: '',
          client_id: '',
          tattoo_type_id: '',
          estimated_price: 0
        })
        setErrors({})
        loadInitialData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`❌ Erro ao criar agendamento: ${errorData.message || 'Tente novamente'}`)
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('❌ Erro de conexão. Verifique se o servidor está rodando')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const createClient = async () => {
    if (!validateClientForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios corretamente')
      return
    }

    setIsLoading(true)
    setLoadingMessage('Criando cliente...')

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`✅ Cliente "${newClient.name}" cadastrado com sucesso!`)
        setShowNewClient(false)
        setNewClient({ name: '', email: '', phone: '', notes: '' })
        setErrors({})
        loadInitialData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`❌ Erro ao cadastrar cliente: ${errorData.message || 'Tente novamente'}`)
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast.error('❌ Erro de conexão. Verifique se o servidor está rodando')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const createTattooType = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tattoo-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTattooType)
      })
      
      if (response.ok) {
        toast.success(`✅ Tipo de tatuagem "${newTattooType.name}" criado com sucesso!`)
        setShowNewTattooType(false)
        setNewTattooType({
          name: '',
          duration_hours: 2,
          base_price: 200,
          color: '#10B981',
          description: ''
        })
        loadInitialData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`❌ Erro ao criar tipo: ${errorData.message || 'Tente novamente'}`)
      }
    } catch (error) {
      console.error('Erro ao criar tipo de tatuagem:', error)
      toast.error('❌ Erro de conexão ao criar tipo de tatuagem')
    }
  }

  // Funções de exclusão
  const deleteAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('✅ Agendamento deletado com sucesso!')
        loadInitialData()
      } else {
        toast.error('❌ Erro ao deletar agendamento. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      toast.error('❌ Erro de conexão ao deletar agendamento')
    }
  }

  const deleteClient = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('✅ Cliente deletado com sucesso!')
        loadInitialData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`❌ Erro ao deletar cliente: ${errorData.message || 'Pode haver agendamentos vinculados'}`)
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      toast.error('❌ Erro de conexão ao deletar cliente')
    }
  }

  const deleteTattooType = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/tattoo-types/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('✅ Tipo de tatuagem deletado com sucesso!')
        loadInitialData()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(`❌ Erro ao deletar tipo: ${errorData.message || 'Pode haver agendamentos vinculados'}`)
      }
    } catch (error) {
      console.error('Erro ao deletar tipo:', error)
      toast.error('❌ Erro de conexão ao deletar tipo de tatuagem')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pendente': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'concluido': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'concluido': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStorageIcon = (mode) => {
    switch (mode) {
      case 'local': return <HardDrive className="w-4 h-4" />
      case 'qnap': return <Server className="w-4 h-4" />
      case 'gdrive': return <Cloud className="w-4 h-4" />
      case 'hybrid': return <Wifi className="w-4 h-4" />
      default: return <HardDrive className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Carregando Sistema Híbrido</h2>
          <p className="text-purple-200">Inicializando armazenamento e sincronização...</p>
        </div>
      </div>
    )
  }

  // Se estiver visualizando um cliente, mostrar o CustomerManagement
  if (viewingCustomerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <CustomerManagement 
          customerId={viewingCustomerId} 
          onClose={() => setViewingCustomerId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Agenda Híbrida</h1>
                <p className="text-purple-200 text-sm">Sistema Visual para Tatuadores</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status do armazenamento */}
              {systemConfig && (
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                  {getStorageIcon(systemConfig.storageMode)}
                  <span className="text-white text-sm capitalize">{systemConfig.storageMode}</span>
                </div>
              )}
              
              {/* Status da autenticação */}
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg">
                        <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
                        <span className="text-green-400 text-sm font-medium">Google Conectado</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-green-400" />
                          <span className="text-green-300 text-xs">Calendar</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Cloud className="w-3 h-3 text-green-400" />
                          <span className="text-green-300 text-xs">Drive</span>
                        </div>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="flex items-center space-x-2 text-purple-300 bg-purple-500/20 px-3 py-2 rounded-lg">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">{loadingMessage}</span>
                      </div>
                    )}
                    <Button onClick={handleGoogleDisconnect} variant="destructive" size="sm" disabled={loading}>
                      {loading ? '...' : 'Desconectar Google'}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleGoogleAuth} variant="outline" size="sm" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Conectar Google
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
              <Monitor className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-white/20">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário Visual
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-white/20">
              <Clock className="w-4 h-4 mr-2" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-white/20">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-white/20">
              <Image className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="drive" className="data-[state=active]:bg-white/20">
              <Cloud className="w-4 h-4 mr-2" />
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cards de estatísticas - Melhorados com mais destaque */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white">Total de Clientes</CardTitle>
                  <Users className="h-5 w-5 text-purple-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-4xl font-bold text-white mb-2">{stats.totalClients || 0}</div>
                  <p className="text-sm text-purple-200 font-medium">Clientes cadastrados</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white">Próximos Agendamentos</CardTitle>
                  <Calendar className="h-5 w-5 text-blue-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-4xl font-bold text-white mb-2">{stats.upcomingAppointments || 0}</div>
                  <p className="text-sm text-blue-200 font-medium">Nas próximas semanas</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white">Arquivos Totais</CardTitle>
                  <FileImage className="h-5 w-5 text-green-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-4xl font-bold text-white mb-2">{stats.totalFiles || 0}</div>
                  <p className="text-sm text-green-200 font-medium">Imagens e documentos</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-white">Armazenamento</CardTitle>
                  <HardDrive className="h-5 w-5 text-yellow-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-4xl font-bold text-white mb-2">
                    {stats.totalStorage ? `${(stats.totalStorage / 1024 / 1024).toFixed(1)}` : '0'}
                  </div>
                  <p className="text-sm text-yellow-200 font-medium">MB utilizados</p>
                </CardContent>
              </Card>
            </div>

            {/* Status do sistema híbrido */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Server className="w-6 h-6 mr-3" />
                  Status do Sistema Híbrido
                </CardTitle>
                <CardDescription className="text-purple-200 mt-2">
                  Monitore as integrações de armazenamento em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">Armazenamento Local</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 font-semibold">✓ Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Cloud className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-white font-medium">Google Drive</span>
                    </div>
                    <Badge className={isAuthenticated ? "bg-green-500/20 text-green-400 font-semibold" : "bg-red-500/20 text-red-400 font-semibold"}>
                      {isAuthenticated ? '✓ Conectado' : '✗ Desconectado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Server className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-white font-medium">QNAP NAS</span>
                    </div>
                    <Badge className={systemConfig?.qnapEnabled ? "bg-green-500/20 text-green-400 font-semibold" : "bg-yellow-500/20 text-yellow-400 font-semibold"}>
                      {systemConfig?.qnapEnabled ? '✓ Configurado' : '⚠ Pendente'}
                    </Badge>
                  </div>
                </div>
                
                {/* Botão de ajuda para QNAP */}
                {!systemConfig?.qnapEnabled && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">QNAP NAS não configurado</p>
                        <p className="text-yellow-200 text-sm mb-3">
                          Configure o QNAP NAS para sincronização automática de arquivos e backup em tempo real.
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                          onClick={() => setActiveTab('settings')}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar agora
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximos agendamentos */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between text-xl">
                  <span className="flex items-center">
                    <Calendar className="w-6 h-6 mr-3" />
                    Próximos Agendamentos
                  </span>
                  <Button onClick={() => setShowNewAppointment(true)} size="sm" className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </CardTitle>
                <CardDescription className="text-purple-200 mt-2">
                  {appointments.length > 0 
                    ? `${appointments.length} agendamento(s) no total` 
                    : 'Adicione seu primeiro agendamento'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-base">{appointment.title}</p>
                          <p className="text-purple-200 text-sm mt-1">
                            👤 {appointment.client_name} • 📅 {new Date(appointment.start_datetime).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} font-semibold px-3 py-1`}>
                        {appointment.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                  
                  {appointments.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-purple-400" />
                      </div>
                      <h3 className="text-white text-lg font-semibold mb-2">Nenhum agendamento cadastrado</h3>
                      <p className="text-purple-200 mb-4">Comece criando seu primeiro agendamento para organizar sua agenda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Visual Tab */}
          <TabsContent value="calendar" className="space-y-6 mt-6">
            <CalendarioVisual />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gerenciar Agenda</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-purple-400" />
                      Novo Agendamento
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-base">
                      Preencha os dados abaixo para criar um novo agendamento
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="title" className="text-white font-medium flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        Título do Agendamento *
                      </Label>
                      <Input
                        id="title"
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                        placeholder="Ex: Sessão de tatuagem - Braço direito"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                      {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="client" className="text-white font-medium flex items-center mb-2">
                        <Users className="w-4 h-4 mr-2" />
                        Cliente *
                      </Label>
                      <Select value={newAppointment.client_id} onValueChange={(value) => setNewAppointment({...newAppointment, client_id: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} - {client.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client && <p className="text-red-400 text-sm mt-1">{errors.client}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_datetime" className="text-white font-medium flex items-center mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          Data e Hora de Início *
                        </Label>
                        <Input
                          id="start_datetime"
                          type="datetime-local"
                          value={newAppointment.start_datetime}
                          onChange={(e) => setNewAppointment({...newAppointment, start_datetime: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                        {errors.start && <p className="text-red-400 text-sm mt-1">{errors.start}</p>}
                      </div>

                      <div>
                        <Label htmlFor="end_datetime" className="text-white font-medium flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Data e Hora de Término *
                        </Label>
                        <Input
                          id="end_datetime"
                          type="datetime-local"
                          value={newAppointment.end_datetime}
                          onChange={(e) => setNewAppointment({...newAppointment, end_datetime: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                        {errors.end && <p className="text-red-400 text-sm mt-1">{errors.end}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white font-medium flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newAppointment.description}
                        onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                        placeholder="Detalhes sobre o agendamento, observações, etc."
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <Button onClick={createAppointment} className="flex-1 bg-purple-500 hover:bg-purple-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Criar Agendamento
                      </Button>
                      <Button variant="outline" onClick={() => setErrors({})} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                    <Calendar className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">Nenhum agendamento cadastrado</h3>
                  <p className="text-purple-200 mb-4">Comece criando seu primeiro agendamento para organizar sua agenda</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: appointment.type_color || '#8B5CF6' }}
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">{appointment.title}</h3>
                          <p className="text-purple-200">{appointment.client_name}</p>
                          <p className="text-purple-300 text-sm">
                            {new Date(appointment.start_datetime).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {appointment.estimated_price && (
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">
                              R$ {appointment.estimated_price.toFixed(2)}
                            </p>
                            <p className="text-purple-200 text-sm">Orçamento</p>
                          </div>
                        )}
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setAppointmentToDelete(appointment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {appointment.description && (
                      <p className="text-purple-200 mt-3">{appointment.description}</p>
                    )}
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gerenciar Clientes</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl flex items-center">
                      <Users className="w-6 h-6 mr-2 text-purple-400" />
                      Novo Cliente
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-base">
                      Cadastre um novo cliente no sistema
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName" className="text-white font-medium flex items-center mb-2">
                        <User className="w-4 h-4 mr-2" />
                        Nome Completo *
                      </Label>
                      <Input
                        id="clientName"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        placeholder="Nome completo do cliente"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="clientEmail" className="text-white font-medium flex items-center mb-2">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="clientPhone" className="text-white font-medium flex items-center mb-2">
                        <Phone className="w-4 h-4 mr-2" />
                        Telefone
                      </Label>
                      <Input
                        id="clientPhone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <Label htmlFor="clientNotes" className="text-white font-medium flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        Observações
                      </Label>
                      <Textarea
                        id="clientNotes"
                        value={newClient.notes}
                        onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                        placeholder="Informações adicionais sobre o cliente"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <Button onClick={createClient} className="flex-1 bg-purple-500 hover:bg-purple-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Cadastrar Cliente
                      </Button>
                      <Button variant="outline" onClick={() => setErrors({})} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white">{client.name}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {client.email || 'Email não informado'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.phone && (
                        <p className="text-purple-200 text-sm">📱 {client.phone}</p>
                      )}
                      <p className="text-purple-300 text-sm">
                        {client.appointments_count || 0} agendamento(s)
                      </p>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setViewingCustomerId(client.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleScheduleFromClient(client.id)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar
                        </Button>
                        <Button size="sm" variant="outline">
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setClientToDelete(client)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6 mt-6">
            <GaleriaCorrigida />
          </TabsContent>

          {/* Google Drive Tab */}
          <TabsContent value="drive" className="space-y-6 mt-6">
            <GoogleDriveExplorer />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Configurações do Sistema</CardTitle>
                <CardDescription className="text-purple-200">
                  Configure o armazenamento híbrido e integrações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipos de tatuagem */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Tipos de Tatuagem</h3>
                    <Button onClick={() => setShowNewTattooType(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tattooTypes.map((type) => (
                      <div key={type.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <div>
                            <p className="text-white font-medium">{type.name}</p>
                            <p className="text-purple-200 text-sm">
                              {type.duration_hours}h • R$ {type.base_price}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setTattooTypeToDelete(type)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
