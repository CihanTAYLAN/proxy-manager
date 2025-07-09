'use client';

import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, UserCheck, UserX, Calendar, Shield, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: '2024-01-01T10:00:00Z',
        lastLogin: '2024-01-20T14:30:00Z',
        isActive: true,
    },
    {
        id: '2',
        email: 'editor@example.com',
        name: 'Editor User',
        role: 'editor',
        createdAt: '2024-01-10T09:15:00Z',
        lastLogin: '2024-01-18T16:45:00Z',
        isActive: true,
    },
    {
        id: '3',
        email: 'inactive@example.com',
        name: 'Inactive User',
        role: 'editor',
        createdAt: '2024-01-05T11:30:00Z',
        lastLogin: '2024-01-12T08:20:00Z',
        isActive: false,
    },
];

/**
 * User management page - view and manage dashboard users
 */
export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form state
    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        role: 'editor' as 'admin' | 'editor',
        password: '',
    });

    const { toast } = useToast();

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.name || !newUser.password) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user: User = {
                id: Date.now().toString(),
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                createdAt: new Date().toISOString(),
                isActive: true,
            };

            setUsers(prev => [user, ...prev]);
            setShowCreateModal(false);
            setNewUser({ email: '', name: '', role: 'editor', password: '' });

            toast({
                title: "User created",
                description: `User ${newUser.name} has been created successfully.`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to create user.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setUsers(prev => prev.filter(user => user.id !== id));
            toast({
                title: "User deleted",
                description: "The user has been deleted successfully.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive",
            });
        }
    };

    const handleToggleUserStatus = async (id: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            setUsers(prev => prev.map(user =>
                user.id === id ? { ...user, isActive: !user.isActive } : user
            ));
            toast({
                title: "Status updated",
                description: "User status has been updated.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    const getRoleBadge = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return { variant: 'default' as const, label: 'Admin', icon: Shield };
            case 'editor':
                return { variant: 'secondary' as const, label: 'Editor', icon: Pencil };
            default:
                return { variant: 'secondary' as const, label: 'Unknown', icon: Users };
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? { variant: 'default' as const, label: 'Active', icon: UserCheck }
            : { variant: 'secondary' as const, label: 'Inactive', icon: UserX };
    };

    const activeUsers = users.filter(user => user.isActive).length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const recentLogins = users.filter(user =>
        user.lastLogin &&
        new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage dashboard users and their access permissions.
                    </p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the dashboard with specific role and permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input
                                    id="user-name"
                                    placeholder="John Doe"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-email">Email Address</Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-password">Password</Label>
                                <Input
                                    id="user-password"
                                    type="password"
                                    placeholder="Enter a secure password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-role">Role</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value: 'admin' | 'editor') =>
                                        setNewUser(prev => ({ ...prev, role: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser} disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Shield className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentLogins}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Users</CardTitle>
                    <CardDescription>
                        Manage user accounts and their access permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            <span>Loading users...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No users found</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first dashboard user to get started.
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const roleBadge = getRoleBadge(user.role);
                                    const statusBadge = getStatusBadge(user.isActive);
                                    const RoleIcon = roleBadge.icon;
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={roleBadge.variant} className="flex items-center gap-1 w-fit">
                                                    <RoleIcon className="h-3 w-3" />
                                                    {roleBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLogin ? (
                                                    <div>
                                                        {new Date(user.lastLogin).toLocaleDateString()}
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(user.lastLogin).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={user.isActive}
                                                        onCheckedChange={() => handleToggleUserStatus(user.id)}
                                                    />
                                                    <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusBadge.label}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete &quot;{user.name}&quot;?
                                                                    This action cannot be undone and will revoke all access for this user.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            {selectedUser && (
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user information and permissions for {selectedUser.name}.
                            </DialogDescription>
                        </DialogHeader>
                        {/* TODO: Add edit form */}
                        <div className="p-4 text-center text-muted-foreground">
                            Edit user form will be implemented here
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setShowEditModal(false)}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
} 