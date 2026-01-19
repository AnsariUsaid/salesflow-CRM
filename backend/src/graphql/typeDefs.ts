export const typeDefs = `#graphql
  # Custom Scalars
  scalar DateTime

  # Enums
  enum UserRole {
    ADMIN
    SALES_AGENT
    PROCESSING_AGENT
    FOLLOWUP_AGENT
    EMPLOYEE
    CUSTOMER
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
  }

  enum TicketType {
    SUPPORT
    PAYMENT
    DELIVERY
    OTHER
  }

  enum TicketStatus {
    OPEN
    IN_PROGRESS
    CLOSED
  }

  enum PaymentStatus {
    PENDING
    SUCCESS
    FAILED
  }

  # Types
  type Organization {
    id: ID!
    orgName: String!
    orgEmail: String!
    numUsers: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    users: [User!]
    orders: [Order!]
    tickets: [Ticket!]
  }

  type User {
    id: ID!
    orgId: String!
    firstName: String!
    lastName: String
    email: String!
    phone: String
    address: String
    city: String
    state: String
    country: String
    pincode: String
    role: UserRole!
    isDeleted: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization!
    orders: [Order!]
    tickets: [Ticket!]
    transactions: [Transaction!]
  }

  type Product {
    id: ID!
    make: String!
    model: String!
    year: Int!
    productName: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Order {
    id: ID!
    userId: String!
    orgId: String!
    totalAmount: Float!
    discountedAmount: Float
    shippingAddress: String!
    salesAgentId: String
    processingAgentId: String
    followupAgentId: String
    orderTracking: String
    orderStatus: OrderStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    organization: Organization!
    products: [OrderProduct!]
    tickets: [Ticket!]
    transactions: [Transaction!]
  }

  type OrderProduct {
    orderId: String!
    productId: String!
    procurementCost: Float!
    procurementSource: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    order: Order!
    product: Product!
  }

  type Ticket {
    id: ID!
    orgId: String!
    userId: String!
    orderId: String!
    type: TicketType!
    status: TicketStatus!
    followupAgentId: String
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization!
    user: User!
    order: Order!
  }

  type Transaction {
    id: ID!
    userId: String!
    orderId: String!
    status: PaymentStatus!
    amountPaid: Float!
    agentId: String
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    order: Order!
  }

  # Input Types
  input CreateOrganizationInput {
    orgName: String!
    orgEmail: String!
    numUsers: Int!
  }

  input CreateUserInput {
    orgId: String!
    firstName: String!
    lastName: String
    email: String!
    phone: String
    address: String
    city: String
    state: String
    country: String
    pincode: String
    role: UserRole!
  }

  input CreateProductInput {
    make: String!
    model: String!
    year: Int!
    productName: String!
    description: String
  }

  input CreateOrderInput {
    userId: String!
    orgId: String!
    totalAmount: Float!
    discountedAmount: Float
    shippingAddress: String!
    salesAgentId: String
    orderStatus: OrderStatus!
  }

  # Queries
  type Query {
    # Organization
    organizations: [Organization!]!
    organization(id: ID!): Organization

    # User
    users: [User!]!
    user(id: ID!): User
    usersByOrg(orgId: String!): [User!]!
    usersByRole(role: UserRole!): [User!]!

    # Product
    products: [Product!]!
    product(id: ID!): Product
    productsByMake(make: String!): [Product!]!

    # Order
    orders: [Order!]!
    order(id: ID!): Order
    ordersByUser(userId: String!): [Order!]!
    ordersByOrg(orgId: String!): [Order!]!
    ordersByStatus(status: OrderStatus!): [Order!]!

    # Ticket
    tickets: [Ticket!]!
    ticket(id: ID!): Ticket
    ticketsByUser(userId: String!): [Ticket!]!
    ticketsByOrder(orderId: String!): [Ticket!]!

    # Transaction
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    transactionsByOrder(orderId: String!): [Transaction!]!
  }

  # Mutations
  type Mutation {
    # Organization
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, orgName: String, orgEmail: String, numUsers: Int, isActive: Boolean): Organization!
    deleteOrganization(id: ID!): Boolean!

    # User
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, firstName: String, lastName: String, email: String, phone: String, role: UserRole): User!
    deleteUser(id: ID!): Boolean!

    # Product
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, make: String, model: String, year: Int, productName: String, description: String): Product!
    deleteProduct(id: ID!): Boolean!

    # Order
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    deleteOrder(id: ID!): Boolean!
  }
`;
