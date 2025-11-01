'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

type ImportType = 'excel' | 'csv' | 'ics' | null;
type Step = 1 | 2 | 3;

interface FieldMapping {
  source: string;
  target: string;
}

export default function ImportWizardPage() {
  const [step, setStep] = useState<Step>(1);
  const [importType, setImportType] = useState<ImportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [mapping, setMapping] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const targetFields = [
    { value: 'name', label: 'Nome' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telefone' },
    { value: 'cpf', label: 'CPF' },
    { value: 'birthDate', label: 'Data Nascimento' },
    { value: 'address', label: 'Endereço' },
    { value: 'city', label: 'Cidade' },
    { value: 'state', label: 'Estado' },
    { value: 'zipCode', label: 'CEP' },
    { value: 'notes', label: 'Observações' },
    { value: 'ignore', label: '(Ignorar)' }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !importType) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/imports/${importType}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setPreview(data);
      
      // Auto-mapping inicial
      const autoMapping: FieldMapping[] = data.columns.map((col: string) => ({
        source: col,
        target: detectTargetField(col)
      }));
      setMapping(autoMapping);

      toast.success('Arquivo processado com sucesso!');
      setStep(2);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const detectTargetField = (sourceField: string): string => {
    const field = sourceField.toLowerCase();
    if (field.includes('nome') || field.includes('name')) return 'name';
    if (field.includes('email') || field.includes('e-mail')) return 'email';
    if (field.includes('telefone') || field.includes('phone') || field.includes('celular')) return 'phone';
    if (field.includes('cpf')) return 'cpf';
    if (field.includes('nascimento') || field.includes('birth')) return 'birthDate';
    if (field.includes('endereço') || field.includes('address')) return 'address';
    if (field.includes('cidade') || field.includes('city')) return 'city';
    if (field.includes('estado') || field.includes('state') || field.includes('uf')) return 'state';
    if (field.includes('cep') || field.includes('zip')) return 'zipCode';
    if (field.includes('obs') || field.includes('note')) return 'notes';
    return 'ignore';
  };

  const updateMapping = (sourceField: string, targetField: string) => {
    setMapping(prev =>
      prev.map(m => m.source === sourceField ? { ...m, target: targetField } : m)
    );
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/imports/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: importType,
          data: preview.sampleData || preview.sampleEvents,
          mapping
        })
      });

      const result = await response.json();
      toast.success(`Importação concluída! ${result.stats.imported} registros importados.`);
      
      setStep(3);
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setImportType(null);
    setFile(null);
    setPreview(null);
    setMapping([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Assistente de Importação
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Importe dados de Excel, CSV ou ICS em 3 passos simples
          </p>
        </div>

        {/* Stepper */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={step >= 1 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}>
                Escolher Formato
              </span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={step >= 2 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}>
                Mapear Campos
              </span>
            </div>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className={step >= 3 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}>
                Concluído
              </span>
            </div>
          </div>
        </Card>

        {/* Step 1: Escolher Formato */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`p-6 cursor-pointer hover:shadow-lg transition-all ${
                  importType === 'excel' ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
                onClick={() => setImportType('excel')}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Excel</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">.xlsx, .xls</p>
                  </div>
                  {importType === 'excel' && (
                    <Badge className="bg-indigo-600">Selecionado</Badge>
                  )}
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer hover:shadow-lg transition-all ${
                  importType === 'csv' ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
                onClick={() => setImportType('csv')}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">CSV</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">.csv</p>
                  </div>
                  {importType === 'csv' && (
                    <Badge className="bg-indigo-600">Selecionado</Badge>
                  )}
                </div>
              </Card>

              <Card
                className={`p-6 cursor-pointer hover:shadow-lg transition-all ${
                  importType === 'ics' ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
                onClick={() => setImportType('ics')}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Calendário</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">.ics</p>
                  </div>
                  {importType === 'ics' && (
                    <Badge className="bg-indigo-600">Selecionado</Badge>
                  )}
                </div>
              </Card>
            </div>

            {importType && (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Upload do Arquivo {importType.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selecione um arquivo para começar a importação
                    </p>
                  </div>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept={importType === 'excel' ? '.xlsx,.xls' : importType === 'csv' ? '.csv' : '.ics'}
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
                    </Button>
                  </label>
                </div>
              </Card>
            )}

            {/* Link para Vagaro */}
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    Importando do Vagaro?
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                    Use nosso importador especializado para dados do Vagaro
                  </p>
                </div>
                <Link href="/importar/vagaro">
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                    Ir para Vagaro Import
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}

        {/* Step 2: Mapear Campos */}
        {step === 2 && preview && (
          <>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Mapeamento de Campos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Associe os campos do seu arquivo aos campos do sistema. O mapeamento foi detectado automaticamente, mas você pode ajustá-lo.
              </p>

              <div className="space-y-3">
                {mapping.map((map, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Campo Origem</Label>
                      <div className="font-medium text-gray-900 dark:text-white">{map.source}</div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Campo Destino</Label>
                      <select
                        value={map.target}
                        onChange={(e) => updateMapping(map.source, e.target.value)}
                        className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {targetFields.map(field => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preview dados */}
            <Card>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Preview ({preview.rowCount || preview.eventCount} registros)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {preview.columns?.map((col: string, idx: number) => (
                        <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {preview.sampleData?.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx}>
                        {preview.columns?.map((col: string, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Ações */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 gap-2"
              >
                {isLoading ? 'Importando...' : 'Importar Dados'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Concluído */}
        {step === 3 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Importação Concluída!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seus dados foram importados com sucesso
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetWizard}>
                Nova Importação
              </Button>
              <Link href="/clientes">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Ver Clientes
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

