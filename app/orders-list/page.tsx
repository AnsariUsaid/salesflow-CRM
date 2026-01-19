'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@apollo/client/react';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { GET_ORDERS } from '@/graphql/queries';

export default function OrdersListPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  // Show loading state
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

  return <OrdersListContent />;
}

function OrdersListContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders using GraphQL
  const { data, loading, error } = useQuery(GET_ORDERS);
  const orders = data?.orders || [];

  // Filter orders based on search
  const filteredOrders = orders.filter((order: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.order_id.toLowerCase().includes(searchLower) ||
      order.customer_email?.toLowerCase().includes(searchLower)
    );
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-600" size={28} />
                Orders List
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Total Orders: <span className="font-semibold text-gray-800">{orders.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, order ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package size={48} className="mx-auto text-red-300 mb-4" />
            <p className="text-red-600">Error loading orders. Please try again.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No orders found matching your search' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.order_id} 
                      onClick={() => router.push(`/orders-list/${order.order_id}`)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {order.order_id.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status === 'created' ? 'Unpaid' : order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
