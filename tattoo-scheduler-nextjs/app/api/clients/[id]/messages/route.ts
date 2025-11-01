import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const messages = [
    {
      id: 1,
      type: 'whatsapp',
      subject: null,
      message: 'Confirmação de agendamento para amanhã às 14h',
      sent_at: '2025-10-30T10:00:00Z'
    },
    {
      id: 2,
      type: 'email',
      subject: 'Instruções pré-tatuagem',
      message: 'Enviadas instruções de cuidados antes da sessão',
      sent_at: '2025-10-28T15:30:00Z'
    }
  ];

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newMessage = {
      id: Date.now(),
      ...body,
      sent_at: new Date().toISOString()
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}

