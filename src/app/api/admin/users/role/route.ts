import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    
    const { userId, newRole, changedBy } = await request.json();

    // Validate required fields
    if (!userId || !newRole || !changedBy) {
      return NextResponse.json(
        { success: false, error: 'User ID, new role, and changed by are required' },
        { status: 400 },
        {
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 },
        {
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Get the user to be updated
    const user = await FirestoreService.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
        {
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Get the admin making the change
    const adminUser = await FirestoreService.getUser(changedBy);
    if (!adminUser || adminUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Super Admins can change user roles' },
        { status: 403 },
        {
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Prevent changing SUPERADMIN role if user is not the one being changed
    if (user.role === 'SUPERADMIN' && userId !== changedBy) {
      return NextResponse.json(
        { success: false, error: 'Cannot change Super Admin role' },
        { status: 403 },
        {
          headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Update user role
    await FirestoreService.updateUser(userId, { role: newRole });

    // Get updated user
    const updatedUser = await FirestoreService.getUser(userId);

    return NextResponse.json({
      success: true,
      data: updatedUser
    }, {
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Change user role error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}