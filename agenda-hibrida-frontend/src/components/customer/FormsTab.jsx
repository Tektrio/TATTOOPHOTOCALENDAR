import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { 
  FileText, 
  Plus, 
  X, 
  Eye,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const FormsTab = ({ customerId, customerData }) => {
  const [forms, setForms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fillDialog, setFillDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState({ open: false, form: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, form: null });
  
  // Estado para novo formulário
  const [newForm, setNewForm] = useState({
    template_id: '',
    responses: {}
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [formsRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/customers/${customerId}/forms`),
        fetch(`${API_URL}/api/form-templates`)
      ]);
      
      if (!formsRes.ok || !templatesRes.ok) {
        throw new Error('Erro ao carregar dados');
      }
      
      const [formsData, templatesData] = await Promise.all([
        formsRes.json(),
        templatesRes.json()
      ]);
      
      setForms(formsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar formulários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [customerId, API_URL]);

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId, loadData]);

  // Selecionar template
  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      const initialResponses = {};
      template.fields.forEach(field => {
        initialResponses[field.name] = field.type === 'checkbox' ? false : '';
      });
      setNewForm({
        template_id: templateId,
        responses: initialResponses
      });
    }
  };

  // Atualizar resposta
  const updateResponse = (fieldName, value) => {
    setNewForm({
      ...newForm,
      responses: {
        ...newForm.responses,
        [fieldName]: value
      }
    });
  };

  // Salvar formulário
  const handleSaveForm = async () => {
    try {
      setError(null);
      
      if (!newForm.template_id) {
        setError('Selecione um formulário');
        return;
      }

      const formData = {
        template_id: Number(newForm.template_id),
        responses: newForm.responses,
        status: 'completed'
      };

      const response = await fetch(`${API_URL}/api/customers/${customerId}/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar formulário');
      }

      setSuccess('Formulário salvo com sucesso!');
      
      // Reset
      setNewForm({
        template_id: '',
        responses: {}
      });
      
      setFillDialog(false);
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar formulário:', err);
      setError(err.message || 'Erro ao salvar formulário. Tente novamente.');
    }
  };

  // Deletar formulário
  const handleDeleteForm = async (formId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/customers/${customerId}/forms/${formId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar formulário');
      }

      setSuccess('Formulário deletado com sucesso!');
      await loadData();
      setDeleteDialog({ open: false, form: null });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar formulário:', err);
      setError('Erro ao deletar formulário. Tente novamente.');
    }
  };

  // Renderizar campo do formulário
  const renderField = (field, value, onChange) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value || false}
              onCheckedChange={(checked) => onChange(field.name, checked)}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-normal cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
    }
  };

  // Renderizar valor da resposta para visualização
  const renderValue = (field, value) => {
    if (field.type === 'checkbox') {
      return value ? (
        <Badge className="bg-green-500">Sim</Badge>
      ) : (
        <Badge variant="outline">Não</Badge>
      );
    }
    
    return <p className="text-gray-700">{value || '-'}</p>;
  };

  // Obter cor do tipo de formulário
  const getTypeColor = (type) => {
    switch (type) {
      case 'consent':
        return 'bg-red-500';
      case 'medical':
        return 'bg-blue-500';
      case 'checkin':
        return 'bg-green-500';
      case 'aftercare':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obter label do tipo
  const getTypeLabel = (type) => {
    const labels = {
      consent: 'Consentimento',
      medical: 'Médico',
      checkin: 'Check-in',
      aftercare: 'Pós-procedimento',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando formulários...</p>
        </CardContent>
      </Card>
    );
  }

  const selectedTemplate = templates.find(t => t.id.toString() === newForm.template_id);

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{success}</span>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formulários
            </CardTitle>
            <Button onClick={() => setFillDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Preencher Formulário
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Formulários */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum formulário encontrado</p>
            <p className="text-sm">Preencha o primeiro formulário para este cliente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{form.template_name || 'Formulário'}</h3>
                    <p className="text-sm text-gray-600">
                      Preenchido em {new Date(form.filled_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={getTypeColor(form.template_type)}>
                    {getTypeLabel(form.template_type)}
                  </Badge>
                </div>

                {form.status === 'completed' && (
                  <div className="flex items-center gap-2 mb-4 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Completo</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewDialog({ open: true, form })}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteDialog({ open: true, form })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de preenchimento */}
      <Dialog open={fillDialog} onOpenChange={setFillDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preencher Formulário</DialogTitle>
            <DialogDescription>
              Preencha um formulário para {customerData?.name || 'o cliente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Seleção de template */}
            <div>
              <Label htmlFor="template">Selecione o Formulário *</Label>
              <Select 
                value={newForm.template_id} 
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um formulário" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      <div>
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-gray-500 block">
                            {template.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos do formulário */}
            {selectedTemplate && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-bold text-lg">{selectedTemplate.name}</h3>
                {selectedTemplate.description && (
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                )}
                
                <div className="space-y-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name}>
                      {field.type !== 'checkbox' && (
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      )}
                      {renderField(field, newForm.responses[field.name], updateResponse)}
                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFillDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveForm} disabled={!newForm.template_id}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Salvar Formulário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualização */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, form: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewDialog.form?.template_name}</DialogTitle>
            <DialogDescription>
              Preenchido em {viewDialog.form && new Date(viewDialog.form.filled_at).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {viewDialog.form && viewDialog.form.template_fields && (
              <>
                {JSON.parse(viewDialog.form.template_fields).map((field) => (
                  <div key={field.name} className="border-b pb-3">
                    <Label className="text-sm font-medium text-gray-600">
                      {field.label}
                    </Label>
                    <div className="mt-1">
                      {renderValue(field, viewDialog.form.responses[field.name])}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, form: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o formulário "{deleteDialog.form?.template_name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteForm(deleteDialog.form?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsTab;
