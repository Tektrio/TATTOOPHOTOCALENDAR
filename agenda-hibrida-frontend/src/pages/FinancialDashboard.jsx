/**
 * Financial Dashboard
 * Dashboardfinanceiro com gráficos de receita, transações e análises
 */

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  Users,
  Package,
  Loader2,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CHART_COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9333EA', '#EC4899'];

export default function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [financialData, setFinancialData] = useState({
    summary: {
      total_revenue: 0,
      total_transactions: 0,
      average_ticket: 0,
      growth_rate: 0
    },
    revenue_by_day: [],
    revenue_by_type: [],
    revenue_by_payment_method: [],
    top_services: [],
    recent_transactions: []
  });

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/financials/dashboard?range=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setFinancialData(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const exportReport = () => {
    // Implementar exportação de relatório
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    let csv = 'Data,Receita,Transações\n';
    financialData.revenue_by_day.forEach(item => {
      csv += `${item.date},${item.revenue},${item.count}\n`;
    });
    return csv;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const { summary } = financialData;

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="financial-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-gray-500">Análise de receitas e transações</p>
        </div>
        
        <div className="flex gap-2">
          {/* Filtro de período */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            data-testid="select-date-range"
          >
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="year">Este ano</option>
            <option value="all">Todo período</option>
          </select>

          <Button variant="outline" onClick={loadFinancialData}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="outline" onClick={exportReport} data-testid="btn-export-report">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Receita Total */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant={summary.growth_rate >= 0 ? 'default' : 'destructive'}>
              {formatPercentage(summary.growth_rate)}
            </Badge>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Receita Total</h3>
          <p className="text-2xl font-bold" data-testid="total-revenue">
            {formatCurrency(summary.total_revenue)}
          </p>
        </Card>

        {/* Transações */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Transações</h3>
          <p className="text-2xl font-bold" data-testid="total-transactions">
            {summary.total_transactions}
          </p>
        </Card>

        {/* Ticket Médio */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Ticket Médio</h3>
          <p className="text-2xl font-bold" data-testid="average-ticket">
            {formatCurrency(summary.average_ticket)}
          </p>
        </Card>

        {/* Clientes Ativos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">Clientes Ativos</h3>
          <p className="text-2xl font-bold" data-testid="active-customers">
            {summary.active_customers || 0}
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receita por Dia */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receita por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData.revenue_by_day}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4285F4" 
                strokeWidth={2}
                name="Receita"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Receita por Tipo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receita por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData.revenue_by_type}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#34A853" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Métodos de Pagamento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financialData.revenue_by_payment_method}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.method}: ${formatCurrency(entry.revenue)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {financialData.revenue_by_payment_method.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Serviços */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Serviços</h3>
          <div className="space-y-4">
            {financialData.top_services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum serviço encontrado</p>
            ) : (
              financialData.top_services.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.count} vendas</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="recent-transactions-table">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Serviço</th>
                <th className="text-left py-3 px-4">Método</th>
                <th className="text-right py-3 px-4">Valor</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {financialData.recent_transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                financialData.recent_transactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{transaction.customer_name || 'N/A'}</td>
                    <td className="py-3 px-4">{transaction.item_name}</td>
                    <td className="py-3 px-4 capitalize">{transaction.payment_method}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={transaction.status === 'paid' ? 'default' : 'secondary'}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

