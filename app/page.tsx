'use client';

import Link from "next/link";
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
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { DashboardStats, RecentActivity, DASHBOARD_STATS_ICONS, RECENT_ACTIVITY_CONFIG } from "./types";

export default function Home() {
  const { user } = useUser();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        const stats: DashboardStats[] = [
          { label: 'Total Revenue', value: `$${(data.totalRevenue || 0).toLocaleString()}`, change: '+12.5%', icon: DASHBOARD_STATS_ICONS.TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Active Orders', value: data.activeOrders, change: '+4', icon: DASHBOARD_STATS_ICONS.Package, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'New Customers', value: data.newCustomers, change: '+2.4%', icon: DASHBOARD_STATS_ICONS.Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Pending Process', value: data.pendingProcess, change: '-2', icon: DASHBOARD_STATS_ICONS.Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
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
        setPendingReviews(data);
      });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">SalesFlow</span>
              <span className="text-xs block text-gray-500 -mt-0.5">CRM System</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-100">
                  Sign In
                </button>
              </SignInButton>
              <Link 
                href="/sign-in"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center gap-2"
              >
                Get Started
                <ArrowUpRight size={16} />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/orders"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
            </h1>
            <p className="text-gray-600 text-lg">Here is what&apos;s happening with your store today.</p>
          </div>
          <SignedIn>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                <TrendingUp size={16} />
                View Reports
              </button>
              <Link 
                href="/orders"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl"
              >
                <PlusCircle size={16} /> Create Order
              </Link>
            </div>
          </SignedIn>
          <SignedOut>
            <Link 
              href="/sign-in"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl"
            >
              Sign In to Continue
              <ArrowUpRight size={18} />
            </Link>
          </SignedOut>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.change}
                </span>
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
              <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
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
                 </div>
               </div>
               {/* Decorative Background Icon */}
               <LayoutDashboard className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
            </div>

            {/* Pending Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
               <h3 className="font-bold text-gray-800 mb-4">Pending Review</h3>
               <ul className="space-y-3">
                  {pendingReviews.map(order => (
                    <li key={order.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {order.customer.firstname.charAt(0)}{order.customer.lastname.charAt(0)}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700">Order #{order.order_id.substring(0, 7)}</p>
                          <p className="text-xs text-gray-400">Awaiting payment</p>
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
