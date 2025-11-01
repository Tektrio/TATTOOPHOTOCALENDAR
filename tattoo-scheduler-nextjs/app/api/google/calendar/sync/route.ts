import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TODO: Sincronização bidirecional com Google Calendar
    // 1. Buscar eventos do Calendar
    // 2. Comparar com DB local
    // 3. Criar eventos novos no Calendar
    // 4. Atualizar eventos modificados
    // 5. Deletar eventos removidos
    // 6. Salvar no DB local

    const { accountId } = await request.json();

    return NextResponse.json({
      success: true,
      synced: {
        created: 5,
        updated: 3,
        deleted: 1
      }
    });
  } catch (error) {
    console.error('Erro ao sincronizar Calendar:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar' },
      { status: 500 }
    );
  }
}
