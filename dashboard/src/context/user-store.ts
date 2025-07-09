import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export interface User {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	lastLogin: string | null;
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
	password?: string;
	isActive?: boolean;
}

interface UserStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;

	// Actions
	initialize: () => void;
	fetchUsers: () => Promise<void>;
	createUser: (userData: CreateUserData) => Promise<User>;
	updateUser: (id: string, userData: UpdateUserData) => Promise<User>;
	deleteUser: (id: string) => Promise<void>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
}

/**
 * User management store using Zustand
 * Handles user CRUD operations for admin dashboard
 */
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
			set({ isLoading: true, error: null });

			const data = await apiClient.get("/api/users");

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

			const data = await apiClient.post("/api/users", userData);

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

			const data = await apiClient.put(`/api/users/${id}`, userData);

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

			await apiClient.delete(`/api/users/${id}`);

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

	setLoading: (isLoading: boolean) => set({ isLoading }),
	setError: (error: string | null) => set({ error }),
	clearError: () => set({ error: null }),
}));
