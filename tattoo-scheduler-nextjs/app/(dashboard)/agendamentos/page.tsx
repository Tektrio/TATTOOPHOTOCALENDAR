export default function AgendamentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Novo Agendamento
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Todos os status</option>
          <option>Pendente</option>
          <option>Confirmado</option>
          <option>Concluído</option>
          <option>Cancelado</option>
        </select>
        
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      {/* Calendário (placeholder) */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p className="text-6xl mb-4">📅</p>
          <p className="text-xl font-semibold mb-2">Nenhum agendamento ainda</p>
          <p className="text-gray-600">
            Clique em "Novo Agendamento" para criar seu primeiro agendamento
          </p>
        </div>
      </div>
    </div>
  );
}

