import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export interface UpdateUserRequest {
	email?: string;
	username?: string;
	isActive?: boolean;
	password?: string;
}

/**
 * PUT /api/users/[id] - Update user
 * Requires authentication
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body: UpdateUserRequest = await request.json();

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prepare update data
		const updateData: any = {};

		if (body.email !== undefined) {
			// Check if email is already used by another user
			const emailExists = await prisma.user.findFirst({
				where: {
					email: body.email,
					id: { not: id },
				},
			});
			if (emailExists) {
				return NextResponse.json(
					{
						error: "Email is already used by another user",
					},
					{ status: 409 }
				);
			}
			updateData.email = body.email;
		}

		if (body.username !== undefined) {
			// Check if username is already used by another user
			const usernameExists = await prisma.user.findFirst({
				where: {
					username: body.username,
					id: { not: id },
				},
			});
			if (usernameExists) {
				return NextResponse.json(
					{
						error: "Username is already used by another user",
					},
					{ status: 409 }
				);
			}
			updateData.username = body.username;
		}

		if (body.isActive !== undefined) {
			updateData.isActive = body.isActive;
		}

		if (body.password !== undefined) {
			// Hash new password
			updateData.password = await bcrypt.hash(body.password, 12);
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
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

		return NextResponse.json({
			success: true,
			message: "User updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * DELETE /api/users/[id] - Delete user
 * Requires authentication
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prevent deleting the current user
		if (authResult.user?.id === id) {
			return NextResponse.json(
				{
					error: "Cannot delete your own account",
				},
				{ status: 400 }
			);
		}

		// Delete user (cascade will handle related records)
		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * PATCH /api/users/[id]/toggle-status - Toggle user active status
 * Requires authentication
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Verify authentication
		const authResult = await verifyAuth(request);
		if (!authResult.success) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prevent deactivating the current user
		if (authResult.user?.id === id && existingUser.isActive) {
			return NextResponse.json(
				{
					error: "Cannot deactivate your own account",
				},
				{ status: 400 }
			);
		}

		// Toggle status
		const updatedUser = await prisma.user.update({
			where: { id },
			data: { isActive: !existingUser.isActive },
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

		return NextResponse.json({
			success: true,
			message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error toggling user status:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
