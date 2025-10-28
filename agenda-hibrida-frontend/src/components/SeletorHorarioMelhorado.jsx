import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Star, Package } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SeletorHorarioMelhorado = ({ value, onChange, minDate = new Date(), onServiceChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Novos states para serviços
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // Carregar serviços predefinidos
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(`${API_URL}/api/services?active=1&featured=1`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Quando um serviço é selecionado
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    
    // Auto-ajustar duração baseado no serviço
    if (selectedStartTime && service.default_duration) {
      const [hour, minute] = selectedStartTime.split(':');
      const startMinutes = parseInt(hour) * 60 + parseInt(minute);
      const endMinutes = startMinutes + service.default_duration;
      
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      
      if (endHour <= 20) {
        setSelectedEndTime(endTime);
      }
    }
    
    // Notificar componente pai
    if (onServiceChange) {
      onServiceChange(service);
    }
  };

  // Parse do valor inicial
  useEffect(() => {
    if (value?.start && value?.end) {
      const startDate = new Date(value.start);
      const endDate = new Date(value.end);
      setSelectedDate(startDate);
      setSelectedStartTime(`${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`);
      setSelectedEndTime(`${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`);
    }
  }, []);

  // Atualizar valor quando houver mudanças
  useEffect(() => {
    if (selectedDate && selectedStartTime && selectedEndTime) {
      const [startHour, startMinute] = selectedStartTime.split(':');
      const [endHour, endMinute] = selectedEndTime.split(':');
      
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
      
      onChange?.({
        start: startDateTime.toISOString().slice(0, 16),
        end: endDateTime.toISOString().slice(0, 16),
        service: selectedService
      });
    }
  }, [selectedDate, selectedStartTime, selectedEndTime, selectedService]);

  // Ajustar horário de término quando hora inicial muda e há serviço selecionado
  useEffect(() => {
    if (selectedStartTime && selectedService?.default_duration) {
      const [hour, minute] = selectedStartTime.split(':');
      const startMinutes = parseInt(hour) * 60 + parseInt(minute);
      const endMinutes = startMinutes + selectedService.default_duration;
      
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      
      if (endHour <= 20) {
        setSelectedEndTime(endTime);
      }
    }
  }, [selectedStartTime, selectedService]);

  // Gerar horários disponíveis (das 8h às 20h, de 30 em 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 20 && minute === 30) break; // Parar em 20:00
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Funções de navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Verificar se é hoje
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Verificar se está selecionado
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Verificar se é passado
  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="space-y-4" data-testid="seletor-horario-melhorado">
      {/* Seletor de Serviço */}
      <div className="space-y-2">
        <Label className="text-white font-medium flex items-center gap-2">
          <Package className="w-4 h-4" />
          Selecione o Serviço
        </Label>
        
        {loadingServices ? (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-4 text-center text-gray-400">
              Carregando serviços...
            </CardContent>
          </Card>
        ) : services.length === 0 ? (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-4 text-center text-gray-400">
              Nenhum serviço disponível
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedService?.id === service.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }
                `}
                data-testid={`service-option-${service.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color_code }}
                    />
                    <h4 className="text-white font-semibold">{service.service_name}</h4>
                  </div>
                  {service.is_featured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                
                {service.short_description && (
                  <p className="text-gray-400 text-xs mb-2">{service.short_description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <Badge className="bg-gray-700 text-gray-300">
                    {formatDuration(service.default_duration)}
                  </Badge>
                  <span className="text-white font-semibold">
                    {formatCurrency(service.base_price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Seletor de Data */}
      <div className="space-y-2">
        <Label className="text-white font-medium flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Selecione a Data
        </Label>
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-4">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold capitalize">{monthName}</h3>
              <div className="flex items-center gap-1">
                <Button
                  onClick={goToPreviousMonth}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                  data-testid="btn-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={goToNextMonth}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                  data-testid="btn-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-semibold text-gray-400 p-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && !isPast(date) && setSelectedDate(date)}
                  disabled={!date || isPast(date)}
                  data-testid={date ? `calendar-day-${date.toISOString().split('T')[0]}` : undefined}
                  className={`
                    aspect-square p-1 text-sm rounded transition-all
                    ${!date ? 'invisible' : ''}
                    ${isPast(date) ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-700'}
                    ${isSelected(date) ? 'bg-purple-500 text-white font-bold' : ''}
                    ${isToday(date) && !isSelected(date) ? 'bg-gray-700 font-semibold' : ''}
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Horário */}
      {selectedDate && (
        <div className="grid grid-cols-2 gap-4">
          {/* Horário de Início */}
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Início
            </Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-800 rounded-lg border border-gray-600">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedStartTime(time)}
                  data-testid={`time-start-${time.replace(':', '')}`}
                  className={`
                    p-2 text-sm rounded transition-all
                    ${selectedStartTime === time 
                      ? 'bg-purple-500 text-white font-bold' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Horário de Término */}
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Término
              {selectedService && (
                <Badge className="bg-purple-500/30 text-purple-300 text-xs">
                  Auto: {formatDuration(selectedService.default_duration)}
                </Badge>
              )}
            </Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-800 rounded-lg border border-gray-600">
              {timeSlots.map((time) => {
                const disabled = selectedStartTime && time <= selectedStartTime;
                return (
                  <button
                    key={time}
                    onClick={() => !disabled && setSelectedEndTime(time)}
                    disabled={disabled}
                    data-testid={`time-end-${time.replace(':', '')}`}
                    className={`
                      p-2 text-sm rounded transition-all
                      ${disabled 
                        ? 'bg-gray-900 text-gray-600 cursor-not-allowed' 
                        : selectedEndTime === time 
                          ? 'bg-purple-500 text-white font-bold' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resumo */}
      {selectedDate && selectedStartTime && selectedEndTime && (
        <Card className="bg-green-500/20 border-green-500/50" data-testid="booking-summary">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">Agendamento selecionado:</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/30 text-green-300">
                  {selectedDate.toLocaleDateString('pt-BR')}
                </Badge>
                <Badge className="bg-purple-500/30 text-purple-300">
                  {selectedStartTime} - {selectedEndTime}
                </Badge>
              </div>
            </div>
            
            {selectedService && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-green-500/30">
                <span className="text-gray-300">{selectedService.service_name}</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedService.base_price)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeletorHorarioMelhorado;
