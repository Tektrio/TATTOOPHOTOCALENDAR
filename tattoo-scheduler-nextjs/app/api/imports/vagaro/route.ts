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

    // TODO: Implementar parsing específico do formato Vagaro
    // O Vagaro geralmente exporta em CSV com formato específico
    
    const preview = {
      filename: file.name,
      size: file.size,
      type: 'vagaro',
      clientCount: 120,
      appointmentCount: 450,
      sampleClients: [
        {
          vagaroId: 'VAG-12345',
          firstName: 'Lucas',
          lastName: 'Ferreira',
          email: 'lucas@email.com',
          phone: '(11) 98888-7777',
          memberSince: '2023-01-15',
          totalSpent: 3500.00,
          appointmentCount: 12
        },
        {
          vagaroId: 'VAG-12346',
          firstName: 'Juliana',
          lastName: 'Mendes',
          email: 'juliana@email.com',
          phone: '(11) 97777-6666',
          memberSince: '2023-03-20',
          totalSpent: 2800.00,
          appointmentCount: 8
        }
      ],
      sampleAppointments: [
        {
          vagaroId: 'APP-98765',
          clientName: 'Lucas Ferreira',
          service: 'Tatuagem Grande',
          artist: 'Rodrigo Silva',
          date: '2025-11-10',
          time: '14:00',
          duration: 180,
          price: 1200.00,
          status: 'Confirmed'
        },
        {
          vagaroId: 'APP-98766',
          clientName: 'Juliana Mendes',
          service: 'Tatuagem Média',
          artist: 'Ana Costa',
          date: '2025-11-11',
          time: '10:00',
          duration: 120,
          price: 800.00,
          status: 'Confirmed'
        }
      ]
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Erro ao processar arquivo Vagaro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo Vagaro' },
      { status: 500 }
    );
  }
}

