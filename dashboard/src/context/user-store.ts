import { create } from "zustand";
import { useAuthStore } from "./auth-store";

export interface User {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	lastLogin?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserData {
	email: string;
	username: string;
	password: string;
}

export interface UpdateUserData {
	email?: string;
	username?: string;
	isActive?: boolean;
	password?: string;
}

interface UserStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;

	// Actions
	fetchUsers: () => Promise<void>;
	createUser: (userData: CreateUserData) => Promise<User>;
	updateUser: (id: string, userData: UpdateUserData) => Promise<User>;
	deleteUser: (id: string) => Promise<void>;
	toggleUserStatus: (id: string) => Promise<User>;
	clearError: () => void;
	initialize: () => void;
}

/**
 * Make authenticated API request using auth store
 */
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const { token, isAuthenticated } = useAuthStore.getState();

	if (!isAuthenticated || !token) {
		throw new Error("No authentication token found");
	}

	const response = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: "Request failed" }));
		throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const useUserStore = create<UserStore>((set, _get) => ({
	users: [],
	isLoading: false,
	error: null,
	isInitialized: false,

	/**
	 * Initialize the store - should be called after auth is confirmed
	 */
	initialize: () => {
		set({ isInitialized: true });
	},

	/**
	 * Fetch all users from the API
	 */
	fetchUsers: async () => {
		try {
			const { isAuthenticated } = useAuthStore.getState();

			if (!isAuthenticated) {
				set({ error: "Authentication required", isLoading: false });
				return;
			}

			set({ isLoading: true, error: null });

			const data = await makeAuthenticatedRequest("/api/users");

			set({ users: data.data, isLoading: false });
		} catch (error) {
			console.error("Error fetching users:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to fetch users",
				isLoading: false,
			});
		}
	},

	/**
	 * Create a new user
	 */
	createUser: async (userData: CreateUserData): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const data = await makeAuthenticatedRequest("/api/users", {
				method: "POST",
				body: JSON.stringify(userData),
			});

			const newUser = data.data;
			set((state) => ({
				users: [newUser, ...state.users],
				isLoading: false,
			}));

			return newUser;
		} catch (error) {
			console.error("Error creating user:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to create user";
			set({ error: errorMessage, isLoading: false });
			throw new Error(errorMessage);
		}
	},

	/**
	 * Update an existing user
	 */
	updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const data = await makeAuthenticatedRequest(`/api/users/${id}`, {
				method: "PUT",
				body: JSON.stringify(userData),
			});

			const updatedUser = data.data;
			set((state) => ({
				users: state.users.map((user) => (user.id === id ? updatedUser : user)),
				isLoading: false,
			}));

			return updatedUser;
		} catch (error) {
			console.error("Error updating user:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to update user";
			set({ error: errorMessage, isLoading: false });
			throw new Error(errorMessage);
		}
	},

	/**
	 * Delete a user
	 */
	deleteUser: async (id: string): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			await makeAuthenticatedRequest(`/api/users/${id}`, {
				method: "DELETE",
			});

			set((state) => ({
				users: state.users.filter((user) => user.id !== id),
				isLoading: false,
			}));
		} catch (error) {
			console.error("Error deleting user:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
			set({ error: errorMessage, isLoading: false });
			throw new Error(errorMessage);
		}
	},

	/**
	 * Toggle user active status
	 */
	toggleUserStatus: async (id: string): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const data = await makeAuthenticatedRequest(`/api/users/${id}`, {
				method: "PATCH",
			});

			const updatedUser = data.data;
			set((state) => ({
				users: state.users.map((user) => (user.id === id ? updatedUser : user)),
				isLoading: false,
			}));

			return updatedUser;
		} catch (error) {
			console.error("Error toggling user status:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to update user status";
			set({ error: errorMessage, isLoading: false });
			throw new Error(errorMessage);
		}
	},

	/**
	 * Clear any error state
	 */
	clearError: () => {
		set({ error: null });
	},
}));
