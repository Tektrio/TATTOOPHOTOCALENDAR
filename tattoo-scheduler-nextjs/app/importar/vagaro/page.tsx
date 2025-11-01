'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Upload,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function VagaroImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/imports/vagaro', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setPreview(data);
      toast.success('Arquivo processado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/imports/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vagaro',
          data: preview,
          mapping: {} // Auto-mapping for Vagaro format
        })
      });

      const result = await response.json();
      toast.success(`Importação concluída! ${result.stats.imported} registros importados.`);
      
      // Limpar estado
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Importar do Vagaro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Importe seus dados de clientes e agendamentos do Vagaro
          </p>
        </div>

        {/* Instruções */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Como exportar do Vagaro:
          </h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside">
            <li>Acesse seu painel do Vagaro</li>
            <li>Vá em <strong>Reports → Export Data</strong></li>
            <li>Selecione <strong>Clients</strong> e <strong>Appointments</strong></li>
            <li>Escolha o formato <strong>CSV</strong></li>
            <li>Clique em <strong>Export</strong> e salve o arquivo</li>
            <li>Faça upload do arquivo abaixo</li>
          </ol>
        </Card>

        {/* Upload Area */}
        {!preview && (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Upload do Arquivo Vagaro
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Formatos suportados: CSV exportado do Vagaro
                </p>
              </div>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
                </Button>
              </label>
            </div>
          </Card>
        )}

        {/* Preview */}
        {preview && (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clientes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {preview.clientCount || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Agendamentos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {preview.appointmentCount || 0}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Arquivo</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {file?.name}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </Card>
            </div>

            {/* Preview Clientes */}
            <Card>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Preview de Clientes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID Vagaro</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Desde</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {preview.sampleClients?.map((client: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {client.vagaroId}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {client.firstName} {client.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {client.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {client.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(client.memberSince).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                          R$ {client.totalSpent.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Preview Agendamentos */}
            <Card>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Preview de Agendamentos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Serviço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Artista</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Preço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {preview.sampleAppointments?.map((apt: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {apt.vagaroId}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {apt.clientName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {apt.service}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {apt.artist}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(apt.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {apt.time}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                          R$ {apt.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">
                            {apt.status}
                          </Badge>
                        </td>
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
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 gap-2"
              >
                {isLoading ? (
                  'Importando...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Importar {preview.clientCount + preview.appointmentCount} Registros
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Info adicional */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            O que será importado:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <strong>Clientes:</strong> Nome, email, telefone, histórico de compras, data de cadastro
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <strong>Agendamentos:</strong> Serviços, datas, horários, artistas, preços, status
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <strong>Histórico:</strong> Total gasto por cliente, número de visitas
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <strong>Validação:</strong> Dados serão validados antes da importação
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

