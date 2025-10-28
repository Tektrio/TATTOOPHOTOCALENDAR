/**
 * Gerenciador de Contas Google
 * Interface para adicionar, gerenciar e sincronizar múltiplas contas Google Drive/Calendar
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Plus, 
  Trash2, 
  Star, 
  StarOff, 
  RefreshCw, 
  Loader2,
  Check,
  X,
  Calendar,
  Cloud,
  HardDrive
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLORS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC05', // Google Yellow
  '#EA4335', // Google Red
  '#9333EA', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
];

export default function GoogleAccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state para nova conta
  const [formData, setFormData] = useState({
    account_name: '',
    account_email: '',
    account_type: 'both',
    color_code: COLORS[0]
  });

  // Carregar contas ao montar
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/google/accounts`);
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        throw new Error(data.message || 'Erro ao carregar contas');
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Não foi possível carregar as contas Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações
    if (!formData.account_name || !formData.account_email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.account_email)) {
      setError('Email inválido');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/google/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Conta adicionada com sucesso!');
        setShowAddDialog(false);
        setFormData({
          account_name: '',
          account_email: '',
          account_type: 'both',
          color_code: COLORS[0]
        });
        loadAccounts();
      } else {
        throw new Error(data.message || 'Erro ao adicionar conta');
      }
    } catch (err) {
      console.error('Erro ao adicionar conta:', err);
      setError(err.message || 'Não foi possível adicionar a conta');
    }
  };

  const handleSetPrimary = async (accountId) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/google/accounts/${accountId}/set-primary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Conta primária alterada com sucesso!');
        loadAccounts();
      } else {
        throw new Error(data.message || 'Erro ao definir conta primária');
      }
    } catch (err) {
      console.error('Erro ao definir conta primária:', err);
      setError(err.message || 'Não foi possível definir conta primária');
    }
  };

  const handleToggleActive = async (accountId, currentStatus) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/google/accounts/${accountId}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Conta ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`);
        loadAccounts();
      } else {
        throw new Error(data.message || 'Erro ao alterar status da conta');
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setError(err.message || 'Não foi possível alterar o status');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Tem certeza que deseja remover esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/google/accounts/${accountId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Conta removida com sucesso!');
        loadAccounts();
      } else {
        throw new Error(data.message || 'Erro ao remover conta');
      }
    } catch (err) {
      console.error('Erro ao remover conta:', err);
      setError(err.message || 'Não foi possível remover a conta');
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/google/accounts/sync-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        loadAccounts();
      } else {
        throw new Error(data.message || 'Erro ao sincronizar contas');
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
      setError(err.message || 'Não foi possível sincronizar as contas');
    } finally {
      setSyncing(false);
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'drive':
        return <HardDrive className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'both':
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'drive':
        return 'Drive';
      case 'calendar':
        return 'Calendar';
      case 'both':
      default:
        return 'Drive + Calendar';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Carregando contas...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="google-account-manager">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contas Google</h2>
          <p className="text-sm text-gray-500">
            Gerencie múltiplas contas Google Drive e Calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncAll}
            disabled={syncing || accounts.length === 0}
            variant="outline"
            data-testid="btn-sync-all-accounts"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Todas
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            data-testid="btn-add-account"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conta
          </Button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-700">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Lista de contas */}
      <div className="grid gap-4">
        {accounts.length === 0 ? (
          <Card className="p-8 text-center">
            <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta configurada</h3>
            <p className="text-gray-500 mb-4">
              Adicione sua primeira conta Google para começar
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Conta
            </Button>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card 
              key={account.id} 
              className={`p-6 ${!account.is_active ? 'opacity-50' : ''}`}
              data-testid={`account-card-${account.id}`}
            >
              <div className="flex items-start justify-between">
                {/* Info da conta */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Indicador de cor */}
                  <div
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: account.color_code }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{account.account_name}</h3>
                      {account.is_primary && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                          Primária
                        </Badge>
                      )}
                      {!account.is_active && (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{account.account_email}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {getAccountTypeIcon(account.account_type)}
                        <span>{getAccountTypeLabel(account.account_type)}</span>
                      </div>

                      {account.stats && (
                        <>
                          <span>•</span>
                          <span>{account.stats.total_files || 0} arquivos</span>
                          {account.stats.calendars > 0 && (
                            <>
                              <span>•</span>
                              <span>{account.stats.calendars} calendários</span>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {account.stats?.last_file_sync && (
                      <p className="text-xs text-gray-400 mt-2">
                        Última sincronização: {new Date(account.stats.last_file_sync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  {!account.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(account.id)}
                      title="Definir como primária"
                      data-testid={`btn-set-primary-${account.id}`}
                    >
                      <StarOff className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(account.id, account.is_active)}
                    title={account.is_active ? 'Desativar' : 'Ativar'}
                    data-testid={`btn-toggle-active-${account.id}`}
                  >
                    {account.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remover conta"
                    data-testid={`btn-delete-${account.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para adicionar conta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent data-testid="dialog-add-account">
          <DialogHeader>
            <DialogTitle>Adicionar Conta Google</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAccount} className="space-y-4">
            <div>
              <Label htmlFor="account_name">Nome da Conta *</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Ex: Conta Pessoal, Conta Trabalho"
                required
                data-testid="input-account-name"
              />
            </div>

            <div>
              <Label htmlFor="account_email">Email *</Label>
              <Input
                id="account_email"
                type="email"
                value={formData.account_email}
                onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                placeholder="email@gmail.com"
                required
                data-testid="input-account-email"
              />
            </div>

            <div>
              <Label htmlFor="account_type">Tipo de Conta</Label>
              <select
                id="account_type"
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                data-testid="select-account-type"
              >
                <option value="both">Drive + Calendar</option>
                <option value="drive">Apenas Drive</option>
                <option value="calendar">Apenas Calendar</option>
              </select>
            </div>

            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color_code: color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color_code === color ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="btn-confirm-add-account">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

