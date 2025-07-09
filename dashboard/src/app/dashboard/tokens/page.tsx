'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Copy, Trash2, AlertCircle, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Mock token data
interface APIToken {
    id: string;
    name: string;
    permissions: string[];
    createdAt: string;
    lastUsed: string | null;
    status: 'active' | 'inactive';
    prefix: string;
}

const mockTokens: APIToken[] = [
    {
        id: '1',
        name: 'Production API',
        permissions: ['read', 'write'],
        createdAt: '2024-01-15T10:30:00Z',
        lastUsed: '2024-01-20T14:25:00Z',
        status: 'active',
        prefix: 'pm_prod_'
    },
    {
        id: '2',
        name: 'CI/CD Pipeline',
        permissions: ['read'],
        createdAt: '2024-01-10T09:15:00Z',
        lastUsed: '2024-01-19T11:40:00Z',
        status: 'active',
        prefix: 'pm_cicd_'
    },
    {
        id: '3',
        name: 'Development Token',
        permissions: ['read', 'write', 'delete'],
        createdAt: '2024-01-05T16:20:00Z',
        lastUsed: null,
        status: 'inactive',
        prefix: 'pm_dev_'
    }
];

const availablePermissions = [
    { id: 'read', name: 'Read', description: 'View proxy configurations' },
    { id: 'write', name: 'Write', description: 'Create and update proxies' },
    { id: 'delete', name: 'Delete', description: 'Delete proxy configurations' },
    { id: 'ssl', name: 'SSL Management', description: 'Manage SSL certificates' },
];

/**
 * API Token management page - create, view, and delete API tokens
 */
export default function TokensPage() {
    const [tokens, setTokens] = useState<APIToken[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newToken, setNewToken] = useState<string | null>(null);
    const [showNewTokenDialog, setShowNewTokenDialog] = useState(false);

    // Form state
    const [tokenName, setTokenName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const { toast } = useToast();

    const fetchTokens = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTokens(mockTokens);
        } catch {
            setError('Failed to fetch tokens');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, []);

    const handleCreateToken = async () => {
        if (!tokenName.trim() || selectedPermissions.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please provide a name and select at least one permission.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            const generatedToken = `pm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            setNewToken(generatedToken);
            setShowCreateDialog(false);
            setShowNewTokenDialog(true);

            // Add new token to list
            const newTokenObj: APIToken = {
                id: Date.now().toString(),
                name: tokenName,
                permissions: selectedPermissions,
                createdAt: new Date().toISOString(),
                lastUsed: null,
                status: 'active',
                prefix: 'pm_new_'
            };
            setTokens(prev => [newTokenObj, ...prev]);

            // Reset form
            setTokenName('');
            setSelectedPermissions([]);
        } catch {
            setError('Failed to create token');
        }
    };

    const handleDeleteToken = async (id: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setTokens(prev => prev.filter(token => token.id !== id));
            toast({
                title: "Token deleted",
                description: "The API token has been successfully deleted.",
            });
        } catch {
            setError('Failed to delete token');
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: "Copied!",
                description: "Token copied to clipboard.",
            });
        } catch {
            toast({
                title: "Copy failed",
                description: "Failed to copy token to clipboard.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: APIToken['status']) => {
        switch (status) {
            case 'active':
                return { variant: 'default' as const, label: 'Active' };
            case 'inactive':
                return { variant: 'secondary' as const, label: 'Inactive' };
            default:
                return { variant: 'secondary' as const, label: 'Unknown' };
        }
    };

    const getPermissionBadges = (permissions: string[]) => {
        return permissions.map(permission => {
            const perm = availablePermissions.find(p => p.id === permission);
            return perm ? perm.name : permission;
        });
    };

    const activeTokens = tokens.filter(token => token.status === 'active').length;
    const recentlyUsed = tokens.filter(token =>
        token.lastUsed &&
        new Date(token.lastUsed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Key className="h-8 w-8" />
                        API Tokens
                    </h1>
                    <p className="text-muted-foreground">
                        Create and manage API tokens for programmatic access to the proxy manager.
                    </p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Token
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New API Token</DialogTitle>
                            <DialogDescription>
                                Create a new API token with specific permissions for programmatic access.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="token-name">Token Name</Label>
                                <Input
                                    id="token-name"
                                    placeholder="e.g., Production API, CI/CD Pipeline"
                                    value={tokenName}
                                    onChange={(e) => setTokenName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Permissions</Label>
                                {availablePermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={permission.id}
                                            checked={selectedPermissions.includes(permission.id)}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) {
                                                    setSelectedPermissions(prev => [...prev, permission.id]);
                                                } else {
                                                    setSelectedPermissions(prev => prev.filter(p => p !== permission.id));
                                                }
                                            }}
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor={permission.id} className="text-sm font-medium">
                                                {permission.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {permission.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateToken}>
                                Create Token
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tokens.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTokens}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recently Used</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentlyUsed}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* New Token Display */}
            <Dialog open={showNewTokenDialog} onOpenChange={setShowNewTokenDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Token Created Successfully!
                        </DialogTitle>
                        <DialogDescription>
                            Please copy this token now. You will not be able to see it again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                Store this token securely. It provides access to your proxy manager API.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label>Your new API token:</Label>
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 px-3 py-2 bg-muted rounded border font-mono text-sm break-all">
                                    {newToken}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => newToken && copyToClipboard(newToken)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            setShowNewTokenDialog(false);
                            setNewToken(null);
                        }}>
                            I&apos;ve Saved My Token
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tokens Table */}
            <Card>
                <CardHeader>
                    <CardTitle>API Tokens</CardTitle>
                    <CardDescription>
                        Manage your API tokens and their permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            <span>Loading tokens...</span>
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-center py-8">
                            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No API tokens found</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first API token to enable programmatic access.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Token
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token) => {
                                    const statusBadge = getStatusBadge(token.status);
                                    const permissionBadges = getPermissionBadges(token.permissions);

                                    return (
                                        <TableRow key={token.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    {token.name}
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {token.prefix}***
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {permissionBadges.map((permission, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(token.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {token.lastUsed ? (
                                                    <div>
                                                        {new Date(token.lastUsed).toLocaleDateString()}
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(token.lastUsed).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadge.variant}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete API Token</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete the token &quot;{token.name}&quot;?
                                                                This action cannot be undone and will immediately revoke access for this token.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteToken(token.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 