import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, User } from '@/types';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, fullName, email, address, profilePictureUrl } = await request.json();

    // Get user ID from session or request body (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    let currentUserId = userId;

    // For now, we'll use a simple approach - in production, use proper JWT/session
    if (!currentUserId && authHeader) {
      // Extract user ID from token or session
      currentUserId = authHeader.replace('Bearer ', '');
    }

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!fullName?.trim() || !address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name and address are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: currentUserId },
      data: {
        fullName: fullName.trim(),
        email: email?.trim() || null,
        address: address.trim(),
        profilePictureUrl: profilePictureUrl || null,
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
      message: 'Profile updated successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}