import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
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
import { Users, DollarSign, Calendar, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'expired': 'bg-red-100 text-red-800',
  'cancelled': 'bg-orange-100 text-orange-800',
  'suspended': 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  'active': 'Ativo',
  'expired': 'Expirado',
  'cancelled': 'Cancelado',
  'suspended': 'Suspenso',
};

const MembershipsTab = ({ customerId }) => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadMemberships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/api/customers/${customerId}/memberships${
        filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar memberships');
      }
      
      const data = await response.json();
      setMemberships(data);
    } catch (err) {
      console.error('Erro ao carregar memberships:', err);
      setError('Erro ao carregar assinaturas. Tente novamente.');
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, filterStatus]);

  useEffect(() => {
    if (customerId) {
      loadMemberships();
    }
  }, [customerId, loadMemberships]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando assinaturas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Memberships
            </CardTitle>
            <div className="w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de Memberships */}
      <Card>
        <CardContent className="pt-6">
          {memberships.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-gray-500">
                {filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Este cliente ainda não possui assinaturas.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Término</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Renovação Automática</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => {
                  const daysRemaining = getDaysRemaining(membership.end_date);
                  return (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.plan_name || 'Plano Personalizado'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(membership.monthly_fee)}
                          <span className="text-xs text-gray-500">/mês</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[membership.status]}>
                          {statusLabels[membership.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(membership.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(membership.end_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null ? (
                          <span className={`text-sm font-medium ${
                            daysRemaining > 30 ? 'text-green-600' : 
                            daysRemaining > 7 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirado'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {membership.auto_renew ? (
                          <Check className="h-5 w-5 text-green-600 inline" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      {memberships.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Assinaturas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memberships.length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {memberships.filter(m => m.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Valor Mensal Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    memberships
                      .filter(m => m.status === 'active')
                      .reduce((sum, m) => sum + (m.monthly_fee || 0), 0)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MembershipsTab;

