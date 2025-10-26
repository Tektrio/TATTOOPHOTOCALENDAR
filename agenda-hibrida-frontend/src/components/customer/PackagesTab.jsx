import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Package, 
  Plus, 
  Check, 
  X, 
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  History
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const PackagesTab = ({ customerId, customerData }) => {
  const [packages, setPackages] = useState([]);
  const [packageTypes, setPackageTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [useDialog, setUseDialog] = useState({ open: false, package: null });
  const [historyDialog, setHistoryDialog] = useState({ open: false, package: null, history: [] });
  
  // Estado para novo pacote
  const [newPackage, setNewPackage] = useState({
    package_type_id: '',
    name: '',
    sessions_count: 1,
    price: 0,
    discount: 0,
    valid_until: '',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar pacotes e tipos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [packagesRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/api/customers/${customerId}/packages`),
        fetch(`${API_URL}/api/packages/types`)
      ]);
      
      if (!packagesRes.ok || !typesRes.ok) {
        throw new Error('Erro ao carregar dados');
      }
      
      const [packagesData, typesData] = await Promise.all([
        packagesRes.json(),
        typesRes.json()
      ]);
      
      setPackages(packagesData);
      setPackageTypes(typesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar pacotes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [customerId, API_URL]);

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId, loadData]);

  // Criar novo pacote
  const handleCreatePackage = async () => {
    try {
      setError(null);
      
      if (!newPackage.name || !newPackage.sessions_count || !newPackage.price) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      const finalPrice = Number(newPackage.price) - Number(newPackage.discount);

      const packageData = {
        client_id: customerId,
        package_type_id: newPackage.package_type_id || null,
        name: newPackage.name,
        sessions_count: Number(newPackage.sessions_count),
        price: Number(newPackage.price),
        discount: Number(newPackage.discount),
        final_price: finalPrice,
        valid_until: newPackage.valid_until || null,
        notes: newPackage.notes
      };

      const response = await fetch(`${API_URL}/api/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pacote');
      }

      setSuccess('Pacote criado com sucesso!');
      
      // Reset form
      setNewPackage({
        package_type_id: '',
        name: '',
        sessions_count: 1,
        price: 0,
        discount: 0,
        valid_until: '',
        notes: ''
      });
      
      setCreateDialog(false);
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao criar pacote:', err);
      setError(err.message || 'Erro ao criar pacote. Tente novamente.');
    }
  };

  // Usar sessão
  const handleUseSession = async (packageId, notes = '') => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/packages/${packageId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao usar sessão');
      }

      const data = await response.json();
      setSuccess(`Sessão usada! Restam ${data.sessions_remaining} sessões.`);
      
      setUseDialog({ open: false, package: null });
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao usar sessão:', err);
      setError(err.message || 'Erro ao usar sessão. Tente novamente.');
    }
  };

  // Carregar histórico
  const loadHistory = async (packageId) => {
    try {
      const response = await fetch(`${API_URL}/api/packages/${packageId}/history`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      return [];
    }
  };

  // Abrir histórico
  const openHistory = async (pkg) => {
    const history = await loadHistory(pkg.id);
    setHistoryDialog({ open: true, package: pkg, history });
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Calcular progresso
  const getProgress = (sessionsUsed, sessionsTotal) => {
    return Math.round((sessionsUsed / sessionsTotal) * 100);
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ativo',
      completed: 'Concluído',
      expired: 'Expirado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pacotes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pacotes de Sessões
            </CardTitle>
            <Button onClick={() => setCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pacote
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Pacotes */}
      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum pacote encontrado</p>
            <p className="text-sm">Crie um pacote de sessões para este cliente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const progress = getProgress(pkg.sessions_used, pkg.sessions_count);
            const isExpired = pkg.valid_until && new Date(pkg.valid_until) < new Date();
            
            return (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">
                        {pkg.package_type_name || 'Pacote Personalizado'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(pkg.status)}>
                      {getStatusLabel(pkg.status)}
                    </Badge>
                  </div>

                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Sessões Usadas</span>
                      <span className="font-bold">
                        {pkg.sessions_used} / {pkg.sessions_count}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {pkg.sessions_count - pkg.sessions_used} sessões restantes
                    </p>
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Valor Pago</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(pkg.final_price)}
                      </p>
                    </div>
                    {pkg.valid_until && (
                      <div>
                        <p className="text-gray-500">Válido até</p>
                        <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                          {new Date(pkg.valid_until).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {pkg.notes && (
                    <p className="text-sm text-gray-600 italic mb-4 p-2 bg-gray-50 rounded">
                      {pkg.notes}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    {pkg.status === 'active' && pkg.sessions_used < pkg.sessions_count && !isExpired && (
                      <Button
                        size="sm"
                        onClick={() => setUseDialog({ open: true, package: pkg })}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Usar Sessão
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openHistory(pkg)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de criação */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Pacote de Sessões</DialogTitle>
            <DialogDescription>
              Crie um pacote de sessões para {customerData?.name || 'o cliente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tipo de pacote (opcional) */}
            <div>
              <Label htmlFor="package_type">Tipo de Pacote (opcional)</Label>
              <Select 
                value={newPackage.package_type_id} 
                onValueChange={(value) => {
                  const type = packageTypes.find(t => t.id.toString() === value);
                  setNewPackage({ 
                    ...newPackage, 
                    package_type_id: value,
                    name: type?.name || newPackage.name,
                    sessions_count: type?.sessions_count || newPackage.sessions_count,
                    price: type?.price || newPackage.price
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} - {type.sessions_count} sessões - {formatCurrency(type.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome do Pacote *</Label>
              <Input
                id="name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                placeholder="Ex: Pacote 5 Sessões"
              />
            </div>

            {/* Quantidade de sessões */}
            <div>
              <Label htmlFor="sessions_count">Quantidade de Sessões *</Label>
              <Input
                id="sessions_count"
                type="number"
                value={newPackage.sessions_count}
                onChange={(e) => setNewPackage({ ...newPackage, sessions_count: e.target.value })}
                min="1"
              />
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço Total *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="discount">Desconto</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newPackage.discount}
                  onChange={(e) => setNewPackage({ ...newPackage, discount: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Validade */}
            <div>
              <Label htmlFor="valid_until">Válido até (opcional)</Label>
              <Input
                id="valid_until"
                type="date"
                value={newPackage.valid_until}
                onChange={(e) => setNewPackage({ ...newPackage, valid_until: e.target.value })}
              />
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={newPackage.notes}
                onChange={(e) => setNewPackage({ ...newPackage, notes: e.target.value })}
                placeholder="Observações sobre o pacote..."
                rows={3}
              />
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Final:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(newPackage.price) - Number(newPackage.discount))}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency((Number(newPackage.price) - Number(newPackage.discount)) / Number(newPackage.sessions_count || 1))} por sessão
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePackage}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Pacote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de usar sessão */}
      <AlertDialog open={useDialog.open} onOpenChange={(open) => setUseDialog({ open, package: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usar Sessão</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma o uso de uma sessão do pacote "{useDialog.package?.name}"?
              <br />
              <strong>Sessões restantes após uso: {(useDialog.package?.sessions_count || 0) - (useDialog.package?.sessions_used || 0) - 1}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleUseSession(useDialog.package?.id)}
            >
              Confirmar Uso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de histórico */}
      <Dialog open={historyDialog.open} onOpenChange={(open) => setHistoryDialog({ open, package: null, history: [] })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Uso</DialogTitle>
            <DialogDescription>
              Pacote: {historyDialog.package?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {historyDialog.history.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma sessão foi usada ainda
              </p>
            ) : (
              historyDialog.history.map((entry, index) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Sessão #{index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.used_at).toLocaleString('pt-BR')}
                      </p>
                      {entry.appointment_title && (
                        <p className="text-sm text-gray-500 mt-1">
                          Agendamento: {entry.appointment_title}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm italic mt-2">{entry.notes}</p>
                      )}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackagesTab;
