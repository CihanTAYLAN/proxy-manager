/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

/**
 * Handles user logout and creates audit log
 * Requires authentication token to identify the user
 */
export async function POST(request: NextRequest) {
	try {
		// Authenticate user from token
		let user;
		try {
			user = await authenticateRequest(request);
		} catch {
			// If authentication fails, still return success for logout
			// This prevents errors when token is already expired
			return NextResponse.json({
				success: true,
				message: "Logout successful",
			});
		}

		// Create audit log for logout
		await prisma.auditLog.create({
			data: {
				action: "LOGOUT",
				resource: "USER",
				resourceId: user.id,
				details: {
					email: user.email,
					logoutTime: new Date().toISOString(),
				},
				userId: user.id,
				ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
				userAgent: request.headers.get("user-agent") || "unknown",
			},
		});

		const response = NextResponse.json({
			success: true,
			message: "Logout successful",
		});

		// Clear authentication cookie (if used)
		response.cookies.set("auth-token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0,
		});

		return response;
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
	}
}
