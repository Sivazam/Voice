import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, email, address } = await request.json();

    if (!userId || !fullName || !address) {
      return NextResponse.json(
        { success: false, error: 'User ID, full name, and address are required' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        fullName,
        email: email || null,
        address
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          address: updatedUser.address,
          profilePictureUrl: updatedUser.profilePictureUrl,
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}