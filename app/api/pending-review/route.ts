
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

    const pendingOrders = await prisma.order.findMany({
      where: {
        org_id: user.org_id,
        payment_status: 'unpaid',
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
