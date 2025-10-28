/**
 * Interface Visual de Importação Vagaro
 * Upload e gerenciamento de importações de dados do Vagaro
 */

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Info,
  Users,
  DollarSign,
  Briefcase,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const IMPORT_TYPES = [
  {
    id: 'customers',
    name: 'Clientes',
    icon: Users,
    color: 'bg-blue-500',
    description: 'Importar dados de clientes do Vagaro',
    requiredFields: ['name (ou first_name + last_name)'],
    optionalFields: ['email', 'phone', 'address', 'city', 'state', 'birth_date']
  },
  {
    id: 'transactions',
    name: 'Transações',
    icon: DollarSign,
    color: 'bg-green-500',
    description: 'Importar histórico de pagamentos e vendas',
    requiredFields: ['transaction_date', 'total'],
    optionalFields: ['customer_email', 'service_name', 'payment_method', 'employee_name']
  },
  {
    id: 'employees',
    name: 'Funcionários',
    icon: Briefcase,
    color: 'bg-purple-500',
    description: 'Importar dados de funcionários e colaboradores',
    requiredFields: ['name (ou employee_name)'],
    optionalFields: ['email', 'phone', 'role', 'commission_rate', 'hire_date']
  },
  {
    id: 'appointments',
    name: 'Agendamentos',
    icon: Calendar,
    color: 'bg-orange-500',
    description: 'Importar histórico de agendamentos (em breve)',
    requiredFields: ['date', 'customer_name', 'service'],
    optionalFields: ['employee_name', 'duration', 'status'],
    disabled: true
  }
];

export default function VagaroImport() {
  const [selectedType, setSelectedType] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [importLogs, setImportLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);

  useEffect(() => {
    loadImportLogs();
  }, []);

  const loadImportLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/imports/logs`);
      const data = await response.json();
      
      if (data.success) {
        setImportLogs(data.logs);
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        setError('Formato inválido. Use apenas arquivos .xlsx, .xls ou .csv');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedType) {
      setError('Selecione o tipo de importação e o arquivo');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('import_type', selectedType.id);
    formData.append('update_existing', updateExisting);

    try {
      const response = await fetch(`${API_URL}/api/imports/vagaro`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setProgress(100);
        loadImportLogs(); // Recarregar logs
      } else {
        throw new Error(data.message || 'Erro ao importar arquivo');
      }
    } catch (err) {
      console.error('Erro na importação:', err);
      setError(err.message || 'Não foi possível realizar a importação');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (type) => {
    // Criar template CSV/Excel de exemplo
    const templates = {
      customers: 'name,email,phone,address,city,state,zip,birth_date,notes\nJohn Doe,john@example.com,555-0100,123 Main St,City,ST,12345,1990-01-01,VIP Client\n',
      transactions: 'transaction_date,customer_email,service_name,total,payment_method,employee_name\n2024-01-15,client@email.com,Tattoo Session,200.00,credit_card,Artist Name\n',
      employees: 'name,email,phone,role,commission_rate,hire_date\nJane Artist,jane@studio.com,555-0200,artist,30,2023-01-01\n'
    };

    const content = templates[type];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'completed': { variant: 'default', color: 'text-green-600', label: 'Concluído' },
      'processing': { variant: 'secondary', color: 'text-blue-600', label: 'Processando' },
      'failed': { variant: 'destructive', color: 'text-red-600', label: 'Falhou' },
      'partial': { variant: 'outline', color: 'text-orange-600', label: 'Parcial' }
    };

    const config = variants[status] || variants.completed;

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="vagaro-import-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importação de Dados Vagaro</h1>
        <p className="text-gray-500">
          Importe clientes, transações e funcionários do seu sistema Vagaro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Seleção e Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seleção de Tipo */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">1. Selecione o Tipo de Importação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMPORT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType?.id === type.id;

                return (
                  <button
                    key={type.id}
                    onClick={() => !type.disabled && setSelectedType(type)}
                    disabled={type.disabled}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : type.disabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`import-type-${type.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${type.color} p-2 rounded-lg text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {type.name}
                          {type.disabled && (
                            <Badge variant="secondary" className="text-xs">Em breve</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Upload de Arquivo */}
          {selectedType && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">2. Faça Upload do Arquivo Excel</h2>
              
              {/* Informações do tipo selecionado */}
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Campos obrigatórios:</strong> {selectedType.requiredFields.join(', ')}
                  <br />
                  <strong>Campos opcionais:</strong> {selectedType.optionalFields.join(', ')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Botão de Template */}
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate(selectedType.id)}
                  className="w-full"
                  data-testid="btn-download-template"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template de Exemplo
                </Button>

                {/* Input de Arquivo */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {file ? (
                      <>
                        <FileSpreadsheet className="w-12 h-12 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Formatos aceitos: .xlsx, .xls, .csv
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Opções */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="rounded"
                    data-testid="checkbox-update-existing"
                  />
                  <span className="text-sm">Atualizar registros existentes (sobrescrever duplicatas)</span>
                </label>

                {/* Botão de Importação */}
                <Button
                  onClick={handleImport}
                  disabled={!file || uploading}
                  className="w-full"
                  size="lg"
                  data-testid="btn-start-import"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Iniciar Importação
                    </>
                  )}
                </Button>

                {/* Progresso */}
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-gray-500">
                      Processando arquivo... {progress}%
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Resultado */}
          {result && (
            <Card className="p-6 border-green-200 bg-green-50" data-testid="import-result">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Importação Concluída!
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-2xl font-bold">{result.stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Importados</p>
                      <p className="text-2xl font-bold text-green-600">{result.stats.successful}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Pulados</p>
                      <p className="text-2xl font-bold text-yellow-600">{result.stats.skipped}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Falhas</p>
                      <p className="text-2xl font-bold text-red-600">{result.stats.failed}</p>
                    </div>
                  </div>

                  {result.stats.failed > 0 && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.stats.failed} registro(s) falharam. Verifique os logs para mais detalhes.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Coluna Direita: Histórico */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Importações</h2>
            
            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : importLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma importação realizada ainda
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {importLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`import-log-${log.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium capitalize">
                        {log.import_type.replace('vagaro_', '')}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">{log.file_name}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium">{log.total_rows}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">OK:</span>
                        <span className="ml-1 font-medium text-green-600">{log.successful_rows}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Erro:</span>
                        <span className="ml-1 font-medium text-red-600">{log.failed_rows}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

