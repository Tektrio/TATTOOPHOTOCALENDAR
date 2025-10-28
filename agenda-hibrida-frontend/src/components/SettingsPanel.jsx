/**
 * Painel de Configurações
 * Permite alternar entre temas (claro/escuro) e idiomas (PT/EN)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Moon, Sun, Languages, Settings as SettingsIcon, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsPanel = () => {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('pt');
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLanguage = localStorage.getItem('language') || 'pt';
    const savedAutoSync = localStorage.getItem('autoSync') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false'; // default true
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setAutoSync(savedAutoSync);
    setNotifications(savedNotifications);
    
    // Aplicar tema ao documento
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.setProperty('--background', '255 255 255');
      root.style.setProperty('--foreground', '0 0 0');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.setProperty('--background', '10 10 10');
      root.style.setProperty('--foreground', '255 255 255');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast.success(`Tema alterado para ${newTheme === 'dark' ? 'Escuro' : 'Claro'}! ✨`);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast.success(`Idioma alterado para ${newLanguage === 'pt' ? 'Português' : 'English'}! 🌐`);
  };

  const handleAutoSyncChange = (checked) => {
    setAutoSync(checked);
    localStorage.setItem('autoSync', String(checked));
    toast.success(`Sincronização automática ${checked ? 'ativada' : 'desativada'}!`);
  };

  const handleNotificationsChange = (checked) => {
    setNotifications(checked);
    localStorage.setItem('notifications', String(checked));
    toast.success(`Notificações ${checked ? 'ativadas' : 'desativadas'}!`);
  };

  const resetSettings = () => {
    handleThemeChange('dark');
    handleLanguageChange('pt');
    handleAutoSyncChange(true);
    handleNotificationsChange(true);
    toast.success('Configurações restauradas para padrão! 🔄');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" data-testid="settings-panel">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-8 h-8 text-purple-500" />
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
      </div>

      <div className="space-y-6">
        {/* Tema */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Aparência
            </CardTitle>
            <CardDescription className="text-gray-400">
              Escolha entre tema claro e escuro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-white">Tema</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger 
                  className="w-48 bg-gray-900 border-gray-600 text-white"
                  data-testid="select-theme"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Escuro
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Claro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview do tema */}
            <div className="mt-4 p-4 rounded-lg border border-gray-600 bg-gray-900">
              <p className="text-sm text-gray-400 mb-2">Prévia:</p>
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <h3 className="font-bold">Título de exemplo</h3>
                <p className="text-sm opacity-70">Este é um parágrafo de exemplo para visualizar o tema selecionado.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Idioma */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Idioma
            </CardTitle>
            <CardDescription className="text-gray-400">
              Selecione o idioma da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-white">Idioma</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger 
                  className="w-48 bg-gray-900 border-gray-600 text-white"
                  data-testid="select-language"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sincronização */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sincronização</CardTitle>
            <CardDescription className="text-gray-400">
              Configurações de sincronização automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Sincronização Automática</Label>
                <p className="text-sm text-gray-400">
                  Sincronizar automaticamente com Google Calendar
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={handleAutoSyncChange}
                data-testid="switch-auto-sync"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notificações</CardTitle>
            <CardDescription className="text-gray-400">
              Gerenciar notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Ativar Notificações</Label>
                <p className="text-sm text-gray-400">
                  Receber notificações de agendamentos e eventos
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
                data-testid="switch-notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Restaurar Padrões</h3>
                <p className="text-sm text-gray-400">
                  Restaurar todas as configurações para os valores padrão
                </p>
              </div>
              <Button
                onClick={resetSettings}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
                data-testid="btn-reset-settings"
              >
                Restaurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo das Configurações Atuais */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Configurações Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Tema:</span>
                <span className="ml-2 text-white font-semibold">
                  {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Idioma:</span>
                <span className="ml-2 text-white font-semibold">
                  {language === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Sincronização Automática:</span>
                <span className={`ml-2 font-semibold ${autoSync ? 'text-green-400' : 'text-red-400'}`}>
                  {autoSync ? '✓ Ativada' : '✗ Desativada'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Notificações:</span>
                <span className={`ml-2 font-semibold ${notifications ? 'text-green-400' : 'text-red-400'}`}>
                  {notifications ? '✓ Ativadas' : '✗ Desativadas'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPanel;

