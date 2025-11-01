import { NextRequest, NextResponse } from 'next/server';

// Mock data
const invoices = [
  {
    id: 1,
    client_id: 1,
    client_name: 'João Silva',
    amount: 1500.00,
    status: 'pago',
    issue_date: '2025-10-15',
    due_date: '2025-10-30',
    items: [
      { description: 'Tatuagem Grande - Braço', quantity: 1, unit_price: 1500.00 }
    ]
  }
];

export async function GET() {
  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newInvoice = {
      id: invoices.length + 1,
      ...body,
      createdAt: new Date().toISOString()
    };
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar fatura' }, { status: 500 });
  }
}

