# Organization-Based Multi-Tenancy with Clerk Authentication

## Overview

This backend implements a secure multi-tenant architecture where:
1. Users authenticate via Clerk
2. User's email is extracted from Clerk JWT token
3. User record (with `orgId`) is fetched from database
4. All GraphQL queries are automatically scoped to the user's organization

## Authentication Flow

```
1. Frontend → Clerk Authentication
2. Clerk issues JWT token with user email
3. Backend receives request with Authorization header
4. @clerk/express middleware validates JWT token
5. Custom auth middleware extracts email and queries database
6. req.user = { userId, orgId, email, role } is set
7. GraphQL context receives user information
8. All resolvers enforce organization-based access control
```

## Implementation Details

### Middleware Chain

**index.ts**
```typescript
app.use(clerkMiddleware());              // Validates Clerk JWT
app.use("/graphql", clerkAuthMiddleware); // Extracts user from DB
app.use("/graphql", expressMiddleware(..., {
  context: ({ req }) => ({ user: req.user })
}));
```

### Authentication Middleware (lib/auth.ts)

The `clerkAuthMiddleware` function:
- Gets the authenticated email from Clerk session
- Queries the `users` table to find the user record
- Extracts `userId`, `orgId`, `email`, and `role`
- Attaches to `req.user`
- Returns 401 if not authenticated, 404 if user not in database

### GraphQL Context

All resolvers receive:
```typescript
interface GraphQLContext {
  user?: {
    userId: string;
    orgId: string;
    email: string;
    role: string;
  }
}
```

## Organization Scoping

### Automatic Filtering

All queries automatically filter by organization:

```graphql
# Users can only see users from their org
query {
  users {
    id
    firstName
    email
  }
}

# Users can only see orders from their org
query {
  orders {
    id
    totalAmount
    orderStatus
  }
}

# Users can only see tickets from their org
query {
  tickets {
    id
    type
    status
  }
}
```

### Access Control

The system prevents cross-organization access:

```typescript
// ✅ Allowed: Query own organization's data
const users = await prisma.user.findMany({
  where: { orgId: context.user.orgId }
});

// ❌ Forbidden: Query different organization
if (requestedOrgId !== context.user.orgId) {
  throw new GraphQLError("Access denied");
}
```

## Example Usage

### Frontend (Next.js with Clerk)

```typescript
import { useAuth } from "@clerk/nextjs";
import { ApolloClient, createHttpLink } from "@apollo/client";

function useAuthenticatedApollo() {
  const { getToken } = useAuth();
  
  const httpLink = createHttpLink({
    uri: "http://localhost:8000/graphql",
    headers: async () => {
      const token = await getToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    },
  });
  
  return new ApolloClient({ link: httpLink, cache: new InMemoryCache() });
}
```

### GraphQL Queries

```graphql
# Get all users in my organization
query GetUsers {
  users {
    id
    firstName
    lastName
    email
    role
  }
}

# Get all orders for my organization
query GetOrders {
  orders {
    id
    totalAmount
    orderStatus
    user {
      firstName
      lastName
    }
  }
}

# Get organization details
query GetMyOrg {
  organizations {
    id
    orgName
    orgEmail
    numUsers
  }
}
```

### Creating Orders

```graphql
mutation CreateOrder($input: OrderInput!) {
  createOrder(input: $input) {
    id
    totalAmount
    orderStatus
  }
}
```

The `orgId` is automatically set to the authenticated user's organization.

## Security Features

### 1. JWT Validation
- Clerk validates JWT signature and expiration
- Invalid tokens are rejected before hitting GraphQL

### 2. Organization Isolation
- Users can only access data within their organization
- Cross-organization queries return access denied errors

### 3. Soft Deletes
- Deleted users (`isDeleted: true`) cannot authenticate
- Deleted users are filtered from all queries

### 4. Role-Based Access Control (RBAC)
User roles are stored in the database:
- `ADMIN` - Full organization access
- `SALES_AGENT` - Create orders, manage customers
- `PROCESSING_AGENT` - Manage order fulfillment
- `FOLLOWUP_AGENT` - Customer support
- `EMPLOYEE` - General staff
- `CUSTOMER` - End customers

## Environment Setup

### Backend .env
```bash
DATABASE_URL="postgresql://..."
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
PORT=8000
```

### Frontend .env.local
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Database Schema

### Organization Table
```sql
CREATE TABLE organizations (
  org_id UUID PRIMARY KEY,
  org_name VARCHAR NOT NULL,
  org_email VARCHAR NOT NULL,
  num_users INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(org_id),
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  role USER_ROLE NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### 1. Create Test Organization
```graphql
mutation {
  createOrganization(input: {
    orgName: "Acme Corp"
    orgEmail: "admin@acme.com"
    numUsers: 0
  }) {
    id
    orgName
  }
}
```

### 2. Create Test User
```graphql
mutation {
  createUser(input: {
    email: "john@acme.com"
    firstName: "John"
    lastName: "Doe"
    role: SALES_AGENT
  }) {
    id
    email
    orgId
  }
}
```

### 3. Sign Up in Clerk
- Use the same email: `john@acme.com`
- Clerk will authenticate the user
- Backend will find the user in database by email
- All queries will be scoped to Acme Corp organization

## Common Patterns

### Get Current User's Organization Stats
```graphql
query GetOrgStats {
  organizations {
    id
    orgName
    numUsers
    users {
      id
      firstName
      role
    }
    orders {
      id
      totalAmount
      orderStatus
    }
  }
}
```

### Create Order for Customer
```graphql
mutation CreateOrder($input: OrderInput!) {
  createOrder(input: {
    userId: "customer-user-id"  # Must be in same org
    totalAmount: 1500.00
    shippingAddress: "123 Main St"
    orderStatus: PENDING
  }) {
    id
    orderStatus
  }
}
```

## Error Handling

### Common Errors

**UNAUTHENTICATED**
```json
{
  "errors": [{
    "message": "Authentication required",
    "extensions": { "code": "UNAUTHENTICATED" }
  }]
}
```

**FORBIDDEN**
```json
{
  "errors": [{
    "message": "Access denied to this organization",
    "extensions": { "code": "FORBIDDEN" }
  }]
}
```

**User Not Found**
```json
{
  "error": "User not found in database. Please contact administrator."
}
```

## Next Steps

1. **Add Role-Based Permissions**: Implement resolver-level role checks
2. **Audit Logging**: Log all data access for compliance
3. **Rate Limiting**: Add per-organization API rate limits
4. **Webhooks**: Sync Clerk user creation/deletion with database
5. **Multi-Factor Authentication**: Enable MFA in Clerk settings
