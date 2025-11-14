import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
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

    // Find or create user in Firestore
    let user = await FirestoreService.getUserByPhoneNumber(phoneNumber);

    if (!user) {
      // Create new user in Firestore with mobile number as document ID
      user = await FirestoreService.createUser({
        phoneNumber,
        fullName: '', // Will be filled in profile completion
        address: '', // Will be filled in profile completion
        role: UserRole.USER,
        isActive: true,
        totalCasesFiled: 0
      });
    }

    // Update last login
    await FirestoreService.updateUser(user.id, {
      lastLoginAt: new Date().toISOString()
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