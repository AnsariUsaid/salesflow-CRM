// User Roles
export type UserRole = 'admin' | 'sales' | 'processing' | 'followup' | 'customer';

// Order Status
export type OrderStatus = 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'closed';

// User Type
export interface User {
  user_id: string;
  org_id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  role: UserRole;
  isdeleted: boolean;
  meta_data?: Record<string, any>;
}

// Product Type
export interface Product {
  product_id: string;
  product_name: string;
  product_code: string;
  description?: string;
  make: string;
  model: string;
  year: string;
  meta_data?: Record<string, any>;
}

// Order Product Type
export interface OrderProduct {
  product_id: string;
  product_name: string;
  product_code: string;
  make: string;
  model: string;
  year: string;
  procurement_cost?: number;
  procurement_source?: string;
  quantity: number;
  price: number;
}

// Order Type
export interface Order {
  order_id: string;
  org_id: string;
  user_id: string; // customer
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  discounted_amount?: number;
  shipping_address: string;
  sales_agent?: string;
  processing_agent?: string;
  followup_agent?: string;
  order_tracking?: string;
  order_status: OrderStatus;
  products: OrderProduct[];
  created_at: string;
  meta_data?: Record<string, any>;
}

// Transaction Type
export interface Transaction {
  transaction_id: string;
  order_id: string;
  user_id: string;
  agent_id: string;
  amount: number;
  status: string;
  meta_data?: Record<string, any>;
  created_at: string;
}

// Payment Form Data
export interface PaymentFormData {
  order_id: string;
  amount: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  city: string;
  state: string;
  zipCode: string;
}
