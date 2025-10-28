import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  CreditCard,
  Gift,
  Receipt,
  PiggyBank
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FinancialTab = ({ clientId }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12months');
  const [financialHistory, setFinancialHistory] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    tips: 0,
    avgPerSession: 0,
    count: 0
  });

  useEffect(() => {
    fetchFinancialHistory();
  }, [clientId, period]);

  const fetchFinancialHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/clients/${clientId}/financial-history?period=${period}`
      );
      const result = await response.json();
      
      if (result.success) {
        const history = result.data;
        setFinancialHistory(history);
        
        // Calculate summary
        const total = history.reduce((sum, item) => sum + (item.total || 0), 0);
        const tips = history.reduce((sum, item) => sum + (item.tips || 0), 0);
        const count = history.reduce((sum, item) => sum + (item.count || 0), 0);
        
        setSummary({
          total,
          tips,
          avgPerSession: count > 0 ? total / count : 0,
          count
        });
      }
    } catch (error) {
      console.error('Erro ao buscar histórico financeiro:', error);
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

  const formatMonth = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const exportReport = () => {
    // Generate CSV
    let csv = 'Mês,Total,Gorjetas,Transações\n';
    financialHistory.forEach(item => {
      csv += `${formatMonth(item.month)},${item.total},${item.tips},${item.count}\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-cliente-${clientId}-${period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Histórico Financeiro</h2>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2" size={16} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline">
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(summary.total)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gorjetas Totais</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(summary.tips)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Gift className="text-yellow-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média por Sessão</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(summary.avgPerSession)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nº de Transações</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {summary.count}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Receipt className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="text-purple-500" />
            Histórico por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financialHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mês</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Transações</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Gorjetas</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Média</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {financialHistory.map((item, index) => {
                    const avg = item.count > 0 ? item.total / item.count : 0;
                    const tipPercentage = item.total > 0 ? (item.tips / item.total) * 100 : 0;
                    
                    return (
                      <tr 
                        key={index} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {formatMonth(item.month)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="outline">{item.count}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(item.total)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-yellow-600">
                            {formatCurrency(item.tips)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-gray-700">
                            {formatCurrency(avg)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge 
                            className={
                              tipPercentage >= 15 ? 'bg-green-100 text-green-800' :
                              tipPercentage >= 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {tipPercentage.toFixed(0)}% gorjeta
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">TOTAL</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {summary.count}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-700">
                      {formatCurrency(summary.total)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-yellow-700">
                      {formatCurrency(summary.tips)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatCurrency(summary.avgPerSession)}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <PiggyBank className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Nenhuma transação registrada neste período</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {financialHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-purple-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">Mês com Maior Gasto</p>
                <p className="text-xl font-bold text-blue-900">
                  {(() => {
                    const maxMonth = financialHistory.reduce((max, item) => 
                      item.total > max.total ? item : max, 
                      financialHistory[0]
                    );
                    return formatMonth(maxMonth.month);
                  })()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {formatCurrency(Math.max(...financialHistory.map(i => i.total)))}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 font-medium mb-1">Maior Gorjeta</p>
                <p className="text-xl font-bold text-yellow-900">
                  {(() => {
                    const maxTipMonth = financialHistory.reduce((max, item) => 
                      item.tips > max.tips ? item : max, 
                      financialHistory[0]
                    );
                    return formatMonth(maxTipMonth.month);
                  })()}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  {formatCurrency(Math.max(...financialHistory.map(i => i.tips)))}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-1">Taxa Média de Gorjeta</p>
                <p className="text-xl font-bold text-green-900">
                  {summary.total > 0 ? ((summary.tips / summary.total) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {formatCurrency(summary.tips)} em gorjetas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialTab;

