"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useProxyStore } from "@/context/proxy-store";
import { type ProxyConfig, type ProxyFormData } from "@/context/proxy-store";

interface ProxyFormProps {
    mode: "create" | "edit";
    proxy?: ProxyConfig;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * Proxy form component for creating and editing proxy configurations
 * Handles form validation, submission, and error display
 */
export default function ProxyForm({ mode, proxy, onSuccess, onCancel }: ProxyFormProps) {
    const { createProxy, updateProxy, isLoading, error, clearError } = useProxyStore();

    // Form state
    const [formData, setFormData] = useState<ProxyFormData>({
        domain: "",
        target: "",
        port: undefined,
        path: undefined,
        headers: {},
        tls: true,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Initialize form data for edit mode
    useEffect(() => {
        if (mode === "edit" && proxy) {
            setFormData({
                domain: proxy.domain,
                target: proxy.target,
                port: proxy.port,
                path: proxy.path,
                headers: proxy.headers || {},
                tls: proxy.tls,
            });
        }
    }, [mode, proxy]);

    // Clear errors when form data changes
    useEffect(() => {
        clearError();
        setValidationErrors({});
    }, [formData, clearError]);

    /**
     * Validates the form data
     * @returns True if valid, false otherwise
     */
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Validate domain
        if (!formData.domain.trim()) {
            errors.domain = "Domain is required";
        } else {
            const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!domainRegex.test(formData.domain.trim())) {
                errors.domain = "Please enter a valid domain (e.g., api.example.com)";
            }
        }

        // Validate target
        if (!formData.target.trim()) {
            errors.target = "Target is required";
        }

        // Validate port if provided
        if (formData.port && (formData.port < 1 || formData.port > 65535)) {
            errors.port = "Port must be between 1 and 65535";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handles form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const submitData: ProxyFormData = {
                domain: formData.domain.trim().toLowerCase(),
                target: formData.target.trim(),
                port: formData.port || undefined,
                path: formData.path?.trim() || undefined,
                headers: formData.headers || {},
                tls: formData.tls,
            };

            if (mode === "create") {
                await createProxy(submitData);
            } else if (mode === "edit" && proxy) {
                await updateProxy(proxy.id, submitData);
            }

            onSuccess?.();
        } catch (error) {
            console.error("Form submission error:", error);
            // Error is handled by the store
        }
    };

    /**
     * Updates form field value
     */
    const handleFieldChange = (field: keyof ProxyFormData, value: string | number | boolean | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    /**
     * Resets form to initial state
     */
    const handleReset = () => {
        if (mode === "create") {
            setFormData({
                domain: "",
                target: "",
                port: undefined,
                path: undefined,
                headers: {},
                tls: true,
            });
        } else if (proxy) {
            setFormData({
                domain: proxy.domain,
                target: proxy.target,
                port: proxy.port,
                path: proxy.path,
                headers: proxy.headers || {},
                tls: proxy.tls,
            });
        }
        setValidationErrors({});
        clearError();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error Message */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Domain Field */}
            <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                    id="domain"
                    type="text"
                    placeholder="api.example.com"
                    value={formData.domain}
                    onChange={(e) => handleFieldChange("domain", e.target.value)}
                    className={validationErrors.domain ? "border-destructive" : ""}
                    disabled={isLoading}
                />
                {validationErrors.domain && (
                    <p className="text-sm text-destructive">{validationErrors.domain}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    The domain name that will route to your service (e.g., api.example.com)
                </p>
            </div>

            {/* Target Field */}
            <div className="space-y-2">
                <Label htmlFor="target">Target *</Label>
                <Input
                    id="target"
                    type="text"
                    placeholder="localhost"
                    value={formData.target}
                    onChange={(e) => handleFieldChange("target", e.target.value)}
                    className={validationErrors.target ? "border-destructive" : ""}
                    disabled={isLoading}
                />
                {validationErrors.target && (
                    <p className="text-sm text-destructive">{validationErrors.target}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    The backend service hostname or IP address (e.g., localhost, 192.168.1.100)
                </p>
            </div>

            {/* Port Field */}
            <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                    id="port"
                    type="number"
                    placeholder="3000"
                    value={formData.port || ""}
                    onChange={(e) => handleFieldChange("port", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className={validationErrors.port ? "border-destructive" : ""}
                    disabled={isLoading}
                    min="1"
                    max="65535"
                />
                {validationErrors.port && (
                    <p className="text-sm text-destructive">{validationErrors.port}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    The port number of your backend service (e.g., 3000, 8080)
                </p>
            </div>

            {/* Path Field */}
            <div className="space-y-2">
                <Label htmlFor="path">Path</Label>
                <Input
                    id="path"
                    type="text"
                    placeholder="/api/*"
                    value={formData.path || ""}
                    onChange={(e) => handleFieldChange("path", e.target.value || undefined)}
                    disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                    Optional path pattern to match (e.g., /api/*, /v1/*)
                </p>
            </div>

            {/* SSL/TLS Field */}
            <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                    <Label htmlFor="tls">SSL/TLS Certificate</Label>
                    <p className="text-sm text-muted-foreground">
                        Automatically obtain and manage SSL certificates for this domain
                    </p>
                </div>
                <Switch
                    id="tls"
                    checked={formData.tls}
                    onCheckedChange={(checked) => handleFieldChange("tls", checked)}
                    disabled={isLoading}
                />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="button" variant="ghost" onClick={handleReset} disabled={isLoading}>
                    Reset
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create" ? "Create Proxy" : "Update Proxy"}
                </Button>
            </div>
        </form>
    );
} 