/**
 * Página de Gestão de Funcionários
 * CRUD completo, estatísticas e performance tracking
 */

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone,
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ROLES = [
  { value: 'artist', label: 'Artista/Tatuador' },
  { value: 'piercer', label: 'Piercer' },
  { value: 'receptionist', label: 'Recepcionista' },
  { value: 'manager', label: 'Gerente' },
  { value: 'owner', label: 'Proprietário' }
];

const EMPLOYMENT_STATUS = [
  { value: 'active', label: 'Ativo', color: 'bg-green-500' },
  { value: 'inactive', label: 'Inativo', color: 'bg-gray-400' },
  { value: 'on_leave', label: 'De Licença', color: 'bg-yellow-500' },
  { value: 'terminated', label: 'Desligado', color: 'bg-red-500' }
];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [showDialog, setShowDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_email: '',
    employee_phone: '',
    role: 'artist',
    employment_status: 'active',
    commission_rate: 30,
    hourly_rate: 0,
    salary: 0,
    hire_date: '',
    calendar_color: '#4285F4',
    specialties: []
  });

  useEffect(() => {
    try {
      loadEmployees();
    } catch (error) {
      console.error('Erro ao inicializar Employees:', error);
      setError('Erro ao inicializar página de funcionários');
    }
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        throw new Error(data.message || 'Erro ao carregar funcionários');
      }
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setError('Não foi possível carregar os funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingEmployee
        ? `${API_URL}/api/employees/${editingEmployee.id}`
        : `${API_URL}/api/employees`;
      
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingEmployee ? 'Funcionário atualizado!' : 'Funcionário adicionado!');
        setShowDialog(false);
        resetForm();
        loadEmployees();
      } else {
        throw new Error(data.message || 'Erro ao salvar funcionário');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Não foi possível salvar o funcionário');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Funcionário removido com sucesso!');
        loadEmployees();
      } else {
        throw new Error(data.message || 'Erro ao remover funcionário');
      }
    } catch (err) {
      console.error('Erro ao remover:', err);
      setError(err.message || 'Não foi possível remover o funcionário');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_name: employee.employee_name,
      employee_email: employee.employee_email || '',
      employee_phone: employee.employee_phone || '',
      role: employee.role || 'artist',
      employment_status: employee.employment_status || 'active',
      commission_rate: employee.commission_rate || 30,
      hourly_rate: employee.hourly_rate || 0,
      salary: employee.salary || 0,
      hire_date: employee.hire_date || '',
      calendar_color: employee.calendar_color || '#4285F4',
      specialties: employee.specialties ? JSON.parse(employee.specialties) : []
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      employee_name: '',
      employee_email: '',
      employee_phone: '',
      role: 'artist',
      employment_status: 'active',
      commission_rate: 30,
      hourly_rate: 0,
      salary: 0,
      hire_date: '',
      calendar_color: '#4285F4',
      specialties: []
    });
  };

  const getStatusBadge = (status) => {
    const config = EMPLOYMENT_STATUS.find(s => s.value === status) || EMPLOYMENT_STATUS[0];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRoleLabel = (role) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Filtrar funcionários
  const filteredEmployees = (employees || []).filter(employee => {
    const matchesSearch = employee.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.employee_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = filterStatus === 'all' || employee.employment_status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: (employees || []).length,
    active: (employees || []).filter(e => e.employment_status === 'active').length,
    totalRevenue: (employees || []).reduce((sum, e) => sum + (e.total_revenue || 0), 0),
    avgRating: (employees || []).reduce((sum, e) => sum + (e.average_rating || 0), 0) / ((employees || []).length || 1)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="employees-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Funcionários</h1>
            <p className="text-gray-500">Gerencie sua equipe e acompanhe performance</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowDialog(true);
          }} data-testid="btn-add-employee">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Funcionário
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ativos</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Receita Total</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avaliação Média</p>
                <p className="text-xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filtros e Busca */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou email..."
                className="pl-10"
                data-testid="input-search-employees"
              />
            </div>
          </div>

          <div>
            <Label>Função</Label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              data-testid="select-filter-role"
            >
              <option value="all">Todas</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              data-testid="select-filter-status"
            >
              <option value="all">Todos</option>
              {EMPLOYMENT_STATUS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Funcionários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <Card className="p-8 text-center col-span-full">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhum funcionário encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Adicione seu primeiro funcionário para começar'}
            </p>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6" data-testid={`employee-card-${employee.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: employee.calendar_color }}
                  >
                    {employee.employee_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{employee.employee_name}</h3>
                    <p className="text-sm text-gray-500">{getRoleLabel(employee.role)}</p>
                  </div>
                </div>
                {getStatusBadge(employee.employment_status)}
              </div>

              <div className="space-y-2 mb-4">
                {employee.employee_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{employee.employee_email}</span>
                  </div>
                )}
                {employee.employee_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{employee.employee_phone}</span>
                  </div>
                )}
                {employee.hire_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Desde {new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Estatísticas do Funcionário */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Comissão</p>
                  <p className="font-semibold">{employee.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Serviços</p>
                  <p className="font-semibold">{employee.total_services || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Receita</p>
                  <p className="font-semibold">{formatCurrency(employee.total_revenue || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avaliação</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {(employee.average_rating || 0).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(employee)}
                  className="flex-1"
                  data-testid={`btn-edit-${employee.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`btn-delete-${employee.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Adicionar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-employee-form">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_name">Nome *</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  required
                  data-testid="input-employee-name"
                />
              </div>

              <div>
                <Label htmlFor="employee_email">Email</Label>
                <Input
                  id="employee_email"
                  type="email"
                  value={formData.employee_email}
                  onChange={(e) => setFormData({ ...formData, employee_email: e.target.value })}
                  data-testid="input-employee-email"
                />
              </div>

              <div>
                <Label htmlFor="employee_phone">Telefone</Label>
                <Input
                  id="employee_phone"
                  value={formData.employee_phone}
                  onChange={(e) => setFormData({ ...formData, employee_phone: e.target.value })}
                  data-testid="input-employee-phone"
                />
              </div>

              <div>
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  data-testid="select-employee-role"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="employment_status">Status</Label>
                <select
                  id="employment_status"
                  value={formData.employment_status}
                  onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  data-testid="select-employment-status"
                >
                  {EMPLOYMENT_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="commission_rate">Comissão (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                  data-testid="input-commission-rate"
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate">Valor/Hora (R$)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                  data-testid="input-hourly-rate"
                />
              </div>

              <div>
                <Label htmlFor="hire_date">Data de Contratação</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  data-testid="input-hire-date"
                />
              </div>

              <div>
                <Label htmlFor="calendar_color">Cor no Calendário</Label>
                <Input
                  id="calendar_color"
                  type="color"
                  value={formData.calendar_color}
                  onChange={(e) => setFormData({ ...formData, calendar_color: e.target.value })}
                  data-testid="input-calendar-color"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="btn-save-employee">
                {editingEmployee ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

