import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const NotesTab = ({ customerId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, [customerId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers/${customerId}/notes`);
      if (!response.ok) throw new Error('Erro ao buscar notas');
      const data = await response.json();
      setNotes(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      const url = currentNote.id
        ? `${API_URL}/api/customers/${customerId}/notes/${currentNote.id}`
        : `${API_URL}/api/customers/${customerId}/notes`;
      
      const method = currentNote.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentNote)
      });

      if (!response.ok) throw new Error('Erro ao salvar nota');

      setIsDialogOpen(false);
      setCurrentNote({ title: '', content: '' });
      fetchNotes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar nota');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Deseja realmente deletar esta nota?')) return;

    try {
      const response = await fetch(
        `${API_URL}/api/customers/${customerId}/notes/${noteId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Erro ao deletar nota');

      fetchNotes();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      alert('Erro ao deletar nota');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notas do Cliente</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentNote({ title: '', content: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {currentNote.id ? 'Editar Nota' : 'Nova Nota'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={currentNote.title || ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da nota..."
                />
              </div>
              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={currentNote.content || ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  placeholder="Escreva suas observações..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNote} disabled={!currentNote.content}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma nota adicionada</p>
            <p className="text-sm">Clique em "Nova Nota" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    {note.title && (
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    )}
                    <p className="text-sm text-gray-500">
                      {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {note.created_by && ` • ${note.created_by}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentNote(note);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesTab;

