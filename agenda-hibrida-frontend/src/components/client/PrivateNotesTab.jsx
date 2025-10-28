import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const noteTypes = {
  general: { icon: '📝', label: 'Geral', color: 'bg-gray-100 text-gray-800' },
  technical: { icon: '🎨', label: 'Técnico', color: 'bg-blue-100 text-blue-800' },
  behavioral: { icon: '👤', label: 'Comportamental', color: 'bg-yellow-100 text-yellow-800' },
  reminder: { icon: '⏰', label: 'Lembrete', color: 'bg-purple-100 text-purple-800' },
  feedback: { icon: '💬', label: 'Feedback', color: 'bg-green-100 text-green-800' }
};

function PrivateNotesTab({ clientId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    note_type: 'general',
    content: '',
    tags: [],
    is_pinned: false
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadNotes();
  }, [clientId, filter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Note: Esse endpoint ainda precisa ser implementado no backend
      // Por enquanto, vou usar um array vazio como placeholder
      setNotes([]);
      // const response = await axios.get(`${API_BASE}/api/clients/${clientId}/private-notes`);
      // setNotes(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        // await axios.put(`${API_BASE}/api/clients/${clientId}/private-notes/${editingNote.id}`, formData);
      } else {
        // await axios.post(`${API_BASE}/api/clients/${clientId}/private-notes`, formData);
      }
      
      loadNotes();
      resetForm();
      alert('Nota salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar nota');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Deseja deletar esta nota privada?')) return;

    try {
      // await axios.delete(`${API_BASE}/api/clients/${clientId}/private-notes/${noteId}`);
      loadNotes();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  const togglePin = async (noteId, currentStatus) => {
    try {
      // await axios.put(`${API_BASE}/api/clients/${clientId}/private-notes/${noteId}/pin`, {
      //   is_pinned: !currentStatus
      // });
      loadNotes();
    } catch (error) {
      console.error('Erro ao fixar/desfixar nota:', error);
    }
  };

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()]
    });
    setNewTag('');
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      note_type: 'general',
      content: '',
      tags: [],
      is_pinned: false
    });
    setEditingNote(null);
    setShowAddModal(false);
  };

  const editNote = (note) => {
    setFormData(note);
    setEditingNote(note);
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
          <h2 className="text-2xl font-bold text-gray-800">Notas Privadas do Artista</h2>
          <p className="text-sm text-gray-600 mt-1">Anotações confidenciais sobre o cliente</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Nova Nota
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🔒</span>
          <div>
            <h3 className="font-bold text-purple-800">Notas Privadas</h3>
            <p className="text-sm text-purple-700">
              Estas notas são visíveis apenas para você e não são compartilhadas com o cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pinned')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
            filter === 'pinned'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📌 Fixadas
        </button>
        {Object.entries(noteTypes).map(([type, data]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {data.icon} {data.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-3">Nenhuma nota privada cadastrada</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Criar primeira nota
            </button>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`bg-white p-5 rounded-lg shadow border-2 border-gray-200 hover:shadow-lg transition ${
                note.is_pinned ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    noteTypes[note.note_type]?.color || 'bg-gray-100'
                  }`}>
                    {noteTypes[note.note_type]?.icon} {noteTypes[note.note_type]?.label}
                  </span>

                  {note.is_pinned && (
                    <span className="text-purple-600 font-bold">📌 Fixada</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(note.id, note.is_pinned)}
                    className={`px-2 py-1 text-sm rounded transition ${
                      note.is_pinned
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => editNote(note)}
                    className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="text-gray-800 whitespace-pre-wrap mb-3">{note.content}</p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Criada em: {new Date(note.created_at).toLocaleString()}
                {note.updated_at !== note.created_at && (
                  <span> • Atualizada em: {new Date(note.updated_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingNote ? 'Editar Nota' : 'Nova Nota Privada'}
            </h3>
            
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Nota
                </label>
                <select
                  value={formData.note_type}
                  onChange={(e) => setFormData({...formData, note_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(noteTypes).map(([type, data]) => (
                    <option key={type} value={type}>
                      {data.icon} {data.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Escreva suas anotações privadas aqui..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({...formData, is_pinned: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <span className="text-gray-700">📌 Fixar esta nota no topo</span>
              </label>

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
                  {editingNote ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateNotesTab;

