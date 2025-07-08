/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Caddy REST API client utility functions
 * Handles communication with Caddy server API for proxy management
 */

const CADDY_API_BASE_URL = process.env.CADDY_API_URL || "http://localhost:2019";

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
 * Adds a new proxy route to Caddy configuration
 * @param domain - Target domain for the proxy
 * @param target - Backend target URL
 * @returns Promise with success status
 */
export async function addProxyRoute(domain: string, target: string): Promise<boolean> {
	try {
		const config = await getCaddyConfig();

		const newRoute: CaddyRoute = {
			match: [{ host: [domain] }],
			handle: [
				{
					handler: "reverse_proxy",
					upstreams: [{ dial: target }],
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

		return await updateCaddyConfig(config);
	} catch (error) {
		throw new Error(`Error adding proxy route: ${error}`);
	}
}

/**
 * Removes a proxy route from Caddy configuration
 * @param domain - Domain to remove from proxy configuration
 * @returns Promise with success status
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
