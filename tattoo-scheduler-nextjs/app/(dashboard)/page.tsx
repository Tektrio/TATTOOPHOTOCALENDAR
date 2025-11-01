'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  FileImage, 
  HardDrive,
  Server,
  Cloud,
  Plus,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Wifi
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingAppointments: 0,
    totalFiles: 0,
    totalStorage: 0
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    client_id: '',
    estimated_price: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar estatísticas
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Carregar clientes
      const clientsRes = await fetch('/api/clients');
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }

      // Carregar agendamentos
      const appointmentsRes = await fetch('/api/appointments');
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.slice(0, 5)); // Apenas 5 próximos
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const createAppointment = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });

      if (response.ok) {
        toast.success('✅ Agendamento criado com sucesso!');
        setShowNewAppointment(false);
        setNewAppointment({
          title: '',
          description: '',
          start_datetime: '',
          end_datetime: '',
          client_id: '',
          estimated_price: 0
        });
        loadData();
      } else {
        toast.error('❌ Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className={`backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
            isDark 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-white">Total de Clientes</CardTitle>
            <Users className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-white mb-2">{stats.totalClients}</div>
            <p className="text-sm text-purple-200 font-medium">Clientes cadastrados</p>
            <p className="text-xs text-purple-300 mt-2 flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              Clique para ver detalhes
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
            isDark 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-white">Próximos Agendamentos</CardTitle>
            <Calendar className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-white mb-2">{stats.upcomingAppointments}</div>
            <p className="text-sm text-blue-200 font-medium">Nas próximas semanas</p>
            <p className="text-xs text-blue-300 mt-2 flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              Clique para ver agenda
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
            isDark 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-white">Arquivos Totais</CardTitle>
            <FileImage className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-white mb-2">{stats.totalFiles}</div>
            <p className="text-sm text-green-200 font-medium">Imagens e documentos</p>
            <p className="text-xs text-green-300 mt-2 flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              Clique para ver galeria
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
            isDark 
              ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
              : 'bg-white/10 border-white/20 hover:bg-white/15'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-white">Armazenamento</CardTitle>
            <HardDrive className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.totalStorage ? `${(stats.totalStorage / 1024 / 1024).toFixed(1)}` : '0'}
            </div>
            <p className="text-sm text-yellow-200 font-medium">MB utilizados</p>
            <p className="text-xs text-yellow-300 mt-2 flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              Clique para ver drive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema Híbrido */}
      <Card className={`backdrop-blur-md ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/10 border-white/20'
      }`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center text-xl">
            <Server className="w-6 h-6 mr-3" />
            Status do Sistema Híbrido
          </CardTitle>
          <CardDescription className={isDark ? 'text-gray-400 mt-2' : 'text-purple-200 mt-2'}>
            Monitore as integrações de armazenamento em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
              isDark 
                ? 'bg-gray-900/50 hover:bg-gray-900/70 border-gray-700/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-white font-medium">Armazenamento Local</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 font-semibold">✓ Ativo</Badge>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
              isDark 
                ? 'bg-gray-900/50 hover:bg-gray-900/70 border-gray-700/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Cloud className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-white font-medium">Google Drive</span>
              </div>
              <Badge className="bg-red-500/20 text-red-400 font-semibold">✗ Desconectado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Agendamentos */}
      <Card className={`backdrop-blur-md ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/10 border-white/20'
      }`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between text-xl">
            <span className="flex items-center">
              <Calendar className="w-6 h-6 mr-3" />
              Próximos Agendamentos
            </span>
            <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl">Novo Agendamento</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Preencha os dados abaixo para criar um novo agendamento
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Título *</Label>
                    <Input
                      id="title"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                      className="bg-gray-800 text-white"
                      placeholder="Ex: Sessão de tatuagem"
                    />
                  </div>

                  <div>
                    <Label htmlFor="client" className="text-white">Cliente *</Label>
                    <Select value={newAppointment.client_id} onValueChange={(value) => setNewAppointment({...newAppointment, client_id: value})}>
                      <SelectTrigger className="bg-gray-800 text-white">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start" className="text-white">Data Início *</Label>
                      <Input
                        id="start"
                        type="datetime-local"
                        value={newAppointment.start_datetime}
                        onChange={(e) => setNewAppointment({...newAppointment, start_datetime: e.target.value})}
                        className="bg-gray-800 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end" className="text-white">Data Fim *</Label>
                      <Input
                        id="end"
                        type="datetime-local"
                        value={newAppointment.end_datetime}
                        onChange={(e) => setNewAppointment({...newAppointment, end_datetime: e.target.value})}
                        className="bg-gray-800 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newAppointment.description}
                      onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                      className="bg-gray-800 text-white"
                      rows={3}
                    />
                  </div>

                  <Button onClick={createAppointment} className="w-full bg-purple-500 hover:bg-purple-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Criar Agendamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription className={`mt-2 ${isDark ? 'text-gray-400' : 'text-purple-200'}`}>
            {appointments.length > 0 
              ? `${appointments.length} agendamento(s) próximos` 
              : 'Nenhum agendamento cadastrado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Nenhum agendamento</h3>
                <p className="text-purple-200">Crie seu primeiro agendamento</p>
              </div>
            ) : (
              appointments.map((appointment: any) => (
                <div key={appointment.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-900/50 hover:bg-gray-900/70 border-gray-700/50' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}>
                  <div>
                    <p className="text-white font-semibold">{appointment.title}</p>
                    <p className="text-purple-200 text-sm">
                      {appointment.client_name} • {new Date(appointment.start_datetime).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(appointment.status || 'pendente')}>
                    {appointment.status || 'Pendente'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
