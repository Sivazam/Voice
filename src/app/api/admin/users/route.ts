import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get all users with their case counts
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { cases: true }
        }
      }
    });

    // Transform the data to match the User interface
    const userResponse: User[] = users.map(user => ({
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      address: user.address,
      profilePictureUrl: user.profilePictureUrl,
      role: user.role as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      totalCasesFiled: user._count.cases
    }));

    const response: ApiResponse<User[]> = {
      success: true,
      data: userResponse
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}