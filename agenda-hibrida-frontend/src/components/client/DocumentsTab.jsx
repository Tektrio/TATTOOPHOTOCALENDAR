import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const documentTypes = {
  consent: { label: 'Termo de Consentimento', icon: '📋', required: true },
  health_form: { label: 'Formulário de Saúde', icon: '🏥', required: true },
  image_release: { label: 'Liberação de Imagem', icon: '📸', required: true },
  liability: { label: 'Termo de Responsabilidade', icon: '⚖️', required: true },
  cancellation: { label: 'Política de Cancelamento', icon: '🚫', required: false }
};

function DocumentsTab({ clientId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [completeness, setCompleteness] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [formData, setFormData] = useState({
    document_type: 'consent',
    document_name: '',
    document_url: '',
    signed_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    signature_data: '',
    version: '1.0'
  });

  useEffect(() => {
    loadDocuments();
    loadStats();
    loadCompleteness();
  }, [clientId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/documents`);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/documents/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadCompleteness = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/documents/completeness`);
      setCompleteness(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar completude:', error);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/api/clients/${clientId}/documents`,
        formData
      );
      
      loadDocuments();
      loadStats();
      loadCompleteness();
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      alert('Erro ao adicionar documento');
    }
  };

  const invalidateDocument = async (documentId) => {
    if (!confirm('Deseja invalidar este documento?')) return;

    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/documents/${documentId}/invalidate`
      );
      loadDocuments();
      loadStats();
      loadCompleteness();
    } catch (error) {
      console.error('Erro ao invalidar documento:', error);
    }
  };

  const renewDocument = async (documentId) => {
    const newExpiryDate = prompt('Nova data de validade (YYYY-MM-DD):');
    if (!newExpiryDate) return;

    try {
      await axios.post(
        `${API_BASE}/api/clients/${clientId}/documents/${documentId}/renew`,
        {
          document_type: selectedDocument.document_type,
          document_name: selectedDocument.document_name,
          document_url: selectedDocument.document_url,
          signed_date: new Date().toISOString(),
          expiry_date: newExpiryDate,
          version: `${parseFloat(selectedDocument.version) + 0.1}`.slice(0, 3)
        }
      );

      loadDocuments();
      loadStats();
      loadCompleteness();
      setSelectedDocument(null);
      alert('Documento renovado com sucesso!');
    } catch (error) {
      console.error('Erro ao renovar documento:', error);
      alert('Erro ao renovar documento');
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: 'consent',
      document_name: '',
      document_url: '',
      signed_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      signature_data: '',
      version: '1.0'
    });
    setShowAddModal(false);
  };

  const getStatusColor = (doc) => {
    if (!doc.is_valid) return 'bg-gray-100 text-gray-800 border-gray-300';
    
    if (doc.expiry_date) {
      const daysUntilExpiry = Math.floor(
        (new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 border-red-300';
      if (daysUntilExpiry < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getStatusText = (doc) => {
    if (!doc.is_valid) return 'Inválido';
    
    if (doc.expiry_date) {
      const daysUntilExpiry = Math.floor(
        (new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 0) return 'Expirado';
      if (daysUntilExpiry < 30) return `Expira em ${daysUntilExpiry} dias`;
    }
    
    return 'Válido';
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Documentos & Termos</h2>
          <p className="text-sm text-gray-600 mt-1">Gestão de documentos legais e assinaturas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Adicionar Documento
        </button>
      </div>

      {/* Completeness Alert */}
      {completeness && !completeness.isComplete && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-800">Documentação Incompleta</h3>
              <p className="text-sm text-yellow-700">
                Documentos faltando: {completeness.missingDocuments.map(d => 
                  documentTypes[d]?.label || d
                ).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_documents || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-700">Válidos</div>
            <div className="text-2xl font-bold text-green-900">{stats.valid_documents || 0}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-700">Expirados</div>
            <div className="text-2xl font-bold text-red-900">{stats.expired_documents || 0}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-sm text-yellow-700">Expirando</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.expiring_soon || 0}</div>
          </div>
        </div>
      )}

      {/* Required Documents Checklist */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3">Documentos Obrigatórios</h3>
        <div className="space-y-2">
          {Object.entries(documentTypes)
            .filter(([_, data]) => data.required)
            .map(([type, data]) => {
              const hasValid = completeness?.details?.[type]?.isValid;
              return (
                <div key={type} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{data.icon}</span>
                    <span className="font-medium">{data.label}</span>
                  </div>
                  {hasValid ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded font-medium">
                      ✅ Completo
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded font-medium">
                      ❌ Faltando
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 mb-3">Todos os Documentos</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-3">Nenhum documento cadastrado</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Adicionar primeiro documento
            </button>
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className={`p-4 rounded-lg shadow border-2 cursor-pointer hover:shadow-lg transition ${
                getStatusColor(doc)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{documentTypes[doc.document_type]?.icon || '📄'}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {doc.document_name || documentTypes[doc.document_type]?.label || doc.document_type}
                      </h4>
                      <p className="text-sm text-gray-600">Versão {doc.version}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-700">
                    <span>📅 Assinado: {new Date(doc.signed_date).toLocaleDateString()}</span>
                    {doc.expiry_date && (
                      <span>⏰ Validade: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded border ${
                    getStatusColor(doc)
                  }`}>
                    {getStatusText(doc)}
                  </span>
                  {doc.is_valid && doc.expiry_date && (
                    <span className="text-xs text-gray-500">
                      Clique para detalhes
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDocument.document_name || documentTypes[selectedDocument.document_type]?.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Versão {selectedDocument.version}</p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Tipo de Documento</label>
                  <p className="font-medium">
                    {documentTypes[selectedDocument.document_type]?.label || selectedDocument.document_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <p className={`font-medium ${
                    selectedDocument.is_valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getStatusText(selectedDocument)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Data de Assinatura</label>
                  <p className="font-medium">
                    {new Date(selectedDocument.signed_date).toLocaleDateString()}
                  </p>
                </div>
                {selectedDocument.expiry_date && (
                  <div>
                    <label className="text-sm text-gray-600">Data de Validade</label>
                    <p className="font-medium">
                      {new Date(selectedDocument.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedDocument.document_url && (
                <div>
                  <label className="text-sm text-gray-600">URL do Documento</label>
                  <a
                    href={selectedDocument.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 block truncate"
                  >
                    {selectedDocument.document_url}
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedDocument.is_valid && (
                <>
                  <button
                    onClick={() => renewDocument(selectedDocument.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔄 Renovar
                  </button>
                  <button
                    onClick={() => invalidateDocument(selectedDocument.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ❌ Invalidar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Adicionar Documento</h3>
            
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  required
                  value={formData.document_type}
                  onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(documentTypes).map(([type, data]) => (
                    <option key={type} value={type}>
                      {data.icon} {data.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Documento
                </label>
                <input
                  type="text"
                  value={formData.document_name}
                  onChange={(e) => setFormData({...formData, document_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Termo de Consentimento 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Documento
                </label>
                <input
                  type="url"
                  value={formData.document_url}
                  onChange={(e) => setFormData({...formData, document_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Assinatura *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.signed_date}
                    onChange={(e) => setFormData({...formData, signed_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsTab;

