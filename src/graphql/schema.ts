export const typeDefs = `#graphql
  # Enums
  enum UserRole {
    admin
    sales
    processing
    followup
    customer
  }

  enum OrderStatus {
    created
    paid
    processing
    shipped
    delivered
    closed
  }

  enum TransactionStatus {
    pending
    completed
    failed
    refunded
  }

  enum TicketStatus {
    open
    in_progress
    resolved
    closed
  }

  enum TicketPriority {
    low
    medium
    high
    urgent
  }

  # Types
  type User {
    user_id: ID!
    clerk_user_id: String!
    org_id: String!
    firstname: String!
    lastname: String!
    email: String!
    phone: String
    address: String
    city: String
    state: String
    country: String
    pincode: String
    role: UserRole!
    isdeleted: Boolean!
    createdAt: String!
    updatedAt: String!
    organization: Organization
    orders: [Order!]!
  }

  type Organization {
    org_id: ID!
    org_name: String!
    org_email: String
    org_phone: String
    org_address: String
    isdeleted: Boolean!
    createdAt: String!
    updatedAt: String!
    users: [User!]!
    orders: [Order!]!
  }

  type Product {
    product_id: ID!
    product_name: String!
    product_code: String!
    description: String
    make: String!
    model: String!
    year: String!
    isdeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type OrderProduct {
    orderproduct_id: ID!
    order_id: String!
    product_id: String!
    product_name: String!
    product_code: String!
    make: String!
    model: String!
    year: String!
    quantity: Int!
    price: Float!
    procurement_cost: Float
    procurement_source: String
  }

  type Order {
    order_id: ID!
    org_id: String!
    user_id: String!
    customer_name: String!
    customer_email: String!
    customer_phone: String!
    total_amount: Float!
    discounted_amount: Float
    shipping_address: String!
    sales_agent: String
    processing_agent: String
    followup_agent: String
    order_tracking: String
    order_status: OrderStatus!
    createdAt: String!
    updatedAt: String!
    customer: User
    orderProducts: [OrderProduct!]!
    transactions: [Transaction!]!
  }

  type Transaction {
    transaction_id: ID!
    order_id: String!
    user_id: String!
    agent_id: String!
    amount: Float!
    status: TransactionStatus!
    payment_method: String
    auth_code: String
    response_code: String
    createdAt: String!
    updatedAt: String!
    order: Order
    user: User
  }

  type Ticket {
    ticket_id: ID!
    org_id: String!
    order_id: String
    user_id: String!
    title: String!
    description: String!
    priority: TicketPriority!
    status: TicketStatus!
    assigned_to: String
    createdAt: String!
    updatedAt: String!
    resolvedAt: String
    order: Order
    user: User
  }

  # Queries
  type Query {
    # User queries
    me: User
    users: [User!]!
    user(user_id: ID!): User

    # Organization queries
    myOrganization: Organization
    organization(org_id: ID!): Organization

    # Product queries
    products: [Product!]!
    product(product_id: ID!): Product

    # Order queries
    orders: [Order!]!
    order(order_id: ID!): Order
    myOrders: [Order!]!

    # Transaction queries
    transactions: [Transaction!]!
    transaction(transaction_id: ID!): Transaction

    # Ticket queries
    tickets: [Ticket!]!
    ticket(ticket_id: ID!): Ticket
    myTickets: [Ticket!]!
  }

  # Mutations
  type Mutation {
    # User mutations
    createUser(
      firstname: String!
      lastname: String!
      email: String!
      phone: String
      address: String
      city: String
      state: String
      role: UserRole
    ): User!

    updateUser(
      user_id: ID!
      firstname: String
      lastname: String
      phone: String
      address: String
      city: String
      state: String
      role: UserRole
    ): User!

    # Product mutations
    createProduct(
      product_name: String!
      product_code: String!
      description: String
      make: String!
      model: String!
      year: String!
    ): Product!

    updateProduct(
      product_id: ID!
      product_name: String
      description: String
      make: String
      model: String
      year: String
    ): Product!

    deleteProduct(product_id: ID!): Boolean!

    # Order mutations
    createOrder(
      customer_name: String!
      customer_email: String!
      customer_phone: String!
      shipping_address: String!
      total_amount: Float!
      products: [OrderProductInput!]!
    ): Order!

    updateOrderStatus(
      order_id: ID!
      order_status: OrderStatus!
    ): Order!

    assignOrderAgent(
      order_id: ID!
      agent_type: String!
      agent_id: String!
    ): Order!

    # Transaction mutations
    createTransaction(
      order_id: ID!
      amount: Float!
      payment_method: String!
      auth_code: String
      response_code: String
    ): Transaction!

    # Ticket mutations
    createTicket(
      order_id: ID
      title: String!
      description: String!
      priority: TicketPriority!
    ): Ticket!

    updateTicket(
      ticket_id: ID!
      status: TicketStatus
      assigned_to: String
      priority: TicketPriority
    ): Ticket!

    resolveTicket(ticket_id: ID!): Ticket!
  }

  # Input types
  input OrderProductInput {
    product_id: String!
    product_name: String!
    product_code: String!
    make: String!
    model: String!
    year: String!
    quantity: Int!
    price: Float!
  }
`;
