# GraphQL Sample Queries & Mutations

## 🔍 Queries

### Get Current User
```graphql
query {
  me {
    user_id
    firstname
    lastname
    email
    role
    organization {
      org_name
    }
  }
}
```

### Get All Products
```graphql
query {
  products {
    product_id
    product_name
    product_code
    make
    model
    year
    description
  }
}
```

### Get All Orders
```graphql
query {
  orders {
    order_id
    customer_name
    customer_email
    total_amount
    order_status
    createdAt
    orderProducts {
      product_name
      quantity
      price
    }
  }
}
```

### Get My Orders
```graphql
query {
  myOrders {
    order_id
    customer_name
    total_amount
    order_status
    orderProducts {
      product_name
      quantity
    }
  }
}
```

### Get All Tickets
```graphql
query {
  tickets {
    ticket_id
    title
    description
    status
    priority
    createdAt
    user {
      firstname
      lastname
    }
  }
}
```

## ✏️ Mutations

### Create Product (Admin only)
```graphql
mutation {
  createProduct(
    product_name: "Brake Rotors"
    product_code: "BR-2024"
    description: "High-performance brake rotors"
    make: "Toyota"
    model: "Camry"
    year: "2024"
  ) {
    product_id
    product_name
    product_code
  }
}
```

### Create Order
```graphql
mutation {
  createOrder(
    customer_name: "John Doe"
    customer_email: "john@example.com"
    customer_phone: "555-0123"
    shipping_address: "123 Main St, City, State 12345"
    total_amount: 299.99
    products: [
      {
        product_id: "PRODUCT_ID_HERE"
        product_name: "Brake Pad Set"
        product_code: "BPS-2023"
        make: "Honda"
        model: "Civic"
        year: "2023"
        quantity: 1
        price: 299.99
      }
    ]
  ) {
    order_id
    customer_name
    total_amount
    order_status
  }
}
```

### Update Order Status
```graphql
mutation {
  updateOrderStatus(
    order_id: "ORDER_ID_HERE"
    order_status: processing
  ) {
    order_id
    order_status
  }
}
```

### Create Ticket
```graphql
mutation {
  createTicket(
    title: "Order delivery issue"
    description: "Customer reports package not delivered"
    priority: high
  ) {
    ticket_id
    title
    status
    priority
  }
}
```

### Resolve Ticket
```graphql
mutation {
  resolveTicket(ticket_id: "TICKET_ID_HERE") {
    ticket_id
    status
    resolvedAt
  }
}
```

## 🔐 Authorization

- All queries require authentication (Clerk)
- Queries are org-scoped (users only see their org's data)
- Admin-only operations:
  - createProduct
  - updateProduct
  - deleteProduct
  - users query
  - assignOrderAgent

## 🧪 Test GraphQL Playground

1. Visit: http://localhost:3000/api/graphql
2. Login first to get authenticated
3. Try the queries above
4. GraphQL Studio will auto-complete for you!

