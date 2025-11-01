import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Buscar contas Google do banco
    const accounts = [
      {
        id: '1',
        email: 'studio@example.com',
        name: 'Studio Principal',
        isActive: true,
        scopes: ['calendar', 'drive'],
        connectedAt: new Date(),
        lastSync: new Date()
      }
    ];

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contas' },
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

