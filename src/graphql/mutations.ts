import { gql } from '@apollo/client';

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $customer_name: String!
    $customer_email: String!
    $customer_phone: String!
    $shipping_address: String!
    $total_amount: Float!
    $products: [OrderProductInput!]!
  ) {
    createOrder(
      customer_name: $customer_name
      customer_email: $customer_email
      customer_phone: $customer_phone
      shipping_address: $shipping_address
      total_amount: $total_amount
      products: $products
    ) {
      order_id
      customer_name
      order_status
      total_amount
      createdAt
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($order_id: ID!, $order_status: OrderStatus!) {
    updateOrderStatus(order_id: $order_id, order_status: $order_status) {
      order_id
      order_status
      updatedAt
    }
  }
`;

export const ASSIGN_ORDER_AGENT = gql`
  mutation AssignOrderAgent($order_id: ID!, $agent_type: String!, $agent_id: String!) {
    assignOrderAgent(order_id: $order_id, agent_type: $agent_type, agent_id: $agent_id) {
      order_id
      sales_agent
      processing_agent
      followup_agent
    }
  }
`;

// Product Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $product_name: String!
    $product_code: String!
    $description: String
    $make: String!
    $model: String!
    $year: String!
  ) {
    createProduct(
      product_name: $product_name
      product_code: $product_code
      description: $description
      make: $make
      model: $model
      year: $year
    ) {
      product_id
      product_name
      product_code
      make
      model
      year
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $product_id: ID!
    $product_name: String
    $description: String
    $make: String
    $model: String
    $year: String
  ) {
    updateProduct(
      product_id: $product_id
      product_name: $product_name
      description: $description
      make: $make
      model: $model
      year: $year
    ) {
      product_id
      product_name
      product_code
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($product_id: ID!) {
    deleteProduct(product_id: $product_id)
  }
`;

// Transaction Mutations
export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction(
    $order_id: ID!
    $amount: Float!
    $payment_method: String!
    $auth_code: String
    $response_code: String
  ) {
    createTransaction(
      order_id: $order_id
      amount: $amount
      payment_method: $payment_method
      auth_code: $auth_code
      response_code: $response_code
    ) {
      transaction_id
      order_id
      amount
      status
      payment_method
      createdAt
    }
  }
`;

// Ticket Mutations
export const CREATE_TICKET = gql`
  mutation CreateTicket(
    $order_id: ID
    $title: String!
    $description: String!
    $priority: TicketPriority!
  ) {
    createTicket(
      order_id: $order_id
      title: $title
      description: $description
      priority: $priority
    ) {
      ticket_id
      title
      description
      status
      priority
      createdAt
    }
  }
`;

export const UPDATE_TICKET = gql`
  mutation UpdateTicket(
    $ticket_id: ID!
    $status: TicketStatus
    $assigned_to: String
    $priority: TicketPriority
  ) {
    updateTicket(
      ticket_id: $ticket_id
      status: $status
      assigned_to: $assigned_to
      priority: $priority
    ) {
      ticket_id
      status
      priority
      assigned_to
    }
  }
`;

export const RESOLVE_TICKET = gql`
  mutation ResolveTicket($ticket_id: ID!) {
    resolveTicket(ticket_id: $ticket_id) {
      ticket_id
      status
      resolvedAt
    }
  }
`;

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser(
    $firstname: String!
    $lastname: String!
    $email: String!
    $phone: String
    $address: String
    $city: String
    $state: String
    $role: UserRole
  ) {
    createUser(
      firstname: $firstname
      lastname: $lastname
      email: $email
      phone: $phone
      address: $address
      city: $city
      state: $state
      role: $role
    ) {
      user_id
      firstname
      lastname
      email
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $user_id: ID!
    $firstname: String
    $lastname: String
    $phone: String
    $address: String
    $city: String
    $state: String
    $role: UserRole
  ) {
    updateUser(
      user_id: $user_id
      firstname: $firstname
      lastname: $lastname
      phone: $phone
      address: $address
      city: $city
      state: $state
      role: $role
    ) {
      user_id
      firstname
      lastname
      email
      role
    }
  }
`;
