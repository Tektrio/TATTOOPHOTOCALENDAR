import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock data
  const documents = [
    {
      id: 1,
      title: 'Termo de Consentimento',
      file_url: '/documents/termo-consentimento.pdf',
      file_type: 'PDF',
      uploaded_at: '2025-10-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Contrato de Serviço',
      file_url: '/documents/contrato.pdf',
      file_type: 'PDF',
      uploaded_at: '2025-10-01T10:05:00Z'
    }
  ];

  return NextResponse.json(documents);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const newDocument = {
      id: Date.now(),
      ...body,
      uploaded_at: new Date().toISOString()
    };

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}

