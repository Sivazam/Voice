import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, email, address } = await request.json();

    if (!userId || !fullName || !address) {
      return NextResponse.json(
        { success: false, error: 'User ID, full name, and address are required' },
        { status: 400 }
      );
    }

    const updatedUser = await FirestoreService.updateUser(userId, {
      fullName,
      email: email || null,
      address
    });

    // Get the updated user data
    const userData = await FirestoreService.getUser(userId) as User | null;

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          phoneNumber: userData.phoneNumber,
          fullName: userData.fullName,
          email: userData.email,
          address: userData.address,
          profilePictureUrl: userData.profilePictureUrl,
          role: userData.role
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