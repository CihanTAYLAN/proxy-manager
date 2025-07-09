import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Checks if any users exist in the database
 * Used to determine if initial setup is required
 */
export async function GET() {
	try {
		// Count total users in database
		const userCount = await prisma.user.count();

		return NextResponse.json({
			success: true,
			data: {
				hasUsers: userCount > 0,
				userCount,
			},
			message: userCount > 0 ? "Users exist" : "No users found, setup required",
		});
	} catch (error) {
		console.error("Setup check error:", error);
		return NextResponse.json({ success: false, error: "Failed to check setup status" }, { status: 500 });
	}
}
