import 'dotenv/config';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../src/lib/prisma';

async function syncClerkUsers() {
  try {
    console.log('🔄 Fetching users from Clerk...');
    
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList();
    
    console.log(`📊 Found ${clerkUsers.data.length} users in Clerk`);

    for (const clerkUser of clerkUsers.data) {
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
      const primaryPhone = clerkUser.phoneNumbers.find(p => p.id === clerkUser.primaryPhoneNumberId);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { clerk_user_id: clerkUser.id },
      });

      if (existingUser) {
        console.log(`✓ User ${clerkUser.id} already exists, skipping...`);
        continue;
      }

      // Create organization for user
      const org = await prisma.organization.create({
        data: {
          org_name: `${clerkUser.firstName || 'User'}'s Organization`,
          org_email: primaryEmail?.emailAddress || '',
        },
      });

      // Create user
      await prisma.user.create({
        data: {
          clerk_user_id: clerkUser.id,
          org_id: org.org_id,
          firstname: clerkUser.firstName || '',
          lastname: clerkUser.lastName || '',
          email: primaryEmail?.emailAddress || '',
          phone: primaryPhone?.phoneNumber || '',
          role: (clerkUser.publicMetadata?.role as any) || 'customer',
          meta_data: clerkUser.publicMetadata as any,
        },
      });

      console.log(`✅ Synced user: ${clerkUser.id} (${primaryEmail?.emailAddress})`);
    }

    console.log('🎉 Sync complete!');
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerkUsers();
