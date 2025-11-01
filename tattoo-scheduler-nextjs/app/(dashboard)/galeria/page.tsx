export default function GaleriaPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Galeria de Fotos</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          📤 Upload de Fotos
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Todos os clientes</option>
        </select>
        
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Todas as categorias</option>
          <option>Tatuagem</option>
          <option>Piercing</option>
          <option>Referência</option>
          <option>Resultado</option>
        </select>
      </div>
      
      {/* Grid de Fotos (placeholder) */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p className="text-6xl mb-4">📸</p>
          <p className="text-xl font-semibold mb-2">Nenhuma foto ainda</p>
          <p className="text-gray-600">
            Clique em "Upload de Fotos" para adicionar suas primeiras fotos
          </p>
        </div>
      </div>
    </div>
  );
}

