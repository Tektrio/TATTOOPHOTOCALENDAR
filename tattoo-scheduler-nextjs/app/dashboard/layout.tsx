'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  Clock, 
  Upload, 
  Image, 
  Cloud, 
  HardDrive, 
  DollarSign,
  Settings,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();
  
  // Extrair aba ativa do pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname?.includes('/agendamentos')) return 'appointments';
    if (pathname?.includes('/clientes')) return 'clients';
    if (pathname?.includes('/galeria')) return 'gallery';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [isAuthenticated] = useState(false); // TODO: conectar com auth real

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Navegação para as rotas
    const routes: Record<string, string> = {
      dashboard: '/dashboard',
      calendar: '/dashboard/calendario',
      appointments: '/agendamentos',
      clients: '/clientes',
      import: '/dashboard/importar',
      gallery: '/galeria',
      drive: '/dashboard/drive',
      localstorage: '/dashboard/dados-local',
      financial: '/dashboard/financeiro',
      employees: '/dashboard/funcionarios',
      settings: '/dashboard/configuracoes',
    };
    
    router.push(routes[value] || '/dashboard');
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
          : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
      }`}
    >
      <div className="py-4">
        {/* Status Bar Compacto */}
        <div className="container mx-auto px-4 mb-3">
          <div className="flex items-center justify-end gap-2">
            {/* Toggle de Tema */}
            <ThemeToggle />
            
            {/* Status de armazenamento */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
              isDark ? 'bg-gray-800/80' : 'bg-white/5'
            }`}>
              <HardDrive className="w-3 h-3" />
              <span className="text-white/70 capitalize">local</span>
            </div>
            
            {/* Status da autenticação */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Conectado</span>
                </div>
                <Button variant="destructive" size="sm" className="h-6 px-2 text-xs">
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className={`border-white/10 h-6 px-2 text-xs ${
                  isDark ? 'bg-gray-800/80 hover:bg-gray-700/80' : 'bg-white/5 hover:bg-white/10'
                } text-white`}
              >
                <WifiOff className="w-3 h-3 mr-1.5" />
                Conectar
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className={`backdrop-blur-md rounded-lg border overflow-x-auto ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/5 border-white/10'
            }`}>
              <TabsList className="flex items-center gap-1 bg-transparent p-1.5 w-max min-w-full">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Dashboard
                </TabsTrigger>
                
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Calendário
                </TabsTrigger>
                
                <TabsTrigger 
                  value="appointments" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Agendamentos
                </TabsTrigger>
                
                <TabsTrigger 
                  value="clients" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  Clientes
                </TabsTrigger>
                
                <TabsTrigger 
                  value="import" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Importar
                </TabsTrigger>
                
                <TabsTrigger 
                  value="gallery" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all"
                >
                  <Image className="w-3.5 h-3.5" />
                  Galeria
                </TabsTrigger>
                
                <TabsTrigger 
                  value="drive" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-sky-600 data-[state=active]:text-white transition-all"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Drive
                </TabsTrigger>
                
                <TabsTrigger 
                  value="localstorage" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  Dados Local
                </TabsTrigger>
                
                <TabsTrigger 
                  value="financial" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Financeiro
                </TabsTrigger>
                
                <TabsTrigger 
                  value="employees" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  Funcionários
                </TabsTrigger>
                
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 data-[state=active]:bg-slate-600 data-[state=active]:text-white transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Config
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
