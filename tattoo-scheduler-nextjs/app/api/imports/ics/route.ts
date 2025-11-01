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

    // TODO: Implementar parsing de ICS com ical.js
    // const text = await file.text();
    // const jcalData = ICAL.parse(text);
    // const comp = new ICAL.Component(jcalData);
    // const events = comp.getAllSubcomponents('vevent');

    const preview = {
      filename: file.name,
      size: file.size,
      type: file.type,
      eventCount: 42,
      dateRange: {
        start: '2025-11-01',
        end: '2025-12-31'
      },
      sampleEvents: [
        {
          title: 'Tatuagem - João Silva',
          start: '2025-11-05T14:00:00',
          end: '2025-11-05T16:00:00',
          description: 'Braço direito - Dragão japonês',
          location: 'Studio Principal'
        },
        {
          title: 'Consulta - Maria Santos',
          start: '2025-11-06T10:00:00',
          end: '2025-11-06T11:00:00',
          description: 'Orçamento coxa',
          location: 'Studio Principal'
        },
        {
          title: 'Retoque - Pedro Costa',
          start: '2025-11-07T15:00:00',
          end: '2025-11-07T16:00:00',
          description: 'Retoque costas',
          location: 'Studio 2'
        }
      ]
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Erro ao processar ICS:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo ICS' },
      { status: 500 }
    );
  }
}

