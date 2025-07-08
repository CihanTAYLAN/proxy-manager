import { create } from "zustand";

export interface SSLCertificate {
	id: string;
	domain: string;
	issuer: string;
	validFrom: string;
	validTo: string;
	status: "valid" | "invalid" | "expired" | "expiring" | "pending";
	autoRenewal: boolean;
	daysUntilExpiry: number;
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
			const response = await fetch("/api/ssl");
			if (!response.ok) {
				throw new Error("Failed to fetch SSL certificates");
			}

			const data = await response.json();
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
			const response = await fetch("/api/ssl/refresh", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain }),
			});

			if (!response.ok) {
				throw new Error("Failed to refresh SSL certificate");
			}

			const data = await response.json();
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
