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

// --- Mock Data for Dashboard ---
const DASHBOARD_STATS = [
  { label: 'Total Revenue', value: '$124,500', change: '+12.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Active Orders', value: '45', change: '+4', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'New Customers', value: '12', change: '+2.4%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Pending Process', value: '8', change: '-2', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
];

const RECENT_ACTIVITY = [
  { id: 1, user: 'John Doe', action: 'Created new order', target: '#ORD-7782', time: '2 mins ago', status: 'created' },
  { id: 2, user: 'Sarah Smith', action: 'Processed payment', target: '$450.00', time: '15 mins ago', status: 'success' },
  { id: 3, user: 'Mike Ross', action: 'Updated shipping', target: '#ORD-7740', time: '1 hour ago', status: 'updated' },
  { id: 4, user: 'System', action: 'Daily report generated', target: 'PDF', time: '4 hours ago', status: 'system' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, John</h1>
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

        {/* Stats Grid */}
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
                {RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === 'created' ? 'bg-blue-500' : 
                      item.status === 'success' ? 'bg-green-500' :
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
