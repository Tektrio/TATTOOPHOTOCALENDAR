'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function PrivateNotesTab({ customerId }: { customerId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [customerId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      toast.error('Digite uma nota');
      return;
    }

    try {
      const response = await fetch(`/api/clients/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      });

      if (response.ok) {
        toast.success('✅ Nota adicionada!');
        setNewNote('');
        loadNotes();
      } else {
        toast.error('❌ Erro ao adicionar nota');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Excluir esta nota?')) return;

    try {
      const response = await fetch(`/api/clients/${customerId}/notes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ Nota excluída!');
        loadNotes();
      } else {
        toast.error('❌ Erro ao excluir nota');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('❌ Erro de conexão');
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando notas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Notas Privadas</h2>
        <p className="text-gray-400 text-sm">Estas notas são visíveis apenas para você e não são compartilhadas com o cliente.</p>
      </div>

      {/* Nova Nota */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite uma nova nota privada..."
            className="bg-gray-900 text-white"
            rows={4}
          />
          <Button onClick={addNote} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nota
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Notas */}
      {notes.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white">Nenhuma nota privada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="bg-yellow-900/20 border-yellow-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white whitespace-pre-wrap">{note.content}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(note.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

