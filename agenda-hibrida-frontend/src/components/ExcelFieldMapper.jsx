/**
 * Componente de Mapeamento de Campos Excel
 * Permite preview e ajuste do mapeamento de colunas antes da importação
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function ExcelFieldMapper({ preview, type, onImport, onCancel }) {
  const [mapping, setMapping] = useState(preview.suggestedMapping || {});
  
  // Campos requeridos por tipo
  const requiredFields = {
    clients: ['name'],
    appointments: ['client_name', 'date', 'time']
  };

  // Todos os campos possíveis
  const allFields = {
    clients: {
      name: 'Nome do Cliente *',
      email: 'Email',
      phone: 'Telefone',
      birth_date: 'Data de Nascimento',
      address: 'Endereço',
      city: 'Cidade',
      state: 'Estado',
      zip_code: 'CEP',
      notes: 'Observações',
      external_id: 'ID Externo (Vagaro)'
    },
    appointments: {
      client_name: 'Nome do Cliente *',
      date: 'Data *',
      time: 'Horário *',
      end_time: 'Horário Fim',
      service: 'Serviço',
      title: 'Título',
      status: 'Status',
      notes: 'Observações',
      price: 'Preço',
      duration: 'Duração (min)',
      external_id: 'ID Externo (Vagaro)'
    }
  };

  const fields = allFields[type] || {};
  const required = requiredFields[type] || [];

  const handleMappingChange = (field, column) => {
    setMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  const handleClearMapping = (field) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[field];
      return newMapping;
    });
  };

  const handleImport = () => {
    // Validar campos requeridos
    const missingFields = required.filter(field => !mapping[field]);
    
    if (missingFields.length > 0) {
      alert(`Campos obrigatórios não mapeados: ${missingFields.join(', ')}`);
      return;
    }

    onImport(mapping);
  };

  const isMapped = (column) => {
    return Object.values(mapping).includes(column);
  };

  const availableColumns = preview.headers.filter(h => !isMapped(h));

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Revise o mapeamento automático de colunas. Campos marcados com * são obrigatórios.
          <div className="mt-2 font-semibold">
            {preview.totalRows} linhas serão processadas
          </div>
        </AlertDescription>
      </Alert>

      {/* Mapeamento de Campos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mapeamento de Colunas</h3>
        
        <div className="space-y-3">
          {Object.entries(fields).map(([field, label]) => {
            const isRequired = required.includes(field);
            const currentMapping = mapping[field];

            return (
              <div key={field} className="flex items-center gap-4">
                <div className="w-48 font-medium flex items-center gap-2">
                  {label}
                  {isRequired && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                </div>
                
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={currentMapping || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className={`flex-1 p-2 border rounded-lg ${
                      isRequired && !currentMapping ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Selecione uma coluna...</option>
                    {preview.headers.map(header => (
                      <option
                        key={header}
                        value={header}
                        disabled={isMapped(header) && currentMapping !== header}
                      >
                        {header}
                        {isMapped(header) && currentMapping !== header ? ' (já mapeada)' : ''}
                      </option>
                    ))}
                  </select>

                  {currentMapping && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearMapping(field)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {availableColumns.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Colunas não mapeadas ({availableColumns.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColumns.map(col => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Preview dos Dados */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Preview dos Dados (primeiras {Math.min(10, preview.preview.length)} linhas)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="preview-table">
            <thead>
              <tr className="bg-gray-100">
                {Object.entries(fields).map(([field, label]) => {
                  if (mapping[field]) {
                    return (
                      <th key={field} className="p-2 text-left border">
                        {label.replace(' *', '')}
                        <div className="text-xs text-gray-500 font-normal mt-1">
                          {mapping[field]}
                        </div>
                      </th>
                    );
                  }
                  return null;
                })}
              </tr>
            </thead>
            <tbody>
              {preview.preview.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.entries(fields).map(([field]) => {
                    if (mapping[field]) {
                      const value = row[mapping[field]];
                      return (
                        <td key={field} className="p-2 border">
                          {value || <span className="text-gray-400 italic">vazio</span>}
                        </td>
                      );
                    }
                    return null;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {preview.totalRows > 10 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            + {preview.totalRows - 10} linhas adicionais serão importadas
          </div>
        )}
      </Card>

      {/* Ações */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleImport} size="lg" data-testid="btn-confirm-import">
          <Upload className="w-4 h-4 mr-2" />
          Importar {preview.totalRows} {type === 'clients' ? 'Clientes' : 'Agendamentos'}
        </Button>
      </div>
    </div>
  );
}
