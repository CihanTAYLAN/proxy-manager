import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
