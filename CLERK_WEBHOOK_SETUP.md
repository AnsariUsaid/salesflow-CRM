# Clerk Webhook Setup

This guide explains how to set up Clerk webhooks to sync user data with your database.

## What's Been Set Up

✅ Webhook endpoint: `/api/webhooks/clerk`
✅ Handles: `user.created`, `user.updated`, `user.deleted`
✅ Auto-creates organizations for new users
✅ Soft delete support (sets `isdeleted = true`)

## Configuration Steps

### 1. Get Your Webhook Secret from Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   - Development: Use ngrok or similar tunnel (e.g., `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`)
   - Production: `https://yourdomain.com/api/webhooks/clerk`
6. Select events to listen to:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Copy the **Signing Secret** (starts with `whsec_`)

### 2. Add Secret to .env

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### 3. Test the Webhook (Development)

**Option A: Using ngrok**
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

**Option B: Using Clerk's Test Feature**
- In Clerk Dashboard > Webhooks > Your endpoint
- Click "Testing" tab
- Send test events

### 4. Verify Sync is Working

1. Create a new user in Clerk (sign up)
2. Check your database - user should appear in `users` table
3. Check logs: `✅ User created: user_xxxxx`

## How It Works

### user.created Event
```
1. User signs up in Clerk
2. Clerk sends webhook to /api/webhooks/clerk
3. Creates Organization (if not exists)
4. Creates User record with clerk_user_id
5. Stores role from public_metadata (default: customer)
```

### user.updated Event
```
1. User updates profile in Clerk
2. Webhook syncs changes to database
3. Updates: firstname, lastname, email, phone, role
```

### user.deleted Event
```
1. User deleted in Clerk
2. Soft delete in database (isdeleted = true)
3. User data preserved for audit trail
```

## Helper Functions

Use these in your app to get the current user:

```typescript
import { getCurrentUser, getCurrentUserWithClerk } from '@/lib/auth';

// Get database user only
const user = await getCurrentUser();

// Get both Clerk + database user
const { clerkUser, dbUser } = await getCurrentUserWithClerk();
```

## Public Metadata for Roles

To assign roles during user creation, add to Clerk user metadata:

```json
{
  "role": "admin",
  "org_id": "org_xxxxx"
}
```

Roles: `admin`, `sales`, `processing`, `followup`, `customer`

## Troubleshooting

**Webhook not receiving events:**
- Check CLERK_WEBHOOK_SECRET is set
- Verify webhook URL is accessible (use ngrok for local dev)
- Check Clerk Dashboard > Webhooks > Attempts for errors

**User not created in database:**
- Check server logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations are applied

**403 Forbidden:**
- Webhook route must be in public routes (check proxy.ts)
- Should include: `/api/webhooks(.*)`
