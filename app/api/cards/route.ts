import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cards = await prisma.cardDetails.findMany({
      where: {
        user_id: dbUser.user_id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      order_id,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      billingAddress,
      city,
      state,
      zipCode,
    } = body;

    // Create card record
    const card = await prisma.cardDetails.create({
      data: {
        card_id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: dbUser.user_id,
        order_id: order_id || null,
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
        expiryMonth,
        expiryYear,
        cvv, // In production, don't store CVV!
        cardholderName,
        billingAddress,
        city,
        state,
        zipCode,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error('Error saving card:', error);
    return NextResponse.json({ error: 'Failed to save card' }, { status: 500 });
  }
}
