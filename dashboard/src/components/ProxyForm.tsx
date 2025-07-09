"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useProxyStore } from "@/context/proxy-store";
import { type ProxyConfig, type ProxyFormData } from "@/lib/caddy-api";

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
        sslEnabled: true,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Initialize form data for edit mode
    useEffect(() => {
        if (mode === "edit" && proxy) {
            setFormData({
                domain: proxy.domain,
                target: proxy.target,
                sslEnabled: proxy.sslEnabled,
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
        } else {
            if (!formData.target.includes(":")) {
                errors.target = "Target must include port (e.g., localhost:3000)";
            }
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
                sslEnabled: formData.sslEnabled,
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
    const handleFieldChange = (field: keyof ProxyFormData, value: string | boolean) => {
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
                sslEnabled: true,
            });
        } else if (proxy) {
            setFormData({
                domain: proxy.domain,
                target: proxy.target,
                sslEnabled: proxy.sslEnabled,
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
                    placeholder="localhost:3000"
                    value={formData.target}
                    onChange={(e) => handleFieldChange("target", e.target.value)}
                    className={validationErrors.target ? "border-destructive" : ""}
                    disabled={isLoading}
                />
                {validationErrors.target && (
                    <p className="text-sm text-destructive">{validationErrors.target}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    The backend service address and port (e.g., localhost:3000, 192.168.1.100:8080)
                </p>
            </div>

            {/* SSL Enabled Field */}
            <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                    <Label htmlFor="ssl-enabled">SSL/TLS Certificate</Label>
                    <p className="text-sm text-muted-foreground">
                        Automatically obtain and manage SSL certificates for this domain
                    </p>
                </div>
                <Switch
                    id="ssl-enabled"
                    checked={formData.sslEnabled}
                    onCheckedChange={(checked) => handleFieldChange("sslEnabled", checked)}
                    disabled={isLoading}
                />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create" ? "Create Proxy" : "Update Proxy"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    Reset
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
} 