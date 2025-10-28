import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function HealthTab({ clientId }) {
  const [healthInfo, setHealthInfo] = useState(null);
  const [risks, setRisks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    allergies: [],
    medical_conditions: [],
    medications: [],
    blood_type: '',
    has_diabetes: false,
    has_hemophilia: false,
    has_keloid_tendency: false,
    has_skin_conditions: false,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    contraindications: [],
    special_notes: ''
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newContraindication, setNewContraindication] = useState('');

  useEffect(() => {
    loadHealthInfo();
    checkRisks();
  }, [clientId]);

  const loadHealthInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/health`);
      const data = response.data.data;
      
      if (data) {
        setHealthInfo(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações de saúde:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRisks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/health/risks`);
      setRisks(response.data.data);
    } catch (error) {
      console.error('Erro ao verificar riscos:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/clients/${clientId}/health`, formData);
      
      loadHealthInfo();
      checkRisks();
      setEditing(false);
      alert('Informações de saúde salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar informações de saúde');
    }
  };

  const addArrayItem = (field, value, setterCallback) => {
    if (!value.trim()) return;
    
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), value.trim()]
    });
    setterCallback('');
  };

  const removeArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
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
          <h2 className="text-2xl font-bold text-gray-800">Saúde & Cuidados</h2>
          <p className="text-sm text-gray-600 mt-1">Informações médicas e de emergência</p>
        </div>
        {!editing && healthInfo && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Editar
          </button>
        )}
      </div>

      {/* Risk Alerts */}
      {risks && (risks.hasRisks || risks.hasWarnings) && (
        <div className="space-y-3 mb-6">
          {/* Critical Risks */}
          {risks.risks && risks.risks.length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🚨</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-2">ATENÇÃO: Riscos Críticos</h3>
                  <ul className="space-y-1">
                    {risks.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {risk.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {risks.warnings && risks.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-800 mb-2">Avisos Importantes</h3>
                  <ul className="space-y-1">
                    {risks.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        • {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing Info Alert */}
      {risks && risks.hasInfoMissing && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h3 className="font-bold text-blue-800">Informações de Saúde Não Cadastradas</h3>
              <p className="text-sm text-blue-700">
                Cadastre as informações de saúde do cliente para melhor segurança nas sessões.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Cadastrar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Critical Conditions */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              Condições Críticas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_diabetes}
                  onChange={(e) => setFormData({...formData, has_diabetes: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Diabetes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_hemophilia}
                  onChange={(e) => setFormData({...formData, has_hemophilia: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Hemofilia</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_keloid_tendency}
                  onChange={(e) => setFormData({...formData, has_keloid_tendency: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Tendência a Queloides</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_skin_conditions}
                  onChange={(e) => setFormData({...formData, has_skin_conditions: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Condições de Pele</span>
              </label>
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤧</span>
              Alergias
            </h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('allergies', newAllergy, setNewAllergy);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Digite uma alergia e pressione Enter"
              />
              <button
                type="button"
                onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.allergies && formData.allergies.length > 0 ? (
                formData.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('allergies', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma alergia cadastrada</p>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              Condições Médicas
            </h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('medical_conditions', newCondition, setNewCondition);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Digite uma condição e pressione Enter"
              />
              <button
                type="button"
                onClick={() => addArrayItem('medical_conditions', newCondition, setNewCondition)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.medical_conditions && formData.medical_conditions.length > 0 ? (
                formData.medical_conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('medical_conditions', index)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma condição cadastrada</p>
              )}
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💊</span>
              Medicações
            </h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('medications', newMedication, setNewMedication);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Digite uma medicação e pressione Enter"
              />
              <button
                type="button"
                onClick={() => addArrayItem('medications', newMedication, setNewMedication)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.medications && formData.medications.length > 0 ? (
                formData.medications.map((medication, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {medication}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('medications', index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma medicação cadastrada</p>
              )}
            </div>
          </div>

          {/* Blood Type & Emergency Contact */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span>
              Informações de Emergência
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Sanguíneo
                </label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecione...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relação
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_relation}
                  onChange={(e) => setFormData({...formData, emergency_contact_relation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Mãe, Esposo"
                />
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Notas Especiais
            </h3>
            
            <textarea
              value={formData.special_notes}
              onChange={(e) => setFormData({...formData, special_notes: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Observações adicionais sobre a saúde do cliente..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData(healthInfo || {});
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              💾 Salvar
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        healthInfo ? (
          <div className="space-y-6">
            {/* Critical Conditions */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Condições Críticas</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded ${healthInfo.has_diabetes ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-500'}`}>
                  {healthInfo.has_diabetes ? '✅' : '○'} Diabetes
                </div>
                <div className={`p-3 rounded ${healthInfo.has_hemophilia ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-500'}`}>
                  {healthInfo.has_hemophilia ? '✅' : '○'} Hemofilia
                </div>
                <div className={`p-3 rounded ${healthInfo.has_keloid_tendency ? 'bg-yellow-50 text-yellow-800' : 'bg-gray-50 text-gray-500'}`}>
                  {healthInfo.has_keloid_tendency ? '✅' : '○'} Tendência a Queloides
                </div>
                <div className={`p-3 rounded ${healthInfo.has_skin_conditions ? 'bg-yellow-50 text-yellow-800' : 'bg-gray-50 text-gray-500'}`}>
                  {healthInfo.has_skin_conditions ? '✅' : '○'} Condições de Pele
                </div>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Allergies */}
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">🤧 Alergias</h4>
                {healthInfo.allergies && healthInfo.allergies.length > 0 ? (
                  <div className="space-y-1">
                    {healthInfo.allergies.map((allergy, i) => (
                      <div key={i} className="text-sm text-gray-700">• {allergy}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma alergia</p>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">🏥 Condições Médicas</h4>
                {healthInfo.medical_conditions && healthInfo.medical_conditions.length > 0 ? (
                  <div className="space-y-1">
                    {healthInfo.medical_conditions.map((condition, i) => (
                      <div key={i} className="text-sm text-gray-700">• {condition}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma condição</p>
                )}
              </div>

              {/* Medications */}
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">💊 Medicações</h4>
                {healthInfo.medications && healthInfo.medications.length > 0 ? (
                  <div className="space-y-1">
                    {healthInfo.medications.map((medication, i) => (
                      <div key={i} className="text-sm text-gray-700">• {medication}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma medicação</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">📞 Contato de Emergência</h4>
                {healthInfo.emergency_contact_name ? (
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Nome:</span> {healthInfo.emergency_contact_name}</div>
                    <div><span className="font-medium">Telefone:</span> {healthInfo.emergency_contact_phone}</div>
                    <div><span className="font-medium">Relação:</span> {healthInfo.emergency_contact_relation}</div>
                    {healthInfo.blood_type && (
                      <div><span className="font-medium">Tipo Sanguíneo:</span> {healthInfo.blood_type}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Não cadastrado</p>
                )}
              </div>
            </div>

            {/* Special Notes */}
            {healthInfo.special_notes && (
              <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">📝 Notas Especiais</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{healthInfo.special_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-3">Nenhuma informação de saúde cadastrada</p>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Cadastrar agora
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default HealthTab;

