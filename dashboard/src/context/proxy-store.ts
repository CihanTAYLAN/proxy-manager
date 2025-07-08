import { create } from "zustand";

export interface ProxyConfig {
	id: string;
	domain: string;
	target: string;
	sslEnabled: boolean;
	sslStatus: "valid" | "invalid" | "expired" | "pending";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
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
	createProxy: (data: Omit<ProxyConfig, "id" | "createdAt" | "updatedAt">) => Promise<void>;
	updateProxy: (id: string, data: Partial<ProxyConfig>) => Promise<void>;
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
			const response = await fetch("/api/proxies");
			if (!response.ok) {
				throw new Error("Failed to fetch proxies");
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
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(proxyData),
			});

			if (!response.ok) {
				throw new Error("Failed to create proxy");
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
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, ...proxyData }),
			});

			if (!response.ok) {
				throw new Error("Failed to update proxy");
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
			const response = await fetch(`/api/proxies?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete proxy");
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
