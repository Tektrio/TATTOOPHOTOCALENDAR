import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import all tab components
import WaitingListTab from '../components/client/WaitingListTab';
import ProjectsTab from '../components/client/ProjectsTab';
import PhotoGalleryTab from '../components/client/PhotoGalleryTab';
import DocumentsTab from '../components/client/DocumentsTab';
import HealthTab from '../components/client/HealthTab';
import CommunicationTab from '../components/client/CommunicationTab';
import PrivateNotesTab from '../components/client/PrivateNotesTab';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: '👤' },
  { id: 'waiting-list', label: 'Fila de Espera', icon: '📋' },
  { id: 'projects', label: 'Projetos', icon: '🎨' },
  { id: 'sessions', label: 'Sessões', icon: '📅' },
  { id: 'photos', label: 'Fotos', icon: '📷' },
  { id: 'documents', label: 'Documentos', icon: '📄' },
  { id: 'health', label: 'Saúde', icon: '🏥' },
  { id: 'communication', label: 'Comunicação', icon: '💬' },
  { id: 'financial', label: 'Financeiro', icon: '💰' },
  { id: 'private-notes', label: 'Notas Privadas', icon: '🔒' }
];

function ClientProfile() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      loadClientInfo();
    }
  }, [clientId]);

  const loadClientInfo = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint de clientes
      // const response = await axios.get(`${API_BASE}/api/clients/${clientId}`);
      // setClient(response.data.data);
      
      // Placeholder temporário
      setClient({
        id: clientId,
        name: 'Cliente de Exemplo',
        email: 'cliente@example.com',
        phone: '(11) 99999-9999'
      });
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral do Cliente</h2>
            
            {client && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Nome</label>
                      <p className="font-medium">{client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Telefone</label>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Estatísticas Rápidas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Sessões</span>
                      <span className="font-bold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projetos Ativos</span>
                      <span className="font-bold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Investido</span>
                      <span className="font-bold">$0.00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 md:col-span-2">
                  <h3 className="font-bold text-gray-900 mb-4">Acesso Rápido</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {tabs.slice(1).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="p-4 text-center rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 transition"
                      >
                        <div className="text-3xl mb-2">{tab.icon}</div>
                        <div className="text-sm font-medium text-gray-700">{tab.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'waiting-list':
        return <WaitingListTab clientId={clientId} />;

      case 'projects':
        return <ProjectsTab clientId={clientId} />;

      case 'photos':
        return <PhotoGalleryTab clientId={clientId} />;

      case 'documents':
        return <DocumentsTab clientId={clientId} />;

      case 'health':
        return <HealthTab clientId={clientId} />;

      case 'communication':
        return <CommunicationTab clientId={clientId} />;

      case 'private-notes':
        return <PrivateNotesTab clientId={clientId} />;

      case 'sessions':
      case 'financial':
        return (
          <div className="p-6">
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-3">Esta aba ainda não foi implementada</p>
              <p className="text-sm text-gray-400">Em desenvolvimento...</p>
            </div>
          </div>
        );

      default:
        return <div>Aba não encontrada</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/clients')}
                className="px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{client?.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {client?.email} • {client?.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                ✏️ Editar
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                📅 Nova Sessão
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default ClientProfile;

