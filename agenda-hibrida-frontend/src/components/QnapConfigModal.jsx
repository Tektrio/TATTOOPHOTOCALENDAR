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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, CheckCircle, AlertCircle } from 'lucide-react';
import { validateQnapConfig } from '../utils/syncHelpers';

/**
 * Modal de configuração QNAP NAS
 * Formulário completo com validação e teste de conexão
 */
export default function QnapConfigModal({ 
  open, 
  onOpenChange,
  initialConfig = null,
  onSave
}) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState('webdav');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remotePath, setRemotePath] = useState('/');
  const [secure, setSecure] = useState(false);
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carrega configuração inicial se estiver editando
  useEffect(() => {
    if (open && initialConfig) {
      setName(initialConfig.name || '');
      setHost(initialConfig.config?.host || '');
      setPort(initialConfig.config?.port?.toString() || '');
      setProtocol(initialConfig.config?.protocol || 'webdav');
      setUsername(initialConfig.config?.username || '');
      setPassword(initialConfig.config?.password || '');
      setRemotePath(initialConfig.config?.remotePath || '/');
      setSecure(initialConfig.config?.secure || false);
    }
  }, [open, initialConfig]);

  const getConfig = () => ({
    host,
    port: port ? parseInt(port) : (protocol === 'webdav' ? (secure ? 443 : 80) : 21),
    protocol,
    username,
    password,
    remotePath,
    secure
  });

  const handleTest = async () => {
    const config = getConfig();
    const validation = validateQnapConfig(config);

    if (!validation.valid) {
      alert('Erros: ' + validation.errors.join(', '));
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${API_URL}/api/qnap/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      const data = await response.json();
      setTestResult(data.testResult);
    } catch (error) {
      setTestResult({
        valid: false,
        errors: [error.message]
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Digite um nome para o QNAP');
      return;
    }

    const config = getConfig();
    const validation = validateQnapConfig(config);

    if (!validation.valid) {
      alert('Erros: ' + validation.errors.join(', '));
      return;
    }

    setSaving(true);

    try {
      const endpoint = initialConfig 
        ? `${API_URL}/api/sync-destinations/${initialConfig.id}`
        : `${API_URL}/api/qnap/configure`;

      const method = initialConfig ? 'PUT' : 'POST';

      const body = initialConfig
        ? { name: name.trim(), config }
        : { name: name.trim(), config };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configuração');
      }

      const data = await response.json();

      if (onSave) onSave(data);
      handleClose();
    } catch (error) {
      console.error('Erro ao configurar QNAP:', error);
      alert('Erro ao configurar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setHost('');
    setPort('');
    setProtocol('webdav');
    setUsername('');
    setPassword('');
    setRemotePath('/');
    setSecure(false);
    setTestResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <Server className="w-6 h-6 text-purple-400" />
            {initialConfig ? 'Editar' : 'Configurar'} QNAP NAS
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure a conexão com seu servidor QNAP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          {/* Nome e Host em grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="qnap-name" className="text-sm font-medium">Nome *</Label>
              <Input
                id="qnap-name"
                placeholder="QNAP Studio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qnap-host" className="text-sm font-medium">Host/IP *</Label>
              <Input
                id="qnap-host"
                placeholder="192.168.1.100"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Protocolo e Porta em grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="qnap-protocol" className="text-sm font-medium">Protocolo *</Label>
              <Select value={protocol} onValueChange={setProtocol}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webdav">WebDAV</SelectItem>
                  <SelectItem value="ftp">FTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="qnap-port" className="text-sm font-medium">Porta</Label>
              <Input
                id="qnap-port"
                type="number"
                placeholder={protocol === 'webdav' ? '80/443' : '21'}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* HTTPS checkbox */}
          {protocol === 'webdav' && (
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="qnap-secure"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="qnap-secure" className="text-sm cursor-pointer">
                Usar HTTPS (conexão segura)
              </Label>
            </div>
          )}

          {/* Usuário e Senha em grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="qnap-user" className="text-sm font-medium">Usuário *</Label>
              <Input
                id="qnap-user"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qnap-pass" className="text-sm font-medium">Senha *</Label>
              <Input
                id="qnap-pass"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Pasta Remota */}
          <div className="space-y-1">
            <Label htmlFor="qnap-path" className="text-sm font-medium">Pasta Remota</Label>
            <Input
              id="qnap-path"
              placeholder="/"
              value={remotePath}
              onChange={(e) => setRemotePath(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <Alert className={testResult.valid ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-800'}>
              <AlertDescription className="flex items-start gap-2">
                {testResult.valid ? (
                  <>
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400" />
                    <div className="flex-1">
                      <p className="text-green-200 font-semibold">Conexão bem-sucedida!</p>
                      {testResult.warnings && testResult.warnings.length > 0 && (
                        <ul className="text-xs text-green-300 mt-1 ml-4 list-disc">
                          {testResult.warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mt-0.5 text-red-400" />
                    <div className="flex-1">
                      <p className="text-red-200 font-semibold">Falha na conexão</p>
                      {testResult.errors && (
                        <ul className="text-xs text-red-300 mt-1 ml-4 list-disc">
                          {testResult.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2 mt-3">
          <Button variant="outline" onClick={handleTest} disabled={testing || saving} className="h-10 text-sm">
            {testing ? '⏳ Testando...' : 'Testar'}
          </Button>
          <div className="flex-1"></div>
          <Button variant="outline" onClick={handleClose} disabled={saving} className="h-10">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !testResult?.valid} className="h-10">
            {saving ? '💾 Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

