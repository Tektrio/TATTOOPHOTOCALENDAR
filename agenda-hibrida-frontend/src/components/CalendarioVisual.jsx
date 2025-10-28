import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon, Phone, User, FileText, Folder, Grid, List, Clock, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import ConflictResolver from './ConflictResolver';
import SyncStatusIndicator from './SyncStatusIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const API_URL = 'http://localhost:3001';

// Cores por tipo de agendamento
const APPOINTMENT_COLORS = {
  'Grande': 'from-purple-600 to-purple-800 border-purple-500',
  'Média': 'from-blue-600 to-blue-800 border-blue-500',
  'Pequena': 'from-green-600 to-green-800 border-green-500',
  'Retoque': 'from-yellow-600 to-yellow-800 border-yellow-500',
  'Sessão Completa': 'from-red-600 to-red-800 border-red-500',
  'default': 'from-gray-600 to-gray-800 border-gray-500'
};

const CalendarioVisual = () => {
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientImages, setClientImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null); // Estado para controlar dia expandido
  const [syncConflicts, setSyncConflicts] = useState([]); // Conflitos de sincronização
  const [showConflictModal, setShowConflictModal] = useState(false); // Modal de conflitos
  const [draggedAppointment, setDraggedAppointment] = useState(null); // Appointment sendo arrastado
  const [dropTarget, setDropTarget] = useState(null); // Alvo do drop
  
  // Novos estados para Multi-Conta Google
  const [googleAccounts, setGoogleAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState('all'); // 'all' ou ID da conta
  const [accountsLoading, setAccountsLoading] = useState(false);

  useEffect(() => {
    loadGoogleAccounts();
    loadData();
  }, [currentDate]);

  useEffect(() => {
    loadData(); // Recarregar dados quando mudar a conta ativa
  }, [activeAccount]);

  // Carregar contas Google cadastradas
  const loadGoogleAccounts = async () => {
    try {
      setAccountsLoading(true);
      const response = await fetch(`${API_URL}/api/google/accounts`);
      if (response.ok) {
        const data = await response.json();
        setGoogleAccounts(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar contas Google:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  // Extrair telefone do título se vier do Google Calendar
  const extractPhoneFromTitle = (title) => {
    if (!title) return null;
    // Procurar por números de telefone no título (formato brasileiro)
    const phoneMatch = title.match(/\d{10,11}/);
    return phoneMatch ? phoneMatch[0] : null;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const appointmentsRes = await fetch(`${API_URL}/api/appointments`);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData || []);
        
        // Carregar imagens para cada cliente com telefone
        const imagesMap = {};
        for (const apt of appointmentsData || []) {
          // Tentar pegar telefone direto ou extrair do título
          let phone = apt.client_phone;
          
          // Se não tem telefone mas vem do Google Calendar, tentar extrair do título
          if (!phone && apt.source === 'google' && apt.title) {
            phone = extractPhoneFromTitle(apt.title);
          }
          
          if (phone) {
            try {
              const filesRes = await fetch(`${API_URL}/api/files/by-phone/${encodeURIComponent(phone)}`);
              if (filesRes.ok) {
                const filesData = await filesRes.json();
                imagesMap[phone] = filesData;
                // Também mapear pelo ID do agendamento para facilitar acesso
                imagesMap[apt.id] = filesData;
              }
            } catch (error) {
              console.error(`Erro ao carregar imagens do cliente ${apt.client_name}:`, error);
            }
          }
        }
        setClientImages(imagesMap);
      } else {
        console.error('Erro ao carregar agendamentos:', appointmentsRes.status);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Funções de navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obter dias do mês
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Obter agendamentos para um dia específico
  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    
    let filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.start_datetime);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });

    // Filtrar por conta Google ativa
    if (activeAccount !== 'all') {
      filtered = filtered.filter(apt => apt.account_id === parseInt(activeAccount));
    }

    return filtered;
  };

  // Obter todos os agendamentos filtrados pela conta ativa
  const getFilteredAppointments = () => {
    if (activeAccount === 'all') {
      return appointments;
    }
    return appointments.filter(apt => apt.account_id === parseInt(activeAccount));
  };

  // Obter imagens para um agendamento pelo telefone
  const getImagesForAppointment = (appointment) => {
    // Tentar primeiro pelo client_phone
    if (appointment.client_phone && clientImages[appointment.client_phone]) {
      return clientImages[appointment.client_phone];
    }
    
    // Se não tiver, tentar extrair telefone do título (Google Calendar)
    const phone = extractPhoneFromTitle(appointment.title);
    if (phone && clientImages[phone]) {
      return clientImages[phone];
    }
    
    // Por último, tentar pelo ID do agendamento
    return clientImages[appointment.id] || [];
  };

  // Abrir pasta do cliente (com sincronização)
  const handleOpenFolder = async (appointment, imagePath) => {
    // Tentar pegar telefone direto ou extrair do título
    let phone = appointment.client_phone;
    if (!phone && appointment.title) {
      phone = extractPhoneFromTitle(appointment.title);
    }
    
    if (!phone) {
      toast.error('Cliente sem telefone cadastrado');
      return;
    }

    try {
      toast.info('🔄 Sincronizando arquivos...');

      const response = await fetch(`${API_URL}/api/clients/open-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Verificar se há conflitos para resolver
        if (data.needsConflictResolution && data.conflicts && data.conflicts.length > 0) {
          toast.warning(`⚠️ ${data.conflicts.length} conflito(s) detectado(s)!`);
          setSyncConflicts(data.conflicts);
          setShowConflictModal(true);
        } else {
          // Mostrar estatísticas de sincronização
          if (data.syncStats) {
            const { synced, downloaded, onlyLocal } = data.syncStats;
            if (downloaded > 0) {
              toast.success(`📥 ${downloaded} arquivo(s) baixado(s) do Drive`);
            } else if (synced > 0) {
              toast.success(`✅ ${synced} arquivo(s) já sincronizado(s)`);
            }
          }
          
          toast.success(`📁 Pasta do cliente ${appointment.client_name} aberta com sucesso!`);
        }
      } else {
        toast.error(data.error || 'Erro ao abrir pasta');
      }
    } catch (error) {
      console.error('Erro ao abrir pasta:', error);
      toast.error('Erro ao abrir pasta do cliente');
    }
  };

  // Callback após resolver conflitos
  const handleConflictsResolved = () => {
    toast.success('✅ Conflitos resolvidos! Atualizando...');
    loadData(); // Recarregar dados
  };

  // Verificar se é hoje
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Função para expandir/colapsar o dia
  const handleDayClick = (date) => {
    if (!date) return;
    
    // Se clicar no mesmo dia, colapsa
    if (expandedDay && 
        expandedDay.getDate() === date.getDate() &&
        expandedDay.getMonth() === date.getMonth() &&
        expandedDay.getFullYear() === date.getFullYear()) {
      setExpandedDay(null);
    } else {
      // Expande o novo dia
      setExpandedDay(date);
    }
  };

  // Formatar horário
  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor do agendamento
  const getAppointmentColor = (appointment) => {
    return APPOINTMENT_COLORS[appointment.type] || APPOINTMENT_COLORS['default'];
  };

  // ===== DRAG AND DROP HANDLERS =====
  const handleDragStart = (e, appointment) => {
    e.stopPropagation(); // Prevenir propagação para o card do dia
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    // Adicionar classe visual
    setTimeout(() => {
      e.currentTarget.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedAppointment(null);
    setDropTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, target) => {
    e.preventDefault();
    setDropTarget(target);
  };

  const handleDragLeave = (e) => {
    // Só remove o highlight se realmente saiu do elemento
    if (e.currentTarget === e.target) {
      setDropTarget(null);
    }
  };

  const handleDrop = async (e, newDate, newHour = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedAppointment) return;

    try {
      // Criar nova data/hora para o agendamento
      const originalDate = new Date(draggedAppointment.start_datetime);
      const newDateTime = new Date(newDate);
      
      // Manter o horário original se não especificou novo horário
      if (newHour !== null) {
        newDateTime.setHours(newHour);
        newDateTime.setMinutes(originalDate.getMinutes());
      } else {
        newDateTime.setHours(originalDate.getHours());
        newDateTime.setMinutes(originalDate.getMinutes());
      }
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);

      // Calcular duração
      const originalEnd = draggedAppointment.end_datetime 
        ? new Date(draggedAppointment.end_datetime)
        : null;
      const duration = originalEnd 
        ? originalEnd.getTime() - originalDate.getTime()
        : 60 * 60 * 1000; // 1 hora default

      const newEndDateTime = new Date(newDateTime.getTime() + duration);

      toast.info('🔄 Reagendando...');

      // Atualizar no backend
      const response = await fetch(`${API_URL}/api/appointments/${draggedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draggedAppointment,
          start_datetime: newDateTime.toISOString(),
          end_datetime: newEndDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('✅ Agendamento reagendado com sucesso!');
        await loadData(); // Recarregar dados
      } else {
        const error = await response.json();
        toast.error(`Erro ao reagendar: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      toast.error('Erro ao reagendar agendamento');
    } finally {
      setDraggedAppointment(null);
      setDropTarget(null);
    }
  };

  // Funções de navegação por vista
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  // Obter dias da semana atual
  const getDaysInWeek = (date) => {
    const dayOfWeek = date.getDay();
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Obter horários do dia (8h-22h)
  const getDayHours = () => {
    const hours = [];
    for (let hour = 8; hour <= 22; hour++) {
      hours.push(hour);
    }
    return hours;
  };

  // Obter agendamentos dentro de um horário específico
  const getAppointmentsForHour = (date, hour) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_datetime);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear() &&
             aptDate.getHours() === hour;
    });
  };

  // Ordenar agendamentos por data
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.start_datetime) - new Date(b.start_datetime)
  );

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const weekDays = getDaysInWeek(currentDate);
  const dayHours = getDayHours();

  // Se houver um dia expandido, mostrar visualização detalhada
  if (expandedDay) {
    const expandedDayAppointments = getAppointmentsForDay(expandedDay);
    const dayName = expandedDay.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    return (
      <div className="calendar-view space-y-6" data-testid="calendar-view">
        {/* Header do Dia Expandido */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white capitalize flex items-center gap-2">
                <CalendarIcon className="w-8 h-8" />
                {dayName}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setExpandedDay(null)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar ao Calendário
                </Button>
              </div>
            </div>

            {/* Informações do dia */}
            <div className="flex items-center gap-4 mb-6 text-white">
              <Badge className="bg-purple-500/20 text-purple-300 text-lg px-4 py-2">
                {expandedDayAppointments.length} {expandedDayAppointments.length === 1 ? 'agendamento' : 'agendamentos'}
              </Badge>
              {isToday(expandedDay) && (
                <Badge className="bg-green-500/20 text-green-300 text-lg px-4 py-2">
                  Hoje
                </Badge>
              )}
            </div>

            {/* Agendamentos detalhados */}
            {expandedDayAppointments.length > 0 ? (
              <div className="space-y-4">
                {expandedDayAppointments.map((appointment) => {
                  const images = getImagesForAppointment(appointment);

                  return (
                    <Card 
                      key={appointment.id}
                      className="bg-white/5 border-white/20 hover:bg-white/10 transition-all"
                    >
                      <CardContent className="p-6">
                        {/* Cabeçalho do agendamento */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-purple-400" />
                              <h3 className="text-2xl font-bold text-white">
                                {appointment.client_name || 'Cliente não informado'}
                              </h3>
                            </div>

                            {appointment.client_phone && (
                              <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-green-400" />
                                <span className="text-lg text-green-300">
                                  {appointment.client_phone}
                                </span>
                              </div>
                            )}

                            {appointment.title && (
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-lg text-blue-200">
                                  {appointment.title}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-bold text-purple-300">
                              {formatTime(appointment.start_datetime)}
                            </div>
                            {appointment.end_datetime && (
                              <div className="text-sm text-white/60">
                                até {formatTime(appointment.end_datetime)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Descrição */}
                        {appointment.description && (
                          <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start gap-2">
                              <FileText className="w-5 h-5 text-blue-300 mt-1" />
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1">Descrição:</h4>
                                <p className="text-white/80">{appointment.description}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Galeria de imagens */}
                        {images.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <ImageIcon className="w-5 h-5" />
                              Imagens ({images.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer"
                                  onDoubleClick={() => handleOpenFolder(appointment, image.file_path)}
                                  title="Duplo clique para abrir a pasta do cliente"
                                >
                                  <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-white/10 hover:border-purple-500 transition-all overflow-hidden flex items-center justify-center">
                                    <img
                                      src={
                                        image.thumbnail_url 
                                          ? (image.thumbnail_url.startsWith('http') 
                                              ? image.thumbnail_url 
                                              : `http://localhost:3001${image.thumbnail_url}`)
                                          : (image.file_url 
                                              ? (image.file_url.startsWith('http') 
                                                  ? image.file_url 
                                                  : `http://localhost:3001${image.file_url}`)
                                              : '')
                                      }
                                      alt={image.original_name}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-full h-full items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-white/50" />
                                    </div>
                                  </div>
                                  
                                  {/* Overlay ao passar o mouse */}
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-lg">
                                    <Folder className="w-8 h-8 text-white mb-2" />
                                    <span className="text-xs text-white text-center px-2">
                                      Duplo clique<br/>para abrir pasta
                                    </span>
                                  </div>
                                  
                                  {/* Badge da categoria */}
                                  <Badge className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1">
                                    {image.category || 'outros'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Botão para abrir pasta */}
                        <Button
                          onClick={() => handleOpenFolder(appointment)}
                          variant="outline"
                          className="mt-4 w-full border-white/20 text-white hover:bg-white/10"
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          Abrir Pasta do Cliente
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-xl text-white/60">Nenhum agendamento para este dia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Visualização normal do calendário
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80">Carregando calendário...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="calendar-view space-y-6" data-testid="calendar-view">
        {/* Header do Calendário */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                {viewMode === 'month' && monthName}
                {viewMode === 'week' && `Semana de ${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                {viewMode === 'list' && 'Todos os Agendamentos'}
              </h2>
              
              <div className="flex items-center gap-2">
                {/* Botões de Vista */}
                <div className="flex items-center gap-1 mr-2 bg-white/5 rounded-md p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setViewMode('month')}
                        variant={viewMode === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        className={viewMode === 'month' ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/10'}
                        data-testid="btn-calendar-month"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vista de Mês</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setViewMode('week')}
                        variant={viewMode === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        className={viewMode === 'week' ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/10'}
                        data-testid="btn-calendar-week"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vista de Semana</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setViewMode('day')}
                        variant={viewMode === 'day' ? 'default' : 'ghost'}
                        size="sm"
                        className={viewMode === 'day' ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/10'}
                        data-testid="btn-calendar-day"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vista de Dia</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setViewMode('list')}
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className={viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/10'}
                        data-testid="btn-calendar-list"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vista de Lista</TooltipContent>
                  </Tooltip>
                </div>

                <SyncStatusIndicator />
                
                {viewMode !== 'list' && (
                  <>
                    <Button
                      onClick={goToPrevious}
                      variant="outline"
                      size="sm"
                      data-testid="btn-calendar-prev"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={goToToday}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Hoje
                    </Button>
                    <Button
                      onClick={goToNext}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                      data-testid="btn-calendar-next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs de Contas Google (Multi-Account) */}
            {googleAccounts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Contas Google:</span>
                </div>
                <Tabs value={activeAccount} onValueChange={setActiveAccount} className="w-full">
                  <TabsList className="bg-white/5 p-1" data-testid="tabs-google-accounts">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/70"
                      data-testid="tab-account-all"
                    >
                      Todas as Contas
                    </TabsTrigger>
                    {googleAccounts.map(account => (
                      <TabsTrigger
                        key={account.id}
                        value={String(account.id)}
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/70"
                        data-testid={`tab-account-${account.id}`}
                      >
                        {account.account_name || account.account_email}
                        {account.is_primary && (
                          <Badge className="ml-2 bg-yellow-500 text-black text-xs">Principal</Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* VISTA DE MÊS */}
            {viewMode === 'month' && (
              <>
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-purple-300 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid de dias */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((date, index) => {
              const dayAppointments = getAppointmentsForDay(date);
              const hasAppointments = dayAppointments.length > 0;

              return (
                <Card
                  key={index}
                  data-testid={date ? `calendar-cell-${date.toISOString().split('T')[0]}` : undefined}
                  data-date={date ? date.toISOString().split('T')[0] : undefined}
                  onClick={() => handleDayClick(date)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, { id: date?.toDateString(), type: 'day' })}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => date && handleDrop(e, date)}
                  className={`
                    min-h-[120px] p-2 border transition-all
                    ${date ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'bg-transparent border-transparent'}
                    ${isToday(date) ? 'border-purple-500 border-2 bg-purple-500/20' : 'border-white/10'}
                    ${hasAppointments ? 'border-green-500/50' : ''}
                    ${dropTarget && dropTarget.id === date?.toDateString() ? 'border-purple-400 border-2 bg-purple-400/20 scale-105' : ''}
                  `}
                >
                  <div className="h-full flex flex-col">
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${isToday(date) ? 'text-purple-300' : 'text-white'}`}>
                            {date.getDate()}
                          </span>
                          {hasAppointments && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs px-1 py-0">
                              {dayAppointments.length}
                            </Badge>
                          )}
                        </div>

                        {/* Agendamentos do dia com informações completas */}
                        <div className="flex-1 space-y-2 overflow-y-auto">
                          {dayAppointments.map((appointment) => {
                            const images = getImagesForAppointment(appointment);
                            const primaryImage = images.find(img => img.category === 'fotos_finais') || 
                                               images.find(img => img.category === 'desenhos_aprovados') || 
                                               images[0];

                            return (
                              <Tooltip key={appointment.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    data-testid={`appointment-${appointment.id}`}
                                    data-appointment-id={appointment.id}
                                    data-date={appointment.date || (appointment.start_datetime ? appointment.start_datetime.split('T')[0] : '')}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, appointment)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative rounded overflow-hidden bg-white/5 hover:bg-white/10 transition-all border cursor-move
                                      ${dropTarget && dropTarget.id === date?.toDateString() ? 'border-purple-500' : 'border-white/10'}
                                      hover:border-purple-500/50
                                    `}
                                  >
                                {/* Cabeçalho com informações do cliente - SEMPRE VISÍVEL */}
                                <div className="p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10">
                                  <div className="flex items-center gap-1 mb-1">
                                    <User className="w-3 h-3 text-purple-300" />
                                    <span className="text-xs font-semibold text-white truncate">
                                      {appointment.client_name || 'Cliente não informado'}
                                    </span>
                                  </div>
                                  
                                  {appointment.client_phone && (
                                    <div className="flex items-center gap-1 mb-1">
                                      <Phone className="w-3 h-3 text-green-400" />
                                      <span className="text-[10px] text-green-300">
                                        {appointment.client_phone}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {appointment.description && (
                                    <div className="flex items-start gap-1">
                                      <FileText className="w-3 h-3 text-blue-300 mt-0.5" />
                                      <span className="text-[10px] text-blue-200 line-clamp-2">
                                        {appointment.description}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Área de imagens */}
                                {images.length > 0 ? (
                                  <div className="p-2">
                                    <div className="grid grid-cols-2 gap-1">
                                      {images.slice(0, 4).map((image, idx) => (
                                        <div
                                          key={idx}
                                          className="relative group cursor-pointer"
                                          onDoubleClick={() => handleOpenFolder(appointment, image.file_path)}
                                          title="Duplo clique para abrir a pasta do cliente"
                                        >
                                          <div className="w-full h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded border border-white/10 hover:border-purple-500 transition-all overflow-hidden flex items-center justify-center">
                                            <img
                                              src={
                                                image.thumbnail_url 
                                                  ? (image.thumbnail_url.startsWith('http') 
                                                      ? image.thumbnail_url 
                                                      : `http://localhost:3001${image.thumbnail_url}`)
                                                  : (image.file_url 
                                                      ? (image.file_url.startsWith('http') 
                                                          ? image.file_url 
                                                          : `http://localhost:3001${image.file_url}`)
                                                      : '')
                                              }
                                              alt={image.original_name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                              }}
                                            />
                                            <div className="hidden w-full h-full items-center justify-center">
                                              <ImageIcon className="w-6 h-6 text-white/50" />
                                            </div>
                                          </div>
                                          
                                          {/* Overlay ao passar o mouse */}
                                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded">
                                            <Folder className="w-5 h-5 text-white mb-1" />
                                            <span className="text-[9px] text-white text-center px-1">
                                              Duplo clique<br/>para abrir pasta
                                            </span>
                                          </div>
                                          
                                          {/* Badge da categoria */}
                                          <Badge className="absolute top-1 left-1 bg-black/80 text-white text-[8px] px-1 py-0">
                                            {image.category || 'outros'}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {images.length > 4 && (
                                      <div className="mt-1 text-center">
                                        <Badge className="bg-purple-500/20 text-purple-300 text-[9px] px-2 py-0.5">
                                          +{images.length - 4} mais
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-2">
                                    <div 
                                      className="w-full h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded flex flex-col items-center justify-center border border-white/10"
                                    >
                                      <ImageIcon className="w-6 h-6 text-white/30 mb-1" />
                                      <span className="text-[9px] text-white/50">
                                        Sem imagens
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                <div><strong>{appointment.client_name}</strong></div>
                                <div>{formatTime(appointment.start_datetime)}</div>
                                {appointment.description && <div>{appointment.description}</div>}
                                <div className="text-yellow-300 mt-1">🖐️ Arraste para reagendar</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
                </div>
              </>
            )}

            {/* VISTA DE SEMANA */}
            {viewMode === 'week' && (
              <>
                {/* Cabeçalho da semana */}
                <div className="grid grid-cols-8 gap-2 mb-2">
                  <div className="text-center text-sm font-semibold text-purple-300 p-2">Hora</div>
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="text-center text-sm font-semibold text-purple-300 p-2">
                      <div>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][idx]}</div>
                      <div className={`text-lg ${isToday(day) ? 'text-purple-400 font-bold' : ''}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid de horários */}
                <div className="overflow-auto max-h-[600px]">
                  {dayHours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 gap-2 mb-1">
                      {/* Coluna de horário */}
                      <div className="text-center text-sm text-purple-300 p-2 border border-white/10 rounded">
                        {hour}:00
                      </div>

                      {/* Células de cada dia */}
                      {weekDays.map((day, dayIdx) => {
                        const hourAppointments = getAppointmentsForHour(day, hour);
                        const cellId = `${day.toDateString()}-${hour}`;
                        return (
                          <Tooltip key={dayIdx}>
                            <TooltipTrigger asChild>
                              <div
                                data-testid={`calendar-cell-week-${day.toISOString().split('T')[0]}-${hour}`}
                                data-date={day.toISOString().split('T')[0]}
                                data-hour={hour}
                                onDragOver={handleDragOver}
                                onDragEnter={(e) => handleDragEnter(e, { id: cellId, type: 'hour', day, hour })}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, day, hour)}
                                className={`min-h-[60px] p-2 border rounded transition-all cursor-pointer
                                  ${hourAppointments.length > 0 ? 'border-green-500/50 bg-white/10' : 'border-white/10 bg-white/5'}
                                  ${dropTarget && dropTarget.id === cellId ? 'border-purple-400 border-2 bg-purple-400/20' : ''}
                                  hover:bg-white/10
                                `}>
                                {hourAppointments.map((apt, aptIdx) => (
                                  <div 
                                    key={aptIdx}
                                    data-testid={`appointment-${apt.id}`}
                                    data-appointment-id={apt.id}
                                    data-date={apt.date || (apt.start_datetime ? apt.start_datetime.split('T')[0] : '')}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, apt)}
                                    onDragEnd={handleDragEnd}
                                    className={`text-xs p-1 mb-1 rounded bg-gradient-to-r ${getAppointmentColor(apt)} text-white truncate cursor-move`}
                                  >
                                    {apt.client_name || 'Sem nome'}
                                  </div>
                                ))}
                              </div>
                            </TooltipTrigger>
                            {hourAppointments.length > 0 && (
                              <TooltipContent>
                                {hourAppointments.map((apt, idx) => (
                                  <div key={idx} className="mb-2">
                                    <strong>{apt.client_name}</strong>
                                    <div className="text-xs">{formatTime(apt.start_datetime)} - {apt.end_datetime && formatTime(apt.end_datetime)}</div>
                                    {apt.description && <div className="text-xs">{apt.description}</div>}
                                  </div>
                                ))}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* VISTA DE DIA */}
            {viewMode === 'day' && (
              <div className="overflow-auto max-h-[700px]">
                {dayHours.map((hour) => {
                  const hourAppointments = getAppointmentsForHour(currentDate, hour);
                  return (
                    <div key={hour} className="grid grid-cols-12 gap-2 mb-2">
                      {/* Coluna de horário */}
                      <div className="col-span-2 text-center text-lg text-purple-300 p-4 border border-white/10 rounded bg-white/5">
                        <div className="font-bold">{hour}:00</div>
                        <div className="text-xs text-white/60">-</div>
                        <div className="text-sm">{hour+1}:00</div>
                      </div>

                      {/* Coluna de agendamentos */}
                      <div
                        data-testid={`calendar-cell-day-${currentDate.toISOString().split('T')[0]}-${hour}`}
                        data-date={currentDate.toISOString().split('T')[0]}
                        data-hour={hour}
                        className={`col-span-10 min-h-[100px] p-4 border rounded transition-all
                          ${dropTarget && dropTarget.id === `day-${hour}` 
                            ? 'border-purple-400 border-2 bg-purple-400/20' 
                            : 'border-white/10 bg-white/5'
                          }
                        `}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, { id: `day-${hour}`, type: 'hour', day: currentDate, hour })}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, currentDate, hour)}
                      >
                        {hourAppointments.length > 0 ? (
                          <div className="space-y-2">
                            {hourAppointments.map((apt) => {
                              const images = getImagesForAppointment(apt);
                              return (
                                <Tooltip key={apt.id}>
                                  <TooltipTrigger asChild>
                                    <Card
                                      data-testid={`appointment-${apt.id}`}
                                      data-appointment-id={apt.id}
                                      data-date={apt.date || (apt.start_datetime ? apt.start_datetime.split('T')[0] : '')}
                                      draggable={true}
                                      onDragStart={(e) => handleDragStart(e, apt)}
                                      onDragEnd={handleDragEnd}
                                      className={`bg-gradient-to-r ${getAppointmentColor(apt)} border-2 hover:scale-102 transition-transform cursor-move`}
                                    >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                          <User className="w-5 h-5" />
                                          {apt.client_name || 'Cliente não informado'}
                                        </h4>
                                        {apt.client_phone && (
                                          <div className="flex items-center gap-2 mb-1">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm text-white/90">{apt.client_phone}</span>
                                          </div>
                                        )}
                                        {apt.description && (
                                          <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 mt-1" />
                                            <p className="text-sm text-white/90">{apt.description}</p>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{formatTime(apt.start_datetime)}</div>
                                        {apt.end_datetime && (
                                          <div className="text-sm text-white/80">até {formatTime(apt.end_datetime)}</div>
                                        )}
                                        {apt.type && (
                                          <Badge className="mt-2 bg-white/20 text-white">{apt.type}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    {images.length > 0 && (
                                      <div className="mt-3 flex gap-2 overflow-x-auto">
                                        {images.slice(0, 5).map((img, idx) => (
                                          <img
                                            key={idx}
                                            src={img.thumbnail_url || img.file_url}
                                            alt={img.original_name}
                                            className="w-16 h-16 object-cover rounded border border-white/20"
                                            loading="lazy"
                                          />
                                        ))}
                                        {images.length > 5 && (
                                          <div className="w-16 h-16 flex items-center justify-center bg-white/20 rounded border border-white/20">
                                            <span className="text-xs text-white">+{images.length - 5}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs space-y-1">
                                      <div><strong>{apt.client_name}</strong></div>
                                      <div>{formatTime(apt.start_datetime)} - {formatTime(apt.end_datetime)}</div>
                                      {apt.description && <div>{apt.description}</div>}
                                      <div className="text-yellow-300 mt-1">🖐️ Arraste para reagendar</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/40 text-sm">
                            Nenhum agendamento
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VISTA DE LISTA */}
            {viewMode === 'list' && (
              <div className="space-y-4 max-h-[700px] overflow-auto">
                {sortedAppointments.length > 0 ? (
                  <>
                    {sortedAppointments.map((apt) => {
                      const images = getImagesForAppointment(apt);
                      const aptDate = new Date(apt.start_datetime);
                      return (
                        <Card key={apt.id} className={`bg-gradient-to-r ${getAppointmentColor(apt)} border-2 hover:scale-102 transition-all`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <CalendarIcon className="w-5 h-5 text-white" />
                                  <span className="text-xl font-bold text-white">
                                    {aptDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                  </span>
                                  {isToday(aptDate) && (
                                    <Badge className="bg-purple-500/30 text-white">Hoje</Badge>
                                  )}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                  <User className="w-6 h-6" />
                                  {apt.client_name || 'Cliente não informado'}
                                </h3>
                                {apt.client_phone && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-white/90">{apt.client_phone}</span>
                                  </div>
                                )}
                                {apt.description && (
                                  <div className="flex items-start gap-2 mt-3 p-3 bg-white/10 rounded">
                                    <FileText className="w-4 h-4 mt-1" />
                                    <p className="text-white/90">{apt.description}</p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-white">{formatTime(apt.start_datetime)}</div>
                                {apt.end_datetime && (
                                  <div className="text-lg text-white/80">até {formatTime(apt.end_datetime)}</div>
                                )}
                                {apt.type && (
                                  <Badge className="mt-2 bg-white/20 text-white text-lg px-3 py-1">{apt.type}</Badge>
                                )}
                              </div>
                            </div>
                            {images.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4" />
                                  {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
                                </h4>
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                  {images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                      <img
                                        src={img.thumbnail_url || img.file_url}
                                        alt={img.original_name}
                                        className="w-full aspect-square object-cover rounded border border-white/20 hover:border-white/60 transition-all"
                                        loading="lazy"
                                      />
                                      <Badge className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1">
                                        {img.category}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <CalendarIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white/60 mb-2">Nenhum agendamento encontrado</h3>
                    <p className="text-white/40">Crie um novo agendamento para começar</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Legenda e Instruções */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/20"></div>
                <span className="text-white">Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-green-500/50 bg-white/5"></div>
                <span className="text-white">Com agendamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-white">Nome do cliente</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-white">Telefone</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-white">Descrição</span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                <span className="text-white font-semibold">Dica:</span>
                <span className="text-white/80">
                  Clique em qualquer dia para ver os detalhes completos dos agendamentos
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Folder className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">Dica:</span>
                <span className="text-white/80">
                  Dê duplo clique em qualquer imagem para abrir a pasta do cliente
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Modal de Resolução de Conflitos */}
        <ConflictResolver
          conflicts={syncConflicts}
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          onResolved={handleConflictsResolved}
        />
      </div>
    </TooltipProvider>
  );
};

export default CalendarioVisual;

