/**
 * Sistema de Internacionalização (i18n)
 * Gerencia traduções e idiomas da aplicação
 */

import pt from './locales/pt.json';
import en from './locales/en.json';

const translations = {
  pt,
  en
};

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'pt';
    this.translations = translations;
  }

  /**
   * Define o idioma atual
   * @param {string} language - Código do idioma ('pt' ou 'en')
   */
  setLanguage(language) {
    if (!this.translations[language]) {
      console.error(`Idioma ${language} não encontrado. Idiomas disponíveis: ${Object.keys(this.translations).join(', ')}`);
      return;
    }
    
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
    // Disparar evento para notificar componentes sobre mudança de idioma
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }

  /**
   * Obtém o idioma atual
   * @returns {string} Código do idioma atual
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Traduz uma chave para o idioma atual
   * @param {string} key - Chave da tradução (ex: 'common.save')
   * @param {object} params - Parâmetros para interpolação (ex: {name: 'João'})
   * @returns {string} Texto traduzido
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    // Navegar pela estrutura aninhada
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        console.warn(`Tradução não encontrada para: ${key} (idioma: ${this.currentLanguage})`);
        return key;
      }
    }

    // Interpolar parâmetros se houver
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return translation;
  }

  /**
   * Verifica se uma chave de tradução existe
   * @param {string} key - Chave da tradução
   * @returns {boolean} True se a chave existe
   */
  exists(key) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtém todas as traduções do idioma atual
   * @returns {object} Objeto com todas as traduções
   */
  getAllTranslations() {
    return this.translations[this.currentLanguage];
  }

  /**
   * Obtém lista de idiomas disponíveis
   * @returns {array} Array com códigos dos idiomas
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

// Criar instância global
const i18n = new I18n();

export default i18n;

