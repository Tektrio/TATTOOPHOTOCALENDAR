import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - substituir por queries reais no Prisma
  const stats = {
    totalRevenue: 45000,
    monthRevenue: 8500,
    pendingPayments: 3200,
    completedPayments: 5300
  };

  return NextResponse.json(stats);
}

