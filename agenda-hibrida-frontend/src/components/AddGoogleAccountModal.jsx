import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Cloud, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { DESTINATION_COLORS } from '../utils/storageConfig';

/**
 * Modal para adicionar nova conta Google Drive
 * Inicia processo OAuth e mostra preview da cor
 */
export default function AddGoogleAccountModal({ 
  open, 
  onOpenChange, 
  onAdd,
  existingAccountsCount = 0 
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // ============================================
  // LISTENER PARA RECEBER CÓDIGO OAUTH DO CALLBACK
  // ============================================
  useEffect(() => {
    const handleMessage = async (event) => {
      // Recebe código OAuth da janela popup
      if (event.data.type === 'google-oauth' && event.data.code) {
        const code = event.data.code;
        const pending = localStorage.getItem('pending_google_account');
        
        if (!pending) {
          console.warn('⚠️ Nenhuma conta pendente encontrada no localStorage');
          return;
        }
        
        try {
          const pendingData = JSON.parse(pending);
          console.log('📧 Processando autenticação OAuth para:', pendingData.name);
          
          setLoading(true);
          
          // Envia código para o backend completar OAuth
          const response = await fetch(`${API_URL}/api/google-accounts/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              destinationId: pendingData.destinationId
            })
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            console.log('✅ Google Drive conectado com sucesso!');
            toast.success(`✅ Conta "${pendingData.name}" conectada com sucesso!`);
            
            // Limpa localStorage
            localStorage.removeItem('pending_google_account');
            
            // Notifica componente pai para recarregar lista
            if (onAdd) onAdd();
            
            // Fecha o modal
            handleClose();
          } else {
            console.error('❌ Erro ao conectar conta:', result);
            toast.error(`Erro: ${result.error || 'Falha ao conectar conta'}`);
          }
        } catch (error) {
          console.error('❌ Erro ao processar callback OAuth:', error);
          toast.error('Erro ao processar autenticação: ' + error.message);
        } finally {
          setLoading(false);
        }
      } else if (event.data.error) {
        // Recebeu erro do callback
        console.error('❌ Erro no callback OAuth:', event.data.error);
        
        // Verifica se é erro 403: access_denied
        if (event.data.error.includes('403') || event.data.error.includes('access_denied')) {
          // Mostra mensagem específica para erro OAuth 403
          const errorMsg = `
⚠️ Autenticação cancelada ou falhou.

Se você viu erro "403: access_denied", significa que:

• O app está em modo de TESTE no Google Cloud
• Você precisa ser adicionado como testador autorizado
• OU o app precisa ser publicado em PRODUÇÃO

Consulte o guia "GOOGLE_OAUTH_SOLUCAO_COMPLETA.md" para resolver.
          `.trim();
          
          // Cria um alerta personalizado
          if (confirm(errorMsg + '\n\nDeseja abrir o guia de solução?')) {
            window.open('/GOOGLE_OAUTH_SOLUCAO_COMPLETA.md', '_blank');
          }
        } else {
          toast.error(`Erro: ${event.data.error}`);
        }
        
        setLoading(false);
        localStorage.removeItem('pending_google_account');
      }
    };
    
    // Adiciona listener
    window.addEventListener('message', handleMessage);
    
    // Remove listener ao desmontar
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [API_URL, onAdd]);

  // Próxima cor disponível
  const nextColor = DESTINATION_COLORS.gdrive[existingAccountsCount % DESTINATION_COLORS.gdrive.length];

  const handleStart = async () => {
    if (!name.trim()) {
      alert('Digite um nome para a conta');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/google-accounts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar OAuth');
      }

      const data = await response.json();
      // const oauthUrl = data.authUrl; // Removido - não necessário, URL já está em data

      // Abre OAuth em nova janela
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        data.authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Salva destinationId para o callback
      localStorage.setItem('pending_google_account', JSON.stringify({
        destinationId: data.destinationId,
        name: name.trim(),
        color: data.suggestedColor
      }));

      if (onAdd) onAdd(data);
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar conta Google:', error);
      alert('Erro ao conectar com Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <Cloud className="w-6 h-6 text-blue-400" />
            Adicionar Google Drive
          </DialogTitle>
          <DialogDescription className="text-sm">
            Conecte uma nova conta para sincronização
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-sm font-medium">Nome da Conta</Label>
            <Input
              id="account-name"
              placeholder="Ex: Backup, Trabalho..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="h-10"
            />
          </div>

          {/* Preview da Cor */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Identificação Visual</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-3xl">{nextColor.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white">{nextColor.label}</p>
                <p className="text-xs text-gray-400">Cor desta conta no sistema</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-950/30 border border-blue-800/30 rounded-lg">
            <p className="text-sm text-blue-300 leading-relaxed">
              ℹ️ Você será redirecionado ao Google para autorização. Retorne após concluir.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-3 gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="h-10">
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={loading || !name.trim()} className="h-10">
            {loading ? (
              <>🔄 Conectando...</>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Conectar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

