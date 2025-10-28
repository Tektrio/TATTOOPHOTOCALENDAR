import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const commTypes = {
  message: { icon: '💬', label: 'Mensagem', color: 'bg-blue-100 text-blue-800' },
  call: { icon: '📞', label: 'Ligação', color: 'bg-green-100 text-green-800' },
  email: { icon: '📧', label: 'Email', color: 'bg-purple-100 text-purple-800' },
  meeting: { icon: '🤝', label: 'Reunião', color: 'bg-yellow-100 text-yellow-800' },
  note: { icon: '📝', label: 'Nota', color: 'bg-gray-100 text-gray-800' }
};

function CommunicationTab({ clientId }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    communication_type: '',
    direction: '',
    is_important: undefined,
    is_read: undefined,
    period: 'all'
  });

  const [formData, setFormData] = useState({
    communication_type: 'message',
    direction: 'outgoing',
    subject: '',
    content: '',
    is_important: false
  });

  useEffect(() => {
    loadCommunications();
    loadStats();
  }, [clientId, filters]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.communication_type) params.append('communication_type', filters.communication_type);
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.is_important !== undefined) params.append('is_important', filters.is_important);
      if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
      
      const response = await axios.get(
        `${API_BASE}/api/clients/${clientId}/communications?${params.toString()}`
      );
      setCommunications(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar comunicações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/clients/${clientId}/communications/stats?period=${filters.period}`
      );
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCommunications();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/api/clients/${clientId}/communications/search?q=${encodeURIComponent(searchTerm)}`
      );
      setCommunications(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommunication = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/api/clients/${clientId}/communications`,
        formData
      );
      
      loadCommunications();
      loadStats();
      resetForm();
      alert('Comunicação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comunicação:', error);
      alert('Erro ao registrar comunicação');
    }
  };

  const toggleRead = async (commId, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/communications/${commId}/read`,
        { isRead: !currentStatus }
      );
      loadCommunications();
      loadStats();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const toggleImportant = async (commId, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/communications/${commId}/important`,
        { isImportant: !currentStatus }
      );
      loadCommunications();
    } catch (error) {
      console.error('Erro ao marcar como importante:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE}/api/clients/${clientId}/communications/mark-all-read`);
      loadCommunications();
      loadStats();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteCommunication = async (commId) => {
    if (!confirm('Deseja deletar esta comunicação?')) return;

    try {
      await axios.delete(`${API_BASE}/api/clients/${clientId}/communications/${commId}`);
      loadCommunications();
      loadStats();
      setSelectedComm(null);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      communication_type: 'message',
      direction: 'outgoing',
      subject: '',
      content: '',
      is_important: false
    });
    setShowAddModal(false);
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
          <h2 className="text-2xl font-bold text-gray-800">Timeline de Comunicação</h2>
          <p className="text-sm text-gray-600 mt-1">Histórico completo de interações</p>
        </div>
        <div className="flex gap-2">
          {stats && stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ✓ Marcar Todas Lidas
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nova Comunicação
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-xl font-bold text-gray-900">{stats.total_communications || 0}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg shadow border border-blue-200">
            <div className="text-xs text-blue-700">Mensagens</div>
            <div className="text-xl font-bold text-blue-900">{stats.messages || 0}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg shadow border border-green-200">
            <div className="text-xs text-green-700">Ligações</div>
            <div className="text-xl font-bold text-green-900">{stats.calls || 0}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg shadow border border-yellow-200">
            <div className="text-xs text-yellow-700">Importantes</div>
            <div className="text-xl font-bold text-yellow-900">{stats.important || 0}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg shadow border border-red-200">
            <div className="text-xs text-red-700">Não Lidas</div>
            <div className="text-xl font-bold text-red-900">{stats.unread || 0}</div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Buscar comunicações..."
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔍 Buscar
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                loadCommunications();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ✕ Limpar
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <select
            value={filters.communication_type}
            onChange={(e) => setFilters({...filters, communication_type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todos os Tipos</option>
            {Object.entries(commTypes).map(([type, data]) => (
              <option key={type} value={type}>{data.icon} {data.label}</option>
            ))}
          </select>

          <select
            value={filters.direction}
            onChange={(e) => setFilters({...filters, direction: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas Direções</option>
            <option value="incoming">📥 Recebidas</option>
            <option value="outgoing">📤 Enviadas</option>
          </select>

          <select
            value={filters.is_important === undefined ? '' : filters.is_important.toString()}
            onChange={(e) => setFilters({
              ...filters,
              is_important: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas</option>
            <option value="true">⭐ Importantes</option>
            <option value="false">Normais</option>
          </select>

          <select
            value={filters.is_read === undefined ? '' : filters.is_read.toString()}
            onChange={(e) => setFilters({
              ...filters,
              is_read: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todas</option>
            <option value="false">📧 Não Lidas</option>
            <option value="true">✓ Lidas</option>
          </select>

          <select
            value={filters.period}
            onChange={(e) => setFilters({...filters, period: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">Todo Período</option>
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {communications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-3">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma comunicação registrada'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Registrar primeira comunicação
            </button>
          </div>
        ) : (
          communications.map(comm => (
            <div
              key={comm.id}
              onClick={() => setSelectedComm(comm)}
              className={`p-4 rounded-lg shadow border-2 cursor-pointer hover:shadow-lg transition ${
                comm.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'
              } ${comm.is_important ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    commTypes[comm.communication_type]?.color || 'bg-gray-100'
                  }`}>
                    {commTypes[comm.communication_type]?.icon} {commTypes[comm.communication_type]?.label}
                  </span>

                  <span className={`px-2 py-1 rounded text-xs ${
                    comm.direction === 'incoming'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {comm.direction === 'incoming' ? '📥 Recebida' : '📤 Enviada'}
                  </span>

                  {comm.is_important && (
                    <span className="text-yellow-500 text-lg">⭐</span>
                  )}

                  {!comm.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>

                <span className="text-sm text-gray-600">
                  {new Date(comm.timestamp).toLocaleString()}
                </span>
              </div>

              {comm.subject && (
                <h4 className="font-bold text-gray-900 mb-1">{comm.subject}</h4>
              )}

              <p className="text-gray-700 text-sm line-clamp-2">{comm.content}</p>

              {comm.attachments && comm.attachments.length > 0 && (
                <div className="mt-2 flex gap-2">
                  <span className="text-xs text-gray-500">
                    📎 {comm.attachments.length} anexo(s)
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Communication Detail Modal */}
      {selectedComm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  commTypes[selectedComm.communication_type]?.color
                }`}>
                  {commTypes[selectedComm.communication_type]?.icon}{' '}
                  {commTypes[selectedComm.communication_type]?.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedComm.direction === 'incoming'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedComm.direction === 'incoming' ? '📥 Recebida' : '📤 Enviada'}
                </span>
              </div>
              <button
                onClick={() => setSelectedComm(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedComm.subject && (
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedComm.subject}</h3>
            )}

            <div className="mb-4 text-sm text-gray-600">
              {new Date(selectedComm.timestamp).toLocaleString('pt-BR', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </div>

            <div className="mb-6 text-gray-800 whitespace-pre-wrap">
              {selectedComm.content}
            </div>

            {selectedComm.attachments && selectedComm.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Anexos</h4>
                <div className="space-y-2">
                  {selectedComm.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-gray-50 rounded hover:bg-gray-100 text-blue-600"
                    >
                      📎 {attachment}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => toggleImportant(selectedComm.id, selectedComm.is_important)}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  selectedComm.is_important
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⭐ {selectedComm.is_important ? 'Importante' : 'Marcar Importante'}
              </button>
              <button
                onClick={() => toggleRead(selectedComm.id, selectedComm.is_read)}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  selectedComm.is_read
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedComm.is_read ? '📧 Marcar Não Lida' : '✓ Marcar Lida'}
              </button>
              <button
                onClick={() => deleteCommunication(selectedComm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Communication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Nova Comunicação</h3>
            
            <form onSubmit={handleAddCommunication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.communication_type}
                    onChange={(e) => setFormData({...formData, communication_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(commTypes).map(([type, data]) => (
                      <option key={type} value={type}>{data.icon} {data.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direção *
                  </label>
                  <select
                    required
                    value={formData.direction}
                    onChange={(e) => setFormData({...formData, direction: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="outgoing">📤 Enviada</option>
                    <option value="incoming">📥 Recebida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Reagendamento de sessão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Descreva a comunicação..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({...formData, is_important: e.target.checked})}
                  className="w-5 h-5 text-yellow-600 rounded"
                />
                <span className="text-gray-700">⭐ Marcar como importante</span>
              </label>

              <div className="flex justify-end gap-3">
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationTab;

