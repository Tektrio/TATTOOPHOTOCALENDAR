import React, { useState, useEffect } from 'react';
// TODO: Migrar para @dnd-kit
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const priorityColors = {
  urgent: 'bg-red-100 border-red-300 text-red-800',
  high: 'bg-orange-100 border-orange-300 text-orange-800',
  medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  low: 'bg-green-100 border-green-300 text-green-800'
};

const priorityIcons = {
  urgent: '🚨',
  high: '⚠️',
  medium: '📌',
  low: '📝'
};

function WaitingListTab({ clientId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    priority: 'medium',
    session_type: 'first',
    estimated_sessions: 1,
    estimated_hours_total: 0,
    estimated_cost: 0,
    deposit_paid: 0,
    body_location: '',
    size_category: '',
    notes: ''
  });

  useEffect(() => {
    loadWaitingList();
    loadStats();
  }, [clientId]);

  const loadWaitingList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/waiting-list`);
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar waiting list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/waiting-list/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setItems(reorderedItems);

    try {
      const orderedIds = reorderedItems.map(item => item.id);
      await axios.put(`${API_BASE}/api/clients/${clientId}/waiting-list/reorder`, {
        orderedIds
      });
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      loadWaitingList(); // Recarregar em caso de erro
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(
          `${API_BASE}/api/clients/${clientId}/waiting-list/${editingItem.id}`,
          formData
        );
      } else {
        await axios.post(
          `${API_BASE}/api/clients/${clientId}/waiting-list`,
          formData
        );
      }
      
      loadWaitingList();
      loadStats();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Deseja remover este projeto da fila de espera?')) return;
    
    try {
      await axios.delete(`${API_BASE}/api/clients/${clientId}/waiting-list/${itemId}`);
      loadWaitingList();
      loadStats();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleSchedule = async (itemId) => {
    // TODO: Integrar com modal de agendamento
    alert('Funcionalidade de agendamento em desenvolvimento');
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      priority: 'medium',
      session_type: 'first',
      estimated_sessions: 1,
      estimated_hours_total: 0,
      estimated_cost: 0,
      deposit_paid: 0,
      body_location: '',
      size_category: '',
      notes: ''
    });
    setEditingItem(null);
    setShowAddModal(false);
  };

  const editItem = (item) => {
    setFormData(item);
    setEditingItem(item);
    setShowAddModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      {/* Header com Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Waiting List & Disponibilidade</h2>
          <p className="text-sm text-gray-600 mt-1">Fila de projetos aguardando agendamento</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Adicionar Projeto
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total na Fila</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-sm text-yellow-700">Aguardando</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.waiting || 0}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-700">Urgentes</div>
            <div className="text-2xl font-bold text-red-900">{stats.urgent || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-700">Receita Estimada</div>
            <div className="text-2xl font-bold text-green-900">
              ${(stats.total_estimated_revenue || 0).toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* List without drag-and-drop (TODO: Migrar para @dnd-kit) */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum projeto na fila de espera</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-800"
            >
              Adicionar primeiro projeto
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-lg shadow border-2 ${priorityColors[item.priority]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{priorityIcons[item.priority]}</span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.project_name}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-gray-700 text-white rounded">
                      {item.session_type}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                  )}
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    {item.body_location && (
                      <span>📍 {item.body_location}</span>
                    )}
                    <span>🎨 {item.estimated_sessions} sessões</span>
                    <span>⏱️ {item.estimated_hours_total}h</span>
                    {item.estimated_cost > 0 && (
                      <span>💰 ${item.estimated_cost}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleSchedule(item.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    📅 Agendar
                  </button>
                  <button
                    onClick={() => editItem(item)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar Projeto' : 'Adicionar Projeto à Fila'}
            </h3>
            
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Sessão
                  </label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({...formData, session_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="first">Primeira Sessão</option>
                    <option value="continuation">Continuação</option>
                    <option value="last">Última Sessão</option>
                    <option value="touch_up">Retoque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sessões Estimadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimated_sessions}
                    onChange={(e) => setFormData({...formData, estimated_sessions: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas Totais
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_hours_total}
                    onChange={(e) => setFormData({...formData, estimated_hours_total: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo Estimado
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({...formData, estimated_cost: parseFloat(e.target.value)})}
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
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaitingListTab;

