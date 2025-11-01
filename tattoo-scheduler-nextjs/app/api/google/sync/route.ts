import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar conta Google no banco
    const account = await prisma.googleAccount.findUnique({
      where: { id: parseInt(accountId) }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se token está válido
    if (account.expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado. Reconecte a conta.' },
        { status: 401 }
      );
    }

    // Configurar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token
    });

    // Sincronizar Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneMonthFromNow.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log(`✓ Sincronizados ${events.data.items?.length || 0} eventos do Google Calendar`);

    // TODO: Salvar eventos no banco de dados local
    // Por enquanto, apenas retornamos a contagem

    // Atualizar timestamp de última sincronização
    await prisma.googleAccount.update({
      where: { id: parseInt(accountId) },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      eventsCount: events.data.items?.length || 0,
      message: `${events.data.items?.length || 0} eventos sincronizados`
    });

  } catch (error: any) {
    console.error('Erro na sincronização:', error);
    
    // Tratar erros específicos do Google API
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Token inválido. Reconecte sua conta Google.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erro na sincronização', 
        details: error.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

