import { NextRequest, NextResponse } from 'next/server';

const giftcards: any[] = [];

export async function GET() {
  return NextResponse.json(giftcards);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newGiftcard = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };
    giftcards.push(newGiftcard);
    return NextResponse.json(newGiftcard, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar gift card' }, { status: 500 });
  }
}

