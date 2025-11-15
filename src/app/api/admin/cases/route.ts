import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { CaseStatus, UserRole } from '@/types';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const cases = await FirestoreService.getAllCases(status || undefined);

    return NextResponse.json({
      success: true,
      data: cases
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Get admin cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const origin = request.headers.get('origin');
  
  try {
    const body = await request.json();
    const { action, ...approvalData } = body;

    // If this is an approval action via POST (workaround for preview environment)
    if (action === 'approve' || action === 'reject') {
      console.log('🔍 Admin approval via POST workaround:', {
        action,
        approvalData,
        origin,
        method: request.method
      });

      const { caseId, status, adminComments, rejectionReason, reviewedBy } = approvalData;

      if (!caseId || !status || !reviewedBy) {
        console.error('❌ Missing required fields:', {
          caseId: !!caseId,
          status: !!status,
          reviewedBy: !!reviewedBy
        });
        return NextResponse.json(
          { success: false, error: 'Case ID, status, and reviewer ID are required' },
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

      // Verify user has admin role
      const reviewer = await FirestoreService.getUser(reviewedBy);
      console.log('🔍 Reviewer user found:', {
        id: reviewer?.id,
        fullName: reviewer?.fullName,
        role: reviewer?.role,
        isActive: reviewer?.isActive
      });
      
      if (!reviewer) {
        console.error('❌ Reviewer not found:', reviewedBy);
        return NextResponse.json(
          { success: false, error: `Reviewer not found: ${reviewedBy}` },
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

      if (reviewer.role !== UserRole.ADMIN && reviewer.role !== UserRole.SUPERADMIN) {
        console.error('❌ Insufficient permissions:', {
          reviewerRole: reviewer.role,
          requiredRoles: [UserRole.ADMIN, UserRole.SUPERADMIN]
        });
        return NextResponse.json(
          { 
            success: false, 
            error: `Admin access required. Current role: ${reviewer.role}. Required: ADMIN or SUPERADMIN` 
          },
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

      const updateData: any = {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy
      };

      if (adminComments) {
        updateData.adminComments = adminComments;
      }

      if (status === CaseStatus.REJECTED && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      if (status === CaseStatus.APPROVED) {
        updateData.isPublic = true;
      }

      console.log('🔍 Updating case with data:', updateData);
      const updatedCase = await FirestoreService.updateCase(caseId, updateData);
      console.log('✅ Case updated successfully via POST workaround');

      return NextResponse.json({
        success: true,
        data: updatedCase
      }, {
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Regular POST for other operations
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use action=approve or action=reject for case operations.'
    }, { status: 400 });

  } catch (error) {
    console.error('🔥 POST approval error:', error);
    console.error('🔥 Error stack:', error.stack);
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