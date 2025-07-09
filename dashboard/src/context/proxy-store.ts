import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export interface ProxyConfig {
	id: string;
	domain: string;
	target: string;
	port?: number;
	path?: string;
	headers?: Record<string, string>;
	tls: boolean;
	status: "active" | "inactive" | "error";
}

export interface ProxyFormData {
	domain: string;
	target: string;
	port?: number;
	path?: string;
	headers?: Record<string, string>;
	tls: boolean;
}

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
	createProxy: (proxyData: ProxyFormData) => Promise<void>;
	updateProxy: (id: string, proxyData: ProxyFormData) => Promise<void>;
	deleteProxy: (id: string) => Promise<void>;
	setSelectedProxy: (proxy: ProxyConfig | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
	showCreateModal: () => void;
	showEditModal: (proxy: ProxyConfig) => void;
	hideModal: () => void;
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
			const data = await apiClient.get("/api/proxies");

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
			const data = await apiClient.post("/api/proxies", proxyData);

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
			const data = await apiClient.put("/api/proxies", { id, ...proxyData });

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
			const data = await apiClient.delete(`/api/proxies?id=${encodeURIComponent(id)}`);

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
