import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CaseStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const cases = await db.case.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        },
        issueCategories: true,
        attachments: true,
        _count: {
          select: { attachments: true }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: cases
    });

  } catch (error) {
    console.error('Get admin cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { caseId, status, adminComments, rejectionReason, reviewedBy } = await request.json();

    if (!caseId || !status || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: 'Case ID, status, and reviewer ID are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
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

    const updatedCase = await db.case.update({
      where: { id: caseId },
      data: updateData,
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        },
        issueCategories: true,
        attachments: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCase
    });

  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}