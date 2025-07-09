import { create } from "zustand";
import { type ProxyConfig, type ProxyFormData } from "@/lib/caddy-api";
import { useAuthStore } from "./auth-store";

interface ProxyState {
	proxies: ProxyConfig[];
	selectedProxy: ProxyConfig | null;
	isLoading: boolean;
	error: string | null;
	showModal: boolean;
	modalMode: "create" | "edit" | null;
}

interface ProxyActions {
	fetchProxies: () => Promise<void>;
	createProxy: (data: ProxyFormData) => Promise<void>;
	updateProxy: (id: string, data: Partial<ProxyFormData>) => Promise<void>;
	deleteProxy: (id: string) => Promise<void>;
	setSelectedProxy: (proxy: ProxyConfig | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	showCreateModal: () => void;
	showEditModal: (proxy: ProxyConfig) => void;
	hideModal: () => void;
	clearError: () => void;
}

/**
 * Gets auth token from auth store
 */
function getAuthToken(): string | null {
	const authState = useAuthStore.getState();
	return authState.token;
}

/**
 * Creates authenticated fetch headers
 */
function getAuthHeaders(): HeadersInit {
	const token = getAuthToken();
	return {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
	};
}

/**
 * Proxy management store using Zustand
 * Handles proxy configurations, CRUD operations, and modal state
 */
export const useProxyStore = create<ProxyState & ProxyActions>((set, get) => ({
	// State
	proxies: [],
	selectedProxy: null,
	isLoading: false,
	error: null,
	showModal: false,
	modalMode: null,

	// Actions
	fetchProxies: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetch("/api/proxies", {
				method: "GET",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Authentication required");
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				set({ proxies: data.data, isLoading: false });
			} else {
				throw new Error(data.error || "Failed to fetch proxies");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to fetch proxies",
				isLoading: false,
			});
		}
	},

	createProxy: async (proxyData) => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetch("/api/proxies", {
				method: "POST",
				headers: getAuthHeaders(),
				body: JSON.stringify(proxyData),
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Authentication required");
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				// Refresh proxies list
				await get().fetchProxies();
				set({ showModal: false, modalMode: null, isLoading: false });
			} else {
				throw new Error(data.error || "Failed to create proxy");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to create proxy",
				isLoading: false,
			});
		}
	},

	updateProxy: async (id, proxyData) => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetch("/api/proxies", {
				method: "PUT",
				headers: getAuthHeaders(),
				body: JSON.stringify({ id, ...proxyData }),
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Authentication required");
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				// Refresh proxies list
				await get().fetchProxies();
				set({ showModal: false, modalMode: null, selectedProxy: null, isLoading: false });
			} else {
				throw new Error(data.error || "Failed to update proxy");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to update proxy",
				isLoading: false,
			});
		}
	},

	deleteProxy: async (id) => {
		set({ isLoading: true, error: null });

		try {
			const response = await fetch(`/api/proxies?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
				headers: getAuthHeaders(),
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Authentication required");
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				// Refresh proxies list
				await get().fetchProxies();
				set({ isLoading: false });
			} else {
				throw new Error(data.error || "Failed to delete proxy");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to delete proxy",
				isLoading: false,
			});
		}
	},

	setSelectedProxy: (proxy) => set({ selectedProxy: proxy }),
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	showCreateModal: () => set({ showModal: true, modalMode: "create", selectedProxy: null }),
	showEditModal: (proxy) => set({ showModal: true, modalMode: "edit", selectedProxy: proxy }),
	hideModal: () => set({ showModal: false, modalMode: null, selectedProxy: null }),
}));
