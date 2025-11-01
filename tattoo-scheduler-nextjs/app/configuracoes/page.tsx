'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Bell,
  Globe,
  Database,
  Cloud,
  Mail,
  Shield,
  Palette,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    studio_name: '',
    email: '',
    phone: '',
    address: '',
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    auto_sync_enabled: true,
    sync_interval: 24,
    backup_enabled: true,
    google_calendar_sync: true
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('✅ Configurações salvas com sucesso!');
      } else {
        toast.error('❌ Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Configurações
        </h2>
        <p className="text-gray-400 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-0">
          <Tabs defaultValue="geral">
            <TabsList className="w-full justify-start border-b border-white/10 bg-transparent p-0">
              <TabsTrigger 
                value="geral"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Globe className="w-4 h-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger 
                value="notificacoes"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger 
                value="sincronizacao"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Sincronização
              </TabsTrigger>
              <TabsTrigger 
                value="integracoes"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Integrações
              </TabsTrigger>
              <TabsTrigger 
                value="seguranca"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <Shield className="w-4 h-4 mr-2" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Geral */}
              <TabsContent value="geral" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Informações do Estúdio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="studio_name" className="text-white">Nome do Estúdio</Label>
                      <Input
                        id="studio_name"
                        value={settings.studio_name}
                        onChange={(e) => setSettings({...settings, studio_name: e.target.value})}
                        placeholder="Meu Estúdio de Tatuagem"
                        className="bg-gray-900 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                          placeholder="contato@estudio.com"
                          className="bg-gray-900 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-white">Telefone</Label>
                        <Input
                          id="phone"
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          placeholder="(11) 99999-9999"
                          className="bg-gray-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-white">Endereço</Label>
                      <Textarea
                        id="address"
                        value={settings.address}
                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                        placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                        className="bg-gray-900 text-white"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Configurações
                </Button>
              </TabsContent>

              {/* Notificações */}
              <TabsContent value="notificacoes" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Preferências de Notificações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Notificações Gerais</p>
                        <p className="text-gray-400 text-sm">Receber todas as notificações do sistema</p>
                      </div>
                      <Switch
                        checked={settings.notifications_enabled}
                        onCheckedChange={(checked) => setSettings({...settings, notifications_enabled: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Notificações por Email</p>
                        <p className="text-gray-400 text-sm">Receber notificações via email</p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Notificações por SMS</p>
                        <p className="text-gray-400 text-sm">Receber notificações via SMS</p>
                      </div>
                      <Switch
                        checked={settings.sms_notifications}
                        onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Preferências
                </Button>
              </TabsContent>

              {/* Sincronização */}
              <TabsContent value="sincronizacao" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Configurações de Sincronização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Sincronização Automática</p>
                        <p className="text-gray-400 text-sm">Sincronizar dados automaticamente com a nuvem</p>
                      </div>
                      <Switch
                        checked={settings.auto_sync_enabled}
                        onCheckedChange={(checked) => setSettings({...settings, auto_sync_enabled: checked})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sync_interval" className="text-white">Intervalo de Sincronização (horas)</Label>
                      <Input
                        id="sync_interval"
                        type="number"
                        value={settings.sync_interval}
                        onChange={(e) => setSettings({...settings, sync_interval: parseInt(e.target.value)})}
                        className="bg-gray-900 text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Backup Automático</p>
                        <p className="text-gray-400 text-sm">Criar backups automáticos dos dados</p>
                      </div>
                      <Switch
                        checked={settings.backup_enabled}
                        onCheckedChange={(checked) => setSettings({...settings, backup_enabled: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Configurações
                </Button>
              </TabsContent>

              {/* Integrações */}
              <TabsContent value="integracoes" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Integrações Externas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Google Calendar</p>
                        <p className="text-gray-400 text-sm">Sincronizar agendamentos com Google Calendar</p>
                      </div>
                      <Switch
                        checked={settings.google_calendar_sync}
                        onCheckedChange={(checked) => setSettings({...settings, google_calendar_sync: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Google OAuth</p>
                          <p className="text-gray-400 text-sm">Status: Não conectado</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        Conectar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cloud className="w-8 h-8 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Google Drive</p>
                          <p className="text-gray-400 text-sm">Status: Não conectado</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        Conectar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Salvar Integrações
                </Button>
              </TabsContent>

              {/* Segurança */}
              <TabsContent value="seguranca" className="mt-0 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Configurações de Segurança</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-white font-medium mb-2">Alterar Senha</p>
                      <div className="space-y-3">
                        <Input
                          type="password"
                          placeholder="Senha atual"
                          className="bg-gray-900 text-white"
                        />
                        <Input
                          type="password"
                          placeholder="Nova senha"
                          className="bg-gray-900 text-white"
                        />
                        <Input
                          type="password"
                          placeholder="Confirmar nova senha"
                          className="bg-gray-900 text-white"
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Atualizar Senha
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-white font-medium mb-2">Autenticação de Dois Fatores</p>
                      <p className="text-gray-400 text-sm mb-3">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        Configurar 2FA
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-900/20 border-red-700/50">
                  <CardHeader>
                    <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="destructive" className="w-full">
                      Limpar Todos os Dados
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Desativar Conta
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

