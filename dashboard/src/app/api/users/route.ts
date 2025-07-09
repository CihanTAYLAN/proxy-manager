import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export interface CreateUserRequest {
	email: string;
	username: string;
	password: string;
}

export interface UpdateUserRequest {
	email?: string;
	username?: string;
	isActive?: boolean;
}

/**
 * GET /api/users - Get all users
 * Requires authentication
 */
export async function GET(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				username: true,
				isActive: true,
				lastLogin: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json({
			success: true,
			data: users,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * POST /api/users - Create a new user
 * Requires authentication
 */
export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body: CreateUserRequest = await request.json();
		const { email, username, password } = body;

		// Validation
		if (!email || !username || !password) {
			return NextResponse.json(
				{
					error: "Missing required fields: email, username, password",
				},
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});

		if (existingUser) {
			return NextResponse.json(
				{
					error: "User with this email or username already exists",
				},
				{ status: 409 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user
		const newUser = await prisma.user.create({
			data: {
				email,
				username,
				password: hashedPassword,
				isActive: true,
			},
			select: {
				id: true,
				email: true,
				username: true,
				isActive: true,
				lastLogin: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(
			{
				success: true,
				message: "User created successfully",
				data: newUser,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
