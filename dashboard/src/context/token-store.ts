import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export interface APIToken {
	id: string;
	name: string;
	permissions: string[];
	lastUsed: string | null;
	createdAt: string;
	isActive: boolean;
}

interface TokenState {
	tokens: APIToken[];
	isLoading: boolean;
	error: string | null;
	isCreateModalOpen: boolean;
	newToken: string | null;
}

interface TokenActions {
	fetchTokens: () => Promise<void>;
	createToken: (name: string, permissions: string[]) => Promise<void>;
	deleteToken: (id: string) => Promise<void>;
	toggleTokenStatus: (id: string) => Promise<void>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
	openCreateModal: () => void;
	closeCreateModal: () => void;
	clearNewToken: () => void;
}

/**
 * API Token management store using Zustand
 * Handles API token creation, deletion, and management
 */
export const useTokenStore = create<TokenState & TokenActions>((set, get) => ({
	// State
	tokens: [],
	isLoading: false,
	error: null,
	isCreateModalOpen: false,
	newToken: null,

	// Actions
	fetchTokens: async () => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.get("/api/tokens");

			if (data.success) {
				set({ tokens: data.data, isLoading: false });
			} else {
				throw new Error(data.error || "Failed to fetch API tokens");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to fetch API tokens",
				isLoading: false,
			});
		}
	},

	createToken: async (name, permissions) => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.post("/api/tokens", { name, permissions });

			if (data.success) {
				set({
					newToken: data.data.token,
					isCreateModalOpen: false,
					isLoading: false,
				});
				// Refresh tokens list
				await get().fetchTokens();
			} else {
				throw new Error(data.error || "Failed to create API token");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to create API token",
				isLoading: false,
			});
		}
	},

	deleteToken: async (id) => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.delete(`/api/tokens?id=${id}`);

			if (data.success) {
				// Refresh tokens list
				await get().fetchTokens();
				set({ isLoading: false });
			} else {
				throw new Error(data.error || "Failed to delete API token");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to delete API token",
				isLoading: false,
			});
		}
	},

	toggleTokenStatus: async (id) => {
		set({ isLoading: true, error: null });

		try {
			const data = await apiClient.put("/api/tokens/toggle", { id });

			if (data.success) {
				// Refresh tokens list
				await get().fetchTokens();
				set({ isLoading: false });
			} else {
				throw new Error(data.error || "Failed to toggle token status");
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to toggle token status",
				isLoading: false,
			});
		}
	},

	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),
	openCreateModal: () => set({ isCreateModalOpen: true }),
	closeCreateModal: () => set({ isCreateModalOpen: false }),
	clearNewToken: () => set({ newToken: null }),
}));
