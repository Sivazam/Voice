import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, isActive, changedBy } = await request.json();

    // Validate required fields
    if (!userId || typeof isActive !== 'boolean' || !changedBy) {
      return NextResponse.json(
        { success: false, error: 'User ID, active status, and changed by are required' },
        { status: 400 }
      );
    }

    // Get the user to be updated
    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the admin making the change
    const adminUser = await FirestoreService.getUser(changedBy);
    if (!adminUser || (adminUser as any).role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Super Admins can change user status' },
        { status: 403 }
      );
    }

    // Prevent deactivating Super Admins
    if ((user as any).role === 'SUPERADMIN' && !isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate Super Admin accounts' },
        { status: 403 }
      );
    }

    // Prevent self-deactivation
    if (userId === changedBy && !isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate your own account' },
        { status: 403 }
      );
    }

    // Update user status
    await FirestoreService.updateUser(userId, { isActive });

    // Get updated user
    const updatedUser = await FirestoreService.getUser(userId);

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('Change user status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}