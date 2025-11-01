'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  createdAt: string;
}

interface OverviewTabProps {
  customer: Customer;
  onRefresh: () => void;
}

export default function OverviewTab({ customer, onRefresh }: OverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zip_code: customer.zip_code || '',
    notes: customer.notes || ''
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/clients/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('✅ Informações atualizadas com sucesso!');
        setIsEditing(false);
        onRefresh();
      } else {
        toast.error('❌ Erro ao atualizar informações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip_code: customer.zip_code || '',
      notes: customer.notes || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Informações do Cliente</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={handleCancel} variant="outline" className="border-gray-600 text-gray-300">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Informações Pessoais */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.email || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="createdAt" className="text-white">Cliente desde</Label>
              <p className="text-gray-300 mt-2">
                {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-white">Rua/Avenida</Label>
            {isEditing ? (
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="bg-gray-900 text-white"
              />
            ) : (
              <p className="text-gray-300 mt-2">{customer.address || '-'}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-white">Cidade</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.city || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="text-white">Estado</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.state || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zip_code" className="text-white">CEP</Label>
              {isEditing ? (
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  className="bg-gray-900 text-white"
                />
              ) : (
                <p className="text-gray-300 mt-2">{customer.zip_code || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Adicione observações sobre o cliente..."
              className="bg-gray-900 text-white"
              rows={5}
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{customer.notes || 'Nenhuma observação cadastrada.'}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

