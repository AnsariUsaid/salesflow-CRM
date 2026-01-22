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
  const eventData = evt.data as any;
  const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata, organization_memberships } = eventData;

  // Helper function to map Clerk roles to database roles
  function mapClerkRoleToDbRole(clerkRole?: string): string {
    if (!clerkRole) return 'customer';
    
    // Remove 'org:' prefix if present
    const normalizedRole = clerkRole.replace(/^org:/, '');
    
    const roleMap: Record<string, string> = {
      'Admin': 'admin',
      'admin': 'admin',
      'Sales Team': 'sales',
      'sales': 'sales',
      'sales_team': 'sales',
      'Follow Up Team': 'followup',
      'followup': 'followup',
      'followup_team': 'followup',
      'Processing Team': 'processing',
      'processing': 'processing',
      'processing_team': 'processing',
      'customer': 'customer',
    };
    
    return roleMap[normalizedRole] || 'customer';
  }

  try {
    switch (eventType) {
      case 'user.created': {
        // Create user in database
        const primaryEmail = email_addresses?.[0]?.email_address || '';
        const primaryPhone = phone_numbers?.[0]?.phone_number || '';
        
        // Debug logging
        console.log('🔍 Webhook data:', {
          id,
          organization_memberships,
          public_metadata,
          role_from_org: organization_memberships?.[0]?.role,
          role_from_metadata: public_metadata?.role
        });
        
        // Get role from organization membership or metadata
        let userRole = 'customer';
        if (organization_memberships && organization_memberships.length > 0) {
          const orgRole = organization_memberships[0]?.role;
          userRole = mapClerkRoleToDbRole(orgRole);
          console.log(`📋 Using org role: ${orgRole} -> ${userRole}`);
        } else if (public_metadata?.role) {
          userRole = mapClerkRoleToDbRole(public_metadata.role as string);
          console.log(`📋 Using metadata role: ${public_metadata.role} -> ${userRole}`);
        } else {
          console.log('⚠️ No role found, defaulting to customer');
        }
        
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
            role: userRole as any,
            meta_data: public_metadata as any,
          },
        });

        console.log(`✅ User created: ${id} with role: ${userRole}`);
        break;
      }

      case 'user.updated': {
        // Update user in database
        const primaryEmail = email_addresses?.[0]?.email_address || '';
        const primaryPhone = phone_numbers?.[0]?.phone_number || '';

        // Don't update role here - it's handled by organizationMembership events
        await prisma.user.update({
          where: {
            clerk_user_id: id as string,
          },
          data: {
            firstname: first_name || '',
            lastname: last_name || '',
            email: primaryEmail,
            phone: primaryPhone,
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

      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        // Get user ID from organization membership
        const userId = evt.data.public_user_data?.user_id;
        const orgRole = evt.data.role;
        
        if (!userId) {
          console.log('⚠️ No user_id in organizationMembership event');
          break;
        }

        const userRole = mapClerkRoleToDbRole(orgRole);
        
        console.log(`🔄 Updating user ${userId} role from org membership: ${orgRole} -> ${userRole}`);

        await prisma.user.update({
          where: {
            clerk_user_id: userId as string,
          },
          data: {
            role: userRole as any,
          },
        });

        console.log(`✅ User role updated from organization: ${userId} -> ${userRole}`);
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
