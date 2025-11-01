'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Mail,
  Calendar,
  HardDrive,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  scopes: string[];
  connected At: Date;
  lastSync: Date;
}

export default function GoogleAccountsPage() {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([
    {
      id: '1',
      email: 'studio@example.com',
      name: 'Studio Principal',
      isActive: true,
      scopes: ['calendar', 'drive'],
      connectedAt: new Date('2025-01-15'),
      lastSync: new Date()
    }
  ]);

  const handleConnectAccount = () => {
    // TODO: Abrir popup do Google OAuth
    toast.info('Google OAuth será implementado em breve');
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId));
    toast.success('Conta desconectada');
  };

  const handleSync = (accountId: string) => {
    toast.success('Sincronização iniciada');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contas Google
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie múltiplas contas do Google
            </p>
          </div>
          <Button
            onClick={handleConnectAccount}
            className="bg-gradient-to-r from-blue-600 to-purple-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Conectar Nova Conta
          </Button>
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Por que múltiplas contas?</strong>
              <p className="mt-1">
                Você pode conectar diferentes contas do Google para separar calendários pessoais e profissionais,
                ou para gerenciar vários estúdios com uma única instalação do sistema.
              </p>
            </div>
          </div>
        </Card>

        {/* Lista de Contas */}
        <div className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {account.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {account.name}
                      </h3>
                      {account.isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{account.email}</span>
                    </div>

                    {/* Escopos */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {account.scopes.includes('calendar') && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          Calendar
                        </Badge>
                      )}
                      {account.scopes.includes('drive') && (
                        <Badge variant="outline" className="gap-1">
                          <HardDrive className="w-3 h-3" />
                          Drive
                        </Badge>
                      )}
                      {account.scopes.includes('gmail') && (
                        <Badge variant="outline" className="gap-1">
                          <Mail className="w-3 h-3" />
                          Gmail
                        </Badge>
                      )}
                    </div>

                    {/* Info adicional */}
                    <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <div>
                        Conectada em: {new Date(account.connectedAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        Última sincronização: {new Date(account.lastSync).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(account.id)}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Sincronizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Desconectar
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {accounts.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma conta conectada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Conecte uma conta do Google para começar a sincronizar
              </p>
              <Button
                onClick={handleConnectAccount}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Conectar Primeira Conta
              </Button>
            </Card>
          )}
        </div>

        {/* Recursos por Serviço */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Google Calendar</h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Sincronização bidirecional
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Múltiplos calendários
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Lembretes automáticos
              </li>
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Google Drive</h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Backup automático
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Armazenamento ilimitado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Compartilhamento fácil
              </li>
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Gmail (em breve)</h3>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Envio automático de emails
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Templates personalizados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Histórico de comunicação
              </li>
            </ul>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-gray-900 dark:text-white">
                Quantas contas posso conectar?
              </strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Não há limite! Você pode conectar quantas contas do Google precisar.
              </p>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Os dados são seguros?
              </strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Sim! Usamos OAuth 2.0 do Google e apenas solicitamos as permissões necessárias.
                Seus tokens são criptografados e armazenados com segurança.
              </p>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">
                Como funciona a sincronização?
              </strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                A sincronização é automática e bidirecional. Mudanças feitas aqui aparecem no Google
                e vice-versa. Você também pode sincronizar manualmente a qualquer momento.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

