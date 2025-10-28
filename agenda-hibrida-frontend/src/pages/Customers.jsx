/**
 * Página de Lista de Clientes com Filtros Avançados
 * Rota sugerida: /customers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, Filter, SortAsc, SortDesc, UserPlus, Mail, Phone, MapPin, 
  Calendar, DollarSign, Tag, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterTag, setFilterTag] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchTags();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, searchTerm, sortBy, sortOrder, filterTag, filterDateRange]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers`);
      if (!response.ok) throw new Error('Erro ao buscar clientes');
      const data = await response.json();
      
      // Normalizar dados dos clientes
      let normalizedData = [];
      if (Array.isArray(data)) {
        normalizedData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // API retorna {data: [], pagination: {}} 
        normalizedData = data.data;
      } else if (data && typeof data === 'object' && Array.isArray(data.customers)) {
        normalizedData = data.customers;
      } else {
        console.warn('API retornou formato inesperado:', data);
        normalizedData = [];
      }
      
      // Normalizar tags para cada cliente
      normalizedData = normalizedData.map(customer => ({
        ...customer,
        tags: normalizeTags(customer.tags)
      }));
      
      setCustomers(normalizedData);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
      setCustomers([]); // Garantir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };
  
  // Função auxiliar para normalizar tags
  const normalizeTags = (tags) => {
    // Se tags já é um array, retornar
    if (Array.isArray(tags)) {
      return tags;
    }
    
    // Se tags é uma string JSON, fazer parse
    if (typeof tags === 'string' && tags.trim().length > 0) {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      // eslint-disable-next-line no-unused-vars
      } catch (_e) {
        console.warn('Erro ao fazer parse de tags:', tags);
        return [];
      }
    }
    
    // Caso contrário, retornar array vazio
    return [];
  };

  const fetchTags = async () => {
    try {
      // TODO: Backend não tem endpoint /api/tags ainda
      // Usando array vazio temporariamente
      setTags([]);
      
      /* Futuro endpoint:
      const response = await fetch(`${API_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
      */
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    }
  };

  const applyFilters = () => {
    // Garantir que customers é um array
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }
    
    let result = [...customers];

    // Filtro de busca (nome, email, telefone)
    if (searchTerm) {
      result = result.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      );
    }

    // Filtro por tag
    if (filterTag && filterTag !== 'all') {
      result = result.filter(customer => 
        customer.tags?.some(tag => tag.id === parseInt(filterTag))
      );
    }

    // Filtro por data de criação
    if (filterDateRange && filterDateRange !== 'all') {
      const now = new Date();
      const ranges = {
        'today': 0,
        'week': 7,
        'month': 30,
        'year': 365
      };
      
      if (ranges[filterDateRange] !== undefined) {
        const daysAgo = ranges[filterDateRange];
        const startDate = new Date(now.setDate(now.getDate() - daysAgo));
        result = result.filter(customer => 
          new Date(customer.created_at) >= startDate
        );
      }
    }

    // Ordenação
    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'total_sales':
          aValue = a.total_sales || 0;
          bValue = b.total_sales || 0;
          break;
        case 'total_appointments':
          aValue = a.total_appointments || 0;
          bValue = b.total_appointments || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(result);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterTag('all');
    setFilterDateRange('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleCustomerClick = (customer) => {
    navigate(`/customers/${customer.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8" />
            Clientes
          </h1>
          <p className="text-gray-400 mt-1">
            {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} 
            {searchTerm || filterTag !== 'all' || filterDateRange !== 'all' ? ' (filtrado)' : ''}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/customers/new')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Linha 1: Pesquisa */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                  data-testid="input-search-clients"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-white hover:bg-gray-700"
                data-testid="btn-toggle-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Linha 2: Filtros Avançados (condicional) */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-gray-700">
                {/* Filtro por Tag */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tag</label>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white" data-testid="select-filter-tag">
                      <SelectValue placeholder="Todas as tags" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      <SelectItem value="all">Todas as tags</SelectItem>
                      {tags.map(tag => (
                        <SelectItem key={tag.id} value={String(tag.id)}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Data */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Data de Cadastro</label>
                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white" data-testid="select-filter-date">
                      <SelectValue placeholder="Todas as datas" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      <SelectItem value="all">Todas as datas</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white" data-testid="select-sort-by">
                      <SelectValue placeholder="Nome" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="created_at">Data de Cadastro</SelectItem>
                      <SelectItem value="total_sales">Total Gasto</SelectItem>
                      <SelectItem value="total_appointments">Agendamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Direção da Ordenação */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Ordem</label>
                  <Button
                    onClick={toggleSortOrder}
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                    data-testid="btn-toggle-sort-order"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Crescente
                      </>
                    ) : (
                      <>
                        <SortDesc className="w-4 h-4 mr-2" />
                        Decrescente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Botão Limpar Filtros */}
            {(searchTerm || filterTag !== 'all' || filterDateRange !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
              <div className="flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  data-testid="btn-clear-filters"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {filteredCustomers.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-400">
              {searchTerm || filterTag !== 'all' || filterDateRange !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Adicione seu primeiro cliente para começar.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="clients-list">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => handleCustomerClick(customer)}
              data-testid={`client-card-${customer.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(customer.name)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate mb-1">
                      {customer.name}
                    </h3>
                    
                    {customer.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {customer.tags && customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {customer.tags.slice(0, 3).map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {customer.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        +{customer.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-900 rounded p-2">
                    <div className="font-bold text-green-400">
                      ${customer.total_sales || 0}
                    </div>
                    <div className="text-gray-500">Gasto</div>
                  </div>
                  <div className="bg-gray-900 rounded p-2">
                    <div className="font-bold text-blue-400">
                      {customer.total_appointments || 0}
                    </div>
                    <div className="text-gray-500">Sessões</div>
                  </div>
                  <div className="bg-gray-900 rounded p-2">
                    <div className="font-bold text-purple-400">
                      {customer.loyalty_points_balance || 0}
                    </div>
                    <div className="text-gray-500">Pontos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;

