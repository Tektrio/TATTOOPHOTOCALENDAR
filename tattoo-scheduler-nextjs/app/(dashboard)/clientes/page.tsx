export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Novo Cliente
        </button>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="search"
          placeholder="Buscar por nome, email ou telefone..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Lista de Clientes (placeholder) */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p className="text-6xl mb-4">👥</p>
          <p className="text-xl font-semibold mb-2">Nenhum cliente ainda</p>
          <p className="text-gray-600">
            Clique em "Novo Cliente" para adicionar seu primeiro cliente
          </p>
        </div>
      </div>
    </div>
  );
}

