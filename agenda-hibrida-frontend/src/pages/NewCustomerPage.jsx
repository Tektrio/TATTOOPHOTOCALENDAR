/**
 * Página de Criação de Novo Cliente
 * Rota: /customers/new
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { validateClientForm } from '../utils/validation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulário
    const validation = validateClientForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar cliente');
      }

      const data = await response.json();
      toast.success(`Cliente "${formData.name}" criado com sucesso!`);
      
      // Redirecionar para a página do cliente recém-criado
      navigate(`/customers/${data.id || data.customer?.id}`);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast.error(error.message || 'Erro ao criar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
          </Button>
          
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <User className="w-8 h-8" />
            Novo Cliente
          </h1>
          <p className="text-gray-400 mt-1">
            Preencha os dados do novo cliente
          </p>
        </div>

        {/* Formulário */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Informações do Cliente</CardTitle>
            <CardDescription className="text-gray-400">
              Campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome Completo *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Digite o nome completo"
                    className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`pl-10 bg-gray-700 border-gray-600 text-white ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">
                  Endereço
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Endereço completo"
                    className="pl-10 bg-gray-700 border-gray-600 text-white resize-none"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Observações
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Notas adicionais sobre o cliente..."
                    className="pl-10 bg-gray-700 border-gray-600 text-white resize-none"
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

