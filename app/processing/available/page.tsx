'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Clock, DollarSign, User, Loader2, Home, ClipboardList, ArrowLeft } from 'lucide-react';
import { GET_AVAILABLE_ORDERS_FOR_PROCESSING, GET_ME } from '@/graphql/queries';
import { ASSIGN_ORDER_AGENT } from '@/graphql/mutations';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AvailableOrdersPage() {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const { data: userData } = useQuery(GET_ME);
  const { data, loading, refetch } = useQuery(GET_AVAILABLE_ORDERS_FOR_PROCESSING);
  const [assignAgent] = useMutation(ASSIGN_ORDER_AGENT);

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

  const orders = data?.availableOrdersForProcessing || [];
  const unassignedOrders = orders.filter((order: any) => !order.processing_agent);
  const assignedOrders = orders.filter((order: any) => order.processing_agent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Agent - Available Orders</h1>
              <p className="text-gray-600">All active orders ready for processing agent assignment</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </button>
              <button
                onClick={() => router.push('/orders-list')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <ClipboardList size={16} />
                Orders List
              </button>
              <button
                onClick={() => router.push('/processing/my-orders')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Package size={16} />
                My Orders
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
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
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{assignedOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Make</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Model</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Year</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-lg font-medium">No active orders</p>
                      <p className="text-sm">All orders have been closed or cancelled</p>
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
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900">
                            {order.order_id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {firstProduct?.product_name || 'N/A'}
                            {productCount > 1 && (
                              <span className="ml-1 text-xs text-gray-500">+{productCount - 1} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {firstProduct?.make || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {firstProduct?.model || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {firstProduct?.year || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            ${order.total_amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.fulfillment_status)}`}>
                            {order.fulfillment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {isAssigned ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500">Assigned to:</span>
                              <span className={`font-medium text-sm ${isAssignedToMe ? 'text-blue-600' : 'text-gray-700'}`}>
                                {isAssignedToMe 
                                  ? 'You' 
                                  : `${order.processingUser?.firstname} ${order.processingUser?.lastname}`
                                }
                              </span>
                            </div>
                          ) : order.payment_status === 'paid' ? (
                            <button
                              onClick={() => handleAssignToMe(order.order_id)}
                              disabled={assigningOrderId === order.order_id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {assigningOrderId === order.order_id ? (
                                <>
                                  <Loader2 className="animate-spin" size={16} />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <User size={16} />
                                  Assign to Me
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              Payment required
                            </div>
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
