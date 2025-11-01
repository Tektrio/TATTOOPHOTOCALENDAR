import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // TODO: Implementar parsing de CSV com papaparse ou csv-parse
    // const text = await file.text();
    // const parsed = Papa.parse(text, { header: true });

    const preview = {
      filename: file.name,
      size: file.size,
      type: file.type,
      rowCount: 85,
      columns: ['name', 'email', 'phone', 'notes'],
      sampleData: [
        {
          name: 'Carlos Alberto',
          email: 'carlos@email.com',
          phone: '11987654321',
          notes: 'Cliente VIP'
        },
        {
          name: 'Ana Paula',
          email: 'ana@email.com',
          phone: '11912345678',
          notes: 'Primeira tatuagem'
        },
        {
          name: 'Roberto Lima',
          email: 'roberto@email.com',
          phone: '21999998888',
          notes: ''
        }
      ]
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Erro ao processar CSV:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo CSV' },
      { status: 500 }
    );
  }
}

