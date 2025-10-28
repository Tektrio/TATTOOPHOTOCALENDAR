/**
 * Componente de Estatísticas de Importação Vagaro
 * Mostra dashboard com estatísticas gerais
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  Gift,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VagaroStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/imports/vagaro/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Carregando estatísticas...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  return (
    <div className="space-y-6" data-testid="vagaro-stats">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Estatísticas do Vagaro</h2>
        <p className="text-gray-500">
          Visão geral dos dados importados do sistema Vagaro
        </p>
      </div>

      {/* Clientes */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Clientes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Clientes"
            value={formatNumber(stats.clients?.total)}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            label="Do Vagaro"
            value={formatNumber(stats.clients?.from_vagaro)}
            icon={Users}
            color="bg-indigo-500"
          />
          <StatCard
            label="Total Pago"
            value={formatMoney(stats.clients?.total_paid)}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            label="Média de Agendamentos"
            value={(stats.clients?.avg_appointments || 0).toFixed(1)}
            icon={Calendar}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Transações */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Transações Financeiras
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Transações"
            value={formatNumber(stats.transactions?.total)}
            icon={FileText}
            color="bg-green-500"
          />
          <StatCard
            label="Valor Bruto"
            value={formatMoney(stats.transactions?.total_gross)}
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            label="Valor Líquido"
            value={formatMoney(stats.transactions?.total_net)}
            icon={DollarSign}
            color="bg-teal-500"
          />
          <StatCard
            label="Total de Taxas"
            value={formatMoney(stats.transactions?.total_fees)}
            icon={AlertCircle}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Serviços */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          Serviços
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total de Serviços"
            value={formatNumber(stats.services?.total_services)}
            icon={Briefcase}
            color="bg-purple-500"
          />
          <StatCard
            label="Total de Agendamentos"
            value={formatNumber(stats.services?.total_appointments)}
            icon={Calendar}
            color="bg-indigo-500"
          />
          <StatCard
            label="Receita Total"
            value={formatMoney(stats.services?.total_revenue)}
            icon={TrendingUp}
            color="bg-violet-500"
          />
        </div>
      </div>

      {/* Gift Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-600" />
          Gift Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total de Gift Cards"
            value={formatNumber(stats.gift_cards?.total)}
            icon={Gift}
            color="bg-pink-500"
          />
          <StatCard
            label="Ativos"
            value={formatNumber(stats.gift_cards?.active)}
            icon={Gift}
            color="bg-rose-500"
          />
          <StatCard
            label="Saldo Total"
            value={formatMoney(stats.gift_cards?.total_balance)}
            icon={DollarSign}
            color="bg-fuchsia-500"
          />
        </div>
      </div>

      {/* Formulários */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          Formulários
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total de Formulários"
            value={formatNumber(stats.forms?.total)}
            icon={FileText}
            color="bg-orange-500"
          />
          <StatCard
            label="Não Assinados"
            value={formatNumber(stats.forms?.unsigned)}
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatCard
            label="Assinados"
            value={formatNumber(stats.forms?.signed)}
            icon={FileText}
            color="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar de Card de Estatística
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-xl font-bold truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

