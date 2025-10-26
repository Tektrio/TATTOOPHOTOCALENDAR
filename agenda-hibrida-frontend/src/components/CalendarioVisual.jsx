import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon, Phone, User, FileText, Folder } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import ConflictResolver from './ConflictResolver';
import SyncStatusIndicator from './SyncStatusIndicator';

const API_URL = 'http://localhost:3001';

const CalendarioVisual = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientImages, setClientImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null); // Estado para controlar dia expandido
  const [syncConflicts, setSyncConflicts] = useState([]); // Conflitos de sincronização
  const [showConflictModal, setShowConflictModal] = useState(false); // Modal de conflitos

  useEffect(() => {
    loadData();
  }, [currentDate]);

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
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_datetime);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
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

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header do Calendário */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              {monthName}
            </h2>
            <div className="flex items-center gap-2">
              <SyncStatusIndicator />
              <Button
                onClick={goToPreviousMonth}
                variant="outline"
                size="sm"
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
                onClick={goToNextMonth}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

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
                  onClick={() => handleDayClick(date)}
                  className={`
                    min-h-[120px] p-2 border transition-all
                    ${date ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'bg-transparent border-transparent'}
                    ${isToday(date) ? 'border-purple-500 border-2 bg-purple-500/20' : 'border-white/10'}
                    ${hasAppointments ? 'border-green-500/50' : ''}
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
                              <div
                                key={appointment.id}
                                className="relative rounded overflow-hidden bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/50"
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
  );
};

export default CalendarioVisual;

