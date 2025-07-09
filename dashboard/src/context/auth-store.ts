import { create } from "zustand";
import { persist } from "zustand/middleware";

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
					const response = await fetch("/api/auth/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
					});

					// Always try to parse JSON response, even for errors
					let data;
					try {
						data = await response.json();
					} catch (parseError) {
						console.error("Failed to parse response JSON:", parseError);
						throw new Error(`Login failed: ${response.status} ${response.statusText}`);
					}

					if (!response.ok) {
						// Handle validation errors specifically
						if (data.details && Array.isArray(data.details)) {
							const validationMessages = data.details.map((detail: any) => detail.message).join(", ");
							throw new Error(validationMessages);
						}
						throw new Error(data.error || `Login failed: ${response.status} ${response.statusText}`);
					}

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
						await fetch("/api/auth/logout", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});
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
					const response = await fetch("/api/auth/verify", {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						throw new Error("Token verification failed");
					}

					const data = await response.json();

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
					const response = await fetch("/api/auth/setup/check");

					if (!response.ok) {
						throw new Error("Failed to check setup status");
					}

					const data = await response.json();

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
					const response = await fetch("/api/auth/setup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, username, password }),
					});

					console.log("API response status:", response.status);

					// Always try to parse JSON response, even for errors
					let data;
					try {
						data = await response.json();
						console.log("API response data:", data);
					} catch (parseError) {
						console.error("Failed to parse response JSON:", parseError);
						throw new Error(`Setup failed: ${response.status} ${response.statusText}`);
					}

					if (!response.ok) {
						// Handle validation errors specifically
						if (data.details && Array.isArray(data.details)) {
							const validationMessages = data.details.map((detail: any) => detail.message).join(", ");
							throw new Error(validationMessages);
						}
						throw new Error(data.error || `Setup failed: ${response.status} ${response.statusText}`);
					}

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
