import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock - substituir por Prisma
  const employee = {
    id: parseInt(params.id),
    name: 'João Silva',
    role: 'Tatuador',
    email: 'joao@studio.com',
    phone: '(11) 99999-1111',
    hourly_rate: 150.00,
    commission_rate: 40,
    status: 'ativo',
    hire_date: '2023-01-15'
  };

  return NextResponse.json(employee);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Mock - substituir por Prisma
    const updatedEmployee = {
      id: parseInt(params.id),
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar funcionário' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock - substituir por Prisma
  return NextResponse.json({ message: 'Funcionário excluído com sucesso' });
}

