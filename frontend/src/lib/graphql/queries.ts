import { gql } from "@apollo/client";

// Organization Queries
export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      orgName
      orgEmail
      numUsers
      isActive
      createdAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      orgName
      orgEmail
      numUsers
      isActive
      createdAt
      updatedAt
    }
  }
`;

// User Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
      phone
      role
      createdAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      phone
      address
      city
      state
      country
      pincode
      role
      createdAt
    }
  }
`;

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      make
      model
      year
      productName
      description
      createdAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      make
      model
      year
      productName
      description
      createdAt
    }
  }
`;

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      totalAmount
      discountedAmount
      shippingAddress
      orderStatus
      orderTracking
      createdAt
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      totalAmount
      discountedAmount
      shippingAddress
      orderStatus
      orderTracking
      createdAt
      user {
        id
        firstName
        lastName
        email
      }
      organization {
        id
        orgName
      }
    }
  }
`;

// Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      orgName
      orgEmail
      numUsers
      isActive
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      firstName
      lastName
      email
      role
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      make
      model
      year
      productName
      description
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalAmount
      discountedAmount
      shippingAddress
      orderStatus
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      orderStatus
    }
  }
`;
