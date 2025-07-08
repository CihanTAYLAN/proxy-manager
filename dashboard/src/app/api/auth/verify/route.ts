import { NextRequest, NextResponse } from "next/server";

/**
 * Mock token verification endpoint for testing
 * TODO: Replace with real JWT verification
 */
export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Mock token validation (in real app, verify JWT signature)
		if (token.startsWith("mock-jwt-token-")) {
			// Extract user info from mock token
			const mockUser = {
				id: "1",
				email: "admin@example.com",
				name: "Admin User",
				role: "admin",
			};

			return NextResponse.json({
				success: true,
				user: mockUser,
			});
		} else {
			return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
		}
	} catch {
		return NextResponse.json({ success: false, error: "Token verification failed" }, { status: 500 });
	}
}
