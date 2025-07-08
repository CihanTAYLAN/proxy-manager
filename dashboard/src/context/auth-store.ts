import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	id: string;
	email: string;
	role: "admin" | "editor";
	name?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	setUser: (user: User) => void;
	setToken: (token: string) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
}

/**
 * Authentication store using Zustand with persistence
 * Manages user authentication state, login, logout functionality
 */
export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			// State
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Actions
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });

				try {
					const response = await fetch("/api/auth/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
					});

					if (!response.ok) {
						throw new Error("Login failed");
					}

					const data = await response.json();

					if (data.success) {
						set({
							user: data.data.user,
							token: data.data.token,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
					} else {
						throw new Error(data.error || "Login failed");
					}
				} catch (error) {
					set({
						error: error instanceof Error ? error.message : "Login failed",
						isLoading: false,
					});
					throw error;
				}
			},

			logout: async () => {
				set({ isLoading: true });

				try {
					await fetch("/api/auth/logout", {
						method: "POST",
					});
				} catch (error) {
					console.error("Logout error:", error);
				} finally {
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			},

			setUser: (user: User) => set({ user, isAuthenticated: true }),
			setToken: (token: string) => set({ token }),
			setLoading: (isLoading: boolean) => set({ isLoading }),
			setError: (error: string | null) => set({ error }),
			clearError: () => set({ error: null }),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
