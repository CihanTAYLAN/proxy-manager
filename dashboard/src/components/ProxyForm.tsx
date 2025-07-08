'use client';

import React, { useState, useEffect } from 'react';
import { ProxyConfig } from '@/context/proxy-store';
import Button from './Button';

export interface ProxyFormProps {
    proxy?: ProxyConfig | null;
    onSubmit: (data: Omit<ProxyConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

/**
 * Proxy configuration form component for creating and editing proxies
 */
export default function ProxyForm({
    proxy,
    onSubmit,
    onCancel,
    isLoading = false
}: ProxyFormProps) {
    const [formData, setFormData] = useState({
        domain: '',
        target: '',
        sslEnabled: true,
        sslStatus: 'pending' as 'valid' | 'invalid' | 'expired' | 'pending',
        status: 'active' as 'active' | 'inactive',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form with existing proxy data when editing
    useEffect(() => {
        if (proxy) {
            setFormData({
                domain: proxy.domain,
                target: proxy.target,
                sslEnabled: proxy.sslEnabled,
                sslStatus: proxy.sslStatus,
                status: proxy.status,
            });
        }
    }, [proxy]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.domain.trim()) {
            newErrors.domain = 'Domain is required';
        } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.domain)) {
            newErrors.domain = 'Please enter a valid domain';
        }

        if (!formData.target.trim()) {
            newErrors.target = 'Target is required';
        } else if (!/^https?:\/\/.+/.test(formData.target) && !/^[a-zA-Z0-9.-]+:\d+$/.test(formData.target)) {
            newErrors.target = 'Please enter a valid URL or host:port';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Domain Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domain *
                </label>
                <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.domain
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'
                        }`}
                    placeholder="example.com"
                    disabled={isLoading}
                />
                {errors.domain && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.domain}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    The domain name that will be proxied (without http/https)
                </p>
            </div>

            {/* Target Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target *
                </label>
                <input
                    type="text"
                    value={formData.target}
                    onChange={(e) => handleInputChange('target', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.target
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'
                        }`}
                    placeholder="http://localhost:8080 or 192.168.1.100:3000"
                    disabled={isLoading}
                />
                {errors.target && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.target}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    The backend server URL or host:port to proxy requests to
                </p>
            </div>

            {/* SSL Settings */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    SSL Configuration
                </label>
                <div className="space-y-3">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.sslEnabled}
                            onChange={(e) => handleInputChange('sslEnabled', e.target.checked)}
                            className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Enable SSL/TLS
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Automatically obtain and manage SSL certificates using ACME
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Status Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Set to inactive to temporarily disable this proxy without deleting it
                </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : proxy ? 'Update Proxy' : 'Create Proxy'}
                </Button>
            </div>
        </form>
    );
} 