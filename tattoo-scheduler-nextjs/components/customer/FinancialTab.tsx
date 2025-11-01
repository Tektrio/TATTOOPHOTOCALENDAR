'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, CreditCard, TrendingUp } from 'lucide-react';

interface Payment {
  id: number;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  payment_date: string;
  description: string;
}

export default function FinancialTab({ customerId }: { customerId: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancial();
  }, [customerId]);

  const loadFinancial = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Payment[]) => {
    const total = data.reduce((sum, p) => sum + p.amount, 0);
    const paid = data.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.amount, 0);
    const pending = total - paid;
    setStats({ total, pending, paid });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando dados financeiros...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Pago</p>
                <p className="text-2xl font-bold">R$ {stats.paid.toFixed(2)}</p>
              </div>
              <CreditCard className="w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Pendente</p>
                <p className="text-2xl font-bold">R$ {stats.pending.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Geral</p>
                <p className="text-2xl font-bold">R$ {stats.total.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Histórico de Pagamentos</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white">Nenhum pagamento registrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{payment.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-white font-bold">R$ {payment.amount.toFixed(2)}</p>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

