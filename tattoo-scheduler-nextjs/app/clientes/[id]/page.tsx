'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Calendar,
  Image,
  MessageSquare,
  DollarSign,
  FileText,
  Heart,
  Settings,
  StickyNote,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

// Importar componentes das abas
import OverviewTab from '@/components/customer/OverviewTab';
import ProjectsTab from '@/components/customer/ProjectsTab';
import PhotoGalleryTab from '@/components/customer/PhotoGalleryTab';
import CommunicationTab from '@/components/customer/CommunicationTab';
import FinancialTab from '@/components/customer/FinancialTab';
import DocumentsTab from '@/components/customer/DocumentsTab';
import HealthTab from '@/components/customer/HealthTab';
import PreferencesTab from '@/components/customer/PreferencesTab';
import PrivateNotesTab from '@/components/customer/PrivateNotesTab';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  total_sales?: number;
  total_appointments?: number;
  loyalty_points_balance?: number;
  no_shows?: number;
  createdAt: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}`);
      if (!response.ok) throw new Error('Cliente não encontrado');
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4 text-white">Cliente não encontrado</h2>
        <Button onClick={() => router.push('/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner do Cliente */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Botão Voltar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/clientes')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={customer.avatar_url} alt={customer.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>

            {/* Informações Principais */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-white">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-white">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </a>
                )}
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {customer.city}, {customer.state}
                  </span>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-blue-500/20 rounded border border-blue-500/50">
                <div className="text-2xl font-bold text-blue-400">R$ {customer.total_sales || 0}</div>
                <div className="text-xs text-blue-300">Gasto Total</div>
              </div>
              
              <div className="text-center px-4 py-2 bg-green-500/20 rounded border border-green-500/50">
                <div className="text-2xl font-bold text-green-400">{customer.total_appointments || 0}</div>
                <div className="text-xs text-green-300">Agendamentos</div>
              </div>
              
              <div className="text-center px-4 py-2 bg-purple-500/20 rounded border border-purple-500/50">
                <div className="text-2xl font-bold text-purple-400">{customer.loyalty_points_balance || 0}</div>
                <div className="text-xs text-purple-300">Pontos</div>
              </div>
              
              <div className="text-center px-4 py-2 bg-red-500/20 rounded border border-red-500/50">
                <div className="text-2xl font-bold text-red-400">{customer.no_shows || 0}</div>
                <div className="text-xs text-red-300">Faltas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-white/10 p-0 h-auto">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <User className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Projetos
              </TabsTrigger>
              
              <TabsTrigger 
                value="gallery" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <Image className="w-4 h-4 mr-2" />
                Galeria
              </TabsTrigger>
              
              <TabsTrigger 
                value="communication" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comunicação
              </TabsTrigger>
              
              <TabsTrigger 
                value="financial" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financeiro
              </TabsTrigger>
              
              <TabsTrigger 
                value="documents" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documentos
              </TabsTrigger>
              
              <TabsTrigger 
                value="health" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <Heart className="w-4 h-4 mr-2" />
                Saúde
              </TabsTrigger>
              
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                Preferências
              </TabsTrigger>
              
              <TabsTrigger 
                value="notes" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70 border-b-2 border-transparent data-[state=active]:border-purple-500 rounded-none px-4 py-3"
              >
                <StickyNote className="w-4 h-4 mr-2" />
                Notas Privadas
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab customer={customer} onRefresh={fetchCustomer} />
              </TabsContent>

              <TabsContent value="projects" className="mt-0">
                <ProjectsTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                <PhotoGalleryTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="communication" className="mt-0">
                <CommunicationTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="financial" className="mt-0">
                <FinancialTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <DocumentsTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="health" className="mt-0">
                <HealthTab customerId={customer.id} />
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <PreferencesTab customer={customer} onRefresh={fetchCustomer} />
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <PrivateNotesTab customerId={customer.id} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

