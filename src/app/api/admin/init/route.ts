import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, fullName, email, address } = await request.json();

    // Validate inputs
    if (!phoneNumber || !fullName || !address) {
      return NextResponse.json(
        { success: false, error: 'Phone number, full name, and address are required' },
        { status: 400 }
      );
    }

    // Check if any super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Super admin already exists' },
        { status: 400 }
      );
    }

    // Check if user with this phone number already exists
    const existingUser = await db.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      // Upgrade existing user to super admin
      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'SUPERADMIN',
          fullName: fullName.trim(),
          email: email?.trim() || null,
          address: address.trim(),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Existing user upgraded to Super Admin successfully',
        data: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          fullName: updatedUser.fullName,
          role: updatedUser.role
        }
      });
    } else {
      // Create new super admin user
      const newSuperAdmin = await db.user.create({
        data: {
          phoneNumber,
          fullName: fullName.trim(),
          email: email?.trim() || null,
          address: address.trim(),
          role: 'SUPERADMIN',
          isActive: true,
          totalCasesFiled: 0
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Super Admin created successfully',
        data: {
          id: newSuperAdmin.id,
          phoneNumber: newSuperAdmin.phoneNumber,
          fullName: newSuperAdmin.fullName,
          role: newSuperAdmin.role
        }
      });
    }

  } catch (error) {
    console.error('Super admin initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if super admin exists
export async function GET() {
  try {
    const superAdminCount = await db.user.count({
      where: { role: 'SUPERADMIN' }
    });

    return NextResponse.json({
      success: true,
      data: {
        exists: superAdminCount > 0,
        count: superAdminCount
      }
    });

  } catch (error) {
    console.error('Super admin check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}