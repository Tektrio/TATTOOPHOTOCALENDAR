import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Edit, Save, X, Calendar as CalendarIcon, MapPin, User, Camera, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfileTab = ({ customer, onUpdate, shouldEdit, onEditStart }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...customer });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(customer?.avatar_url || null);
  const fileInputRef = useRef(null);

  // Ativar modo de edição quando shouldEdit for true
  React.useEffect(() => {
    if (shouldEdit && !editing) {
      setEditing(true);
      if (onEditStart) {
        onEditStart(); // Notificar que a edição foi iniciada
      }
    }
  }, [shouldEdit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...customer });
    setEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ A imagem deve ter no máximo 5MB');
      return;
    }

    // Preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload da imagem
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_URL}/api/customers/${customer.id}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Erro no upload');

      const data = await response.json();
      
      alert('✅ Foto de perfil atualizada com sucesso!');
      
      // Atualizar no estado local
      setFormData(prev => ({ ...prev, avatar_url: data.avatar_url }));
      
      // Chamar callback de atualização
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      alert('❌ Erro ao atualizar foto de perfil');
      setAvatarPreview(customer?.avatar_url || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview.startsWith('http') ? avatarPreview : `${API_URL}${avatarPreview}`}
                    alt={customer.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                onClick={triggerFileInput}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <p className="text-gray-600">{customer.email}</p>
              <p className="text-gray-600">{customer.phone}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={triggerFileInput}
                disabled={uploadingAvatar}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingAvatar ? 'Enviando...' : 'Alterar Foto'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => handleChange('gender', value)}
                disabled={!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                  <SelectItem value="prefer_not_say">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="@username"
                disabled={!editing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Rua / Endereço</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  maxLength={2}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de Emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Nome</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact || ''}
                onChange={(e) => handleChange('emergency_contact', e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Telefone</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_phone || ''}
                onChange={(e) => handleChange('emergency_phone', e.target.value)}
                disabled={!editing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Completas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {customer.total_appointments || 0}
              </div>
              <div className="text-sm text-gray-600">Total de Agendamentos</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {customer.completed_appointments || 0}
              </div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {customer.no_shows || 0}
              </div>
              <div className="text-sm text-gray-600">Faltas</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {customer.cancellations || 0}
              </div>
              <div className="text-sm text-gray-600">Cancelamentos</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                ${customer.total_sales || 0}
              </div>
              <div className="text-sm text-gray-600">Total Gasto</div>
            </div>

            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600">
                {customer.loyalty_points_balance || 0}
              </div>
              <div className="text-sm text-gray-600">Pontos de Fidelidade</div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-sm font-semibold text-teal-600">
                {customer.last_visit_date 
                  ? format(new Date(customer.last_visit_date), "dd/MM/yyyy", { locale: ptBR })
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Última Visita</div>
            </div>

            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-sm font-semibold text-pink-600">
                {customer.customer_since 
                  ? format(new Date(customer.customer_since), "dd/MM/yyyy", { locale: ptBR })
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Cliente Desde</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={!editing}
            rows={4}
            placeholder="Observações gerais sobre o cliente..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;

