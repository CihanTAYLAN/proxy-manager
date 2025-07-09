/**
 * Global API client with authentication and error handling
 * Provides centralized request/response intercepting for SPA behavior
 */

interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	details?: any[];
}

interface RequestOptions extends RequestInit {
	skipAuth?: boolean;
}

class ApiClient {
	private baseURL: string;
	private authStore: any = null;

	constructor(baseURL: string = "") {
		this.baseURL = baseURL;
	}

	/**
	 * Set the auth store reference for 401 handling
	 */
	setAuthStore(store: any) {
		this.authStore = store;
	}

	/**
	 * Get auth token from store
	 */
	private getAuthToken(): string | null {
		if (!this.authStore) return null;
		return this.authStore.getState?.()?.token || null;
	}

	/**
	 * Handle 401 responses globally
	 */
	private handleUnauthorized() {
		console.warn("API: Received 401 - logging out user");

		if (this.authStore?.getState) {
			const { logout } = this.authStore.getState();
			if (logout) {
				// Don't await logout to avoid blocking
				logout().catch(console.error);
			}
		}
	}

	/**
	 * Make authenticated API request
	 */
	async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
		const { skipAuth = false, ...fetchOptions } = options;

		// Prepare headers
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(fetchOptions.headers as Record<string, string>),
		};

		// Add authentication header if not skipped
		if (!skipAuth) {
			const token = this.getAuthToken();
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}

		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, {
				...fetchOptions,
				headers,
			});

			// Handle 401 responses globally
			if (response.status === 401) {
				this.handleUnauthorized();
				throw new Error("Authentication required");
			}

			// Parse response
			let data: ApiResponse<T>;
			try {
				data = await response.json();
			} catch (parseError) {
				console.error("Failed to parse response JSON:", parseError);
				throw new Error(`Request failed: ${response.status} ${response.statusText}`);
			}

			// Handle non-OK responses
			if (!response.ok) {
				// Handle validation errors
				if (data.details && Array.isArray(data.details)) {
					const validationMessages = data.details.map((detail: any) => detail.message).join(", ");
					throw new Error(validationMessages);
				}
				throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
			}

			return data;
		} catch (error) {
			// Re-throw errors for store handling
			throw error;
		}
	}

	/**
	 * GET request
	 */
	async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "GET" });
	}

	/**
	 * POST request
	 */
	async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * PUT request
	 */
	async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * DELETE request
	 */
	async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { ...options, method: "DELETE" });
	}
}

// Global API client instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, RequestOptions };
