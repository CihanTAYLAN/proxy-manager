'use client';

import { useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

/**
 * User management page - view and manage dashboard users
 */
export default function UsersPage() {
    const [users] = useState<User[]>([
        {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            createdAt: '2024-01-01',
            lastLogin: '2024-01-15',
            isActive: true,
        },
        // TODO: Replace with real data from API
    ]);

    const [isLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        role: 'editor' as 'admin' | 'editor',
        password: '',
    });

    const handleCreateUser = async () => {
        // TODO: Implement user creation API call
        console.log('Creating user:', newUser);
        setShowCreateModal(false);
        setNewUser({ email: '', name: '', role: 'editor', password: '' });
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            // TODO: Implement user deletion API call
            console.log('Deleting user:', id);
        }
    };

    const handleToggleUserStatus = async (id: string) => {
        // TODO: Implement user status toggle API call
        console.log('Toggling user status:', id);
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 w-full">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6 sm:mb-8">
                <div className="sm:flex-auto min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage dashboard users and their access permissions.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                    >
                        Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Login
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
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No users found. Click &quot;Add User&quot; to create the first user.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleUserStatus(user.id)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => console.log('Edit user:', user.id)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
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

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Create New User
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter user name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'editor' })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={handleCreateUser}
                                    disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()}
                                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 sm:text-sm"
                                >
                                    Create User
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
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