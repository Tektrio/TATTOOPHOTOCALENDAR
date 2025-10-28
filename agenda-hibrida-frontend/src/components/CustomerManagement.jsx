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
      {/* Header com informações básicas do cliente */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (customer.email) {
                    window.location.href = `mailto:${customer.email}`;
                  } else if (customer.phone) {
                    // Remover caracteres especiais do telefone para WhatsApp
                    const cleanPhone = customer.phone.replace(/\D/g, '');
                    window.open(`https://wa.me/${cleanPhone}`, '_blank');
                  } else {
                    alert('Cliente não possui email ou telefone cadastrado');
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Mensagem
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setActiveTab('profile');
                  setShouldEditProfile(true);
                }}
              >
                Editar Perfil
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={customer.avatar_url} alt={customer.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>

            {/* Informações Principais */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{customer.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                {customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                      {customer.email}
                    </a>
                  </div>
                )}
                
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                      {customer.phone}
                    </a>
                  </div>
                )}
                
                {customer.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.city}, {customer.state}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customer.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${customer.total_sales || 0}
                </div>
                <div className="text-xs text-gray-600">Total Gasto</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {customer.total_appointments || 0}
                </div>
                <div className="text-xs text-gray-600">Agendamentos</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {customer.loyalty_points_balance || 0}
                </div>
                <div className="text-xs text-gray-600">Pontos</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {customer.no_shows || 0}
                </div>
                <div className="text-xs text-gray-600">Faltas</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sistema de Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-10 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          
          <TabsTrigger value="appointments" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendamentos</span>
          </TabsTrigger>
          
          <TabsTrigger value="products" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Produtos</span>
          </TabsTrigger>
          
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notas</span>
          </TabsTrigger>
          
          <TabsTrigger value="forms" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Formulários</span>
          </TabsTrigger>
          
          <TabsTrigger value="files" className="flex items-center gap-1">
            <Folder className="h-4 w-4" />
            <span className="hidden sm:inline">Arquivos</span>
          </TabsTrigger>
          
          <TabsTrigger value="giftcards" className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Gift Cards</span>
          </TabsTrigger>
          
          <TabsTrigger value="packages" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Pacotes</span>
          </TabsTrigger>
          
          <TabsTrigger value="memberships" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Memberships</span>
          </TabsTrigger>
          
          <TabsTrigger value="invoices" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Faturas</span>
          </TabsTrigger>
        </TabsList>

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

