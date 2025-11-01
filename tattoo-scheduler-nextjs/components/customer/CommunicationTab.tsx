'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Mail, Phone, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  type: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  message: string;
  sent_at: string;
}

export default function CommunicationTab({ customerId }: { customerId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [customerId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Histórico de Comunicação</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white">Nenhuma mensagem enviada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-purple-400">{getIcon(msg.type)}</div>
                  <div className="flex-1">
                    {msg.subject && <p className="text-white font-semibold">{msg.subject}</p>}
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(msg.sent_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

