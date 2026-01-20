"use client";

import { useQuery } from "@apollo/client/react";
import { useUser } from "@clerk/nextjs";
import { GET_ORGANIZATIONS, GET_ORDERS, GET_USERS } from "@/lib/graphql/queries";
import { 
  TrendingUp, 
  Users, 
  Package, 
  Clock,
  AlertCircle 
} from "lucide-react";

export function DashboardStats() {
  const { user, isLoaded } = useUser();
  
  const { data: orgData, loading: orgLoading, error: orgError } = useQuery(GET_ORGANIZATIONS);
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(GET_ORDERS);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_USERS);

  // Debug info
  const isLoading = !isLoaded || orgLoading || ordersLoading || usersLoading;
  const hasError = orgError || ordersError || usersError;

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  // Show authentication error
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800">Not Authenticated</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please sign in to view dashboard data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show GraphQL errors
  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">
              {orgError?.message || ordersError?.message || usersError?.message}
            </p>
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                Debug Info
              </summary>
              <div className="mt-2 text-xs font-mono bg-red-100 p-2 rounded">
                <p><strong>Clerk User Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                <p><strong>Clerk User ID:</strong> {user.id}</p>
                <p className="mt-2 text-red-700">
                  Make sure this email exists in your database users table with an orgId.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const orders = ordersData?.orders || [];
  const users = usersData?.users || [];
  const org = orgData?.organizations?.[0];

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + (order.totalAmount || 0),
    0
  );
  const activeOrders = orders.filter(
    (o: any) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED"
  ).length;
  const pendingOrders = orders.filter(
    (o: any) => o.orderStatus === "PENDING"
  ).length;

  const DASHBOARD_STATS = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Active Orders",
      value: activeOrders.toString(),
      change: "+4",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Users",
      value: users.length.toString(),
      change: "+2.4%",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      change: "-2",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <>
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs">
          <strong>🔍 Debug:</strong> Logged in as {user.primaryEmailAddress?.emailAddress} | 
          Organization: {org?.orgName || "Not found"} | 
          Users: {users.length} | Orders: {orders.length}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASHBOARD_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith("+")
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
