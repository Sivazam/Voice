import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    // Check if any super admin exists
    const allUsers = await FirestoreService.getAllUsers();
    const superAdminExists = allUsers.some(user => user.role === 'SUPERADMIN');

    return NextResponse.json({
      success: true,
      data: {
        exists: superAdminExists
      }
    });

  } catch (error) {
    console.error('Check super admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, fullName, email, address } = await request.json();

    // Validate required fields
    if (!phoneNumber || !fullName || !address) {
      return NextResponse.json(
        { success: false, error: 'Phone number, full name, and address are required' },
        { status: 400 }
      );
    }

    // Check if super admin already exists
    const allUsers = await FirestoreService.getAllUsers();
    const superAdminExists = allUsers.some(user => user.role === 'SUPERADMIN');

    if (superAdminExists) {
      return NextResponse.json(
        { success: false, error: 'Super Admin already exists in the system' },
        { status: 400 }
      );
    }

    // Check if user with this phone number already exists
    const existingUser = await FirestoreService.getUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create super admin user
    const superAdminData = {
      phoneNumber,
      fullName,
      email: email || null,
      address,
      role: 'SUPERADMIN',
      isActive: true,
      totalCasesFiled: 0
    };

    const createdSuperAdmin = await FirestoreService.createUser(superAdminData);

    return NextResponse.json({
      success: true,
      message: 'Super Administrator created successfully!',
      data: createdSuperAdmin
    });

  } catch (error) {
    console.error('Create super admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create super administrator' },
      { status: 500 }
    );
  }
}