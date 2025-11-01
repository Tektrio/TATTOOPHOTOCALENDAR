'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  preferred_language?: string;
  preferred_contact_method?: string;
  notification_preferences?: string;
}

export default function PreferencesTab({ customer, onRefresh }: { customer: Customer; onRefresh: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_language: customer.preferred_language || 'pt-BR',
    preferred_contact_method: customer.preferred_contact_method || 'whatsapp',
    notification_preferences: customer.notification_preferences || 'all'
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/clients/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        toast.success('✅ Preferências atualizadas!');
        setIsEditing(false);
        onRefresh();
      } else {
        toast.error('❌ Erro ao atualizar preferências');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Preferências do Cliente</h2>
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
            <Button onClick={() => setIsEditing(false)} variant="outline" className="border-gray-600 text-gray-300">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Preferências de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language" className="text-white">Idioma Preferido</Label>
            {isEditing ? (
              <Select value={preferences.preferred_language} onValueChange={(value) => setPreferences({...preferences, preferred_language: value})}>
                <SelectTrigger className="bg-gray-900 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-gray-300 mt-2">{preferences.preferred_language}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_method" className="text-white">Método de Contato Preferido</Label>
            {isEditing ? (
              <Select value={preferences.preferred_contact_method} onValueChange={(value) => setPreferences({...preferences, preferred_contact_method: value})}>
                <SelectTrigger className="bg-gray-900 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-gray-300 mt-2">{preferences.preferred_contact_method}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notifications" className="text-white">Preferências de Notificação</Label>
            {isEditing ? (
              <Select value={preferences.notification_preferences} onValueChange={(value) => setPreferences({...preferences, notification_preferences: value})}>
                <SelectTrigger className="bg-gray-900 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as notificações</SelectItem>
                  <SelectItem value="important">Apenas importantes</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-gray-300 mt-2">{preferences.notification_preferences}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

