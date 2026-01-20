# Environment Variables Setup

## Frontend vs Backend Clerk Keys

Both use the **same Clerk account keys**, but with different variable names:

### Frontend `.env.local`
```bash
# Next.js requires NEXT_PUBLIC_ prefix for browser access
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### Backend `.env`
```bash
# Express backend uses standard names (no NEXT_PUBLIC_ prefix)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

## ⚠️ Important

The **publishable key value** is the SAME, but the variable name is different:
- Frontend: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Backend: `CLERK_PUBLISHABLE_KEY` (no `NEXT_PUBLIC_` prefix)

## Complete Backend `.env` File

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/salesflow_crm?schema=public"

# Clerk Authentication (use same keys from Clerk Dashboard)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Server
PORT=8000
```

## How to Get Your Clerk Keys

1. Go to https://dashboard.clerk.com/
2. Select your application
3. Navigate to "API Keys" in the sidebar
4. Copy both keys to your `.env` files

## Testing the Setup

```bash
# Start backend
cd backend
npm run dev

# Should see:
# 🚀 SalesFlow CRM Backend is running on port 8000
# No errors about missing publishable key
```
