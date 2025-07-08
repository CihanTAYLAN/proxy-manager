'use client';

import { useEffect } from 'react';
import { useSSLStore } from '@/context/ssl-store';

/**
 * SSL Certificate management page - displays certificate status and validity
 */
export default function SSLPage() {
    const {
        certificates,
        isLoading,
        error,
        lastChecked,
        fetchCertificates,
        refreshCertificate,
        clearError,
    } = useSSLStore();

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const getStatusBadge = (status: string, daysUntilExpiry: number) => {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

        switch (status) {
            case 'valid':
                if (daysUntilExpiry <= 7) {
                    return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
                }
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case 'expired':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            case 'pending':
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
        }
    };

    const getStatusText = (status: string, daysUntilExpiry: number) => {
        switch (status) {
            case 'valid':
                if (daysUntilExpiry <= 7) {
                    return 'Expiring Soon';
                }
                return 'Valid';
            case 'expired':
                return 'Expired';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 w-full">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6 sm:mb-8">
                <div className="sm:flex-auto min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        SSL Certificates
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Monitor SSL certificate status and validity for your domains.
                    </p>
                    {lastChecked && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Last checked: {new Date(lastChecked).toLocaleString()}
                        </p>
                    )}
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => fetchCertificates()}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto disabled:opacity-50"
                    >
                        {isLoading ? 'Checking...' : 'Refresh Certificates'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                Error loading certificates
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                                <p>{error}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={clearError}
                                    className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-md text-sm hover:bg-red-100 dark:hover:bg-red-800 px-2 py-1"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificates Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Domain
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Issuer
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Valid Until
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Auto Renewal
                                </th>
                                <th className="relative px-4 sm:px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Loading certificates...
                                    </td>
                                </tr>
                            ) : certificates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No SSL certificates found. Certificates will appear here once domains are configured.
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((cert) => (
                                    <tr key={cert.id}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            <div className="truncate max-w-xs">{cert.domain}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="truncate max-w-xs">{cert.issuer}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div>
                                                {new Date(cert.validTo).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">
                                                    ({cert.daysUntilExpiry} days remaining)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={getStatusBadge(cert.status, cert.daysUntilExpiry)}>
                                                {getStatusText(cert.status, cert.daysUntilExpiry)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {cert.autoRenewal ? (
                                                <span className="text-green-600 dark:text-green-400">Enabled</span>
                                            ) : (
                                                <span className="text-red-600 dark:text-red-400">Disabled</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => refreshCertificate(cert.domain)}
                                                disabled={isLoading}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:opacity-50"
                                            >
                                                Refresh
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 