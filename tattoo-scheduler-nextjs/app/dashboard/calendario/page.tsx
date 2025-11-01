'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

// Cores por tipo de tatuagem
const APPOINTMENT_COLORS: Record<string, string> = {
  'Grande': 'bg-gradient-to-r from-purple-600 to-purple-800 border-purple-500',
  'Média': 'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-500',
  'Pequena': 'bg-gradient-to-r from-green-600 to-green-800 border-green-500',
  'Retoque': 'bg-gradient-to-r from-yellow-600 to-yellow-800 border-yellow-500',
  'default': 'bg-gradient-to-r from-gray-600 to-gray-800 border-gray-500'
};

interface Appointment {
  id: number;
  title: string;
  startDatetime: string;
  endDatetime: string;
  client_name?: string;
  tattoo_type?: string;
  estimated_price?: number;
  status?: string;
}

export default function CalendarioPage() {
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares de data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startDatetime).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const renderCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-2 border border-gray-700/30" />
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDay(day);
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`aspect-square p-2 border transition-colors ${
            isDark ? 'border-gray-700/30 hover:bg-gray-800/50' : 'border-white/10 hover:bg-white/5'
          } ${isToday ? 'bg-purple-500/20 border-purple-500/50' : ''}`}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-medium ${isToday ? 'text-purple-400' : 'text-white'}`}>
              {day}
            </span>
            <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
              {dayAppointments.slice(0, 3).map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`w-full text-left p-1 rounded text-xs text-white border ${
                    APPOINTMENT_COLORS[apt.tattoo_type || 'default']
                  } hover:opacity-80 transition-opacity truncate`}
                >
                  {apt.title}
                </button>
              ))}
              {dayAppointments.length > 3 && (
                <span className="text-xs text-gray-400">+{dayAppointments.length - 3} mais</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <Card className={`backdrop-blur-md ${
        isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center text-2xl">
              <CalendarIcon className="w-6 h-6 mr-3" />
              Calendário Visual
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={previousMonth}
                variant="outline"
                size="sm"
                className="text-white border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-white font-medium capitalize min-w-[200px] text-center">
                {formatMonth(currentDate)}
              </span>
              <Button
                onClick={nextMonth}
                variant="outline"
                size="sm"
                className="text-white border-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="outline"
                size="sm"
                className="text-white border-white/20"
              >
                Hoje
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
              <p className="mt-4">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-white/70 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid de dias */}
              <div className="grid grid-cols-7 gap-0 border border-gray-700/30">
                {renderCalendarDays()}
              </div>

              {/* Legenda de cores */}
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(APPOINTMENT_COLORS).filter(([key]) => key !== 'default').map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color}`} />
                    <span className="text-sm text-white/70">{type}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedAppointment.title}</h3>
                <p className="text-gray-400 text-sm">
                  {selectedAppointment.client_name}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(selectedAppointment.startDatetime).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    até {new Date(selectedAppointment.endDatetime).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {selectedAppointment.tattoo_type && (
                <div>
                  <Badge className={APPOINTMENT_COLORS[selectedAppointment.tattoo_type] || APPOINTMENT_COLORS.default}>
                    {selectedAppointment.tattoo_type}
                  </Badge>
                </div>
              )}

              {selectedAppointment.estimated_price && (
                <div className="text-green-400 font-semibold">
                  R$ {selectedAppointment.estimated_price.toFixed(2)}
                </div>
              )}

              {selectedAppointment.status && (
                <div>
                  <Badge>{selectedAppointment.status}</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

