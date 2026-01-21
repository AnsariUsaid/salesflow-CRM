import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

// Context function - adds authenticated user to context
async function context(req: NextRequest) {
  try {
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return { user: null };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    return { user };
  } catch (error) {
    console.error('Context error:', error);
    return { user: null };
  }
}

// Create Next.js handler with error handling
const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => context(req),
});

export async function GET(request: NextRequest) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('GraphQL GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('GraphQL POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
