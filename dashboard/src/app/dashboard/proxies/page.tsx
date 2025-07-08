'use client';

import { useEffect } from 'react';
import { useProxyStore, ProxyConfig } from '@/context/proxy-store';
import Modal from '@/components/Modal';
import ProxyForm from '@/components/ProxyForm';
import SSLBadge from '@/components/SSLBadge';

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
        createProxy,
        updateProxy,
        deleteProxy,
        showCreateModal,
        showEditModal,
        hideModal,
        clearError,
    } = useProxyStore();

    useEffect(() => {
        fetchProxies();
    }, [fetchProxies]);

    const handleDeleteProxy = async (id: string) => {
        if (confirm('Are you sure you want to delete this proxy? This action cannot be undone.')) {
            await deleteProxy(id);
        }
    };

    const handleFormSubmit = async (formData: Omit<ProxyConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (modalMode === 'edit' && selectedProxy) {
            await updateProxy(selectedProxy.id, formData);
        } else {
            await createProxy(formData);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 w-full">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6 sm:mb-8">
                <div className="sm:flex-auto min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        Proxy Configurations
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage your Caddy proxy configurations and routing rules.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none">
                    <button
                        type="button"
                        onClick={showCreateModal}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                    >
                        Add Proxy
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                Error
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

            {/* Proxies Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Domain
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Target
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    SSL Status
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="relative px-4 sm:px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Loading proxies...
                                    </td>
                                </tr>
                            ) : proxies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No proxies configured. Click &quot;Add Proxy&quot; to create your first proxy.
                                    </td>
                                </tr>
                            ) : (
                                proxies.map((proxy) => (
                                    <tr key={proxy.id}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            <div className="truncate max-w-xs">{proxy.domain}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="truncate max-w-xs">{proxy.target}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <SSLBadge
                                                status={proxy.sslStatus}
                                                daysUntilExpiry={30} // TODO: Calculate from real data
                                            />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proxy.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {proxy.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => showEditModal(proxy)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProxy(proxy.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Creating/Editing Proxies */}
            <Modal
                isOpen={showModal}
                onClose={hideModal}
                title={modalMode === 'edit' ? 'Edit Proxy' : 'Create New Proxy'}
                size="lg"
            >
                <ProxyForm
                    proxy={selectedProxy}
                    onSubmit={handleFormSubmit}
                    onCancel={hideModal}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
} 