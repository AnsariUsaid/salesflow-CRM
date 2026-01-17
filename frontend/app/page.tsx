'use client';

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { 
  LayoutDashboard, 
  PlusCircle, 
  CreditCard, 
  TrendingUp,
  Users,
  Package,
  Clock,
  ArrowUpRight,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { GET_ORDERS, GET_USERS } from "@/lib/graphql/queries";

export default function Home() {
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_ORDERS);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS);

  // Calculate stats from real data
  const orders = ordersData?.orders || [];
  const users = usersData?.users || [];
  
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
  const activeOrders = orders.filter((o: any) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length;
  const pendingOrders = orders.filter((o: any) => o.orderStatus === 'PENDING').length;

  const DASHBOARD_STATS = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: '+12.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Orders', value: activeOrders.toString(), change: '+4', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Users', value: users.length.toString(), change: '+2.4%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Pending Orders', value: pendingOrders.toString(), change: '-2', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Recent orders as activity
  const recentOrders = orders.slice(0, 4).map((order: any, index: number) => ({
    id: index + 1,
    user: `${order.user?.firstName || 'Unknown'} ${order.user?.lastName || ''}`,
    action: 'Created new order',
    target: `$${order.totalAmount?.toFixed(2) || '0.00'}`,
    time: new Date(order.createdAt).toLocaleDateString(),
    status: order.orderStatus?.toLowerCase() || 'created'
  }));

  const isLoading = ordersLoading || usersLoading;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin</h1>
            <p className="text-gray-500 mt-1">Here is what&apos;s happening with your store today.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              View Reports
            </button>
            <Link 
              href="/orders"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle size={16} /> Create Order
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DASHBOARD_STATS.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Split */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Orders</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="p-6">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto mb-2 text-gray-400" size={48} />
                    <p>No orders yet. Create your first order!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentOrders.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          item.status === 'pending' ? 'bg-yellow-500' : 
                          item.status === 'confirmed' ? 'bg-blue-500' : 
                          item.status === 'delivered' ? 'bg-green-500' :
                          item.status === 'shipped' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">{item.user}</span> {item.action} <span className="font-mono bg-gray-100 px-1 rounded">{item.target}</span>
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
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{item.user}</span> {item.action} <span className="font-mono bg-gray-100 px-1 rounded">{item.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Actions & Mini List */}
          <div className="space-y-6">
            
            {/* Quick Shortcuts */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-1">Fast Actions</h3>
                 <p className="text-blue-200 text-sm mb-6">Common tasks for sales agents</p>
                 
                 <div className="space-y-3">
                   <Link 
                     href="/orders"
                     className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-lg flex items-center justify-between transition-colors text-sm font-medium"
                   >
                     <span>New Sales Order</span>
                     <ArrowUpRight size={16} />
                   </Link>
                   <Link 
                      href="/payment"
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-lg flex items-center justify-between transition-colors text-sm font-medium"
                   >
                     <span>Process Payment</span>
                     <ArrowUpRight size={16} />
                   </Link>
                 </div>
               </div>
               {/* Decorative Background Icon */}
               <LayoutDashboard className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
            </div>

            {/* Pending Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
               <h3 className="font-bold text-gray-800 mb-4">Pending Review</h3>
               <ul className="space-y-3">
                  {[1,2,3].map(i => (
                    <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          JD
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order #778{i}</p>
                          <p className="text-xs text-gray-400">Awaiting approval</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </li>
                  ))}
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
