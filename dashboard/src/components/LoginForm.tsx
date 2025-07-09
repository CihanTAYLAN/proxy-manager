'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, Server, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/context/auth-store';
import { useToast } from '@/hooks/use-toast';

/**
 * Hybrid login/setup form component
 * Shows setup form when no users exist, otherwise shows login form
 */
export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const {
        login,
        setup,
        checkSetup,
        isLoading,
        error,
        needsSetup,
        setupChecked,
        clearError
    } = useAuthStore();

    // Check setup status on component mount
    useEffect(() => {
        if (!setupChecked) {
            checkSetup();
        }
    }, [checkSetup, setupChecked]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double submission
        if (isLoading) {
            console.log('Login already in progress, ignoring submission');
            return;
        }

        clearError();

        try {
            await login(email, password);

            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting to dashboard...",
            });

            router.push('/dashboard');
        } catch (err) {
            toast({
                title: "Login Failed",
                description: err instanceof Error ? err.message : "Login failed",
                variant: "destructive",
            });
        }
    };

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double submission
        if (isLoading) {
            console.log('Setup already in progress, ignoring submission');
            return;
        }

        console.log('Setup form submitted:', { email, username, password: '***' });
        clearError();

        // Validate passwords match
        if (password !== confirmPassword) {
            console.log('Password mismatch error');
            toast({
                title: "Setup Failed",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        // Validate required fields
        if (!email || !username || !password) {
            console.log('Missing required fields');
            toast({
                title: "Setup Failed",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        // Validate password length
        if (password.length < 8) {
            console.log('Password too short');
            toast({
                title: "Setup Failed",
                description: "Password must be at least 8 characters long",
                variant: "destructive",
            });
            return;
        }

        // Validate username length
        if (username.length < 3) {
            console.log('Username too short');
            toast({
                title: "Setup Failed",
                description: "Username must be at least 3 characters long",
                variant: "destructive",
            });
            return;
        }

        // Validate email format
        if (!email.includes('@')) {
            console.log('Invalid email format');
            toast({
                title: "Setup Failed",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return;
        }

        console.log('Starting setup process...');

        try {
            await setup(email, username, password);

            console.log('Setup successful, redirecting...');
            toast({
                title: "Setup Successful",
                description: "Admin account created! Welcome to Proxy Manager.",
            });

            // Small delay to ensure toast is shown
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (err) {
            console.error('Setup failed:', err);
            toast({
                title: "Setup Failed",
                description: err instanceof Error ? err.message : "Setup failed",
                variant: "destructive",
            });
        }
    };

    // Show loading while checking setup status
    if (!setupChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking system status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        <Server className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {needsSetup ? 'Welcome to Proxy Manager' : 'Welcome back'}
                        </h1>
                        <p className="text-muted-foreground">
                            {needsSetup
                                ? 'Set up your admin account to get started'
                                : 'Sign in to your Proxy Manager Dashboard'
                            }
                        </p>
                    </div>
                </div>

                {/* Setup/Login Card */}
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">
                            {needsSetup ? 'Initial Setup' : 'Sign in'}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {needsSetup
                                ? 'Create your admin account to start managing proxies'
                                : 'Enter your credentials to access the dashboard'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={needsSetup ? handleSetupSubmit : handleLoginSubmit}
                            className="space-y-4"
                            noValidate
                        >
                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}


                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Username Field (Only for setup) */}
                            {needsSetup && (
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </div>
                            )}

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    minLength={needsSetup ? 8 : 1}
                                />
                            </div>

                            {/* Confirm Password Field (Only for setup) */}
                            {needsSetup && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !email || !password ||
                                    (needsSetup && (!username || !confirmPassword))}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        {needsSetup ? 'Creating account...' : 'Signing in...'}
                                    </>
                                ) : (
                                    <>
                                        {needsSetup ? (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Create Admin Account
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Sign in
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>
                        {needsSetup
                            ? 'This account will have full administrative privileges.'
                            : 'Secure access to your Caddy proxy configuration and management tools.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
} 