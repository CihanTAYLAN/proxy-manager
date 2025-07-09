import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export interface SSLCertificate {
	domain: string;
	status: "valid" | "expiring" | "expired" | "pending" | "error";
	issuer: string;
	issuedAt: string;
	expiresAt: string;
	daysUntilExpiry: number;
	autoRenew: boolean;
}

interface SSLState {
	certificates: SSLCertificate[];
	isLoading: boolean;
	error: string | null;
	lastChecked: string | null;
}

interface SSLActions {
	fetchCertificates: () => Promise<void>;
	refreshCertificate: (domain: string) => Promise<void>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
}

/**
 * SSL certificate management store using Zustand
 * Handles SSL certificate status, validation, and monitoring
 */
export const useSSLStore = create<SSLState & SSLActions>((set, get) => ({
	// State
	certificates: [],
	isLoading: false,
	error: null,
	lastChecked: null,

	// Actions
	fetchCertificates: async () => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.get("/api/ssl");

			if (data.success) {
				set({
					certificates: data.data.certificates || [],
					isLoading: false,
					lastChecked: new Date().toISOString(),
				});
			} else {
				throw new Error(data.error || "Failed to fetch SSL certificates");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to fetch SSL certificates",
				isLoading: false,
			});
		}
	},

	refreshCertificate: async (domain) => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.post("/api/ssl/refresh", { domain });

			if (data.success) {
				// Refresh certificates list
				await get().fetchCertificates();
			} else {
				throw new Error(data.error || "Failed to refresh SSL certificate");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to refresh SSL certificate",
				isLoading: false,
			});
		}
	},

	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),
}));
