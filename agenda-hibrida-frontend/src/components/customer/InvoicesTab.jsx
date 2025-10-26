import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CreditCard, 
  Plus, 
  Check, 
  X, 
  DollarSign, 
  Calendar, 
  Filter,
  FileText,
  Mail,
  Download,
  Trash2
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
import { Label } from '../ui/label';

const InvoicesTab = ({ customerId, customerData }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, invoice: null });
  
  // Estado para nova invoice
  const [newInvoice, setNewInvoice] = useState({
    items: [{ description: '', quantity: 1, unit_price: 0 }],
    tax: 0,
    discount: 0,
    notes: '',
    due_date: '',
    status: 'draft'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar invoices do cliente
  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/api/invoices?client_id=${customerId}${
        filterStatus !== 'all' ? `&status=${filterStatus}` : ''
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar invoices');
      }
      
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error('Erro ao carregar invoices:', err);
      setError('Erro ao carregar invoices. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [customerId, filterStatus, API_URL]);

  useEffect(() => {
    if (customerId) {
      loadInvoices();
    }
  }, [customerId, loadInvoices]);

  // Calcular totais
  const calculateTotals = () => {
    const subtotal = newInvoice.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unit_price));
    }, 0);
    
    const total = subtotal + Number(newInvoice.tax) - Number(newInvoice.discount);
    
    return { subtotal, total };
  };

  // Adicionar item
  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unit_price: 0 }]
    });
  };

  // Remover item
  const removeItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items });
  };

  // Atualizar item
  const updateItem = (index, field, value) => {
    const items = [...newInvoice.items];
    items[index][field] = value;
    setNewInvoice({ ...newInvoice, items });
  };

  // Criar nova invoice
  const handleCreateInvoice = async () => {
    try {
      setError(null);
      
      // Validação básica
      if (newInvoice.items.length === 0 || !newInvoice.items[0].description) {
        setError('Adicione pelo menos um item à invoice');
        return;
      }

      const { subtotal, total } = calculateTotals();

      const invoiceData = {
        client_id: customerId,
        items: newInvoice.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          item_type: 'service'
        })),
        tax: Number(newInvoice.tax),
        discount: Number(newInvoice.discount),
        notes: newInvoice.notes,
        due_date: newInvoice.due_date || null,
        status: newInvoice.status
      };

      const response = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar invoice');
      }

      const data = await response.json();
      setSuccess(`Invoice ${data.invoice_number} criada com sucesso!`);
      
      // Reset form
      setNewInvoice({
        items: [{ description: '', quantity: 1, unit_price: 0 }],
        tax: 0,
        discount: 0,
        notes: '',
        due_date: '',
        status: 'draft'
      });
      
      // Fechar dialog e recarregar
      setCreateDialog(false);
      await loadInvoices();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao criar invoice:', err);
      setError(err.message || 'Erro ao criar invoice. Tente novamente.');
    }
  };

  // Marcar como paga
  const markAsPaid = async (invoiceId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'paid',
          paid_date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar invoice');
      }

      setSuccess('Invoice marcada como paga!');
      await loadInvoices();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao atualizar invoice:', err);
      setError('Erro ao atualizar invoice. Tente novamente.');
    }
  };

  // Deletar invoice
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar invoice');
      }

      setSuccess('Invoice anulada com sucesso!');
      await loadInvoices();
      setDeleteDialog({ open: false, invoice: null });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar invoice:', err);
      setError('Erro ao deletar invoice. Tente novamente.');
    }
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      case 'void':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Paga',
      pending: 'Pendente',
      overdue: 'Vencida',
      draft: 'Rascunho',
      void: 'Anulada',
      sent: 'Enviada'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando invoices...</p>
        </CardContent>
      </Card>
    );
  }

  const { subtotal: newInvoiceSubtotal, total: newInvoiceTotal } = calculateTotals();

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

      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Faturas e Pagamentos
            </CardTitle>
            <Button onClick={() => setCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Paga</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="void">Anulada</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Resumo rápido */}
            <div className="flex-1 flex justify-end gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Pago</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    invoices
                      .filter(inv => inv.status === 'paid')
                      .reduce((sum, inv) => sum + (inv.total || 0), 0)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Pendente</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(
                    invoices
                      .filter(inv => inv.status === 'pending')
                      .reduce((sum, inv) => sum + (inv.total || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Invoices */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma fatura encontrada</p>
            <p className="text-sm">
              {filterStatus !== 'all' 
                ? 'Nenhuma fatura com este status' 
                : 'Crie sua primeira fatura para este cliente'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{invoice.invoice_number}</h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Data</p>
                        <p className="font-medium">
                          {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {invoice.due_date && (
                        <div>
                          <p className="text-gray-500">Vencimento</p>
                          <p className="font-medium">
                            {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Subtotal</p>
                        <p className="font-medium">{formatCurrency(invoice.subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
                      </div>
                    </div>
                    
                    {invoice.notes && (
                      <p className="text-sm text-gray-600 mt-3 italic">
                        {invoice.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {invoice.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => markAsPaid(invoice.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marcar Paga
                      </Button>
                    )}
                    {invoice.status !== 'void' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, invoice })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Anular
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de criação */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Fatura</DialogTitle>
            <DialogDescription>
              Crie uma nova fatura para {customerData?.name || 'o cliente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Itens da invoice */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Itens</Label>
              {newInvoice.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Descrição do serviço/produto"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder="Preço"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    className="w-32"
                    min="0"
                    step="0.01"
                  />
                  <span className="flex items-center px-3 bg-gray-100 rounded font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                  {newInvoice.items.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {/* Ajustes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax">Taxa/Imposto</Label>
                <Input
                  id="tax"
                  type="number"
                  value={newInvoice.tax}
                  onChange={(e) => setNewInvoice({ ...newInvoice, tax: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="discount">Desconto</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newInvoice.discount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, discount: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Data de vencimento */}
            <div>
              <Label htmlFor="due_date">Data de Vencimento (opcional)</Label>
              <Input
                id="due_date"
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newInvoice.status} 
                onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(newInvoiceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa:</span>
                <span className="font-medium">{formatCurrency(newInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto:</span>
                <span className="font-medium text-red-600">-{formatCurrency(newInvoice.discount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(newInvoiceTotal)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Fatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, invoice: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anular fatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja anular a fatura {deleteDialog.invoice?.invoice_number}?
              Ela será marcada como anulada mas não será deletada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteInvoice(deleteDialog.invoice?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Anular Fatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoicesTab;
