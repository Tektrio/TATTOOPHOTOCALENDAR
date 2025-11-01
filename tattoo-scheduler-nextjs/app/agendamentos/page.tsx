'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  client_id: number;
  client_name?: string;
  tattoo_type_id?: number;
  tattoo_type?: string;
  type_color?: string;
  estimated_price?: number;
  status: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
}

export default function AgendamentosPage() {
  const { isDark } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modais
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  
  // Estados para formulários
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    client_id: '',
    tattoo_type_id: '',
    estimated_price: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, clientsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/clients')
      ]);

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data);
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newAppointment.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!newAppointment.client_id) {
      newErrors.client = 'Cliente é obrigatório';
    }
    if (!newAppointment.startDatetime) {
      newErrors.start = 'Data de início é obrigatória';
    }
    if (!newAppointment.endDatetime) {
      newErrors.end = 'Data de término é obrigatória';
    }
    if (newAppointment.startDatetime && newAppointment.endDatetime) {
      if (new Date(newAppointment.endDatetime) <= new Date(newAppointment.startDatetime)) {
        newErrors.end = 'Data de término deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      newAppointment.title.trim() !== '' &&
      newAppointment.client_id !== '' &&
      newAppointment.startDatetime !== '' &&
      newAppointment.endDatetime !== ''
    );
  }, [newAppointment]);

  const createAppointment = async () => {
    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });

      if (response.ok) {
        toast.success('✅ Agendamento criado com sucesso!');
        setShowNewAppointment(false);
        resetForm();
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(`❌ Erro: ${errorData.error || 'Tente novamente'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAppointment = async () => {
    if (!validateForm() || !appointmentToEdit) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });

      if (response.ok) {
        toast.success('✅ Agendamento atualizado com sucesso!');
        setShowEditAppointment(false);
        setAppointmentToEdit(null);
        resetForm();
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(`❌ Erro: ${errorData.error || 'Tente novamente'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ Agendamento excluído com sucesso!');
        loadData();
      } else {
        toast.error('❌ Erro ao excluir agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    } finally {
      setAppointmentToDelete(null);
    }
  };

  const resetForm = () => {
    setNewAppointment({
      title: '',
      description: '',
      startDatetime: '',
      endDatetime: '',
      client_id: '',
      tattoo_type_id: '',
      estimated_price: 0
    });
    setErrors({});
  };

  const handleEditClick = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || '',
      startDatetime: appointment.startDatetime,
      endDatetime: appointment.endDatetime,
      client_id: appointment.client_id.toString(),
      tattoo_type_id: appointment.tattoo_type_id?.toString() || '',
      estimated_price: appointment.estimated_price || 0
    });
    setShowEditAppointment(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'concluido': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Agenda</h2>
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
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
                  className={`bg-gray-800 text-white placeholder-gray-400 ${
                    errors.title ? 'border-red-500' : newAppointment.title.trim() ? 'border-green-500' : ''
                  }`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1"><XCircle className="w-3 h-3 inline mr-1" />{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="client" className="text-white font-medium flex items-center mb-2">
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
                    value={newAppointment.startDatetime}
                    onChange={(e) => setNewAppointment({...newAppointment, startDatetime: e.target.value})}
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
                    value={newAppointment.endDatetime}
                    onChange={(e) => setNewAppointment({...newAppointment, endDatetime: e.target.value})}
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
                <Button
                  onClick={createAppointment}
                  disabled={!isFormValid || isSubmitting}
                  className={`flex-1 ${isFormValid ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 cursor-not-allowed'}`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
                </Button>
                <Button variant="outline" onClick={() => {setShowNewAppointment(false); resetForm();}} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Agendamentos */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center text-white py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
            <p className="mt-4">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Nenhum agendamento cadastrado</h3>
              <p className="text-purple-200">Comece criando seu primeiro agendamento</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{appointment.title}</h3>
                      <p className="text-purple-200">{appointment.client_name}</p>
                      <p className="text-purple-300 text-sm">
                        {new Date(appointment.startDatetime).toLocaleString('pt-BR')}
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
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(appointment)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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

      {/* Modal de Edição */}
      <Dialog open={showEditAppointment} onOpenChange={(open) => {
        setShowEditAppointment(open);
        if (!open) {
          setAppointmentToEdit(null);
          resetForm();
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center">
              <Edit className="w-6 h-6 mr-2 text-purple-400" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-base">
              Atualize os dados do agendamento abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label htmlFor="edit-title" className="text-white font-medium flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Título do Agendamento *
              </Label>
              <Input
                id="edit-title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                placeholder="Ex: Sessão de tatuagem - Braço direito"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="edit-client" className="text-white font-medium flex items-center mb-2">
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
                <Label htmlFor="edit-start_datetime" className="text-white font-medium flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data e Hora de Início *
                </Label>
                <Input
                  id="edit-start_datetime"
                  type="datetime-local"
                  value={newAppointment.startDatetime}
                  onChange={(e) => setNewAppointment({...newAppointment, startDatetime: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.start && <p className="text-red-400 text-sm mt-1">{errors.start}</p>}
              </div>

              <div>
                <Label htmlFor="edit-end_datetime" className="text-white font-medium flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Data e Hora de Término *
                </Label>
                <Input
                  id="edit-end_datetime"
                  type="datetime-local"
                  value={newAppointment.endDatetime}
                  onChange={(e) => setNewAppointment({...newAppointment, endDatetime: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.end && <p className="text-red-400 text-sm mt-1">{errors.end}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-white font-medium flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Descrição
              </Label>
              <Textarea
                id="edit-description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                placeholder="Detalhes sobre o agendamento, observações, etc."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <Button 
                onClick={updateAppointment} 
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 ${isFormValid ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditAppointment(false);
                  setAppointmentToEdit(null);
                  resetForm();
                }} 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={!!appointmentToDelete} onOpenChange={() => setAppointmentToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {appointmentToDelete && (
            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="text-white font-semibold">{appointmentToDelete.title}</p>
              <p className="text-gray-300">{appointmentToDelete.client_name}</p>
              <p className="text-gray-400 text-sm">
                {new Date(appointmentToDelete.startDatetime).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => appointmentToDelete && deleteAppointment(appointmentToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

