import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error occurred during verification' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = evt.data;

  try {
    switch (eventType) {
      case 'user.created': {
        // Create user in database
        const primaryEmail = email_addresses?.[0]?.email_address || '';
        const primaryPhone = phone_numbers?.[0]?.phone_number || '';
        
        // Get org_id from metadata or create default org
        let orgId = public_metadata?.org_id as string;
        
        if (!orgId) {
          // Create a default organization for new users
          const org = await prisma.organization.create({
            data: {
              org_name: `${first_name || 'User'}'s Organization`,
              org_email: primaryEmail,
            },
          });
          orgId = org.org_id;
        }

        await prisma.user.create({
          data: {
            clerk_user_id: id as string,
            org_id: orgId,
            firstname: first_name || '',
            lastname: last_name || '',
            email: primaryEmail,
            phone: primaryPhone,
            role: (public_metadata?.role as any) || 'admin',
            meta_data: public_metadata as any,
          },
        });

        console.log(`✅ User created: ${id}`);
        break;
      }

      case 'user.updated': {
        // Update user in database
        const primaryEmail = email_addresses?.[0]?.email_address || '';
        const primaryPhone = phone_numbers?.[0]?.phone_number || '';

        await prisma.user.update({
          where: {
            clerk_user_id: id as string,
          },
          data: {
            firstname: first_name || '',
            lastname: last_name || '',
            email: primaryEmail,
            phone: primaryPhone,
            role: (public_metadata?.role as any) || undefined,
            meta_data: public_metadata as any,
          },
        });

        console.log(`✅ User updated: ${id}`);
        break;
      }

      case 'user.deleted': {
        // Soft delete user
        await prisma.user.update({
          where: {
            clerk_user_id: id as string,
          },
          data: {
            isdeleted: true,
          },
        });

        console.log(`✅ User soft deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true, eventType });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook', details: error },
      { status: 500 }
    );
  }
}
