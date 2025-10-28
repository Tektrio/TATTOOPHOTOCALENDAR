import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const statusColors = {
  planning: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800'
};

const statusLabels = {
  planning: 'Planejamento',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  paused: 'Pausado'
};

function ProjectsTab({ clientId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    body_location: '',
    size_category: '',
    style: '',
    color_type: 'color',
    total_sessions_planned: 1,
    total_hours_planned: 0,
    estimated_cost: 0,
    notes: ''
  });

  useEffect(() => {
    loadProjects();
    loadStats();
  }, [clientId, filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/api/clients/${clientId}/projects?status=${filter}`
      );
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/projects/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(
          `${API_BASE}/api/clients/${clientId}/projects/${editingProject.id}`,
          formData
        );
      } else {
        await axios.post(`${API_BASE}/api/clients/${clientId}/projects`, formData);
      }
      
      loadProjects();
      loadStats();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleUpdateProgress = async (projectId, sessions, hours, amount) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/projects/${projectId}/progress`,
        {
          sessionsCompleted: sessions,
          hoursSpent: hours,
          amountPaid: amount
        }
      );
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const handleCompleteProject = async (projectId) => {
    if (!confirm('Marcar este projeto como concluído?')) return;
    
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/projects/${projectId}/complete`,
        { completionDate: new Date().toISOString() }
      );
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Erro ao completar projeto:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Deseja deletar este projeto? Esta ação não pode ser desfeita.')) return;
    
    try {
      await axios.delete(`${API_BASE}/api/clients/${clientId}/projects/${projectId}`);
      loadProjects();
      loadStats();
      setSelectedProject(null);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      body_location: '',
      size_category: '',
      style: '',
      color_type: 'color',
      total_sessions_planned: 1,
      total_hours_planned: 0,
      estimated_cost: 0,
      notes: ''
    });
    setEditingProject(null);
    setShowAddModal(false);
  };

  const editProject = (project) => {
    setFormData(project);
    setEditingProject(project);
    setShowAddModal(true);
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
          <h2 className="text-2xl font-bold text-gray-800">Projetos & Tatuagens</h2>
          <p className="text-sm text-gray-600 mt-1">Gestão completa de projetos de tatuagem</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Projeto
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_projects || 0}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-sm text-blue-700">Em Andamento</div>
            <div className="text-2xl font-bold text-blue-900">{stats.in_progress || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-700">Concluídos</div>
            <div className="text-2xl font-bold text-green-900">{stats.completed || 0}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
            <div className="text-sm text-purple-700">Horas Totais</div>
            <div className="text-2xl font-bold text-purple-900">{stats.total_hours || 0}h</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-700">Receita</div>
            <div className="text-2xl font-bold text-green-900">
              ${(stats.total_actual_revenue || 0).toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'planning', 'in_progress', 'completed', 'paused'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Todos' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum projeto encontrado</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-800"
            >
              Criar primeiro projeto
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{project.project_name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  statusColors[project.status]
                }`}>
                  {statusLabels[project.status]}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-700">
                {project.body_location && (
                  <div>📍 {project.body_location}</div>
                )}
                {project.style && (
                  <div>🎨 {project.style}</div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{project.sessions_completed || 0}/{project.total_sessions_planned || 0} sessões</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (project.progress_percentage || 0))}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                <div>
                  <span className="text-gray-600">Investido:</span>
                  <span className="font-bold text-gray-900 ml-1">
                    ${(project.total_paid || 0).toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Estimado:</span>
                  <span className="font-bold text-gray-900 ml-1">
                    ${(project.estimated_cost || 0).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedProject.project_name}</h3>
                <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded ${
                  statusColors[selectedProject.status]
                }`}>
                  {statusLabels[selectedProject.status]}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedProject.description && (
              <p className="text-gray-700 mb-4">{selectedProject.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600">Localização</label>
                <p className="font-medium">{selectedProject.body_location || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Estilo</label>
                <p className="font-medium">{selectedProject.style || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tamanho</label>
                <p className="font-medium">{selectedProject.size_category || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Cor</label>
                <p className="font-medium">{selectedProject.color_type || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Estatísticas</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Sessões:</span>
                  <span className="font-bold ml-2">
                    {selectedProject.sessions_completed}/{selectedProject.total_sessions_planned}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Horas:</span>
                  <span className="font-bold ml-2">
                    {selectedProject.total_hours_spent}/{selectedProject.total_hours_planned}h
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pago:</span>
                  <span className="font-bold ml-2 text-green-600">
                    ${(selectedProject.total_paid || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Estimado:</span>
                  <span className="font-bold ml-2">
                    ${(selectedProject.estimated_cost || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {selectedProject.notes && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedProject.notes}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => editProject(selectedProject)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ✏️ Editar
              </button>
              {selectedProject.status !== 'completed' && (
                <button
                  onClick={() => handleCompleteProject(selectedProject.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ Marcar Completo
                </button>
              )}
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.body_location}
                    onChange={(e) => setFormData({...formData, body_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Braço esquerdo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estilo
                  </label>
                  <input
                    type="text"
                    value={formData.style}
                    onChange={(e) => setFormData({...formData, style: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Realismo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sessões Planejadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_sessions_planned}
                    onChange={(e) => setFormData({...formData, total_sessions_planned: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas Planejadas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_hours_planned}
                    onChange={(e) => setFormData({...formData, total_hours_planned: parseInt(e.target.value)})}
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
                  {editingProject ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsTab;

