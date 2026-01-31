'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  Package,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { DashboardStats, RecentActivity, DASHBOARD_STATS_ICONS, RECENT_ACTIVITY_CONFIG } from "../types";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch('/api/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        const stats: DashboardStats[] = [
          { label: 'Total Revenue', value: `$${(data.totalRevenue || 0).toLocaleString()}`, icon: DASHBOARD_STATS_ICONS.TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Active Orders', value: data.activeOrders, icon: DASHBOARD_STATS_ICONS.Package, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'New Customers', value: data.newCustomers, icon: DASHBOARD_STATS_ICONS.Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Pending Orders', value: data.pendingProcess, icon: DASHBOARD_STATS_ICONS.Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
        ];
        setDashboardStats(stats);
      });

    fetch('/api/recent-activity')
      .then(res => res.json())
      .then(data => {
        setRecentActivity(data);
      });

    fetch('/api/pending-review')
      .then(res => res.json())
      .then(data => {
        // Handle both old and new API response formats
        if (Array.isArray(data)) {
          setPendingReviews(data);
          setPendingPaymentsCount(data.length);
        } else {
          setPendingReviews(data.orders || []);
          setPendingPaymentsCount(data.totalCount || 0);
        }
      })
      .catch(error => {
        console.error('Error fetching pending reviews:', error);
        setPendingReviews([]);
        setPendingPaymentsCount(0);
      });
  }, [isSignedIn]);

  // Loading state
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Activity</h3>
              <button 
                onClick={() => router.push('/orders-list')}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      (RECENT_ACTIVITY_CONFIG.colors as any)[item.status]
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{item.salesAgent}</span> created new Order <span className="font-semibold text-green-600">${(item.amount || 0).toFixed(2)}</span> <span className="font-mono bg-gray-100 px-1 rounded text-xs">#{item.orderNumber}</span>
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
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl shadow-xl p-6 text-white relative overflow-hidden border border-blue-500/20">
               <div className="relative z-10">
                 <h3 className="font-bold text-xl mb-1">Fast Actions</h3>
                 <p className="text-blue-100 text-sm mb-6">Common tasks for sales agents</p>
                 
                 <div className="space-y-3">
                   <Link 
                     href="/orders"
                     className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-lg flex items-center justify-between transition-all hover:scale-105 text-sm font-semibold backdrop-blur-sm"
                   >
                     <span className="flex items-center gap-2">
                       <PlusCircle size={18} />
                       New Sales Order
                     </span>
                     <ArrowUpRight size={16} />
                   </Link>
                   <Link 
                      href="/orders-list"
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-lg flex items-center justify-between transition-all hover:scale-105 text-sm font-semibold backdrop-blur-sm"
                   >
                     <span className="flex items-center gap-2">
                       <CreditCard size={18} />
                       Process Payment
                     </span>
                     <ArrowUpRight size={16} />
                   </Link>
                   <Link 
                      href="/followup/available"
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-lg flex items-center justify-between transition-all hover:scale-105 text-sm font-semibold backdrop-blur-sm"
                   >
                     <span className="flex items-center gap-2">
                       <UserCheck size={18} />
                       Follow-up Orders
                     </span>
                     <ArrowUpRight size={16} />
                   </Link>
                   <Link 
                      href="/tickets"
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-lg flex items-center justify-between transition-all hover:scale-105 text-sm font-semibold backdrop-blur-sm"
                   >
                     <span className="flex items-center gap-2">
                       <ClipboardList size={18} />
                       Support Tickets
                     </span>
                     <ArrowUpRight size={16} />
                   </Link>
                 </div>
               </div>
               {/* Decorative Background Icon */}
               <LayoutDashboard className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
            </div>

            {/* Pending Payments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
               <div 
                 className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                 onClick={() => router.push('/orders-list?filter=unpaid')}
               >
                 <h3 className="font-bold text-gray-800">Pending Payments</h3>
                 <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                   {pendingPaymentsCount} Total
                 </span>
               </div>
               <ul className="space-y-3">
                  {Array.isArray(pendingReviews) && pendingReviews.map(order => (
                    <li 
                      key={order.order_id} 
                      onClick={() => router.push('/orders-list?filter=unpaid')}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                          {order.customer.firstname.charAt(0)}{order.customer.lastname.charAt(0)}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order #{order.order_number}</p>
                          <p className="text-xs text-red-500 font-semibold">${order.total_amount.toFixed(2)}</p>
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
