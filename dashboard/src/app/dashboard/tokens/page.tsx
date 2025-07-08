'use client';

import { useEffect, useState } from 'react';
import { useTokenStore } from '@/context/token-store';

/**
 * API Token management page - create, view, and delete API tokens
 */
export default function TokensPage() {
    const {
        tokens,
        isLoading,
        error,
        newToken,
        isCreateModalOpen,
        fetchTokens,
        createToken,
        deleteToken,
        openCreateModal,
        closeCreateModal,
        clearNewToken,
        clearError,
    } = useTokenStore();

    const [tokenName, setTokenName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const availablePermissions = [
        { id: 'read', name: 'Read', description: 'View proxy configurations' },
        { id: 'write', name: 'Write', description: 'Create and update proxies' },
        { id: 'delete', name: 'Delete', description: 'Delete proxy configurations' },
        { id: 'ssl', name: 'SSL Management', description: 'Manage SSL certificates' },
    ];

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

    const handleCreateToken = async () => {
        if (!tokenName.trim()) return;

        try {
            await createToken(tokenName.trim(), selectedPermissions);
            setTokenName('');
            setSelectedPermissions([]);
        } catch (error) {
            console.error('Failed to create token:', error);
        }
    };

    const handleDeleteToken = async (id: string) => {
        if (confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
            await deleteToken(id);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Token copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy token:', err);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 w-full">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6 sm:mb-8">
                <div className="sm:flex-auto min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        API Tokens
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Create and manage API tokens for programmatic access to the proxy manager.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none">
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                    >
                        Create Token
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

            {/* New Token Display */}
            {newToken && (
                <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900 p-4">
                    <div className="flex">
                        <div className="ml-3 flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                                Token created successfully!
                            </h3>
                            <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                                <p className="mb-2">Please copy this token now. You will not be able to see it again.</p>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all">
                                    {newToken}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(newToken)}
                                    className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-md text-sm hover:bg-green-100 dark:hover:bg-green-800 px-2 py-1"
                                >
                                    Copy Token
                                </button>
                                <button
                                    type="button"
                                    onClick={clearNewToken}
                                    className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-md text-sm hover:bg-green-100 dark:hover:bg-green-800 px-2 py-1"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tokens Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Used
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
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Loading tokens...
                                    </td>
                                </tr>
                            ) : tokens.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No API tokens found. Click &quot;Create Token&quot; to create your first token.
                                    </td>
                                </tr>
                            ) : (
                                tokens.map((token) => (
                                    <tr key={token.id}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            <div className="truncate max-w-xs">{token.name}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="truncate max-w-xs">{token.permissions.join(', ')}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(token.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {token.lastUsed ? new Date(token.lastUsed).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${token.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {token.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => console.log('Edit token:', token.id)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteToken(token.id)}
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

            {/* Create Token Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Create New API Token
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Token Name
                                    </label>
                                    <input
                                        type="text"
                                        value={tokenName}
                                        onChange={(e) => setTokenName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter token name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        {availablePermissions.map((permission) => (
                                            <label key={permission.id} className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPermissions([...selectedPermissions, permission.id]);
                                                        } else {
                                                            setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                                                        }
                                                    }}
                                                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <div className="ml-3">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{permission.name}</span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={handleCreateToken}
                                    disabled={!tokenName.trim() || selectedPermissions.length === 0 || isLoading}
                                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 sm:text-sm"
                                >
                                    {isLoading ? 'Creating...' : 'Create Token'}
                                </button>
                                <button
                                    onClick={closeCreateModal}
                                    className="flex-1 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 