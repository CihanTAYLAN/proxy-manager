/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Caddy REST API client utility functions
 * Handles communication with Caddy server API for proxy management
 */

import { ProxyConfig, ProxyFormData } from "@/context/proxy-store";

const CADDY_API_BASE_URL = process.env.CADDY_API_URL || "http://127.0.0.1:2019";

export interface CaddyConfig {
	apps: {
		http: {
			servers: {
				[key: string]: {
					listen: string[];
					routes: CaddyRoute[];
					tls?: CaddyTLS;
				};
			};
		};
		tls?: {
			certificates: Record<string, unknown>;
			automation: {
				policies: Array<Record<string, unknown>>;
			};
		};
	};
}

export interface CaddyRoute {
	match: Array<{
		host?: string[];
		path?: string[];
	}>;
	handle: Array<{
		handler: string;
		upstreams?: Array<{
			dial: string;
		}>;
		[key: string]: any;
	}>;
	[key: string]: any;
}

export interface CaddyTLS {
	certificates: Record<string, unknown>;
	automation: {
		policies: Array<Record<string, unknown>>;
	};
}

/**
 * Fetches current Caddy configuration
 * @returns Promise with current Caddy config
 */
export async function getCaddyConfig(): Promise<CaddyConfig> {
	try {
		const response = await fetch(`${CADDY_API_BASE_URL}/config/`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Caddy config: ${response.statusText}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Error fetching Caddy config: ${error}`);
	}
}

/**
 * Updates Caddy configuration
 * @param config - New configuration object
 * @returns Promise with success status
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
			throw new Error(`Failed to update Caddy config: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		throw new Error(`Error updating Caddy config: ${error}`);
	}
}

/**
 * Converts Caddy routes to ProxyConfig format
 * @param config - Caddy configuration
 * @returns Array of ProxyConfig objects
 */
export function parseProxiesFromCaddyConfig(config: CaddyConfig): ProxyConfig[] {
	const proxies: ProxyConfig[] = [];

	// Handle case where config might be empty or malformed
	if (!config?.apps?.http?.servers) {
		console.warn("No HTTP servers found in Caddy config");
		return [];
	}

	Object.entries(config.apps.http.servers).forEach(([serverKey, server]) => {
		if (!server?.routes) {
			return;
		}

		server.routes.forEach((route, index) => {
			console.log(route);

			// Check if this is a reverse proxy route
			const reverseProxyHandler = route.handle?.find((h) => h.handler === "reverse_proxy");
			if (!reverseProxyHandler || !reverseProxyHandler.upstreams || !reverseProxyHandler.upstreams.length) {
				return;
			}

			// Extract domain from match conditions
			const hostMatch = route.match?.find((m) => m.host && m.host.length > 0);
			if (!hostMatch || !hostMatch.host || !hostMatch.host.length) {
				return;
			}

			const domain = hostMatch.host[0];
			const targetDial = reverseProxyHandler.upstreams[0].dial;

			// Parse target URL and port
			let target = targetDial;
			let port: number | undefined;

			// Extract port from dial string (e.g., "localhost:3000" -> target: "localhost", port: 3000)
			if (targetDial && !targetDial.startsWith("http")) {
				const [host, portStr] = targetDial.split(":");
				target = host;
				if (portStr) {
					port = parseInt(portStr, 10);
				}
			} else if (targetDial && targetDial.startsWith("http")) {
				try {
					const url = new URL(targetDial);
					target = url.hostname;
					if (url.port) {
						port = parseInt(url.port, 10);
					}
				} catch (error) {
					console.warn(`Failed to parse URL: ${targetDial}`, error);
					target = targetDial;
				}
			}

			// Extract path from match conditions
			const pathMatch = route.match?.find((m) => m.path && m.path.length > 0);
			const path = pathMatch?.path?.[0];

			// Determine if TLS is enabled
			const tls = server.listen.some((listenAddr) => listenAddr.includes("443") || listenAddr.includes("tls"));

			// Generate unique ID based on domain and server
			const id = `${serverKey}_${index}_${domain.replace(/[^a-zA-Z0-9]/g, "_")}`;

			proxies.push({
				id,
				domain,
				target,
				port,
				path,
				headers: {}, // TODO: Extract headers from route configuration if present
				tls,
				status: "active", // TODO: Implement actual status checking
			});
		});
	});

	return proxies;
}

/**
 * Gets all proxy configurations from Caddy
 * @returns Promise with array of ProxyConfig objects
 */
export async function getProxies(): Promise<ProxyConfig[]> {
	try {
		const config = await getCaddyConfig();
		return parseProxiesFromCaddyConfig(config);
	} catch (error) {
		console.error("Error fetching proxies:", error);
		throw new Error(`Error fetching proxies: ${error}`);
	}
}

/**
 * Adds a new proxy route to Caddy configuration
 * @param proxyData - Proxy configuration data
 * @returns Promise with created proxy config
 */
export async function createProxy(proxyData: ProxyFormData): Promise<ProxyConfig> {
	try {
		const config = await getCaddyConfig();

		// Prepare target with port
		let targetDial = proxyData.target;
		if (proxyData.port) {
			targetDial = `${proxyData.target}:${proxyData.port}`;
		}

		const newRoute: CaddyRoute = {
			match: [
				{
					host: [proxyData.domain],
					...(proxyData.path && { path: [proxyData.path] }),
				},
			],
			handle: [
				{
					handler: "reverse_proxy",
					upstreams: [{ dial: targetDial }],
					...(proxyData.headers &&
						Object.keys(proxyData.headers).length > 0 && {
							headers: {
								request: {
									set: proxyData.headers,
								},
							},
						}),
				},
			],
		};

		// Add route to first server or create new server
		const serverKey = Object.keys(config.apps.http.servers)[0] || "proxy";
		if (!config.apps.http.servers[serverKey]) {
			const listenPorts = proxyData.tls ? [":80", ":443"] : [":80"];
			config.apps.http.servers[serverKey] = {
				listen: listenPorts,
				routes: [],
			};
		}

		config.apps.http.servers[serverKey].routes.push(newRoute);

		// Update Caddy configuration
		await updateCaddyConfig(config);

		// Return the created proxy configuration
		const updatedConfig = await getCaddyConfig();
		const proxies = parseProxiesFromCaddyConfig(updatedConfig);
		const createdProxy = proxies.find((p) => p.domain === proxyData.domain);

		if (!createdProxy) {
			throw new Error("Failed to create proxy configuration");
		}

		return createdProxy;
	} catch (error) {
		console.error("Error creating proxy:", error);
		throw new Error(`Error creating proxy: ${error}`);
	}
}

/**
 * Updates an existing proxy configuration
 * @param proxyId - ID of the proxy to update
 * @param proxyData - Updated proxy data
 * @returns Promise with updated proxy config
 */
export async function updateProxy(proxyId: string, proxyData: Partial<ProxyFormData>): Promise<ProxyConfig> {
	try {
		// First remove the existing proxy
		await removeProxy(proxyId);

		// Then create a new one with updated data
		if (!proxyData.domain || !proxyData.target) {
			throw new Error("Domain and target are required for proxy update");
		}

		const fullProxyData: ProxyFormData = {
			domain: proxyData.domain,
			target: proxyData.target,
			port: proxyData.port,
			path: proxyData.path,
			headers: proxyData.headers || {},
			tls: proxyData.tls || false,
		};

		return await createProxy(fullProxyData);
	} catch (error) {
		console.error("Error updating proxy:", error);
		throw new Error(`Error updating proxy: ${error}`);
	}
}

/**
 * Removes a proxy configuration from Caddy
 * @param proxyId - ID of the proxy to remove
 * @returns Promise with success status
 */
export async function removeProxy(proxyId: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();

		// Find and remove the route by ID
		let routeFound = false;
		Object.entries(config.apps.http.servers).forEach(([serverKey, server]) => {
			if (server.routes) {
				server.routes = server.routes.filter((route, index) => {
					const routeId = `${serverKey}_${index}_${route.match?.[0]?.host?.[0]?.replace(/[^a-zA-Z0-9]/g, "_")}`;
					if (routeId === proxyId) {
						routeFound = true;
						return false;
					}
					return true;
				});
			}
		});

		if (!routeFound) {
			throw new Error(`Proxy with ID ${proxyId} not found`);
		}

		await updateCaddyConfig(config);
		return true;
	} catch (error) {
		console.error("Error removing proxy:", error);
		throw new Error(`Error removing proxy: ${error}`);
	}
}

// Legacy functions for backward compatibility
export async function removeProxyRoute(domain: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();
		const proxies = parseProxiesFromCaddyConfig(config);
		const proxy = proxies.find((p) => p.domain === domain);

		if (!proxy) {
			throw new Error(`Proxy for domain ${domain} not found`);
		}

		return await removeProxy(proxy.id);
	} catch (error) {
		console.error("Error removing proxy route:", error);
		throw new Error(`Error removing proxy route: ${error}`);
	}
}

export async function addProxyRoute(domain: string, target: string): Promise<boolean> {
	try {
		await createProxy({ domain, target, tls: false });
		return true;
	} catch (error) {
		console.error("Error adding proxy route:", error);
		throw new Error(`Error adding proxy route: ${error}`);
	}
}
