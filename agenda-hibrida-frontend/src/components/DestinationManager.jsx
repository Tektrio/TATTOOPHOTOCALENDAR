import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Server, Power, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getColorConfig } from '../utils/storageConfig';

/**
 * Card visual de destino individual (Google Drive ou QNAP)
 * Mostra status, estatísticas e ações disponíveis
 */
export default function DestinationManager({ 
  destination, 
  onTest, 
  onRemove, 
  onConfigure,
  onToggleEnabled 
}) {
  const colorConfig = getColorConfig(destination.color, destination.type);
  const Icon = destination.type === 'gdrive' ? Cloud : Server;

  const handleTest = () => {
    if (onTest) onTest(destination.id);
  };

  const handleRemove = () => {
    if (onRemove) onRemove(destination.id);
  };

  const handleConfigure = () => {
    if (onConfigure) onConfigure(destination);
  };

  const handleToggle = () => {
    if (onToggleEnabled) onToggleEnabled(destination.id, !destination.enabled);
  };

  return (
    <Card className={`border-2 ${colorConfig.borderClass} ${destination.enabled ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorConfig.bgClass}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">{colorConfig.emoji}</span>
                {destination.name}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                {destination.type === 'gdrive' ? 'Google Drive' : 'QNAP NAS'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {destination.enabled ? (
              <Badge variant="outline" className="border-green-500 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="outline" className="border-gray-500 text-gray-400">
                <XCircle className="w-3 h-3 mr-1" />
                Desativado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-lg">
          <div>
            <p className="text-xs text-gray-400">Arquivos Sincronizados</p>
            <p className="text-2xl font-bold text-white">
              {destination.synced_files_count || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Falhas</p>
            <p className="text-2xl font-bold text-red-400">
              {destination.failed_files_count || 0}
            </p>
          </div>
        </div>

        {/* Info adicional (Google Drive) */}
        {destination.type === 'gdrive' && destination.config?.userInfo && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Conta Conectada</p>
            <p className="text-sm text-white truncate">
              {destination.config.userInfo.email}
            </p>
          </div>
        )}

        {/* Info adicional (QNAP) */}
        {destination.type === 'qnap' && destination.config && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Host</p>
            <p className="text-sm text-white">
              {destination.config.host}
              {destination.config.port && `:${destination.config.port}`}
            </p>
            <p className="text-xs text-gray-400 mt-2">Protocolo</p>
            <p className="text-sm text-white uppercase">
              {destination.config.protocol}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Testar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="flex-1"
          >
            <Power className="w-4 h-4 mr-1" />
            {destination.enabled ? 'Desativar' : 'Ativar'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleConfigure}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-400 border-red-500 hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

