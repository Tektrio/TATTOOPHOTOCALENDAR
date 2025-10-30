import { useState, useEffect } from 'react';

/**
 * Hook para carregar categorias dinâmicas do backend
 * @returns {Object} { categories, loading, error }
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/categories`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar categorias');
        }

        const data = await response.json();
        
        // Converter objeto de categorias em array formatado
        const formatted = Object.entries(data).map(([key, value]) => ({
          key,
          value: key,  // Usar key como value para o select
          label: value.label,
          path: value.path,
          icon: value.icon,
          color: value.color,
          allowedTypes: value.allowedTypes,
          maxSize: value.maxSize
        }));

        setCategories(formatted);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError(err.message);
        
        // Fallback para categorias padrão em caso de erro
        setCategories([
          { 
            key: 'referencias', 
            value: 'referencias',
            label: 'Referências', 
            path: 'Tattoo/01_Referencias',
            icon: '🎨', 
            color: '#3B82F6'
          },
          { 
            key: 'fotos_finais', 
            value: 'fotos_finais',
            label: 'Fotos Finais', 
            path: 'Tattoo/03_Fotos_e_videos/Finais',
            icon: '✨', 
            color: '#10B981'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

