import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const payments = [
    {
      id: 1,
      amount: 500.00,
      status: 'pago',
      payment_date: '2025-10-15',
      description: 'Sessão 1 - Outline'
    },
    {
      id: 2,
      amount: 800.00,
      status: 'pendente',
      payment_date: '2025-11-01',
      description: 'Sessão 2 - Sombreamento'
    }
  ];

  return NextResponse.json(payments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newPayment = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar pagamento' }, { status: 500 });
  }
}

