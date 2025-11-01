import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const healthInfo = {
    allergies: 'Látex, Produtos químicos fortes',
    medications: 'Nenhum',
    medical_conditions: 'Nenhuma',
    blood_type: 'O+',
    emergency_contact: 'Maria Silva',
    emergency_phone: '(11) 98888-8888'
  };

  return NextResponse.json(healthInfo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar informações' }, { status: 500 });
  }
}

