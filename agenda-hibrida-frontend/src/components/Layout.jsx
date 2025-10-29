/**
 * Layout Component - Header de Navegação Global
 * Fornece navegação consistente em todas as páginas
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Users, 
  Calendar, 
  Image, 
  Settings,
  Menu,
  X,
  Upload,
  DollarSign,
  Briefcase,
  Cloud
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children, statusBar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Função para voltar
  const goBack = () => {
    window.history.back();
  };

  // Função para avançar
  const goForward = () => {
    window.history.forward();
  };

  // Menu de navegação principal
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/customers', label: 'Gestão de Clientes', icon: Briefcase },
    // Adicione mais rotas conforme necessário
  ];

  // Verificar se está na rota ativa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Obter nome da página atual para breadcrumb
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/clients') return 'Clientes';
    if (path === '/customers') return 'Gestão de Clientes';
    if (path === '/customers/new') return 'Novo Cliente';
    if (path.startsWith('/customers/')) return 'Detalhes do Cliente';
    if (path.startsWith('/clients/')) return 'Perfil do Cliente';
    return 'Página';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Único Compacto - Tudo em uma linha */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Lado Esquerdo: Navegação + Logo + Breadcrumb */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Botões de Histórico */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="text-white hover:bg-white/10 h-7 w-7 p-0"
                  title="Voltar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goForward}
                  className="text-white hover:bg-white/10 h-7 w-7 p-0"
                  title="Avançar"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Logo Compacto */}
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-bold text-white whitespace-nowrap">Agenda Híbrida</span>
              </div>

              {/* Breadcrumb Inline */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-purple-300">
                <span>/</span>
                <span className="text-white">{getCurrentPageName()}</span>
              </div>
            </div>

            {/* Centro: Menu Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className={`h-8 px-2 ${
                  isActive('/') 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/clients')}
                className={`h-8 px-2 ${
                  isActive('/clients') 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customers')}
                className={`h-8 px-2 ${
                  isActive('/customers') 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
              </Button>
            </nav>

            {/* Lado Direito: Status Bar + Menu Mobile */}
            <div className="flex items-center gap-2">
              {/* Status Bar do App (passado via props) */}
              {statusBar && <div className="hidden md:block">{statusBar}</div>}

              {/* Menu Mobile Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white h-7 w-7 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Menu Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pt-2 mt-2 border-t border-white/10">
              <nav className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start h-9 ${
                    isActive('/') 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/clients');
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start h-9 ${
                    isActive('/clients') 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Clientes
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/customers');
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start h-9 ${
                    isActive('/customers') 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Gestão de Clientes
                </Button>
              </nav>
              
              {/* Status Bar no Mobile */}
              {statusBar && (
                <div className="md:hidden mt-2 pt-2 border-t border-white/10">
                  {statusBar}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo da Página */}
      <main className="container mx-auto">
        {children}
      </main>

      {/* Footer (Opcional) */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-purple-200 text-sm">
              © 2025 Agenda Híbrida - Sistema Visual para Tatuadores
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-200 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-200/50 cursor-not-allowed"
                disabled
                title="Em breve"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

