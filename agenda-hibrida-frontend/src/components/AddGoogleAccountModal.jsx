import { useState } from 'react';
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
  const [oauthUrl, setOauthUrl] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      setOauthUrl(data.authUrl);

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
    setOauthUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Adicionar Conta Google Drive
          </DialogTitle>
          <DialogDescription>
            Conecte uma nova conta Google Drive para sincronização
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Conta */}
          <div className="space-y-2">
            <Label htmlFor="account-name">Nome da Conta</Label>
            <Input
              id="account-name"
              placeholder="Ex: Backup, Trabalho, Compartilhada..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400">
              Escolha um nome descritivo para identificar esta conta
            </p>
          </div>

          {/* Preview da Cor */}
          <div className="space-y-2">
            <Label>Cor Atribuída</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <span className="text-3xl">{nextColor.emoji}</span>
              <div>
                <p className="font-semibold text-white">{nextColor.label}</p>
                <p className="text-xs text-gray-400">
                  Esta será a cor visual desta conta no sistema
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-950 border border-blue-800 rounded-lg">
            <p className="text-sm text-blue-200">
              ℹ️ Você será redirecionado para o Google para autorizar o acesso.
              Após autorizar, retorne a esta página.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={loading || !name.trim()}>
            {loading ? (
              <>🔄 Conectando...</>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Conectar com Google
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

