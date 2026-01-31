'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { Package, Clock, User, Loader2, ChevronRight } from 'lucide-react';
import { GET_AVAILABLE_ORDERS_FOR_FOLLOWUP, GET_ME } from '@/graphql/queries';
import { ASSIGN_ORDER_AGENT } from '@/graphql/mutations';
import { useState } from 'react';
import Link from 'next/link';

export default function AvailableFollowupOrdersPage() {
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [showMyOrdersOnly, setShowMyOrdersOnly] = useState(false);

  const { data: userData } = useQuery(GET_ME) as any;
  const { data, loading, refetch } = useQuery(GET_AVAILABLE_ORDERS_FOR_FOLLOWUP) as any;
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
          agent_type: 'followup',
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

  const allOrders = data?.availableOrdersForFollowup || [];
  const myOrders = allOrders.filter((order: any) => order.followup_agent === userData?.me?.user_id);
  const orders = showMyOrdersOnly ? myOrders : allOrders;
  const unassignedOrders = allOrders.filter((order: any) => !order.followup_agent);
  const assignedOrders = allOrders.filter((order: any) => order.followup_agent);

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Follow-up Orders</h1>
              <p className="text-gray-600">
                {showMyOrdersOnly 
                  ? 'Your assigned orders for follow-up' 
                  : 'Delivered and shipped orders ready for follow-up'}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{allOrders.length}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-3xl font-bold text-orange-600">{unassignedOrders.length}</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned to Others</p>
                <p className="text-3xl font-bold text-purple-600">{assignedOrders.length - myOrders.length}</p>
              </div>
              <User className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Orders</p>
                <p className="text-3xl font-bold text-green-600">{myOrders.length}</p>
              </div>
              <User className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {showMyOrdersOnly ? 'No orders assigned to you' : 'No Orders Available'}
              </h3>
              <p className="text-gray-600">
                {showMyOrdersOnly 
                  ? 'Assign orders from the "All Orders" view' 
                  : 'There are no orders ready for follow-up at the moment.'}
              </p>
            </div>
          ) : (
            orders.map((order: any) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.fulfillment_status)}`}>
                        {order.fulfillment_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{order.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {order.followup_agent && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600">Assigned to: </span>
                        <span className="font-medium text-blue-600">
                          {order.followup_agent === userData?.me?.user_id ? 'You' : 'Another Agent'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {order.followup_agent === userData?.me?.user_id ? (
                      <Link
                        href={`/followup/my-orders/${order.order_id}`}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Create Ticket
                      </Link>
                    ) : order.followup_agent ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                        Assigned to Another Agent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssignToMe(order.order_id)}
                        disabled={assigningOrderId === order.order_id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {assigningOrderId === order.order_id ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Assigning...
                          </>
                        ) : (
                          'Assign to Me'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
