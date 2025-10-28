import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  CreditCard,
  User,
  Globe,
  Accessibility,
  Music,
  Thermometer,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

const PreferencesTab = ({ clientId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState(null);
  const [preferences, setPreferences] = useState({
    preferred_contact_method: 'email',
    preferred_contact_time: '',
    notification_appointment_reminder: true,
    notification_appointment_confirm: true,
    notification_followup: true,
    notification_marketing: false,
    preferred_session_duration: 120,
    preferred_days_of_week: [],
    preferred_time_of_day: '',
    avoid_days_of_week: [],
    preferred_artist_id: null,
    preferred_payment_method: '',
    preferred_language: 'pt-BR',
    accessibility_needs: '',
    dietary_restrictions: '',
    music_preferences: '',
    temperature_preference: 'normal',
    notes: ''
  });

  useEffect(() => {
    fetchPreferences();
  }, [clientId]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${clientId}/preferences`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Parse JSON fields
        const prefs = {
          ...result.data,
          preferred_days_of_week: result.data.preferred_days_of_week ? JSON.parse(result.data.preferred_days_of_week) : [],
          avoid_days_of_week: result.data.avoid_days_of_week ? JSON.parse(result.data.avoid_days_of_week) : []
        };
        setPreferences(prefs);
        setInitialPreferences(prefs);
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      toast.error('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${clientId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Preferências salvas com sucesso!');
        setHasChanges(false);
        setInitialPreferences(preferences);
      } else {
        toast.error('Erro ao salvar preferências');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(initialPreferences || preferences);
    setHasChanges(false);
    toast.info('Alterações descartadas');
  };

  const updatePreference = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleDay = (day, field) => {
    const currentDays = preferences[field] || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updatePreference(field, newDays);
  };

  const daysOfWeek = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save/Discard Bar */}
      {hasChanges && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <span className="text-yellow-800 font-medium">Você tem alterações não salvas</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} disabled={saving}>
                  <X size={16} className="mr-2" />
                  Descartar
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save size={16} className="mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="text-purple-500" />
            Preferências de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Método de Contato Preferido</label>
              <Select
                value={preferences.preferred_contact_method}
                onValueChange={(value) => updatePreference('preferred_contact_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><Mail size={16} className="inline mr-2" />Email</SelectItem>
                  <SelectItem value="phone"><Phone size={16} className="inline mr-2" />Telefone</SelectItem>
                  <SelectItem value="whatsapp"><MessageSquare size={16} className="inline mr-2" />WhatsApp</SelectItem>
                  <SelectItem value="sms"><MessageSquare size={16} className="inline mr-2" />SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Melhor Horário para Contato</label>
              <Input
                type="text"
                placeholder="Ex: 18:00-20:00"
                value={preferences.preferred_contact_time || ''}
                onChange={(e) => updatePreference('preferred_contact_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Idioma Preferido</label>
            <Select
              value={preferences.preferred_language}
              onValueChange={(value) => updatePreference('preferred_language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR"><Globe size={16} className="inline mr-2" />Português (BR)</SelectItem>
                <SelectItem value="en-US"><Globe size={16} className="inline mr-2" />English (US)</SelectItem>
                <SelectItem value="es-ES"><Globe size={16} className="inline mr-2" />Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-purple-500" />
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lembretes de Agendamento</p>
              <p className="text-sm text-gray-500">Receber lembretes antes dos compromissos</p>
            </div>
            <Switch
              checked={preferences.notification_appointment_reminder}
              onCheckedChange={(checked) => updatePreference('notification_appointment_reminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Confirmação de Agendamento</p>
              <p className="text-sm text-gray-500">Confirmar agendamentos via notificação</p>
            </div>
            <Switch
              checked={preferences.notification_appointment_confirm}
              onCheckedChange={(checked) => updatePreference('notification_appointment_confirm', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Follow-up pós-sessão</p>
              <p className="text-sm text-gray-500">Receber mensagens de acompanhamento</p>
            </div>
            <Switch
              checked={preferences.notification_followup}
              onCheckedChange={(checked) => updatePreference('notification_followup', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing e Promoções</p>
              <p className="text-sm text-gray-500">Receber ofertas especiais e novidades</p>
            </div>
            <Switch
              checked={preferences.notification_marketing}
              onCheckedChange={(checked) => updatePreference('notification_marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-purple-500" />
            Preferências de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Duração Preferida de Sessão (minutos)</label>
            <Input
              type="number"
              value={preferences.preferred_session_duration}
              onChange={(e) => updatePreference('preferred_session_duration', parseInt(e.target.value))}
              min="30"
              max="480"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Dias da Semana Disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <Button
                  key={day.value}
                  variant={preferences.preferred_days_of_week?.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value, 'preferred_days_of_week')}
                  className={preferences.preferred_days_of_week?.includes(day.value) ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Dias da Semana a Evitar</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <Button
                  key={day.value}
                  variant={preferences.avoid_days_of_week?.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value, 'avoid_days_of_week')}
                  className={preferences.avoid_days_of_week?.includes(day.value) ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Período do Dia Preferido</label>
            <Select
              value={preferences.preferred_time_of_day || 'any'}
              onValueChange={(value) => updatePreference('preferred_time_of_day', value === 'any' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any"><Clock size={16} className="inline mr-2" />Qualquer horário</SelectItem>
                <SelectItem value="morning"><Clock size={16} className="inline mr-2" />Manhã (8h-12h)</SelectItem>
                <SelectItem value="afternoon"><Clock size={16} className="inline mr-2" />Tarde (12h-18h)</SelectItem>
                <SelectItem value="evening"><Clock size={16} className="inline mr-2" />Noite (18h-22h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Other Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="text-purple-500" />
            Pagamento e Outras Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Método de Pagamento Preferido</label>
            <Select
              value={preferences.preferred_payment_method || 'none'}
              onValueChange={(value) => updatePreference('preferred_payment_method', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum preferido</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="card">Cartão de Crédito/Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preferência de Temperatura</label>
            <Select
              value={preferences.temperature_preference}
              onValueChange={(value) => updatePreference('temperature_preference', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold"><Thermometer size={16} className="inline mr-2" />Frio</SelectItem>
                <SelectItem value="normal"><Thermometer size={16} className="inline mr-2" />Normal</SelectItem>
                <SelectItem value="warm"><Thermometer size={16} className="inline mr-2" />Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preferências Musicais</label>
            <Input
              placeholder="Ex: Rock, Jazz, Sem música..."
              value={preferences.music_preferences || ''}
              onChange={(e) => updatePreference('music_preferences', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Necessidades de Acessibilidade</label>
            <Textarea
              placeholder="Descreva qualquer necessidade de acessibilidade..."
              value={preferences.accessibility_needs || ''}
              onChange={(e) => updatePreference('accessibility_needs', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Restrições Alimentares</label>
            <Input
              placeholder="Ex: Vegetariano, Intolerância à lactose..."
              value={preferences.dietary_restrictions || ''}
              onChange={(e) => updatePreference('dietary_restrictions', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notas Adicionais</label>
            <Textarea
              placeholder="Outras preferências ou informações relevantes..."
              value={preferences.notes || ''}
              onChange={(e) => updatePreference('notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      {hasChanges && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <X size={16} className="mr-2" />
            Descartar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Save size={16} className="mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreferencesTab;

