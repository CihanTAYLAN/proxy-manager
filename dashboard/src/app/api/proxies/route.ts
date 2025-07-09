/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getProxies, createProxy, updateProxy, removeProxy, type ProxyFormData } from "@/lib/caddy-api";
import { verifyAuth } from "@/lib/auth";

/**
 * Retrieves all proxy configurations from Caddy server
 */
export async function GET(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const proxies = await getProxies();

		return NextResponse.json({
			success: true,
			data: proxies,
			message: "Proxy configurations retrieved successfully",
		});
	} catch (error) {
		console.error("Error fetching proxies:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to retrieve proxy configurations",
			},
			{ status: 500 }
		);
	}
}

/**
 * Creates a new proxy configuration
 */
export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Validate required fields
		if (!body.domain || !body.target) {
			return NextResponse.json(
				{
					success: false,
					error: "Domain and target are required",
				},
				{ status: 400 }
			);
		}

		// Validate domain format
		const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!domainRegex.test(body.domain)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid domain format",
				},
				{ status: 400 }
			);
		}

		// Validate target format
		if (!body.target.includes(":")) {
			return NextResponse.json(
				{
					success: false,
					error: "Target must include port (e.g., localhost:3000)",
				},
				{ status: 400 }
			);
		}

		const proxyData: ProxyFormData = {
			domain: body.domain.trim().toLowerCase(),
			target: body.target.trim(),
			sslEnabled: body.sslEnabled ?? true,
		};

		const createdProxy = await createProxy(proxyData);

		return NextResponse.json({
			success: true,
			data: createdProxy,
			message: "Proxy configuration created successfully",
		});
	} catch (error) {
		console.error("Error creating proxy:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to create proxy configuration",
			},
			{ status: 500 }
		);
	}
}

/**
 * Updates an existing proxy configuration
 */
export async function PUT(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Validate required fields
		if (!body.id) {
			return NextResponse.json(
				{
					success: false,
					error: "Proxy ID is required",
				},
				{ status: 400 }
			);
		}

		// Validate domain format if provided
		if (body.domain) {
			const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!domainRegex.test(body.domain)) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid domain format",
					},
					{ status: 400 }
				);
			}
		}

		// Validate target format if provided
		if (body.target && !body.target.includes(":")) {
			return NextResponse.json(
				{
					success: false,
					error: "Target must include port (e.g., localhost:3000)",
				},
				{ status: 400 }
			);
		}

		const updateData: Partial<ProxyFormData> = {};
		if (body.domain) updateData.domain = body.domain.trim().toLowerCase();
		if (body.target) updateData.target = body.target.trim();
		if (body.sslEnabled !== undefined) updateData.sslEnabled = body.sslEnabled;

		const updatedProxy = await updateProxy(body.id, updateData);

		return NextResponse.json({
			success: true,
			data: updatedProxy,
			message: "Proxy configuration updated successfully",
		});
	} catch (error) {
		console.error("Error updating proxy:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to update proxy configuration",
			},
			{ status: 500 }
		);
	}
}

/**
 * Deletes a proxy configuration
 */
export async function DELETE(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const proxyId = searchParams.get("id");

		if (!proxyId) {
			return NextResponse.json(
				{
					success: false,
					error: "Proxy ID is required",
				},
				{ status: 400 }
			);
		}

		await removeProxy(proxyId);

		return NextResponse.json({
			success: true,
			message: "Proxy configuration deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting proxy:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete proxy configuration",
			},
			{ status: 500 }
		);
	}
}
