'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  ArrowLeft, 
  CreditCard, 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Car,
  Calendar,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { GET_ORDER } from '@/graphql/queries';
import { UPDATE_PAYMENT_STATUS, UPDATE_FULFILLMENT_STATUS } from '@/graphql/mutations';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { orderId } = React.use(params);

  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <OrderDetailContent orderId={orderId} />;
}

function OrderDetailContent({ orderId }: { orderId: string }) {
  const router = useRouter();

  // Fetch order details using GraphQL
  const { data, loading, error } = useQuery(GET_ORDER,  {
    variables: { orderId },
  }) as any;

  // Update status mutations
  const [updatePaymentStatus, { loading: isUpdatingPayment }] = useMutation(UPDATE_PAYMENT_STATUS, {
    refetchQueries: [{ query: GET_ORDER, variables: { orderId } }],
  });
  
  const [updateFulfillmentStatus, { loading: isUpdatingFulfillment }] = useMutation(UPDATE_FULFILLMENT_STATUS, {
    refetchQueries: [{ query: GET_ORDER, variables: { orderId } }],
  });

  const order = data?.order;

  // Update payment status
  const handlePaymentStatusUpdate = async (newStatus: string) => {
    try {
      await updatePaymentStatus({
        variables: {
          order_id: orderId,
          payment_status: newStatus.toLowerCase(),
        },
      });
      alert('Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    }
  };

  // Update fulfillment status
  const handleFulfillmentStatusUpdate = async (newStatus: string) => {
    try {
      await updateFulfillmentStatus({
        variables: {
          order_id: orderId,
          fulfillment_status: newStatus.toLowerCase(),
        },
      });
      alert('Fulfillment status updated successfully!');
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
      alert('Error updating fulfillment status');
    }
  };

  // Handle payment
  const handlePayment = () => {
    sessionStorage.setItem('pendingOrder', JSON.stringify(order));
    router.push('/payment');
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get fulfillment status color
  const getFulfillmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">{error ? 'Error loading order' : 'Order not found'}</p>
          <button
            onClick={() => router.push('/orders-list')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/orders-list')}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders List
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Package className="text-blue-600" size={32} />
                Order #{order.order_number}
              </h1>
              <p className="text-sm text-gray-500">Order ID: {order.order_id}</p>
            </div>
            <div className="flex gap-3">
              <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </div>
              <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getFulfillmentStatusColor(order.fulfillment_status)}`}>
                {order.fulfillment_status.charAt(0).toUpperCase() + order.fulfillment_status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info & Customer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Mail size={14} /> Email
                  </label>
                  <p className="text-gray-900">{order.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Phone size={14} /> Phone
                  </label>
                  <p className="text-gray-900">{order.customer_phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> Address
                  </label>
                  <p className="text-gray-900">{order.shipping_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            {order.orderProducts && order.orderProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Car size={20} className="text-blue-600" />
                  Vehicle Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Make</label>
                    <p className="text-gray-900 font-medium">{order.orderProducts[0]?.make || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-gray-900 font-medium">{order.orderProducts[0]?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year</label>
                    <p className="text-gray-900 font-medium">{order.orderProducts[0]?.year || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Products ({order.orderProducts?.length || 0})
              </h2>
              <div className="space-y-3">
                {order.orderProducts?.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Total: ${(product.price * product.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="text-blue-600">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Payment Status Update */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h2>
              <div className="space-y-3">
                {['unpaid', 'partial', 'paid', 'refunded'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handlePaymentStatusUpdate(status)}
                    disabled={isUpdatingPayment || order.payment_status === status}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      order.payment_status === status
                        ? getPaymentStatusColor(status) + ' cursor-default'
                        : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:bg-blue-50'
                    } ${isUpdatingPayment ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-between`}
                  >
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    {order.payment_status === status && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fulfillment Status Update */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Fulfillment Status</h2>
              <div className="space-y-3">
                {['pending', 'processing', 'shipped', 'delivered', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFulfillmentStatusUpdate(status)}
                    disabled={isUpdatingFulfillment || order.fulfillment_status === status}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      order.fulfillment_status === status
                        ? getFulfillmentStatusColor(status) + ' cursor-default'
                        : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700 hover:bg-blue-50'
                    } ${isUpdatingFulfillment ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-between`}
                  >
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    {order.fulfillment_status === status && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Action */}
            {order.payment_status === 'unpaid' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Required</h2>
                <p className="text-sm text-gray-600 mb-4">This order hasn't been paid yet.</p>
                <button
                  onClick={handlePayment}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard size={18} />
                  Process Payment
                </button>
              </div>
            )}

            {/* Order Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
