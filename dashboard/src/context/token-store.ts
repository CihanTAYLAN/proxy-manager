import { create } from "zustand";

export interface APIToken {
	id: string;
	name: string;
	token: string;
	permissions: string[];
	createdAt: string;
	lastUsed?: string;
	expiresAt?: string;
	isActive: boolean;
}

interface TokenState {
	tokens: APIToken[];
	isLoading: boolean;
	error: string | null;
	isCreateModalOpen: boolean;
	newToken: string | null; // For showing newly created token
}

interface TokenActions {
	fetchTokens: () => Promise<void>;
	createToken: (name: string, permissions: string[]) => Promise<void>;
	deleteToken: (id: string) => Promise<void>;
	toggleTokenStatus: (id: string) => Promise<void>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	openCreateModal: () => void;
	closeCreateModal: () => void;
	clearNewToken: () => void;
	clearError: () => void;
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
			const response = await fetch("/api/tokens");
			if (!response.ok) {
				throw new Error("Failed to fetch API tokens");
			}

			const data = await response.json();
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
			const response = await fetch("/api/tokens", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, permissions }),
			});

			if (!response.ok) {
				throw new Error("Failed to create API token");
			}

			const data = await response.json();
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
			const response = await fetch(`/api/tokens?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete API token");
			}

			const data = await response.json();
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
			const response = await fetch("/api/tokens/toggle", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to toggle token status");
			}

			const data = await response.json();
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
