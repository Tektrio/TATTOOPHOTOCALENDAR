'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface HealthInfo {
  allergies?: string;
  medications?: string;
  medical_conditions?: string;
  blood_type?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export default function HealthTab({ customerId }: { customerId: number }) {
  const [healthInfo, setHealthInfo] = useState<HealthInfo>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthInfo();
  }, [customerId]);

  const loadHealthInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/health`);
      if (response.ok) {
        const data = await response.json();
        setHealthInfo(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/clients/${customerId}/health`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthInfo)
      });

      if (response.ok) {
        toast.success('✅ Informações de saúde atualizadas!');
        setIsEditing(false);
        loadHealthInfo();
      } else {
        toast.error('❌ Erro ao atualizar informações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando informações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Informações de Saúde</h2>
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

      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Informações Sensíveis</p>
              <p>Estas informações são confidenciais e devem ser mantidas em sigilo.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Condições Médicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="allergies" className="text-white">Alergias</Label>
            {isEditing ? (
              <Textarea
                id="allergies"
                value={healthInfo.allergies || ''}
                onChange={(e) => setHealthInfo({...healthInfo, allergies: e.target.value})}
                placeholder="Ex: Alergia a látex, produtos químicos..."
                className="bg-gray-900 text-white mt-2"
                rows={3}
              />
            ) : (
              <p className="text-gray-300 mt-2">{healthInfo.allergies || 'Nenhuma alergia registrada'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="medications" className="text-white">Medicamentos em Uso</Label>
            {isEditing ? (
              <Textarea
                id="medications"
                value={healthInfo.medications || ''}
                onChange={(e) => setHealthInfo({...healthInfo, medications: e.target.value})}
                placeholder="Liste os medicamentos..."
                className="bg-gray-900 text-white mt-2"
                rows={3}
              />
            ) : (
              <p className="text-gray-300 mt-2">{healthInfo.medications || 'Nenhum medicamento registrado'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="medical_conditions" className="text-white">Condições Médicas</Label>
            {isEditing ? (
              <Textarea
                id="medical_conditions"
                value={healthInfo.medical_conditions || ''}
                onChange={(e) => setHealthInfo({...healthInfo, medical_conditions: e.target.value})}
                placeholder="Ex: Diabetes, hipertensão..."
                className="bg-gray-900 text-white mt-2"
                rows={3}
              />
            ) : (
              <p className="text-gray-300 mt-2">{healthInfo.medical_conditions || 'Nenhuma condição registrada'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Contato de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact" className="text-white">Nome</Label>
              {isEditing ? (
                <Textarea
                  id="emergency_contact"
                  value={healthInfo.emergency_contact || ''}
                  onChange={(e) => setHealthInfo({...healthInfo, emergency_contact: e.target.value})}
                  className="bg-gray-900 text-white mt-2"
                />
              ) : (
                <p className="text-gray-300 mt-2">{healthInfo.emergency_contact || '-'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency_phone" className="text-white">Telefone</Label>
              {isEditing ? (
                <Textarea
                  id="emergency_phone"
                  value={healthInfo.emergency_phone || ''}
                  onChange={(e) => setHealthInfo({...healthInfo, emergency_phone: e.target.value})}
                  className="bg-gray-900 text-white mt-2"
                />
              ) : (
                <p className="text-gray-300 mt-2">{healthInfo.emergency_phone || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

