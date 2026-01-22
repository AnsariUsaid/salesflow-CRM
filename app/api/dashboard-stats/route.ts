
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

    // Calculate today and yesterday date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    // Today's revenue
    const todayRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
        createdAt: {
          gte: todayStart,
        },
        order: {
          org_id: user.org_id,
        },
      },
    });

    // Yesterday's revenue
    const yesterdayRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'completed',
        createdAt: {
          gte: yesterdayStart,
          lt: yesterdayEnd,
        },
        order: {
          org_id: user.org_id,
        },
      },
    });

    // Calculate percentage change
    const todayAmount = todayRevenue._sum.amount || 0;
    const yesterdayAmount = yesterdayRevenue._sum.amount || 0;
    let revenueChange = 0;
    if (yesterdayAmount > 0) {
      revenueChange = ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100;
    } else if (todayAmount > 0) {
      revenueChange = 100; // If no revenue yesterday but have today, show 100% increase
    }

    // Total revenue (all time)
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
        fulfillment_status: { not: 'closed' },
        org_id: user.org_id,
      },
    });

    // Count unique customers who placed orders in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomersOrders = await prisma.order.findMany({
      where: {
        org_id: user.org_id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        user_id: true,
      },
      distinct: ['user_id'],
    });
    
    const newCustomers = newCustomersOrders.length;

    const pendingProcess = await prisma.order.count({
        where: {
            payment_status: 'unpaid',
            org_id: user.org_id,
        },
    });

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      activeOrders,
      newCustomers,
      pendingProcess
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
