
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

    const recentActivity = await prisma.order.findMany({
      take: 5,
      where: {
        org_id: user.org_id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
      },
    });

    const formattedActivity = recentActivity.map((activity) => ({
      id: activity.order_id,
      user: activity.customer ? activity.customer.firstname + ' ' + activity.customer.lastname : 'Unknown User',
      action: 'Created new order',
      target: `#ORD-${activity.order_id}`,
      time: timeSince(activity.createdAt),
      status: 'created',
    }));

    return NextResponse.json(formattedActivity);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function timeSince(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}
