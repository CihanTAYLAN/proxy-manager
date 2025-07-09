import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

// Input validation schema
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

/**
 * User login endpoint with database authentication
 * Validates credentials against database and returns JWT token
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const result = loginSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid input",
					details: result.error.issues,
				},
				{ status: 400 }
			);
		}

		const { email, password } = result.data;

		// Find user in database
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				username: true,
				password: true,
				isActive: true,
			},
		});

		// Check if user exists and is active
		if (!user) {
			return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
		}

		if (!user.isActive) {
			return NextResponse.json({ success: false, error: "Account is disabled" }, { status: 401 });
		}

		// Verify password
		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
		}

		// Generate JWT token
		const token = generateToken({
			id: user.id,
			email: user.email,
			username: user.username,
		});

		// Create audit log for successful login
		await prisma.auditLog.create({
			data: {
				action: "LOGIN",
				resource: "USER",
				resourceId: user.id,
				details: {
					email: user.email,
					loginTime: new Date().toISOString(),
				},
				userId: user.id,
				ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
				userAgent: request.headers.get("user-agent") || "unknown",
			},
		});

		// Return successful response
		return NextResponse.json({
			success: true,
			data: {
				token,
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
				},
			},
			message: "Login successful",
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
	}
}
