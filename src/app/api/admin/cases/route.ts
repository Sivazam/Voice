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
    if (action === 'approve' || action === 'reject' || action === 'delete') {
      console.log('🔍 Admin action via POST workaround:', {
        action,
        approvalData,
        origin,
        method: request.method
      });

      const { caseId, status, adminComments, rejectionReason, reviewedBy } = approvalData;

      if (action === 'delete') {
        // For delete action, we only need caseId and reviewedBy
        const { caseId: deleteCaseId, reviewedBy: deleteReviewedBy } = approvalData;
        
        if (!deleteCaseId || !deleteReviewedBy) {
          console.error('❌ Missing required fields for delete:', {
            caseId: !!deleteCaseId,
            reviewedBy: !!deleteReviewedBy
          });
          return NextResponse.json(
            { success: false, error: 'Case ID and reviewer ID are required for delete action' },
            { status: 400 }
          );
        }

        // Verify user has admin role
        const reviewer = await FirestoreService.getUser(deleteReviewedBy);
        console.log('🔍 Delete reviewer user found:', {
          id: reviewer?.id,
          fullName: (reviewer as any)?.fullName,
          role: (reviewer as any)?.role,
          isActive: (reviewer as any)?.isActive
        });
        
        if (!reviewer) {
          console.error('❌ Delete reviewer not found:', deleteReviewedBy);
          return NextResponse.json(
            { success: false, error: `Reviewer not found: ${deleteReviewedBy}` },
            { status: 404 }
          );
        }

        if ((reviewer as any).role !== UserRole.ADMIN && (reviewer as any).role !== UserRole.SUPERADMIN) {
          console.error('❌ Insufficient permissions for delete:', {
            reviewerRole: (reviewer as any).role,
            requiredRoles: [UserRole.ADMIN, UserRole.SUPERADMIN]
          });
          return NextResponse.json(
            { 
              success: false, 
              error: `Admin access required. Current role: ${(reviewer as any).role}. Required: ADMIN or SUPERADMIN` 
            },
            { status: 403 }
          );
        }

        // Update case to REJECTED and remove from public view
        const deleteUpdateData = {
          status: CaseStatus.REJECTED,
          isPublic: false,
          reviewedAt: new Date().toISOString(),
          reviewedBy: deleteReviewedBy,
          adminComments: 'Case removed from public view by administrator',
          rejectionReason: 'Case was removed from public view by administrator'
        };

        console.log('🔍 Deleting case with data:', deleteUpdateData);
        const updatedCase = await FirestoreService.updateCase(deleteCaseId, deleteUpdateData);
        console.log('✅ Case deleted successfully (marked as rejected and removed from public view)');

        return NextResponse.json({
          success: true,
          data: updatedCase
        });
      }

      if (!caseId || !status || !reviewedBy) {
        console.error('❌ Missing required fields:', {
          caseId: !!caseId,
          status: !!status,
          reviewedBy: !!reviewedBy
        });
        return NextResponse.json(
          { success: false, error: 'Case ID, status, and reviewer ID are required' },
          { 
            status: 400,
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
        fullName: (reviewer as any)?.fullName,
        role: (reviewer as any)?.role,
        isActive: (reviewer as any)?.isActive
      });
      
      if (!reviewer) {
        console.error('❌ Reviewer not found:', reviewedBy);
        return NextResponse.json(
          { success: false, error: `Reviewer not found: ${reviewedBy}` },
          { 
            status: 404,
            headers: {
              'Access-Control-Allow-Origin': origin || '*',
              'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }

      if ((reviewer as any).role !== UserRole.ADMIN && (reviewer as any).role !== UserRole.SUPERADMIN) {
        console.error('❌ Insufficient permissions:', {
          reviewerRole: (reviewer as any).role,
          requiredRoles: [UserRole.ADMIN, UserRole.SUPERADMIN]
        });
        return NextResponse.json(
          { 
            success: false, 
            error: `Admin access required. Current role: ${(reviewer as any).role}. Required: ADMIN or SUPERADMIN` 
          },
          { 
            status: 403,
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
    console.error('🔥 Error stack:', (error as Error).stack);
    return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
  }
}