# Frontend Authentication Setup - Troubleshooting Guide

## Issue
After logging in with Clerk, the dashboard shows no data (users, orders, organization details).

## Root Cause
The backend needs a user record in the database with:
1. The **same email** you use to sign in with Clerk
2. An **orgId** linking them to an organization

## Solution - Create Test Data

### Step 1: Create an Organization

```graphql
mutation {
  createOrganization(input: {
    orgName: "Test Company"
    orgEmail: "admin@testcompany.com"
    numUsers: 1
  }) {
    id
    orgName
  }
}
```

**Save the organization ID returned!**

### Step 2: Create a User with YOUR Clerk Email

```graphql
mutation {
  createUser(input: {
    orgId: "PASTE_ORG_ID_FROM_STEP_1"
    email: "YOUR_CLERK_EMAIL@example.com"  # ⚠️ Use your actual Clerk email!
    firstName: "John"
    lastName: "Doe"
    role: ADMIN
  }) {
    id
    email
    orgId
  }
}
```

**Important:** Use the EXACT email address you sign in with in Clerk!

### Step 3: Create Sample Orders (Optional)

```graphql
mutation {
  createOrder(input: {
    userId: "PASTE_USER_ID_FROM_STEP_2"
    orgId: "PASTE_ORG_ID_FROM_STEP_1"
    totalAmount: 1500.50
    shippingAddress: "123 Main St, City, State 12345"
    orderStatus: PENDING
  }) {
    id
    totalAmount
    orderStatus
  }
}
```

## How to Test

### Option 1: Use GraphQL Playground (No Auth Required for Setup)

1. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Open http://localhost:8000/graphql in your browser

3. Run the mutations above

### Option 2: Use Prisma Studio

```bash
cd backend
npx prisma studio
```

Then manually create organization and user records through the UI.

## Authentication Flow

```
1. User signs in with Clerk
   ↓
2. Clerk provides JWT with email: "john@example.com"
   ↓
3. Backend receives GraphQL request with JWT
   ↓
4. Backend extracts email from JWT
   ↓
5. Backend queries: SELECT * FROM users WHERE email = 'john@example.com'
   ↓
6. Backend gets: { userId, orgId }
   ↓
7. All queries filtered by orgId
   ↓
8. Frontend shows organization's data
```

## Debugging

### Check Network Tab

1. Open DevTools → Network tab
2. Filter for `graphql`
3. Look for requests to `http://localhost:8000/graphql`
4. Check if Authorization header is present:
   ```
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...
   ```

### Check Backend Logs

Look for:
```
🔑 Clerk Keys: ✅ Loaded successfully
🚀 SalesFlow CRM Backend is running on port 8000
```

### Check Frontend Debug Info

The dashboard shows a blue debug banner (in development):
```
🔍 Debug: Logged in as john@example.com | Organization: Test Company | Users: 3 | Orders: 5
```

## Common Issues

### Issue: "User not found in database"
**Solution:** Create a user with your Clerk email address

### Issue: "Authentication required"
**Solution:** 
- Check that Apollo Client is sending Authorization header
- Verify Clerk is loaded and user is signed in

### Issue: "No data showing"
**Solution:**
- Check that user has an orgId
- Verify organization exists
- Create sample orders/users for that organization

### Issue: "CORS errors"
**Solution:** Backend must allow frontend origin in CORS config

## Quick Test Script

Check if your email exists in database:

```sql
-- Run in Prisma Studio or PostgreSQL client
SELECT 
  u.email, 
  u.first_name,
  u.org_id,
  o.org_name
FROM users u
JOIN organizations o ON u.org_id = o.org_id
WHERE u.email = 'YOUR_CLERK_EMAIL@example.com';
```

If no results, you need to create the user!

## Production Setup

In production, use Clerk webhooks to automatically create users:

1. Set up webhook endpoint: `/api/webhooks/clerk`
2. Listen for `user.created` event
3. Auto-create user in database with orgId

See: https://clerk.com/docs/integrations/webhooks
