const QnapClient = require('../lib/qnapClient');

/**
 * Validador de configuração QNAP
 * Testa conectividade e permissões
 */
class QnapValidator {
  /**
   * Valida configuração completa do QNAP
   * @param {object} config 
   * @returns {Promise<object>} { valid, errors, warnings, details }
   */
  static async validate(config) {
    const errors = [];
    const warnings = [];
    const details = {};

    // ============================================
    // VALIDAÇÕES BÁSICAS (Campos obrigatórios)
    // ============================================
    
    if (!config.host || config.host.trim().length === 0) {
      errors.push('Host/IP é obrigatório');
    } else {
      details.host = config.host;
    }

    if (!config.username || config.username.trim().length === 0) {
      errors.push('Usuário é obrigatório');
    }

    if (!config.password || config.password.trim().length === 0) {
      errors.push('Senha é obrigatória');
    }

    if (!config.protocol) {
      errors.push('Protocolo é obrigatório');
    } else if (!['webdav', 'ftp'].includes(config.protocol)) {
      errors.push('Protocolo deve ser webdav ou ftp');
    } else {
      details.protocol = config.protocol;
    }

    // Validação de porta
    if (config.port) {
      if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
        errors.push('Porta deve ser número entre 1 e 65535');
      } else {
        details.port = config.port;
      }
    } else {
      // Define porta padrão se não especificada
      if (config.protocol === 'webdav') {
        details.port = config.secure ? 443 : 80;
        warnings.push(`Usando porta padrão ${details.port} para WebDAV`);
      } else if (config.protocol === 'ftp') {
        details.port = 21;
        warnings.push('Usando porta padrão 21 para FTP');
      }
    }

    // Se há erros básicos, retorna sem testar conexão
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        details
      };
    }

    // ============================================
    // TESTE DE CONECTIVIDADE
    // ============================================
    
    const client = new QnapClient(config);
    
    try {
      console.log('🔍 Testando conexão QNAP...');
      const connectionResult = await client.connect();
      details.connectionSuccess = true;
      details.connectionDetails = connectionResult;

      // ============================================
      // TESTE DE PERMISSÕES
      // ============================================
      
      const testPath = config.remotePath || '/';
      
      try {
        // Testa leitura
        const files = await client.listFiles(testPath);
        details.readPermission = true;
        details.filesCount = files.length;
        
        if (files.length === 0) {
          warnings.push(`Pasta remota ${testPath} está vazia`);
        }
      } catch (error) {
        errors.push(`Sem permissão de leitura em ${testPath}: ${error.message}`);
        details.readPermission = false;
      }

      // Testa escrita (tentando criar arquivo temporário)
      try {
        const testFileName = `.qnap_test_${Date.now()}.txt`;
        // Nota: esta é uma simulação, não vamos realmente criar arquivo
        // Para teste real, precisaria criar um arquivo temporário
        details.writePermission = 'unknown'; // Não testado nesta versão
        warnings.push('Permissão de escrita não testada (requer arquivo temporário)');
      } catch (error) {
        warnings.push('Não foi possível testar permissão de escrita');
      }

      await client.disconnect();

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        details
      };

    } catch (error) {
      errors.push(`Falha na conexão: ${error.message}`);
      details.connectionSuccess = false;
      details.connectionError = error.message;

      // Adiciona dicas de troubleshooting
      if (error.message.includes('ECONNREFUSED')) {
        warnings.push('Dica: Verifique se o serviço está ativo no QNAP');
      } else if (error.message.includes('ETIMEDOUT')) {
        warnings.push('Dica: Verifique firewall e configurações de rede');
      } else if (error.message.includes('401') || error.message.includes('auth')) {
        warnings.push('Dica: Verifique usuário e senha');
      }

      return {
        valid: false,
        errors,
        warnings,
        details
      };
    }
  }

  /**
   * Valida apenas campos (sem testar conexão)
   * @param {object} config 
   * @returns {object} { valid, errors }
   */
  static validateFields(config) {
    const errors = [];

    if (!config.host) errors.push('Host é obrigatório');
    if (!config.username) errors.push('Usuário é obrigatório');
    if (!config.password) errors.push('Senha é obrigatória');
    if (!config.protocol) {
      errors.push('Protocolo é obrigatório');
    } else if (!['webdav', 'ftp'].includes(config.protocol)) {
      errors.push('Protocolo inválido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = QnapValidator;

