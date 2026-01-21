
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

export type DashboardStats = {
    label: string;
    value: string;
    change: string;
    icon: React.ComponentType<any>;
    color: string;
    bg: string;
};
  
export type RecentActivity = {
    id: number;
    user: string;
    action: string;
    target: string;
    time: string;
    status: string;
};
  
export const DASHBOARD_STATS_ICONS = {
    TrendingUp,
    Package,
    Users,
    Clock,
};

export const RECENT_ACTIVITY_CONFIG = {
    colors: {
        created: 'bg-blue-500',
        success: 'bg-green-500',
        updated: 'bg-gray-400',
        system: 'bg-gray-400',
    },
    icons: {
        MoreVertical,
    }
};
