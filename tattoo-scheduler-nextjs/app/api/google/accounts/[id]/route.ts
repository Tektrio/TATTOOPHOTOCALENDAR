import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Deletar conta Google do banco
    await prisma.googleAccount.delete({
      where: { id: parseInt(params.id) }
    });

    console.log(`✓ Conta Google desconectada: ${params.id}`);

    return NextResponse.json({ 
      success: true,
      message: 'Conta desconectada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar conta:', error);
    return NextResponse.json(
      { error: 'Erro ao desconectar conta', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

