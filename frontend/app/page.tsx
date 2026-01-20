"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { UserButton } from "@clerk/nextjs";
import { PlusCircle, Package, MoreVertical } from "lucide-react";
import { GET_ORDERS } from "@/lib/graphql/queries";
import { DashboardStats } from "@/components/DashboardStats";

export default function Home() {
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS);

  const orders = ordersData?.orders || [];

  const recentOrders = orders.slice(0, 4).map((order: any, index: number) => {
    let formattedDate = "N/A";

    if (order.createdAt) {
      try {
        const date = new Date(order.createdAt);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      } catch {}
    }

    return {
      id: index + 1,
      user: `${order.user?.firstName || "Unknown"} ${order.user?.lastName || ""}`,
      action: "Created new order",
      target: `$${order.totalAmount?.toFixed(2) || "0.00"}`,
      time: formattedDate,
      status: order.orderStatus?.toLowerCase() || "created",
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-gray-500 mt-1">
              Here is what&apos;s happening with your store today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/newOrder"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle size={16} />
              Create Order
            </Link>

            <Link
              href="/payment"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Process Payment
            </Link>

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Recent Orders – Full Width */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link
              href="/newOrder"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="p-6">
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto mb-2 text-gray-400" size={48} />
                <p>No orders yet. Create your first order!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentOrders.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full ${
                        item.status === "pending"
                          ? "bg-yellow-500"
                          : item.status === "confirmed"
                            ? "bg-blue-500"
                            : item.status === "delivered"
                              ? "bg-green-500"
                              : item.status === "shipped"
                                ? "bg-purple-500"
                                : "bg-gray-400"
                      }`}
                    />

                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{item.user}</span>{" "}
                        {item.action}{" "}
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          {item.target}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
