import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          phoneNumber,
          fullName: '', // Will be filled in profile completion
          address: '', // Will be filled in profile completion
          role: UserRole.USER
        }
      });
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // In a real app, you would send OTP via SMS service
    // For demo purposes, we'll use a mock OTP
    const mockOtp = '123456';

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        needsProfileCompletion: !user.fullName || !user.address,
        mockOtp // Only for development
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}