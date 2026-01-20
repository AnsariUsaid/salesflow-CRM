"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ORDERS } from "@/lib/graphql/queries";
import Link from "next/link";
import { 
  Package, 
  Eye, 
  ArrowLeft,
  AlertCircle 
} from "lucide-react";

export default function ExistingOrdersPage() {
  const { data, loading, error } = useQuery(GET_ORDERS);

  const orders = data?.orders || [];

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Status badge color helper
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Package size={32} />
                Existing Orders
              </h1>
              <p className="text-gray-500 mt-1">
                View and manage all orders in your organization
              </p>
            </div>
            <Link
              href="/newOrder"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create New Order
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Orders</h3>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first order to get started
                </p>
                <Link
                  href="/newOrder"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Order
                </Link>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Shipping Address
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Time of Ordering
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order: any) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Order ID */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {order.id.slice(0, 8)}...
                              </code>
                            </div>
                          </td>

                          {/* User Email */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {order.user?.email || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.user?.firstName} {order.user?.lastName}
                            </div>
                          </td>

                          {/* Shipping Address */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {order.shippingAddress}
                            </div>
                          </td>

                          {/* Time of Ordering */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>

                          {/* Total Amount */}
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              ${order.totalAmount?.toFixed(2) || '0.00'}
                            </div>
                            {order.discountedAmount && (
                              <div className="text-xs text-gray-500 line-through">
                                ${order.discountedAmount.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                // TODO: Implement view order details
                                alert(`View details for order: ${order.id}`);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Count */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{orders.length}</span>{" "}
                    order{orders.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
