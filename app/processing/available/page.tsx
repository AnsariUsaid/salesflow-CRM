'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Clock, User, Loader2, ChevronRight } from 'lucide-react';
import { GET_AVAILABLE_ORDERS_FOR_PROCESSING, GET_ME } from '@/graphql/queries';
import { ASSIGN_ORDER_AGENT } from '@/graphql/mutations';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AvailableOrdersPage() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [showMyOrdersOnly, setShowMyOrdersOnly] = useState(false);

  const { data: userData } = useQuery(GET_ME) as any;
  const { data, loading, refetch } = useQuery(GET_AVAILABLE_ORDERS_FOR_PROCESSING) as any;
  const [assignAgent] = useMutation(ASSIGN_ORDER_AGENT) as any;

  const handleAssignToMe = async (orderId: string) => {
    if (!userData?.me?.user_id) {
      alert('User not found');
      return;
    }

    setAssigningOrderId(orderId);
    try {
      await assignAgent({
        variables: {
          order_id: orderId,
          agent_type: 'processing',
          agent_id: userData.me.user_id,
        },
      });
      
      // Refetch to update the list
      await refetch();
      alert('Order assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning order:', error);
      alert(error.message || 'Failed to assign order');
    } finally {
      setAssigningOrderId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const allOrders = data?.availableOrdersForProcessing || [];
  const myOrders = allOrders.filter((order: any) => order.processing_agent === userData?.me?.user_id);
  const orders = showMyOrdersOnly ? myOrders : allOrders;
  const unassignedOrders = allOrders.filter((order: any) => !order.processing_agent);
  const assignedOrders = allOrders.filter((order: any) => order.processing_agent);

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Orders</h1>
              <p className="text-gray-600">
                {showMyOrdersOnly 
                  ? 'Your assigned orders for processing' 
                  : 'All active orders ready for processing'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setShowMyOrdersOnly(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !showMyOrdersOnly
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setShowMyOrdersOnly(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showMyOrdersOnly
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Orders ({myOrders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">{unassignedOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned to Others</p>
                <p className="text-2xl font-bold text-gray-900">{assignedOrders.length - myOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <User className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">My Orders</p>
                <p className="text-2xl font-bold text-gray-900">{myOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Order #</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700">Product Info</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Amount</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Payment</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Fulfillment</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Created</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-lg font-medium">
                        {showMyOrdersOnly ? 'No orders assigned to you' : 'No active orders'}
                      </p>
                      <p className="text-sm">
                        {showMyOrdersOnly 
                          ? 'Assign orders from the "All Orders" view' 
                          : 'All orders have been closed or cancelled'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => {
                    const isAssigned = !!order.processing_agent;
                    const isAssignedToMe = order.processing_agent === userData?.me?.user_id;
                    const firstProduct = order.orderProducts?.[0];
                    const productCount = order.orderProducts?.length || 0;
                    
                    return (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-900">
                            #{order.order_number}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                            <p className="text-xs text-gray-500">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <p className="font-medium">{firstProduct?.product_name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              {firstProduct?.make} {firstProduct?.model} {firstProduct?.year}
                            </p>
                            {productCount > 1 && (
                              <span className="text-xs text-blue-600">+{productCount - 1} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            ${order.total_amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.fulfillment_status)}`}>
                            {order.fulfillment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isAssigned ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Assigned to:</span>
                                <span className={`font-medium text-xs ${isAssignedToMe ? 'text-blue-600' : 'text-gray-700'}`}>
                                  {isAssignedToMe 
                                    ? 'You' 
                                    : `${order.processingUser?.firstname} ${order.processingUser?.lastname}`
                                  }
                                </span>
                              </div>
                              {isAssignedToMe && (
                                order.fulfillment_status !== 'shipped' && 
                                order.fulfillment_status !== 'delivered' && 
                                order.fulfillment_status !== 'closed' ? (
                                  <Link
                                    href={`/processing/my-orders/${order.order_id}`}
                                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md font-medium text-xs"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    Manage
                                  </Link>
                                ) : (
                                  <span className="text-xs text-gray-500 italic">Completed</span>
                                )
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignToMe(order.order_id)}
                              disabled={assigningOrderId === order.order_id}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                            >
                              {assigningOrderId === order.order_id ? (
                                <>
                                  <Loader2 className="animate-spin" size={14} />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <User size={16} />
                                  Assign to Me
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
