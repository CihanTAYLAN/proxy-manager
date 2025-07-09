import { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export interface AuthenticatedUser {
	id: string;
	email: string;
	username: string;
}

/**
 * Authenticates a request by verifying the JWT token
 * Returns the authenticated user or throws an error
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
	// Get token from Authorization header
	const authHeader = request.headers.get("authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new Error("Missing or invalid authorization header");
	}

	const token = authHeader.substring(7); // Remove "Bearer " prefix

	try {
		// Verify JWT token
		const decoded = verifyToken(token);

		// Check if user still exists and is active
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: {
				id: true,
				email: true,
				username: true,
				isActive: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		if (!user.isActive) {
			throw new Error("User account is disabled");
		}

		return {
			id: user.id,
			email: user.email,
			username: user.username,
		};
	} catch {
		throw new Error("Invalid or expired token");
	}
}

/**
 * Helper function to create authenticated API responses
 */
export function createAuthError(message: string = "Authentication required") {
	return Response.json({ success: false, error: message }, { status: 401 });
}
