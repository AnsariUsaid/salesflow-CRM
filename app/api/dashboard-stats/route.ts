
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
      },
    });

    const activeOrders = await prisma.order.count({
      where: {
        order_status: 'processing',
      },
    });

    const newCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    const pendingProcess = await prisma.order.count({
        where: {
            order_status: 'created',
        },
    });

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      activeOrders,
      newCustomers,
      pendingProcess
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
