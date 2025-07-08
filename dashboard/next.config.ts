import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable standalone output for Docker
	output: "standalone",

	// Optimize for production
	experimental: {
		// Enable experimental features as needed
	},

	// SWC minification is enabled by default in Next.js 15

	// Compress images
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},

	// Security headers
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default nextConfig;
