import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get user from database using clerk_user_id
  const user = await prisma.user.findUnique({
    where: {
      clerk_user_id: userId,
    },
    include: {
      organization: true,
    },
  });

  return user;
}

export async function getCurrentUserWithClerk() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return { clerkUser: null, dbUser: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      clerk_user_id: clerkUser.id,
    },
    include: {
      organization: true,
    },
  });

  return { clerkUser, dbUser };
}
