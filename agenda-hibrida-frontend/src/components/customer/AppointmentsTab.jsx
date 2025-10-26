import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar, Filter, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'no_show': 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  'pending': 'Pendente',
  'confirmed': 'Confirmado',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
  'no_show': 'Faltou',
};

const AppointmentsTab = ({ customerId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [customerId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/appointments?client_id=${customerId}`
      );
      if (!response.ok) throw new Error('Erro ao buscar agendamentos');
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filters.status !== 'all' && apt.status !== filters.status) {
      return false;
    }
    if (filters.startDate && apt.start_datetime < filters.startDate) {
      return false;
    }
    if (filters.endDate && apt.start_datetime > filters.endDate) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="no_show">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: 'all', startDate: '', endDate: '' })}
              >
                Limpar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Agendamentos ({filteredAppointments.length})
            </span>
            <Button size="sm">Novo Agendamento</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preço Estimado</TableHead>
                    <TableHead>Preço Final</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {appointment.start_datetime && (
                          <div>
                            <div className="font-medium">
                              {format(new Date(appointment.start_datetime), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(appointment.start_datetime), 'HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{appointment.title}</div>
                        {appointment.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {appointment.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[appointment.status] || 'bg-gray-100'}>
                          {statusLabels[appointment.status] || appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${appointment.estimated_price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${appointment.actual_price?.toFixed(2) || '0.00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsTab;

