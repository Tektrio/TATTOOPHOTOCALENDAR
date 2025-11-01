import { NextRequest, NextResponse } from 'next/server';

// Mock data (substituir por Prisma depois)
let employees = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Tatuador',
    email: 'joao@studio.com',
    phone: '(11) 99999-1111',
    hourly_rate: 150.00,
    commission_rate: 40,
    status: 'ativo',
    hire_date: '2023-01-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Maria Santos',
    role: 'Piercer',
    email: 'maria@studio.com',
    phone: '(11) 99999-2222',
    hourly_rate: 100.00,
    commission_rate: 35,
    status: 'ativo',
    hire_date: '2023-06-20',
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newEmployee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      ...body,
      createdAt: new Date().toISOString()
    };

    employees.push(newEmployee);
    
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar funcionário' }, { status: 500 });
  }
}

