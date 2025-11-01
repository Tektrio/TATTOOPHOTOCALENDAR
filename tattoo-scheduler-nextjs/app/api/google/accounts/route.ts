import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar contas Google do banco
    const googleAccounts = await prisma.googleAccount.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transformar em formato de contas
    const accounts = googleAccounts.map(account => {
      const isActive = account.expires_at > new Date();

      return {
        id: account.id.toString(),
        email: account.email,
        name: account.email.split('@')[0].replace(/[._]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        isActive,
        scopes: ['calendar', 'drive'],
        connectedAt: account.createdAt,
        lastSync: account.updatedAt
      };
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contas', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, tokens } = await request.json();

    // TODO: Salvar nova conta no banco

    return NextResponse.json({
      success: true,
      account: {
        id: Date.now().toString(),
        email,
        isActive: true,
        connectedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar conta:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar conta' },
      { status: 500 }
    );
  }
}

