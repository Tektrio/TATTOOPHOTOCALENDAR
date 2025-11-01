import { NextRequest, NextResponse } from 'next/server';

const packages: any[] = [];

export async function GET() {
  return NextResponse.json(packages);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPackage = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };
    packages.push(newPackage);
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar pacote' }, { status: 500 });
  }
}

