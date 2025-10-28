import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
import { Gift, Search, DollarSign, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'used': 'bg-gray-100 text-gray-800',
  'expired': 'bg-red-100 text-red-800',
  'cancelled': 'bg-orange-100 text-orange-800',
};

const statusLabels = {
  'active': 'Ativo',
  'used': 'Usado',
  'expired': 'Expirado',
  'cancelled': 'Cancelado',
};

const GiftCardsTab = ({ customerId }) => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadGiftCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/api/customers/${customerId}/gift-cards${
        filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar gift cards');
      }
      
      const data = await response.json();
      setGiftCards(data);
    } catch (err) {
      console.error('Erro ao carregar gift cards:', err);
      setError('Erro ao carregar gift cards. Tente novamente.');
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, filterStatus]);

  useEffect(() => {
    if (customerId) {
      loadGiftCards();
    }
  }, [customerId, loadGiftCards]);

  const filteredGiftCards = giftCards.filter(gc => {
    if (searchTerm) {
      return gc.code?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando gift cards...</p>
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
              <Gift className="h-5 w-5" />
              Gift Cards
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Busca por Código */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por Status */}
            <div className="w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="used">Usado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de Gift Cards */}
      <Card>
        <CardContent className="pt-6">
          {filteredGiftCards.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum gift card encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Este cliente ainda não possui gift cards.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Valor Inicial</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Emissão</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGiftCards.map((gc) => (
                  <TableRow key={gc.id}>
                    <TableCell className="font-mono font-medium">
                      {gc.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        {formatCurrency(gc.initial_value)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatCurrency(gc.current_balance)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[gc.status]}>
                        {statusLabels[gc.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(gc.issued_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(gc.expiry_date)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      {filteredGiftCards.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Gift Cards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredGiftCards.length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Valor Total Inicial</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    filteredGiftCards.reduce((sum, gc) => sum + (gc.initial_value || 0), 0)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Saldo Total Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    filteredGiftCards.reduce((sum, gc) => sum + (gc.current_balance || 0), 0)
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

export default GiftCardsTab;

