'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, UserCheck, UserX, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserStore, type CreateUserData, type UpdateUserData, type User } from '@/context/user-store';
import { useAuthStore } from '@/context/auth-store';

/**
 * User management page - view and manage dashboard users
 */
export default function UsersPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const {
        users,
        isLoading,
        error,
        isInitialized,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        clearError,
        initialize
    } = useUserStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form state for creating users
    const [newUser, setNewUser] = useState<CreateUserData>({
        email: '',
        username: '',
        password: '',
    });

    // Form state for editing users
    const [editUser, setEditUser] = useState<UpdateUserData>({});

    const { toast } = useToast();

    // Initialize store and load users when authentication is confirmed
    useEffect(() => {
        if (isAuthenticated && !authLoading && !isInitialized) {
            initialize();
            fetchUsers();
        }
    }, [isAuthenticated, authLoading, isInitialized, initialize, fetchUsers]);

    // Clear error when component unmounts or error changes
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.username || !newUser.password) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            await createUser(newUser);
            setShowCreateModal(false);
            setNewUser({ email: '', username: '', password: '' });

            toast({
                title: "User created",
                description: `User ${newUser.username} has been created successfully.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create user.",
                variant: "destructive",
            });
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;

        try {
            await updateUser(selectedUser.id, editUser);
            setShowEditModal(false);
            setSelectedUser(null);
            setEditUser({});

            toast({
                title: "User updated",
                description: "User has been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        try {
            await deleteUser(id);
            toast({
                title: "User deleted",
                description: `User ${username} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete user.",
                variant: "destructive",
            });
        }
    };

    const handleToggleUserStatus = async (id: string) => {
        try {
            // Find the user and toggle their status
            const user = users.find(u => u.id === id);
            if (!user) {
                throw new Error("User not found");
            }

            await updateUser(id, { isActive: !user.isActive });
            toast({
                title: "Status updated",
                description: "User status has been updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? { variant: 'default' as const, label: 'Active', icon: UserCheck }
            : { variant: 'secondary' as const, label: 'Inactive', icon: UserX };
    };

    // Show loading while auth is being checked
    if (authLoading || !isAuthenticated) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span>Loading authentication...</span>
                </div>
            </div>
        );
    }

    const activeUsers = users.filter(user => user.isActive).length;
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
                                Add a new user to the dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-username">Username</Label>
                                <Input
                                    id="user-username"
                                    placeholder="johndoe"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
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

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
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
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const statusBadge = getStatusBadge(user.isActive);
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">@{user.username}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
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
                                                        disabled={isLoading}
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
                                                            setEditUser({
                                                                email: user.email,
                                                                username: user.username,
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                        disabled={isLoading}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" disabled={isLoading}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete &quot;{user.username}&quot;?
                                                                    This action cannot be undone and will revoke all access for this user.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteUser(user.id, user.username)}
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

            {/* Edit User Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-username">Username</Label>
                                <Input
                                    id="edit-user-username"
                                    value={editUser.username || ''}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-email">Email Address</Label>
                                <Input
                                    id="edit-user-email"
                                    type="email"
                                    value={editUser.email || ''}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-user-password">New Password (optional)</Label>
                                <Input
                                    id="edit-user-password"
                                    type="password"
                                    placeholder="Leave empty to keep current password"
                                    value={editUser.password || ''}
                                    onChange={(e) => setEditUser(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedUser(null);
                                setEditUser({});
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditUser} disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 