import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";

/**
 * Verifies JWT token and returns user information
 * Used for checking if stored token is still valid
 */
export async function GET(request: NextRequest) {
	try {
		// Authenticate user from token
		const user = await authenticateRequest(request);

		return NextResponse.json({
			success: true,
			data: {
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
			},
			message: "Token is valid",
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Invalid token",
			},
			{ status: 401 }
		);
	}
}
