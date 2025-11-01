import { NextRequest, NextResponse } from 'next/server';

// Mock data
const photos = [
  {
    id: 1,
    url: 'https://picsum.photos/400/400?random=1',
    title: 'Dragão Oriental',
    client_name: 'João Silva',
    tattoo_type: 'Grande',
    artist: 'Maria Santos',
    uploaded_at: '2025-10-15T10:00:00Z'
  },
  {
    id: 2,
    url: 'https://picsum.photos/400/400?random=2',
    title: 'Rosa das Sombras',
    client_name: 'Ana Costa',
    tattoo_type: 'Média',
    artist: 'João Silva',
    uploaded_at: '2025-10-20T14:30:00Z'
  },
  {
    id: 3,
    url: 'https://picsum.photos/400/400?random=3',
    title: 'Mandala Geométrica',
    client_name: 'Pedro Santos',
    tattoo_type: 'Grande',
    artist: 'Maria Santos',
    uploaded_at: '2025-10-25T16:00:00Z'
  }
];

export async function GET() {
  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPhoto = {
      id: photos.length + 1,
      ...body,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}

