'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/context/auth-store';
import LoginForm from '@/components/LoginForm';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * Auth Guard component - protects routes and shows login/setup if not authenticated
 * Checks setup status first, then handles authentication
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const {
        user,
        isAuthenticated,
        isLoading,
        needsSetup,
        setupChecked,
        verifyToken,
        checkSetup
    } = useAuthStore();

    // Initialize auth state on mount
    useEffect(() => {
        // First check if setup is needed
        if (!setupChecked) {
            checkSetup();
        } else if (!needsSetup && !isAuthenticated) {
            // Only verify token if setup is not needed
            verifyToken();
        }
    }, [checkSetup, verifyToken, setupChecked, needsSetup, isAuthenticated]);

    // Show loading spinner while checking setup status or authentication
    if (isLoading || !setupChecked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        {!setupChecked ? 'Checking system status...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show setup/login form if setup is needed or not authenticated
    if (needsSetup || !isAuthenticated || !user) {
        return <LoginForm />;
    }

    // Show protected content if authenticated and setup is complete
    return <>{children}</>;
} 