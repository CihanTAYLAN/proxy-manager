'use client';
import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock SSL certificate data
interface SSLCertificate {
    id: string;
    domain: string;
    issuer: string;
    validTo: string;
    daysUntilExpiry: number;
    status: 'valid' | 'expiring' | 'expired' | 'error';
    autoRenewal: boolean;
}

const mockCertificates: SSLCertificate[] = [
    {
        id: '1',
        domain: 'api.example.com',
        issuer: "Let's Encrypt",
        validTo: '2024-12-31',
        daysUntilExpiry: 45,
        status: 'valid',
        autoRenewal: true
    },
    {
        id: '2',
        domain: 'app.example.com',
        issuer: "Let's Encrypt",
        validTo: '2024-02-15',
        daysUntilExpiry: 7,
        status: 'expiring',
        autoRenewal: true
    },
    {
        id: '3',
        domain: 'old.example.com',
        issuer: "Let's Encrypt",
        validTo: '2024-01-01',
        daysUntilExpiry: -30,
        status: 'expired',
        autoRenewal: false
    }
];

/**
 * SSL Certificates management page
 */
export default function SSLPage() {
    const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null);

    const fetchCertificates = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCertificates(mockCertificates);
            setLastChecked(new Date().toISOString());
        } catch {
            setError('Failed to fetch SSL certificates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const getStatusBadge = (status: SSLCertificate['status'], daysUntilExpiry: number) => {
        switch (status) {
            case 'valid':
                if (daysUntilExpiry <= 7) {
                    return { variant: 'destructive' as const, label: 'Expiring Soon', icon: AlertTriangle };
                } else if (daysUntilExpiry <= 30) {
                    return { variant: 'secondary' as const, label: 'Expiring', icon: Clock };
                }
                return { variant: 'default' as const, label: 'Valid', icon: CheckCircle };
            case 'expiring':
                return { variant: 'destructive' as const, label: 'Expiring Soon', icon: AlertTriangle };
            case 'expired':
                return { variant: 'destructive' as const, label: 'Expired', icon: AlertCircle };
            case 'error':
                return { variant: 'destructive' as const, label: 'Error', icon: AlertCircle };
            default:
                return { variant: 'secondary' as const, label: 'Unknown', icon: AlertCircle };
        }
    };

    const expiringCount = certificates.filter(cert =>
        cert.status === 'expiring' || cert.daysUntilExpiry <= 30
    ).length;

    const expiredCount = certificates.filter(cert => cert.status === 'expired').length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        SSL Certificates
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor SSL certificate status and validity for your domains.
                    </p>
                    {lastChecked && (
                        <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(lastChecked).toLocaleString()}
                        </p>
                    )}
                </div>
                <Button
                    onClick={fetchCertificates}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Checking...' : 'Refresh Certificates'}
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{certificates.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiringCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiredCount}</div>
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

            {/* Certificates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>SSL Certificates</CardTitle>
                    <CardDescription>
                        Manage and monitor your SSL certificates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading certificates...</span>
                        </div>
                    ) : certificates.length === 0 ? (
                        <div className="text-center py-8">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No SSL certificates found</h3>
                            <p className="text-muted-foreground">
                                SSL certificates will appear here once configured.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Issuer</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Auto Renewal</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {certificates.map((cert) => {
                                    const statusBadge = getStatusBadge(cert.status, cert.daysUntilExpiry);
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <TableRow key={cert.id}>
                                            <TableCell className="font-medium">
                                                {cert.domain}
                                            </TableCell>
                                            <TableCell>{cert.issuer}</TableCell>
                                            <TableCell>
                                                <div>
                                                    {new Date(cert.validTo).toLocaleDateString()}
                                                    <div className="text-xs text-muted-foreground">
                                                        ({cert.daysUntilExpiry > 0 ? cert.daysUntilExpiry : Math.abs(cert.daysUntilExpiry)} days {cert.daysUntilExpiry > 0 ? 'remaining' : 'expired'})
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadge.variant} className="flex items-center gap-1 w-fit">
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cert.autoRenewal ? "default" : "secondary"}>
                                                    {cert.autoRenewal ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    Renew
                                                </Button>
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