import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const users = await FirestoreService.getAllUsers();

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}