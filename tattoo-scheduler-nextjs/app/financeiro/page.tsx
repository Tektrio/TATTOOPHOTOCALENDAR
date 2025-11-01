'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  Gift,
  Users,
  Package
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function FinanceiroPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/financial/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
        <p className="mt-4">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center">
          <DollarSign className="w-8 h-8 mr-3" />
          Dashboard Financeiro
        </h2>
        <p className="text-gray-400 mt-1">Visão geral das finanças do estúdio</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Receita Total</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </h3>
                <div className="flex items-center mt-2 text-white/90 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12% vs mês anterior</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Receita do Mês</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  R$ {stats.monthRevenue.toLocaleString('pt-BR')}
                </h3>
                <div className="flex items-center mt-2 text-white/90 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Novembro 2025</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pagamentos Pendentes</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  R$ {stats.pendingPayments.toLocaleString('pt-BR')}
                </h3>
                <div className="flex items-center mt-2 text-white/90 text-xs">
                  <CreditCard className="w-3 h-3 mr-1" />
                  <span>Aguardando</span>
                </div>
              </div>
              <Receipt className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pagamentos Recebidos</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  R$ {stats.completedPayments.toLocaleString('pt-BR')}
                </h3>
                <div className="flex items-center mt-2 text-white/90 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>Este mês</span>
                </div>
              </div>
              <CreditCard className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-0">
          <Tabs defaultValue="invoices">
            <TabsList className="w-full justify-start border-b border-white/10 bg-transparent p-0">
              <TabsTrigger 
                value="invoices"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Faturas
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger 
                value="giftcards"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Gift className="w-4 h-4 mr-2" />
                Gift Cards
              </TabsTrigger>
              <TabsTrigger 
                value="memberships"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Users className="w-4 h-4 mr-2" />
                Assinaturas
              </TabsTrigger>
              <TabsTrigger 
                value="packages"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Package className="w-4 h-4 mr-2" />
                Pacotes
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="invoices" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Faturas Recentes</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Nova Fatura
                    </Button>
                  </div>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white">Nenhuma fatura encontrada</p>
                      <p className="text-gray-400 text-sm mt-1">Crie sua primeira fatura</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Pagamentos Recentes</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Registrar Pagamento
                    </Button>
                  </div>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white">Nenhum pagamento registrado</p>
                      <p className="text-gray-400 text-sm mt-1">Registre o primeiro pagamento</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="giftcards" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Gift Cards Ativos</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Novo Gift Card
                    </Button>
                  </div>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white">Nenhum gift card ativo</p>
                      <p className="text-gray-400 text-sm mt-1">Crie o primeiro gift card</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="memberships" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Assinaturas Ativas</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Nova Assinatura
                    </Button>
                  </div>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white">Nenhuma assinatura ativa</p>
                      <p className="text-gray-400 text-sm mt-1">Crie o primeiro plano de assinatura</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="packages" className="mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Pacotes Disponíveis</h3>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Novo Pacote
                    </Button>
                  </div>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white">Nenhum pacote cadastrado</p>
                      <p className="text-gray-400 text-sm mt-1">Crie o primeiro pacote de serviços</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

