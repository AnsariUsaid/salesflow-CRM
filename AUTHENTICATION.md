# Clerk Authentication Setup

This project uses [Clerk](https://clerk.com/) for authentication with Next.js App Router.

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [https://clerk.com/](https://clerk.com/) and sign up
2. Create a new application in your Clerk Dashboard
3. Go to **API Keys** page in your dashboard

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then update the Clerk keys in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Important:** Never commit your `.env.local` file to version control.

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Authentication Flow

### Public Pages
- **Home (`/`)** - Landing page with sign-in/sign-up options
- **Sign In (`/sign-in`)** - Clerk's sign-in page
- **Sign Up (`/sign-up`)** - Clerk's sign-up page

### Protected Pages
- **Orders (`/orders`)** - Create new orders (requires authentication)
- **Payment (`/payment`)** - Process payments (requires authentication)

## User Roles

The CRM supports the following roles:
- **Admin** - Full system access
- **Sales** - Create orders, process payments
- **Processing** - Manage order fulfillment
- **Follow-up** - Customer support and feedback
- **Customer** - End users (for future customer portal)

Roles can be managed in Clerk Dashboard under **Users** → **Metadata**.

## Clerk Components Used

- `<ClerkProvider>` - Wraps the entire app in `app/layout.tsx`
- `<SignedIn>` / `<SignedOut>` - Conditional rendering based on auth state
- `<SignInButton>` - Trigger sign-in modal or redirect
- `<UserButton>` - User profile dropdown with sign-out
- `useUser()` - React hook to access user data

## Middleware

The `middleware.ts` file uses `clerkMiddleware()` to protect routes automatically.

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## Next Steps

1. Configure user roles in Clerk Dashboard metadata
2. Add organization support for multi-tenant CRM
3. Implement role-based access control (RBAC)
4. Set up webhooks for user lifecycle events
