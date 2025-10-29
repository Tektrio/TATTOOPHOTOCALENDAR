import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, Calendar, Package, FileText, Folder, 
  Gift, CreditCard, Users, FileSpreadsheet, Mail,
  Phone, MapPin, ArrowLeft
} from 'lucide-react';

// Importar abas
import ProfileTab from './customer/ProfileTab';
import AppointmentsTab from './customer/AppointmentsTab';
import ProductsTab from './customer/ProductsTab';
import NotesTab from './customer/NotesTab';
import FormsTab from './customer/FormsTab';
import FilesTab from './customer/FilesTab';
import GiftCardsTab from './customer/GiftCardsTab';
import PackagesTab from './customer/PackagesTab';
import MembershipsTab from './customer/MembershipsTab';
import InvoicesTab from './customer/InvoicesTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CustomerManagement = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [shouldEditProfile, setShouldEditProfile] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers/${customerId}`);
      if (!response.ok) throw new Error('Erro ao buscar cliente');
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
        <Button onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Banner Horizontal Compacto com Informações do Cliente */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="flex items-center gap-4 p-4">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Avatar Compacto */}
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={customer.avatar_url} alt={customer.name} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>

          {/* Informações Principais - Inline */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{customer.name}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-gray-900">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{customer.email}</span>
                </a>
              )}
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-gray-900">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </a>
              )}
              {customer.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {customer.city}, {customer.state}
                </span>
              )}
            </div>
          </div>

          {/* Estatísticas Compactas - Inline */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="text-center px-3 py-1 bg-blue-50 rounded border-l-2 border-blue-500">
              <div className="text-lg font-bold text-blue-700">${customer.total_sales || 0}</div>
              <div className="text-[10px] text-blue-600 uppercase">Gasto</div>
            </div>
            
            <div className="text-center px-3 py-1 bg-green-50 rounded border-l-2 border-green-500">
              <div className="text-lg font-bold text-green-700">{customer.total_appointments || 0}</div>
              <div className="text-[10px] text-green-600 uppercase">Agendamentos</div>
            </div>
            
            <div className="text-center px-3 py-1 bg-purple-50 rounded border-l-2 border-purple-500">
              <div className="text-lg font-bold text-purple-700">{customer.loyalty_points_balance || 0}</div>
              <div className="text-[10px] text-purple-600 uppercase">Pontos</div>
            </div>
            
            <div className="text-center px-3 py-1 bg-red-50 rounded border-l-2 border-red-500">
              <div className="text-lg font-bold text-red-700">{customer.no_shows || 0}</div>
              <div className="text-[10px] text-red-600 uppercase">Faltas</div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                if (customer.email) {
                  window.location.href = `mailto:${customer.email}`;
                } else if (customer.phone) {
                  const cleanPhone = customer.phone.replace(/\D/g, '');
                  window.open(`https://wa.me/${cleanPhone}`, '_blank');
                } else {
                  alert('Cliente não possui email ou telefone cadastrado');
                }
              }}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm"
              className="h-8 px-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs"
              onClick={() => {
                setActiveTab('profile');
                setShouldEditProfile(true);
              }}
            >
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Sistema de Abas - Estilo Cabeçalho Compacto */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Abas Estilo Header - Compactas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Perfil</span>
            </button>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Agendamentos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Faturas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-orange-600 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Notas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'files'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">Arquivos</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-pink-600 text-pink-600 bg-pink-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Produtos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'packages'
                  ? 'border-teal-600 text-teal-600 bg-teal-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Pacotes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('giftcards')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'giftcards'
                  ? 'border-rose-600 text-rose-600 bg-rose-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">Gift Cards</span>
            </button>
            
            <button
              onClick={() => setActiveTab('memberships')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'memberships'
                  ? 'border-violet-600 text-violet-600 bg-violet-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Membros</span>
            </button>
            
            <button
              onClick={() => setActiveTab('forms')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'forms'
                  ? 'border-slate-600 text-slate-600 bg-slate-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-sm font-medium">Formulários</span>
            </button>
          </div>
        </div>

        <TabsContent value="profile">
          <ProfileTab 
            customer={customer} 
            onUpdate={fetchCustomer} 
            shouldEdit={shouldEditProfile}
            onEditStart={() => setShouldEditProfile(false)}
          />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="forms">
          <FormsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="files">
          <FilesTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="giftcards">
          <GiftCardsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="memberships">
          <MembershipsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;

