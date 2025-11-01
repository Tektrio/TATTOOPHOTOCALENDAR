import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  // Mock - substituir por Prisma
  return NextResponse.json({ message: 'Nota excluída com sucesso' });
}

