import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api-client";

export interface User {
	id: string;
	email: string;
	username: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	needsSetup: boolean;
	setupChecked: boolean;
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	verifyToken: () => Promise<void>;
	checkSetup: () => Promise<void>;
	setup: (email: string, username: string, password: string) => Promise<void>;
	setUser: (user: User) => void;
	setToken: (token: string) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
}

/**
 * Authentication store using Zustand with persistence
 * Manages user authentication state, login, logout functionality, and initial setup
 */
export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set, get) => ({
			// State
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			needsSetup: false,
			setupChecked: false,

			// Actions
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });

				try {
					const data = await apiClient.post("/api/auth/login", { email, password }, { skipAuth: true });

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
					const { token } = get();
					if (token) {
						await apiClient.post("/api/auth/logout");
					}
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

			verifyToken: async () => {
				const { token } = get();

				if (!token) {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
					return;
				}

				set({ isLoading: true, error: null });

				try {
					const data = await apiClient.get("/api/auth/verify");

					if (data.success) {
						set({
							user: data.data.user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
					} else {
						throw new Error(data.error || "Token verification failed");
					}
				} catch (error) {
					console.error("Token verification error:", error);
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			},

			checkSetup: async () => {
				set({ isLoading: true, error: null });

				try {
					const data = await apiClient.get("/api/auth/setup/check", { skipAuth: true });

					if (data.success) {
						set({
							needsSetup: !data.data.hasUsers,
							setupChecked: true,
							isLoading: false,
						});
					} else {
						throw new Error(data.error || "Setup check failed");
					}
				} catch (error) {
					console.error("Setup check error:", error);
					set({
						error: error instanceof Error ? error.message : "Setup check failed",
						isLoading: false,
						setupChecked: true,
						needsSetup: false, // Default to false on error
					});
				}
			},

			setup: async (email: string, username: string, password: string) => {
				console.log("Auth store setup called with:", { email, username, password: "***" });
				set({ isLoading: true, error: null });

				try {
					console.log("Making API call to /api/auth/setup");
					const data = await apiClient.post("/api/auth/setup", { email, username, password }, { skipAuth: true });

					console.log("API response data:", data);

					if (data.success) {
						console.log("Setup successful, updating auth state");
						set({
							user: data.data.user,
							token: data.data.token,
							isAuthenticated: true,
							needsSetup: false,
							setupChecked: true,
							isLoading: false,
							error: null,
						});
					} else {
						throw new Error(data.error || "Setup failed");
					}
				} catch (error) {
					console.error("Setup error in auth store:", error);
					set({
						error: error instanceof Error ? error.message : "Setup failed",
						isLoading: false,
					});
					throw error;
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

// Register auth store with API client for 401 handling
apiClient.setAuthStore(useAuthStore);
