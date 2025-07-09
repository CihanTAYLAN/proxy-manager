import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

// Input validation schema for setup
const setupSchema = z.object({
	email: z.string().email("Invalid email format"),
	username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Creates the first admin user during initial setup
 * Only works when no users exist in the database
 */
export async function POST(request: NextRequest) {
	try {
		console.log("Setup API endpoint called");

		// Check if users already exist
		const userCount = await prisma.user.count();
		console.log("Current user count:", userCount);

		if (userCount > 0) {
			console.log("Setup already completed - users exist");
			return NextResponse.json({ success: false, error: "Setup already completed. Users exist in the system." }, { status: 400 });
		}

		const body = await request.json();
		console.log("Request body received:", { ...body, password: "***" });

		// Validate input
		const result = setupSchema.safeParse(body);
		if (!result.success) {
			console.log("Validation failed:", result.error.issues);
			return NextResponse.json(
				{
					success: false,
					error: "Invalid input",
					details: result.error.issues,
				},
				{ status: 400 }
			);
		}

		const { email, username, password } = result.data;
		console.log("Validation successful, proceeding with user creation");

		// Check if email or username already exists (extra safety)
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existingUser) {
			return NextResponse.json({ success: false, error: "Email or username already exists" }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create first admin user
		console.log("Creating admin user in database");
		const adminUser = await prisma.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
				isActive: true,
			},
		});
		console.log("Admin user created successfully:", { id: adminUser.id, email: adminUser.email, username: adminUser.username });

		// Generate JWT token
		console.log("Generating JWT token");
		const token = generateToken({
			id: adminUser.id,
			email: adminUser.email,
			username: adminUser.username,
		});
		console.log("JWT token generated successfully");

		// Create audit log for setup
		await prisma.auditLog.create({
			data: {
				action: "SETUP",
				resource: "USER",
				resourceId: adminUser.id,
				details: {
					email: adminUser.email,
					username: adminUser.username,
					setupTime: new Date().toISOString(),
				},
				userId: adminUser.id,
				ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
				userAgent: request.headers.get("user-agent") || "unknown",
			},
		});

		// Return successful response with token
		console.log("Setup completed successfully, returning response");
		return NextResponse.json({
			success: true,
			data: {
				token,
				user: {
					id: adminUser.id,
					email: adminUser.email,
					username: adminUser.username,
				},
			},
			message: "Initial setup completed successfully",
		});
	} catch (error) {
		console.error("Setup error:", error);
		return NextResponse.json({ success: false, error: "Setup failed" }, { status: 500 });
	}
}
