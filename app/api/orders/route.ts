import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    // Check if requesting a specific order
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (orderId) {
      // Fetch specific order with products
      const order = await prisma.order.findUnique({
        where: { 
          order_id: orderId,
          org_id: dbUser.org_id,
        },
        include: {
          orderProducts: true,
        },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Fetch all orders for the user's organization
    const orders = await prisma.order.findMany({
      where: { org_id: dbUser.org_id },
      include: {
        customer: true,
        orderProducts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { customer, vehicle, products, total_amount } = body;

    // Create customer name
    const customer_name = `${customer.firstname} ${customer.lastname}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        org_id: dbUser.org_id,
        user_id: dbUser.user_id,
        customer_name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        shipping_address: `${customer.address}, ${customer.city}, ${customer.state}`,
        total_amount,
        order_status: 'created',
      },
    });

    // Create order products with full product details
    for (const orderProduct of products) {
      // Fetch full product details
      const product = await prisma.product.findUnique({
        where: { product_id: orderProduct.product_id },
      });

      if (!product) {
        throw new Error(`Product not found: ${orderProduct.product_id}`);
      }

      await prisma.orderProduct.create({
        data: {
          order_id: order.order_id,
          product_id: product.product_id,
          product_name: product.product_name,
          product_code: product.product_code,
          make: product.make,
          model: product.model,
          year: product.year,
          quantity: orderProduct.quantity,
          price: orderProduct.price,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
