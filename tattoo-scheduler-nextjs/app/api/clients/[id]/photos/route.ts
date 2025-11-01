import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const photos = [
    {
      id: 1,
      url: 'https://picsum.photos/400/400?random=10',
      title: 'Sessão 1 - Outline',
      uploaded_at: '2025-10-01T10:00:00Z'
    },
    {
      id: 2,
      url: 'https://picsum.photos/400/400?random=11',
      title: 'Sessão 2 - Sombreamento',
      uploaded_at: '2025-10-15T14:00:00Z'
    }
  ];

  return NextResponse.json(photos);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newPhoto = {
      id: Date.now(),
      ...body,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}

