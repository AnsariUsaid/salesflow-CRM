
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user's org_id
    const user = await prisma.user.findFirst({
      where: { clerk_user_id: userId, isdeleted: false },
      select: { org_id: true }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const totalRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
        order: {
          org_id: user.org_id,
        },
      },
    });

    const activeOrders = await prisma.order.count({
      where: {
        fulfillment_status: 'processing',
        org_id: user.org_id,
      },
    });

    const newCustomers = await prisma.user.count({
      where: {
        org_id: user.org_id,
        role: 'customer',
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    const pendingProcess = await prisma.order.count({
        where: {
            fulfillment_status: 'pending',
            org_id: user.org_id,
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
