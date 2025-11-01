import { NextRequest, NextResponse } from 'next/server';

const memberships: any[] = [];

export async function GET() {
  return NextResponse.json(memberships);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMembership = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };
    memberships.push(newMembership);
    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 });
  }
}

