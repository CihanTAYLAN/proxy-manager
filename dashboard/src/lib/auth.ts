import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const SALT_ROUNDS = 12;

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(user: { id: string; email: string; username: string }): string {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		JWT_SECRET,
		{ expiresIn: "7d" }
	);
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): any {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch {
		throw new Error("Invalid or expired token");
	}
}

/**
 * Verifies authentication from request headers and returns user data
 */
export async function verifyAuth(request: NextRequest): Promise<{
	success: boolean;
	user?: { id: string; email: string; username: string } | null;
	error?: string;
}> {
	try {
		// Get token from Authorization header
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return { success: false, error: "No valid authorization header" };
		}

		const token = authHeader.substring(7); // Remove "Bearer " prefix

		// Verify token
		const decoded = verifyToken(token);

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: {
				id: true,
				email: true,
				username: true,
				isActive: true,
			},
		});

		if (!user || !user.isActive) {
			return { success: false, error: "User not found or inactive" };
		}

		return { success: true, user };
	} catch (error) {
		console.error("Auth verification error:", error);
		return { success: false, error: "Invalid token" };
	}
}
