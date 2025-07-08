import { QueryClient } from "@tanstack/react-query";

/**
 * Tanstack Query client configuration for API data fetching
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			retry: 3,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});

export const queryKeys = {
	proxies: ["proxies"] as const,
	ssl: ["ssl"] as const,
	tokens: ["tokens"] as const,
	users: ["users"] as const,
	auth: ["auth"] as const,
} as const;
