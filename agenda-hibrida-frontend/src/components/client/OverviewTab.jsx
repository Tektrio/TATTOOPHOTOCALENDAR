import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Award, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Target
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const OverviewTab = ({ clientId, client }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [financialHistory, setFinancialHistory] = useState([]);
  const [frequentServices, setFrequentServices] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        // Executa todas as chamadas em paralelo e aguarda todas terminarem
        await Promise.all([
          fetchMetrics(),
          fetchFinancialHistory(),
          fetchFrequentServices()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        // Define loading como false apenas quando TODAS as chamadas terminarem
        setLoading(false);
      }
    };

    loadAllData();
  }, [clientId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/clients/${clientId}/metrics`);
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw error; // Re-throw para que Promise.all detecte o erro
    }
  };

  const fetchFinancialHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/clients/${clientId}/financial-history?period=12months`);
      const result = await response.json();
      if (result.success) {
        setFinancialHistory(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico financeiro:', error);
      throw error; // Re-throw para que Promise.all detecte o erro
    }
  };

  const fetchFrequentServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/clients/${clientId}/frequent-services?limit=5`);
      const result = await response.json();
      if (result.success) {
        setFrequentServices(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar serviços frequentes:', error);
      throw error; // Re-throw para que Promise.all detecte o erro
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getVIPBadge = (vipStatus) => {
    if (!vipStatus) return null;
    
    const colors = {
      platinum: 'bg-purple-100 text-purple-800 border-purple-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      bronze: 'bg-orange-100 text-orange-800 border-orange-300'
    };

    return (
      <Badge className={`text-lg px-4 py-2 ${colors[vipStatus.level]}`}>
        <span className="mr-2">{vipStatus.icon}</span>
        {vipStatus.label}
      </Badge>
    );
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
      {/* Header com VIP Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{client?.name}</h2>
          <p className="text-gray-600 mt-1">{client?.email} • {client?.phone}</p>
        </div>
        {metrics?.vip_status && getVIPBadge(metrics.vip_status)}
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investido</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(metrics?.total_spent)}
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
                <p className="text-sm text-gray-600">Sessões Realizadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics?.total_sessions || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
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
                  {formatCurrency(metrics?.total_tips)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="text-yellow-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Cancelamento</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics?.cancellation_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                (metrics?.cancellation_rate || 0) < 10 ? 'bg-green-100' : 
                (metrics?.cancellation_rate || 0) < 20 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <AlertCircle className={
                  (metrics?.cancellation_rate || 0) < 10 ? 'text-green-600' : 
                  (metrics?.cancellation_rate || 0) < 20 ? 'text-yellow-600' : 'text-red-600'
                } size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-purple-500" />
                Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projetos Ativos</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {metrics?.active_projects || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projetos Concluídos</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {metrics?.completed_projects || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-purple-500" />
                Informações de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Duração Média</p>
                  <p className="text-lg font-bold text-gray-900">
                    {metrics?.avg_session_duration?.toFixed(0) || 0} minutos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Frequência de Visitas</p>
                  <p className="text-lg font-bold text-gray-900">
                    {metrics?.visit_frequency_days ? 
                      `A cada ${metrics.visit_frequency_days.toFixed(0)} dias` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Visita</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatDate(metrics?.last_visit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-purple-500" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documentos Pendentes</span>
                <Badge variant={metrics?.pending_documents > 0 ? "destructive" : "default"}>
                  {metrics?.pending_documents || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Próximo Agendamento */}
          {metrics?.next_appointment && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Calendar className="text-green-600" />
                  Próximo Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-green-900">
                    {formatDate(metrics.next_appointment.appointment_date)}
                  </p>
                  <p className="text-gray-700">
                    {metrics.next_appointment.service_name || 'Serviço não especificado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Serviços Mais Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-purple-500" />
                Serviços Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {frequentServices.length > 0 ? (
                <div className="space-y-3">
                  {frequentServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{service.service_name}</p>
                        <p className="text-sm text-gray-600">
                          {service.count}x - {formatCurrency(service.total_spent)}
                        </p>
                      </div>
                      <Badge variant="outline">{service.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum serviço registrado ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Histórico Financeiro (últimos meses) */}
          {financialHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="text-purple-500" />
                  Últimos Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {financialHistory.slice(-3).map((month, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(month.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

