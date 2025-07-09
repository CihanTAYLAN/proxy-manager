'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import LoginForm from '@/components/LoginForm';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * Auth Guard component - protects routes and shows login if not authenticated
 * This ensures user stays on the same URL even when logging in
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading } = useAuth();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </div>
            </div>
        );
    }

    // Show login form if not authenticated (URL stays the same)
    if (!user) {
        return <LoginForm />;
    }

    // Show protected content if authenticated
    return <>{children}</>;
} 