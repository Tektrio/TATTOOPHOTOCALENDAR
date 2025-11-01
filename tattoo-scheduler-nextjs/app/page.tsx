import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🎨 TattooScheduler
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Sistema de Agendamento Híbrido - Local + Cloud
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🚀 Acessar Dashboard
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              🔐 Login com Google
            </Link>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-bold mb-2">Funciona Offline</h3>
              <p className="text-gray-600">
                Use SQLite local para trabalhar sem internet
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-xl font-bold mb-2">Sincronização Cloud</h3>
              <p className="text-gray-600">
                Dados sincronizados automaticamente com Supabase
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-2">Resolução de Conflitos</h3>
              <p className="text-gray-600">
                Interface intuitiva para resolver conflitos de sincronização
              </p>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6">🛠️ Tecnologias</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
              <div>Next.js 15</div>
              <div>TypeScript</div>
              <div>Prisma (Dual)</div>
              <div>Supabase</div>
              <div>SQLite Local</div>
              <div>NextAuth</div>
              <div>Google OAuth</div>
              <div>Tailwind CSS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
