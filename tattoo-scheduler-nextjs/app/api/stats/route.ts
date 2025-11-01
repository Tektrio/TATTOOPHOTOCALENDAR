import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Contar total de clientes
    const totalClients = await prisma.client.count();

    // Contar agendamentos próximos (próximos 30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        startDatetime: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Contar total de arquivos
    const totalFiles = await prisma.file.count();

    // Calcular armazenamento total (em bytes)
    const files = await prisma.file.findMany({
      select: {
        size: true,
      },
    });
    const totalStorage = files.reduce((sum, file) => sum + (file.size || 0), 0);

    return NextResponse.json({
      totalClients,
      upcomingAppointments,
      totalFiles,
      totalStorage,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { 
        totalClients: 0,
        upcomingAppointments: 0,
        totalFiles: 0,
        totalStorage: 0,
      },
      { status: 200 } // Retornar zeros em vez de erro
    );
  }
}

