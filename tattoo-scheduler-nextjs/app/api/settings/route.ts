import { NextRequest, NextResponse } from 'next/server';

// Mock settings
let settings = {
  studio_name: 'Meu Estúdio de Tatuagem',
  email: 'contato@estudio.com',
  phone: '(11) 99999-9999',
  address: 'Rua Exemplo, 123 - São Paulo/SP',
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false,
  auto_sync_enabled: true,
  sync_interval: 24,
  backup_enabled: true,
  google_calendar_sync: true
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    settings = { ...settings, ...body };
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}

