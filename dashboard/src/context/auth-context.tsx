'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check if user is authenticated
     */
    const checkAuth = async () => {
        try {
            setIsLoading(true);

            // Check localStorage for token
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
                return;
            }

            // Validate token with backend
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
            } else {
                // Invalid token, remove it
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user with email and password
     */
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // Store token
                localStorage.setItem('auth_token', data.token);

                // Set user data
                setUser(data.user);

                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 