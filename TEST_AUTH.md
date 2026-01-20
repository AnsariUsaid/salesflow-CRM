# Testing Authentication - Quick Guide

## Your Setup ✅

**Email in Database:** `ansariumairnanded@gmail.com`
- User ID: `537bd0af-16dd-48aa-afbe-f24b40fa6642`
- Name: ibad lutfullah
- Role: ADMIN
- Organization: SalesFlow Pvt Ltd
- Organization ID: `42cd03fe-ce6e-4a5a-ab8d-5268acf772e3`

## How to Test

### Step 1: Start Backend with Logging

```bash
cd backend
npm run dev
```

Watch the logs carefully!

### Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

### Step 3: Sign In with Clerk

Use the email: **ansariumairnanded@gmail.com**

### Step 4: Check Backend Logs

You should see detailed logging like:

```
🔐 Auth Middleware - Clerk Auth: { hasAuth: true, userId: 'user_...', sessionId: '...' }
🔍 Fetching user from Clerk API, userId: user_...
📧 Email extracted from Clerk: ansariumairnanded@gmail.com
🔎 Looking up user in database with email: ansariumairnanded@gmail.com
👤 Database user lookup result: { id: '537bd0af...', email: '...', orgId: '...', role: 'ADMIN' }
✅ Authentication successful, user context set
```

### Step 5: Check Network Tab in Browser

1. Open DevTools (F12)
2. Go to Network tab
3. Filter for "graphql"
4. Click on any GraphQL request
5. Check Headers section:
   - Should see: `Authorization: Bearer eyJhbGci...`

## What the Logs Tell You

### ✅ Success Pattern:
```
🔐 Auth Middleware - Clerk Auth: { hasAuth: true, userId: 'user_xyz' }
📧 Email extracted from Clerk: ansariumairnanded@gmail.com
👤 Database user lookup result: { id: '537bd0af...' }
✅ Authentication successful
```

### ❌ Error Pattern 1: No Clerk Auth
```
⚠️ No Clerk authentication found, continuing without user context
```
**Solution:** Check that frontend is sending Authorization header

### ❌ Error Pattern 2: Can't Fetch from Clerk
```
🔐 Auth Middleware - Clerk Auth: { hasAuth: true, userId: 'user_xyz' }
❌ Clerk API error: Invalid API key
```
**Solution:** Check CLERK_SECRET_KEY in backend/.env

### ❌ Error Pattern 3: Email Mismatch
```
📧 Email extracted from Clerk: different@email.com
🔎 Looking up user in database with email: different@email.com
❌ User not found in database: different@email.com
```
**Solution:** You're signed into Clerk with a different email! Sign in with: ansariumairnanded@gmail.com

## Troubleshooting Steps

### 1. Verify Clerk Keys Match

**Backend (.env):**
```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...  # Same value!
CLERK_SECRET_KEY=sk_test_...  # Same value!
```

### 2. Check Database Connection

```bash
cd backend
npx prisma studio
```

Verify:
- Organization "SalesFlow Pvt Ltd" exists
- User "ansariumairnanded@gmail.com" exists
- User has orgId: `42cd03fe-ce6e-4a5a-ab8d-5268acf772e3`

### 3. Test Direct GraphQL Query

Without frontend, test backend directly:

```bash
# Get Clerk token from browser:
# 1. Sign in to frontend
# 2. Open Console
# 3. Run: await window.Clerk.session.getToken()
# 4. Copy the token

curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"query":"{ users { id firstName email } }"}'
```

Should return users from your organization!

### 4. Check CORS

Backend should allow frontend origin:

```typescript
// In backend/src/index.ts
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
```

## Expected Results

After successful authentication, dashboard should show:

```
🔍 Debug: Logged in as ansariumairnanded@gmail.com | 
Organization: SalesFlow Pvt Ltd | Users: [count] | Orders: [count]

📊 Dashboard Stats:
Total Revenue: $X,XXX.XX
Active Orders: X
Total Users: X
Pending Orders: X
```

## Next Steps if Still Failing

1. **Check backend terminal** - Look for the exact error in logs
2. **Check browser console** - Look for JavaScript errors
3. **Check Network tab** - Verify Authorization header is present
4. **Restart both services** - Sometimes helps clear cache
5. **Clear browser cache** - Especially Clerk session cache

## Getting Help

If still not working, provide:
1. Backend logs (especially the 🔐 Auth Middleware lines)
2. Frontend error message
3. Network tab screenshot showing Authorization header
4. Browser console errors
