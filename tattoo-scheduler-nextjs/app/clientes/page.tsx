'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Eye,
  User
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export default function ClientesPage() {
  const { isDark } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
    setFilteredClients(filtered);
  };

  const createClient = async () => {
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        toast.success('✅ Cliente cadastrado com sucesso!');
        setShowNewClient(false);
        setNewClient({ name: '', email: '', phone: '', notes: '' });
        loadClients();
      } else {
        const errorData = await response.json();
        toast.error(`❌ Erro: ${errorData.error || 'Tente novamente'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const deleteClient = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ Cliente excluído com sucesso!');
        loadClients();
      } else {
        toast.error('❌ Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Clientes
          </h2>
          <p className="text-gray-400 mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">Novo Cliente</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os dados do novo cliente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Ex: João Silva"
                  className="bg-gray-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white">Telefone *</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="bg-gray-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="joao@email.com"
                  className="bg-gray-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-white">Observações</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Notas sobre o cliente..."
                  className="bg-gray-800 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={createClient} className="flex-1 bg-purple-500 hover:bg-purple-600">
                  Cadastrar Cliente
                </Button>
                <Button variant="outline" onClick={() => setShowNewClient(false)} className="border-gray-600 text-gray-300">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="pl-10 bg-gray-800 text-white border-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="text-center text-white py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4">Carregando...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-purple-200">
              {searchTerm ? 'Tente outro termo de busca' : 'Comece cadastrando seu primeiro cliente'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className={`backdrop-blur-md transition-all hover:scale-105 ${
              isDark ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">{client.name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-300 text-sm">
                  <Phone className="w-4 h-4 mr-2" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                )}
                {client.notes && (
                  <p className="text-gray-400 text-sm line-clamp-2">{client.notes}</p>
                )}
                <div className="flex items-center text-gray-400 text-xs mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteClient(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo */}
      {!loading && filteredClients.length > 0 && (
        <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
          <CardContent className="p-4">
            <p className="text-white text-center">
              Mostrando {filteredClients.length} de {clients.length} clientes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

