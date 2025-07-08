'use client';
import {
    Home,
    Globe,
    Shield,
    Key,
    Users,
    Settings,
    Server,
    LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/auth-context';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Proxies', href: '/dashboard/proxies', icon: Globe },
    { name: 'SSL Certificates', href: '/dashboard/ssl', icon: Shield },
    { name: 'API Tokens', href: '/dashboard/tokens', icon: Key },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

/**
 * Protected dashboard layout component - requires authentication
 */
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        // User will automatically see login form due to AuthGuard
    };

    return (
        <div className="min-h-screen bg-gray-900 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-700 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center rounded-sm">
                                <Server className="w-4 h-4 text-white rounded-sm" />
                            </div>
                            <span className="ml-2 text-lg font-semibold text-white">Caddy Proxy Manager</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </a>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-gray-700 p-4 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 flex items-center justify-center rounded-full">
                                <Users className="w-4 h-4 text-gray-300" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * Dashboard layout component - provides navigation and common layout
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </AuthGuard>
    );
} 