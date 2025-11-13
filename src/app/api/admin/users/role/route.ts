import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, User, UserRole } from '@/types';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, newRole, changedBy } = await request.json();

    // Validate inputs
    if (!userId || !newRole || !changedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if the changer is a super admin
    const changer = await db.user.findUnique({
      where: { id: changedBy }
    });

    if (!changer || changer.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only super admins can change roles.' },
        { status: 403 }
      );
    }

    // Get the user to be updated
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing super admin role (except self)
    if (targetUser.role === 'SUPERADMIN' && targetUser.id !== changedBy) {
      return NextResponse.json(
        { success: false, error: 'Cannot change super admin role' },
        { status: 403 }
      );
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        updatedAt: new Date()
      }
    });

    // Return updated user data
    const userResponse: User = {
      id: updatedUser.id,
      phoneNumber: updatedUser.phoneNumber,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      address: updatedUser.address,
      profilePictureUrl: updatedUser.profilePictureUrl,
      role: updatedUser.role as any,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt,
      isActive: updatedUser.isActive,
      totalCasesFiled: updatedUser.totalCasesFiled
    };

    const response: ApiResponse<User> = {
      success: true,
      data: userResponse,
      message: `User role updated to ${newRole} successfully`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Role change error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}