
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        order_status: 'created',
        transactions: {
          none: {
            status: 'completed',
          },
        },
      },
      include: {
        customer: true,
      },
      take: 5,
    });

    return NextResponse.json(pendingOrders);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
