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
    Menu,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/context/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Proxies', href: '/dashboard/proxies', icon: Globe },
    { name: 'SSL Certificates', href: '/dashboard/ssl', icon: Shield },
    { name: 'API Tokens', href: '/dashboard/tokens', icon: Key },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

/**
 * Sidebar component for both desktop and mobile
 */
function Sidebar({ className = '' }: { className?: string }) {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={`flex flex-col h-full bg-background border-r ${className}`}>
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center">
                        <Server className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-semibold">Proxy Manager</span>
                </div>
                <ThemeToggle />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Button
                            key={item.name}
                            asChild
                            variant={isActive ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <a href={item.href}>
                                <Icon className="w-4 h-4 mr-3" />
                                {item.name}
                            </a>
                        </Button>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarFallback>
                            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.username || 'Admin User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Protected dashboard layout component - requires authentication
 */
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <div className="flex flex-col flex-1">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center">
                                <Server className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-semibold">Proxy Manager</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>

                <SheetContent side="left" className="p-0 w-64">
                    <Sidebar />
                </SheetContent>
            </Sheet>
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