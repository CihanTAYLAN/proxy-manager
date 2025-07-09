'use client';

import { useEffect } from 'react';
import { Globe, Plus, Pencil, Trash2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProxyStore } from '@/context/proxy-store';
import { useAuthStore } from '@/context/auth-store';
import { type ProxyConfig } from '@/lib/caddy-api';
import ProxyForm from '@/components/ProxyForm';

/**
 * Proxy management page - list, create, edit, delete proxy configurations
 */
export default function ProxiesPage() {
    const {
        proxies,
        isLoading,
        error,
        showModal,
        modalMode,
        selectedProxy,
        fetchProxies,
        deleteProxy,
        showCreateModal,
        showEditModal,
        hideModal,
        clearError
    } = useProxyStore();

    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchProxies();
        }
    }, [isAuthenticated, fetchProxies]);

    const handleDeleteProxy = async (id: string) => {
        try {
            await deleteProxy(id);
        } catch (error) {
            console.error('Failed to delete proxy:', error);
        }
    };

    const handleFormSuccess = () => {
        hideModal();
    };

    const getSSLBadge = (status: ProxyConfig['sslStatus']) => {
        switch (status) {
            case 'valid':
                return { variant: 'default' as const, label: 'Valid SSL', icon: CheckCircle };
            case 'expired':
                return { variant: 'destructive' as const, label: 'SSL Expired', icon: AlertCircle };
            case 'pending':
                return { variant: 'secondary' as const, label: 'SSL Pending', icon: AlertCircle };
            case 'invalid':
                return { variant: 'destructive' as const, label: 'SSL Invalid', icon: AlertCircle };
            default:
                return { variant: 'secondary' as const, label: 'Unknown', icon: AlertCircle };
        }
    };

    const getStatusBadge = (status: ProxyConfig['status']) => {
        switch (status) {
            case 'active':
                return { variant: 'default' as const, label: 'Active' };
            case 'inactive':
                return { variant: 'secondary' as const, label: 'Inactive' };
            default:
                return { variant: 'secondary' as const, label: 'Unknown' };
        }
    };

    const activeProxies = proxies.filter(proxy => proxy.status === 'active').length;
    const sslIssues = proxies.filter(proxy => proxy.sslStatus === 'expired' || proxy.sslStatus === 'invalid').length;

    // Show loading state if authentication is not ready
    if (!isAuthenticated) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Globe className="h-8 w-8" />
                        Proxy Configurations
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your Caddy proxy configurations and routing rules.
                    </p>
                </div>
                <Dialog open={showModal && modalMode === 'create'} onOpenChange={(open) => open ? showCreateModal() : hideModal()}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Proxy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Proxy</DialogTitle>
                            <DialogDescription>
                                Add a new proxy configuration to route traffic to your services.
                            </DialogDescription>
                        </DialogHeader>
                        <ProxyForm
                            mode="create"
                            onSuccess={handleFormSuccess}
                            onCancel={hideModal}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Proxies</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{proxies.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Proxies</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProxies}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SSL Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sslIssues}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={clearError}
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Proxies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Proxy Configurations</CardTitle>
                    <CardDescription>
                        Manage your proxy routing configurations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            <span>Loading proxies...</span>
                        </div>
                    ) : proxies.length === 0 ? (
                        <div className="text-center py-8">
                            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No proxies configured</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by creating your first proxy configuration.
                            </p>
                            <Button onClick={showCreateModal}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Proxy
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>SSL Status</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proxies.map((proxy) => {
                                    const sslBadge = getSSLBadge(proxy.sslStatus);
                                    const statusBadge = getStatusBadge(proxy.status);
                                    const SSLIcon = sslBadge.icon;

                                    return (
                                        <TableRow key={proxy.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {proxy.domain}
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a
                                                            href={`https://${proxy.domain}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                                    {proxy.target}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sslBadge.variant} className="flex items-center gap-1 w-fit">
                                                    <SSLIcon className="h-3 w-3" />
                                                    {sslBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadge.variant}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => showEditModal(proxy)}
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
                                                                <AlertDialogTitle>Delete Proxy</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete the proxy for &quot;{proxy.domain}&quot;?
                                                                    This action cannot be undone and will immediately stop routing traffic.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteProxy(proxy.id)}
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

            {/* Edit Dialog */}
            <Dialog open={showModal && modalMode === 'edit'} onOpenChange={(open) => open ? (selectedProxy && showEditModal(selectedProxy)) : hideModal()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Proxy</DialogTitle>
                        <DialogDescription>
                            Update the proxy configuration for {selectedProxy?.domain}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProxy && (
                        <ProxyForm
                            mode="edit"
                            proxy={selectedProxy}
                            onSuccess={handleFormSuccess}
                            onCancel={hideModal}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 