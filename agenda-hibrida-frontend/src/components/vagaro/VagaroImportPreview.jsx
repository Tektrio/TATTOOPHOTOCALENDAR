/**
 * Componente de Preview de Arquivo Vagaro
 * Mostra preview dos dados antes de importar
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export default function VagaroImportPreview({ preview, onConfirm, onCancel }) {
  if (!preview) return null;

  const { file_name, detected_type, total_rows, headers, sample_data } = preview;

  const getTypeInfo = (type) => {
    const types = {
      customers: { label: 'Clientes', color: 'bg-blue-500', icon: '👤' },
      deposits: { label: 'Transações', color: 'bg-green-500', icon: '💳' },
      services: { label: 'Serviços', color: 'bg-purple-500', icon: '🔧' },
      giftcards: { label: 'Gift Cards', color: 'bg-pink-500', icon: '🎁' },
      forms: { label: 'Formulários', color: 'bg-orange-500', icon: '📋' },
      unknown: { label: 'Desconhecido', color: 'bg-gray-500', icon: '❓' }
    };

    return types[type] || types.unknown;
  };

  const typeInfo = getTypeInfo(detected_type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Preview de Importação</h2>
            </div>
            <p className="text-sm text-gray-500">{file_name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Informações Detectadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {typeInfo.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo Detectado</p>
                  <p className="text-lg font-semibold">{typeInfo.label}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total de Linhas</p>
                  <p className="text-lg font-semibold">{total_rows.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Colunas</p>
                  <p className="text-lg font-semibold">{headers.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerta de Detecção */}
          {detected_type === 'unknown' ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tipo de arquivo não reconhecido!</strong> Verifique se o arquivo é um Excel válido do Vagaro.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Detecção bem-sucedida!</strong> O sistema identificou este arquivo como <strong>{typeInfo.label}</strong>.
              </AlertDescription>
            </Alert>
          )}

          {/* Cabeçalhos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Colunas Detectadas ({headers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {headers.map((header, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {header}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preview dos Dados */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preview dos Dados (primeiras 10 linhas)</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                    {headers.slice(0, 6).map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left font-medium text-gray-500">
                        {header}
                      </th>
                    ))}
                    {headers.length > 6 && (
                      <th className="px-3 py-2 text-left font-medium text-gray-500">...</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sample_data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{rowIndex + 1}</td>
                      {headers.slice(0, 6).map((header, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 max-w-[200px] truncate">
                          {row[header] || <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                      {headers.length > 6 && (
                        <td className="px-3 py-2 text-gray-400">...</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            {detected_type === 'unknown' ? (
              <span className="text-red-600 font-medium">⚠️ Não é possível importar este arquivo</span>
            ) : (
              <span>Tudo pronto para importar <strong>{total_rows}</strong> registro(s)</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={detected_type === 'unknown'}
              className="min-w-[150px]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Importação
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

