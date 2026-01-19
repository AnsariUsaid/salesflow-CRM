import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Checking database for users...\n');
  
  const users = await prisma.user.findMany({
    include: {
      organization: true,
    },
  });
  
  console.log(`Found ${users.length} users in database\n`);
  
  if (users.length === 0) {
    console.log('⚠️  No users found. This means:');
    console.log('   1. Webhook hasn\'t been triggered yet');
    console.log('   2. Or webhook secret is incorrect');
    console.log('   3. Or webhook endpoint not accessible\n');
  } else {
    users.forEach((user) => {
      console.log(`👤 ${user.firstname} ${user.lastname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Clerk ID: ${user.clerk_user_id}`);
      console.log(`   Org: ${user.organization.org_name}`);
      console.log('');
    });
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
