'use client';

import { useState } from 'react';
import { type Conflict } from '@/lib/sync-service';
import { syncService } from '@/lib/sync-service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConflictModalProps {
  conflicts: Conflict[];
  onClose: () => void;
}

export function ConflictModal({ conflicts, onClose }: ConflictModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolving, setResolving] = useState(false);
  
  if (conflicts.length === 0) return null;
  
  const conflict = conflicts[currentIndex];
  
  const handleResolve = async (resolution: 'local' | 'cloud' | 'both') => {
    setResolving(true);
    
    try {
      await syncService.resolveConflict(conflict, resolution);
      
      // Se houver mais conflitos, ir para o próximo
      if (currentIndex < conflicts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Todos resolvidos, fechar modal
        alert('✅ Todos os conflitos foram resolvidos!');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao resolver conflito:', error);
      alert('❌ Erro ao resolver conflito. Tente novamente.');
    } finally {
      setResolving(false);
    }
  };
  
  const renderFields = (data: any) => {
    const fields = ['name', 'title', 'email', 'phone', 'description', 'startDatetime'];
    
    return (
      <div className="space-y-1">
        {fields.map(field => {
          if (data[field] !== undefined && data[field] !== null) {
            return (
              <div key={field} className="text-sm">
                <span className="font-medium">{field}:</span>{' '}
                <span className="text-gray-700">
                  {typeof data[field] === 'object' && data[field] instanceof Date
                    ? data[field].toLocaleString('pt-BR')
                    : String(data[field])
                  }
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            ⚠️ Conflito Encontrado ({currentIndex + 1} de {conflicts.length})
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Este {conflict.type} foi editado em dois lugares diferentes.
            Escolha qual versão manter:
          </p>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Versão LOCAL */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              💻 Versão Local (Seu PC)
              <span className="text-xs text-gray-500 font-normal">
                Editado {formatDistanceToNow(conflict.local.updatedAt, { locale: ptBR, addSuffix: true })}
              </span>
            </h3>
            {renderFields(conflict.local.data)}
            <button
              onClick={() => handleResolve('local')}
              disabled={resolving}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ✅ Manter Versão Local
            </button>
          </div>
          
          {/* Versão CLOUD */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              ☁️ Versão Cloud (Online)
              <span className="text-xs text-gray-500 font-normal">
                Editado {formatDistanceToNow(conflict.cloud.updatedAt, { locale: ptBR, addSuffix: true })}
              </span>
            </h3>
            {renderFields(conflict.cloud.data)}
            <button
              onClick={() => handleResolve('cloud')}
              disabled={resolving}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ✅ Manter Versão Cloud
            </button>
          </div>
          
          {/* Opção: Manter AMBOS */}
          <button
            onClick={() => handleResolve('both')}
            disabled={resolving}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            📋 Manter Ambas (criar 2 registros)
          </button>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {conflicts.length - currentIndex - 1} conflito(s) restante(s)
          </p>
        </div>
      </div>
    </div>
  );
}

