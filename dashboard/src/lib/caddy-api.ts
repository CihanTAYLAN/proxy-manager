/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Caddy REST API client utility functions
 * Simplified JSON config approach for proxy management
 */

import { ProxyConfig, ProxyFormData } from "@/context/proxy-store";

const CADDY_API_BASE_URL = process.env.CADDY_API_URL || "http://127.0.0.1:2019";

// Dashboard domain from environment (protected domain)
const DASHBOARD_DOMAIN = process.env.HOST || "localhost";

export interface CaddyRoute {
	match: Array<{
		host: string[];
		path?: string[];
	}>;
	handle: Array<{
		handler: string;
		upstreams?: Array<{
			dial: string;
		}>;
		headers?: {
			request?: {
				set?: Record<string, string[]>;
			};
		};
	}>;
	terminal?: boolean;
}

export interface CaddyServer {
	listen: string[];
	routes: CaddyRoute[];
	logs?: {
		default_logger_name?: string;
	};
}

export interface CaddyConfig {
	apps: {
		http: {
			servers: {
				[key: string]: CaddyServer;
			};
		};
	};
	admin?: {
		listen: string;
	};
	logging?: any;
}

/**
 * Fetches current Caddy configuration
 */
export async function getCaddyConfig(): Promise<CaddyConfig> {
	try {
		const response = await fetch(`${CADDY_API_BASE_URL}/config/`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Caddy config: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		throw new Error(`Error fetching Caddy config: ${error}`);
	}
}

/**
 * Updates Caddy configuration
 */
export async function updateCaddyConfig(config: CaddyConfig): Promise<boolean> {
	try {
		const response = await fetch(`${CADDY_API_BASE_URL}/config/`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(config),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to update Caddy config: ${response.statusText} - ${errorText}`);
		}
		return true;
	} catch (error) {
		throw new Error(`Error updating Caddy config: ${error}`);
	}
}

/**
 * Adds a route to the main_server for dynamic proxies
 */
export async function addProxyRoute(domain: string, target: string, path?: string, headers?: Record<string, string>): Promise<boolean> {
	try {
		const config = await getCaddyConfig();

		// Ensure main_server exists
		if (!config.apps.http.servers.main_server) {
			config.apps.http.servers.main_server = {
				listen: [":80"],
				routes: [],
			};
		}

		// Create new route
		const newRoute: CaddyRoute = {
			match: [
				{
					host: [domain],
					...(path && { path: [path] }),
				},
			],
			handle: [
				{
					handler: "reverse_proxy",
					upstreams: [
						{
							dial: target,
						},
					],
					...(headers && {
						headers: {
							request: {
								set: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, [value]])),
							},
						},
					}),
				},
			],
			terminal: true,
		};

		// Add route to the beginning (higher priority than catch-all)
		config.apps.http.servers.main_server.routes.unshift(newRoute);

		return await updateCaddyConfig(config);
	} catch (error) {
		throw new Error(`Error adding proxy route: ${error}`);
	}
}

/**
 * Removes a route from the main_server
 */
export async function removeProxyRoute(domain: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();

		if (!config.apps.http.servers.main_server) {
			return true; // No main server, nothing to remove
		}

		// Filter out routes matching the domain
		config.apps.http.servers.main_server.routes = config.apps.http.servers.main_server.routes.filter((route) => !route.match.some((match) => match.host?.includes(domain)));

		return await updateCaddyConfig(config);
	} catch (error) {
		throw new Error(`Error removing proxy route: ${error}`);
	}
}

/**
 * Updates a proxy route
 */
export async function updateProxyRoute(domain: string, target: string, path?: string, headers?: Record<string, string>): Promise<boolean> {
	try {
		// Remove existing route and add new one
		await removeProxyRoute(domain);
		return await addProxyRoute(domain, target, path, headers);
	} catch (error) {
		throw new Error(`Error updating proxy route: ${error}`);
	}
}

/**
 * Parses proxy configurations from Caddy config
 */
export function parseProxiesFromCaddyConfig(config: CaddyConfig): ProxyConfig[] {
	const proxies: ProxyConfig[] = [];

	if (!config?.apps?.http?.servers?.main_server?.routes) {
		return [];
	}

	config.apps.http.servers.main_server.routes.forEach((route, index) => {
		// Skip non-reverse-proxy routes
		const proxyHandler = route.handle.find((h) => h.handler === "reverse_proxy");
		if (!proxyHandler || !proxyHandler.upstreams?.[0]) {
			return;
		}

		const match = route.match[0];
		if (!match.host?.[0]) {
			return;
		}

		const domain = match.host[0];

		// Skip dashboard domain (this is not a proxy, it's the dashboard itself)
		if (domain === DASHBOARD_DOMAIN) {
			return;
		}
		const target = proxyHandler.upstreams[0].dial;
		const path = match.path?.[0];

		// Extract headers
		const headers: Record<string, string> = {};
		if (proxyHandler.headers?.request?.set) {
			Object.entries(proxyHandler.headers.request.set).forEach(([key, values]) => {
				if (Array.isArray(values) && values.length > 0) {
					headers[key] = values[0];
				}
			});
		}

		// Parse target to extract port
		const [targetHost, targetPort] = target.includes(":") ? target.split(":") : [target, "80"];

		proxies.push({
			id: `proxy_${index}`,
			domain,
			target: targetHost,
			port: parseInt(targetPort) || 80,
			path,
			tls: true, // Assume HTTPS for all proxies
			headers: Object.keys(headers).length > 0 ? headers : undefined,
			status: "active",
		});
	});

	return proxies;
}

/**
 * Gets all proxy configurations
 */
export async function getProxies(): Promise<ProxyConfig[]> {
	try {
		const config = await getCaddyConfig();
		return parseProxiesFromCaddyConfig(config);
	} catch (error) {
		throw new Error(`Error fetching proxies: ${error}`);
	}
}

/**
 * Validates domain name (prevents dashboard domain override)
 */
function validateDomain(domain: string): boolean {
	if (domain === DASHBOARD_DOMAIN) {
		throw new Error(`Cannot create proxy for dashboard domain: ${DASHBOARD_DOMAIN}`);
	}

	const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
	return domainRegex.test(domain);
}

/**
 * Creates a new proxy configuration
 */
export async function createProxy(proxyData: ProxyFormData): Promise<ProxyConfig> {
	try {
		if (!validateDomain(proxyData.domain)) {
			throw new Error("Invalid domain format");
		}

		const target = proxyData.port ? `${proxyData.target}:${proxyData.port}` : proxyData.target;

		await addProxyRoute(proxyData.domain, target, proxyData.path, proxyData.headers);

		return {
			id: `proxy_${Date.now()}`,
			domain: proxyData.domain,
			target: proxyData.target,
			port: proxyData.port,
			path: proxyData.path,
			tls: proxyData.tls,
			headers: proxyData.headers,
			status: "active",
		};
	} catch (error) {
		throw new Error(`Error creating proxy: ${error}`);
	}
}

/**
 * Updates an existing proxy configuration
 */
export async function updateProxy(proxyId: string, proxyData: Partial<ProxyFormData>): Promise<ProxyConfig> {
	try {
		if (proxyData.domain && !validateDomain(proxyData.domain)) {
			throw new Error("Invalid domain format");
		}

		// Get current proxies to find the one being updated
		const currentProxies = await getProxies();
		const currentProxy = currentProxies.find((p) => p.id === proxyId);

		if (!currentProxy) {
			throw new Error("Proxy not found");
		}

		// Merge current data with updates
		const updatedData = { ...currentProxy, ...proxyData };

		const target = updatedData.port ? `${updatedData.target}:${updatedData.port}` : updatedData.target;

		// If domain changed, remove old route first
		if (proxyData.domain && proxyData.domain !== currentProxy.domain) {
			await removeProxyRoute(currentProxy.domain);
		}

		await updateProxyRoute(updatedData.domain, target, updatedData.path, updatedData.headers);

		return {
			id: proxyId,
			domain: updatedData.domain,
			target: updatedData.target,
			port: updatedData.port,
			path: updatedData.path,
			tls: updatedData.tls,
			headers: updatedData.headers,
			status: "active",
		};
	} catch (error) {
		throw new Error(`Error updating proxy: ${error}`);
	}
}

/**
 * Removes a proxy configuration
 */
export async function removeProxy(proxyId: string): Promise<boolean> {
	try {
		// Get current proxies to find the domain
		const currentProxies = await getProxies();
		const proxy = currentProxies.find((p) => p.id === proxyId);

		if (!proxy) {
			throw new Error("Proxy not found");
		}

		return await removeProxyRoute(proxy.domain);
	} catch (error) {
		throw new Error(`Error removing proxy: ${error}`);
	}
}
