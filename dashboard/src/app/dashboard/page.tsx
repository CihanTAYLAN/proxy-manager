'use client';
import {
    Globe,
    Shield,
    Key,
    Users, CheckCircle,
    Clock,
    TrendingUp
} from 'lucide-react';

// Mock data for demonstration
const stats = [
    {
        title: 'Active Proxies',
        value: '12',
        change: '+2 this month',
        icon: Globe,
        color: 'text-blue-400',
        bgColor: 'bg-blue-600/10'
    },
    {
        title: 'SSL Certificates',
        value: '8',
        change: '2 expiring soon',
        icon: Shield,
        color: 'text-green-400',
        bgColor: 'bg-green-600/10'
    },
    {
        title: 'API Tokens',
        value: '5',
        change: '3 active',
        icon: Key,
        color: 'text-purple-400',
        bgColor: 'bg-purple-600/10'
    },
    {
        title: 'Users',
        value: '3',
        change: '1 admin',
        icon: Users,
        color: 'text-orange-400',
        bgColor: 'bg-orange-600/10'
    }
];

const recentActivity = [
    { action: 'Proxy created', target: 'api.example.com', time: '2 minutes ago', status: 'success' },
    { action: 'SSL renewed', target: 'app.example.com', time: '1 hour ago', status: 'success' },
    { action: 'User login', target: 'admin@example.com', time: '3 hours ago', status: 'info' },
    { action: 'Token revoked', target: 'pm_abc123...', time: '1 day ago', status: 'warning' }
];

/**
 * Dashboard main page - overview of proxy manager status
 */
export default function DashboardPage() {
    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 w-full">
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow min-w-0">
                            <div className="flex items-center">
                                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.title}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stat.change}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent activity and system info */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow min-w-0">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between min-w-0">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${activity.status === 'success' ? 'bg-green-400' :
                                            activity.status === 'warning' ? 'bg-yellow-400' :
                                                'bg-blue-400'
                                            }`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.action}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.target}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow min-w-0">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Overview</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Caddy Server</span>
                                </div>
                                <span className="text-sm text-green-400 flex-shrink-0">Running</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Database</span>
                                </div>
                                <span className="text-sm text-green-400 flex-shrink-0">Connected</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <Clock className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">SSL Auto-renewal</span>
                                </div>
                                <span className="text-sm text-yellow-400 flex-shrink-0">2 pending</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <TrendingUp className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Uptime</span>
                                </div>
                                <span className="text-sm text-blue-400 flex-shrink-0">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 