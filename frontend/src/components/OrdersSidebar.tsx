'use client';

import { Order } from '@/types';
import { useState } from 'react';

interface OrdersSidebarProps {
  orders: Order[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function OrdersSidebar({ orders, isOpen, onToggle }: OrdersSidebarProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.order_status === filter;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      created: 'bg-gray-100 text-gray-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-80 overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Orders</h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{order.order_id}</p>
                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ${order.discounted_amount || order.total_amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {order.products.length} item{order.products.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
