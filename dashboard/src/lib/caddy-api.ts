/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Caddy REST API client utility functions
 * Handles communication with Caddy server API for proxy management
 */

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
	}>;
}

export interface CaddyTLS {
	certificates: Record<string, unknown>;
	automation: {
		policies: Array<Record<string, unknown>>;
	};
}

/**
 * Standardized proxy configuration interface
 */
export interface ProxyConfig {
	id: string;
	domain: string;
	target: string;
	sslEnabled: boolean;
	sslStatus: "valid" | "invalid" | "expired" | "pending";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
}

/**
 * Proxy creation/update data interface
 */
export interface ProxyFormData {
	domain: string;
	target: string;
	sslEnabled?: boolean;
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
		return await response.json();
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

	Object.entries(config.apps.http.servers).forEach(([serverKey, server]) => {
		server.routes.forEach((route, index) => {
			// Check if this is a reverse proxy route
			const reverseProxyHandler = route.handle?.find((h) => h.handler === "reverse_proxy");
			if (!reverseProxyHandler || !reverseProxyHandler.upstreams) return;

			// Extract domain from match conditions
			const hostMatch = route.match?.find((m) => m.host && m.host.length > 0);
			if (!hostMatch || !hostMatch.host) return;

			const domain = hostMatch.host[0];
			const target = reverseProxyHandler.upstreams[0].dial;

			// Generate unique ID based on domain and server
			const id = `${serverKey}_${index}_${domain.replace(/[^a-zA-Z0-9]/g, "_")}`;

			proxies.push({
				id,
				domain,
				target: target.startsWith("http") ? target : `http://${target}`,
				sslEnabled: server.listen.some((port) => port.includes("443")),
				sslStatus: "valid", // TODO: Implement SSL status checking
				status: "active", // TODO: Implement status checking
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
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

		// Clean target URL
		const cleanTarget = proxyData.target.replace(/^https?:\/\//, "");

		const newRoute: CaddyRoute = {
			match: [{ host: [proxyData.domain] }],
			handle: [
				{
					handler: "reverse_proxy",
					upstreams: [{ dial: cleanTarget }],
				},
			],
		};

		// Add route to first server or create new server
		const serverKey = Object.keys(config.apps.http.servers)[0] || "proxy";
		if (!config.apps.http.servers[serverKey]) {
			config.apps.http.servers[serverKey] = {
				listen: [":80", ":443"],
				routes: [],
			};
		}

		config.apps.http.servers[serverKey].routes.push(newRoute);

		await updateCaddyConfig(config);

		// Return the created proxy config
		const id = `${serverKey}_${config.apps.http.servers[serverKey].routes.length - 1}_${proxyData.domain.replace(/[^a-zA-Z0-9]/g, "_")}`;
		return {
			id,
			domain: proxyData.domain,
			target: proxyData.target.startsWith("http") ? proxyData.target : `http://${proxyData.target}`,
			sslEnabled: proxyData.sslEnabled ?? true,
			sslStatus: "pending",
			status: "active",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	} catch (error) {
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
		// For updates, we need to remove the old route and add a new one
		// First get current config
		const config = await getCaddyConfig();
		const currentProxies = parseProxiesFromCaddyConfig(config);
		const currentProxy = currentProxies.find((p) => p.id === proxyId);

		if (!currentProxy) {
			throw new Error(`Proxy with ID ${proxyId} not found`);
		}

		// Remove old route
		await removeProxy(proxyId);

		// Create new route with updated data
		const updatedData: ProxyFormData = {
			domain: proxyData.domain ?? currentProxy.domain,
			target: proxyData.target ?? currentProxy.target,
			sslEnabled: proxyData.sslEnabled ?? currentProxy.sslEnabled,
		};

		return await createProxy(updatedData);
	} catch (error) {
		throw new Error(`Error updating proxy: ${error}`);
	}
}

/**
 * Removes a proxy route from Caddy configuration
 * @param proxyId - ID of proxy to remove
 * @returns Promise with success status
 */
export async function removeProxy(proxyId: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();
		const currentProxies = parseProxiesFromCaddyConfig(config);
		const targetProxy = currentProxies.find((p) => p.id === proxyId);

		if (!targetProxy) {
			throw new Error(`Proxy with ID ${proxyId} not found`);
		}

		// Remove routes matching the domain
		Object.keys(config.apps.http.servers).forEach((serverKey) => {
			const server = config.apps.http.servers[serverKey];
			server.routes = server.routes.filter((route) => {
				return !route.match.some((match) => match.host && match.host.includes(targetProxy.domain));
			});
		});

		await updateCaddyConfig(config);
		return true;
	} catch (error) {
		throw new Error(`Error removing proxy: ${error}`);
	}
}

/**
 * Legacy function - kept for backwards compatibility
 * @deprecated Use removeProxy instead
 */
export async function removeProxyRoute(domain: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();

		Object.keys(config.apps.http.servers).forEach((serverKey) => {
			const server = config.apps.http.servers[serverKey];
			server.routes = server.routes.filter((route) => {
				return !route.match.some((match) => match.host && match.host.includes(domain));
			});
		});

		return await updateCaddyConfig(config);
	} catch (error) {
		throw new Error(`Error removing proxy route: ${error}`);
	}
}

/**
 * Legacy function - kept for backwards compatibility
 * @deprecated Use createProxy instead
 */
export async function addProxyRoute(domain: string, target: string): Promise<boolean> {
	try {
		await createProxy({ domain, target });
		return true;
	} catch (error) {
		throw new Error(`Error adding proxy route: ${error}`);
	}
}
