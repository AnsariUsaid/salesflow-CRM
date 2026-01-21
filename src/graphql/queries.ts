import { gql } from '@apollo/client';

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      order_id
      customer_name
      customer_email
      customer_phone
      order_status
      total_amount
      createdAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($orderId: ID!) {
    order(order_id: $orderId) {
      order_id
      customer_name
      customer_email
      customer_phone
      shipping_address
      total_amount
      order_status
      createdAt
      orderProducts {
        orderproduct_id
        product_name
        product_code
        make
        model
        year
        quantity
        price
      }
    }
  }
`;

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      product_id
      product_name
      product_code
      make
      model
      year
      description
      createdAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($productId: ID!) {
    product(product_id: $productId) {
      product_id
      product_name
      product_code
      make
      model
      year
      description
    }
  }
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      user_id
      clerk_user_id
      firstname
      lastname
      email
      role
      org_id
      organization {
        org_name
        org_email
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      user_id
      firstname
      lastname
      email
      role
      phone
    }
  }
`;

// Transaction Queries
export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      transaction_id
      order_id
      amount
      status
      payment_method
      createdAt
    }
  }
`;

// Ticket Queries
export const GET_TICKETS = gql`
  query GetTickets {
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
`;

export const GET_MY_TICKETS = gql`
  query GetMyTickets {
    myTickets {
      ticket_id
      title
      description
      status
      priority
      createdAt
    }
  }
`;
