const fs = require('fs-extra');
const path = require('path');

/**
 * Serviço de Gerenciamento de Categorias
 * Centraliza configuração de categorias e validação de arquivos
 */
class CategoryService {
  constructor() {
    this.categories = null;
    this.categoriesPath = path.join(__dirname, '../shared/categories.json');
    this.loadCategories();
  }

  /**
   * Carregar categorias do arquivo JSON
   */
  loadCategories() {
    try {
      if (!fs.existsSync(this.categoriesPath)) {
        console.warn('⚠️ Arquivo categories.json não encontrado, usando categorias padrão');
        this.categories = this.getDefaultCategories();
        return;
      }

      this.categories = fs.readJsonSync(this.categoriesPath);
      console.log(`✅ ${Object.keys(this.categories.categories).length} categorias carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      this.categories = this.getDefaultCategories();
    }
  }

  /**
   * Recarregar categorias do disco
   */
  reload() {
    this.loadCategories();
  }

  /**
   * Obter todas as categorias
   * @returns {Object} - Objeto com todas as categorias
   */
  getAll() {
    return this.categories.categories;
  }

  /**
   * Obter versão do esquema de categorias
   * @returns {string}
   */
  getVersion() {
    return this.categories.version || '1.0';
  }

  /**
   * Obter informações de uma categoria específica
   * @param {string} categoryKey - Chave da categoria
   * @returns {Object|null} - Dados da categoria ou null
   */
  get(categoryKey) {
    return this.categories.categories[categoryKey] || null;
  }

  /**
   * Obter caminho da pasta de uma categoria
   * @param {string} categoryKey - Chave da categoria
   * @returns {string} - Caminho relativo da pasta
   */
  getPath(categoryKey) {
    const category = this.categories.categories[categoryKey];
    
    if (!category) {
      // Tentar mapeamento legado
      const legacyKey = this.categories.legacyMapping[categoryKey];
      
      if (legacyKey) {
        const legacyCategory = this.categories.categories[legacyKey];
        if (legacyCategory) {
          return legacyCategory.path;
        }
      }
      
      throw new Error(`Categoria desconhecida: ${categoryKey}`);
    }
    
    return category.path;
  }

  /**
   * Validar arquivo para uma categoria
   * @param {string} categoryKey - Chave da categoria
   * @param {string} fileExtension - Extensão do arquivo (sem ponto)
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validate(categoryKey, fileExtension, fileSize) {
    const category = this.categories.categories[categoryKey];
    
    if (!category) {
      return { 
        valid: false, 
        error: `Categoria inválida: ${categoryKey}` 
      };
    }

    // Normalizar extensão
    const ext = fileExtension.toLowerCase().replace(/^\./, '');

    // Validar tipo de arquivo
    if (!category.allowedTypes.includes(ext)) {
      return { 
        valid: false, 
        error: `Tipo de arquivo .${ext} não permitido para ${category.label}. Tipos aceitos: ${category.allowedTypes.join(', ')}` 
      };
    }

    // Validar tamanho
    if (fileSize > category.maxSize) {
      const maxSizeMB = (category.maxSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        error: `Arquivo muito grande (${fileSizeMB}MB). Tamanho máximo: ${maxSizeMB}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Obter estrutura de pastas completa (todos os caminhos)
   * @returns {Array<string>} - Lista de caminhos relativos
   */
  getFolderStructure() {
    const paths = Object.values(this.categories.categories).map(c => c.path);
    
    // Remover duplicatas e ordenar
    return [...new Set(paths)].sort();
  }

  /**
   * Obter lista de categorias agrupadas por seção
   * @returns {Object} - Categorias agrupadas
   */
  getGrouped() {
    const grouped = {
      Tattoo: [],
      Documentos: [],
      Financeiro: [],
      Midia_Social: []
    };

    Object.entries(this.categories.categories).forEach(([key, category]) => {
      const section = category.path.split('/')[0];
      
      if (grouped[section]) {
        grouped[section].push({
          key,
          ...category
        });
      }
    });

    return grouped;
  }

  /**
   * Mapear categoria antiga para nova
   * @param {string} oldCategoryKey - Chave da categoria antiga
   * @returns {string} - Chave da categoria nova
   */
  mapLegacy(oldCategoryKey) {
    return this.categories.legacyMapping[oldCategoryKey] || oldCategoryKey;
  }

  /**
   * Categorias padrão (fallback se arquivo não existir)
   * @private
   */
  getDefaultCategories() {
    return {
      version: '1.0',
      categories: {
        referencias: {
          path: 'Tattoo/01_Referencias',
          label: 'Referências',
          icon: '🎨',
          color: '#3B82F6',
          allowedTypes: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
          maxSize: 52428800
        },
        fotos_finais: {
          path: 'Tattoo/03_Fotos_e_videos/Finais',
          label: 'Fotos Finais',
          icon: '✨',
          color: '#10B981',
          allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
          maxSize: 52428800
        }
      },
      legacyMapping: {
        referencias: 'referencias',
        fotos_finais: 'fotos_finais'
      }
    };
  }
}

// Exportar instância singleton
module.exports = new CategoryService();

