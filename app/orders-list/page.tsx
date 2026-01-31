"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@apollo/client/react";
import {
  Search,
  Package,
  CreditCard,
  Home,
  PlusCircle,
  Filter,
  X,
} from "lucide-react";
import { GET_ORDERS } from "@/graphql/queries";

export default function OrdersListPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in");
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
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaymentUnpaid, setFilterPaymentUnpaid] = useState(false);
  const [filterFulfillmentPending, setFilterFulfillmentPending] =
    useState(false);

  // Check for filter parameter in URL
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam === "unpaid") {
      setFilterPaymentUnpaid(true);
    } else if (filterParam === "pending") {
      setFilterFulfillmentPending(true);
    }
  }, [searchParams]);

  // Fetch orders using GraphQL
  const { data, loading, error } = useQuery(GET_ORDERS) as any;
  const orders = data?.orders || [];

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order: any) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.order_id.toLowerCase().includes(searchLower) ||
      order.customer_email?.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Payment status filter
    if (filterPaymentUnpaid && order.payment_status !== "unpaid") {
      return false;
    }

    // Fulfillment status filter
    if (filterFulfillmentPending && order.fulfillment_status !== "pending") {
      return false;
    }

    return true;
  });

  // Get status badge color for fulfillment status
  const getFulfillmentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle process payment
  const handleProcessPayment = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    router.push(`/payment?orderId=${orderId}`);
  };

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-600" size={28} />
                Orders List
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 mr-2">
                Total Orders:{" "}
                <span className="font-semibold text-gray-800">
                  {orders.length}
                </span>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <Home size={16} />
                Back to Home
              </button>
              <button
                onClick={() => router.push("/orders")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl"
              >
                <PlusCircle size={16} />
                Create New Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by customer name, order ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span className="font-medium">Filters:</span>
            </div>
            <button
              onClick={() => setFilterPaymentUnpaid(!filterPaymentUnpaid)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterPaymentUnpaid
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filterPaymentUnpaid && <X size={14} />}
              Unpaid Orders
            </button>
            <button
              onClick={() =>
                setFilterFulfillmentPending(!filterFulfillmentPending)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterFulfillmentPending
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filterFulfillmentPending && <X size={14} />}
              Pending Fulfillment
            </button>
            {(filterPaymentUnpaid || filterFulfillmentPending) && (
              <button
                onClick={() => {
                  setFilterPaymentUnpaid(false);
                  setFilterFulfillmentPending(false);
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear All
              </button>
            )}
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
            <p className="text-red-600">
              Error loading orders. Please try again.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              {searchQuery
                ? "No orders found matching your search"
                : "No orders yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fulfillment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order: any) => (
                    <tr
                      key={order.order_id}
                      onClick={() =>
                        router.push(`/orders-list/${order.order_id}`)
                      }
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}
                        >
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFulfillmentStatusColor(order.fulfillment_status)}`}
                        >
                          {order.fulfillment_status.charAt(0).toUpperCase() +
                            order.fulfillment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.payment_status === "unpaid" && (
                          <button
                            onClick={(e) =>
                              handleProcessPayment(e, order.order_id)
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            <CreditCard size={16} />
                            Process Payment
                          </button>
                        )}
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
