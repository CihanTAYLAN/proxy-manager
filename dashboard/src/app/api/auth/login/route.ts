import { NextRequest, NextResponse } from "next/server";

/**
 * Mock login endpoint for testing
 * TODO: Replace with real authentication backend
 */
export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		// Mock credentials (replace with real authentication)
		const mockUsers = [
			{
				id: "1",
				email: "admin@example.com",
				password: "admin123", // In real app, this would be hashed
				name: "Admin User",
				role: "admin",
			},
		];

		// Simple credential check
		const user = mockUsers.find((u) => u.email === email && u.password === password);

		if (user) {
			// Generate mock JWT token (in real app, use proper JWT)
			const token = `mock-jwt-token-${user.id}-${Date.now()}`;

			return NextResponse.json({
				success: true,
				token,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
			});
		} else {
			return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
		}
	} catch {
		return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
	}
}
