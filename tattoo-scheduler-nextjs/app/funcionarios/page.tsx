'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Edit, Trash2, Calendar, DollarSign, Mail, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Employee {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone: string;
  avatar_url?: string;
  hourly_rate?: number;
  commission_rate?: number;
  status: 'ativo' | 'inativo';
  hire_date?: string;
}

export default function FuncionariosPage() {
  const { isDark } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    hourly_rate: 0,
    commission_rate: 0,
    status: 'ativo' as const
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.phone.trim()) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });

      if (response.ok) {
        toast.success('✅ Funcionário cadastrado com sucesso!');
        setShowNewEmployee(false);
        setNewEmployee({
          name: '',
          role: '',
          email: '',
          phone: '',
          hourly_rate: 0,
          commission_rate: 0,
          status: 'ativo'
        });
        loadEmployees();
      } else {
        toast.error('❌ Erro ao cadastrar funcionário');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const deleteEmployee = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ Funcionário excluído com sucesso!');
        loadEmployees();
      } else {
        toast.error('❌ Erro ao excluir funcionário');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Funcionários
          </h2>
          <p className="text-gray-400 mt-1">{employees.length} funcionários cadastrados</p>
        </div>
        <Dialog open={showNewEmployee} onOpenChange={setShowNewEmployee}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">Novo Funcionário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os dados do novo funcionário
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    placeholder="João Silva"
                    className="bg-gray-800 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-white">Cargo</Label>
                  <Input
                    id="role"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    placeholder="Tatuador, Recepcionista, etc."
                    className="bg-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone *</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-800 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    placeholder="joao@email.com"
                    className="bg-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate" className="text-white">Taxa por Hora (R$)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={newEmployee.hourly_rate}
                    onChange={(e) => setNewEmployee({...newEmployee, hourly_rate: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    className="bg-gray-800 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="commission_rate" className="text-white">Comissão (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={newEmployee.commission_rate}
                    onChange={(e) => setNewEmployee({...newEmployee, commission_rate: parseFloat(e.target.value)})}
                    placeholder="0"
                    className="bg-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={createEmployee} className="flex-1 bg-purple-500 hover:bg-purple-600">
                  Cadastrar Funcionário
                </Button>
                <Button variant="outline" onClick={() => setShowNewEmployee(false)} className="border-gray-600 text-gray-300">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Funcionários */}
      {loading ? (
        <div className="text-center text-white py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4">Carregando...</p>
        </div>
      ) : employees.length === 0 ? (
        <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Nenhum funcionário cadastrado</h3>
            <p className="text-purple-200">Comece cadastrando seu primeiro funcionário</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className={`backdrop-blur-md transition-all hover:scale-105 ${
              isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.avatar_url} alt={employee.name} />
                      <AvatarFallback className="bg-purple-500 text-white">
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-lg">{employee.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{employee.role || 'Sem cargo'}</p>
                    </div>
                  </div>
                  <Badge className={employee.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'}>
                    {employee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.phone && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {employee.phone}
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email}
                  </div>
                )}

                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {employee.hourly_rate && (
                      <div>
                        <p className="text-gray-400">Taxa/Hora</p>
                        <p className="text-white font-semibold">R$ {employee.hourly_rate.toFixed(2)}</p>
                      </div>
                    )}
                    {employee.commission_rate && (
                      <div>
                        <p className="text-gray-400">Comissão</p>
                        <p className="text-white font-semibold">{employee.commission_rate}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {employee.hire_date && (
                  <div className="flex items-center text-gray-400 text-xs mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Desde {new Date(employee.hire_date).toLocaleDateString('pt-BR')}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

