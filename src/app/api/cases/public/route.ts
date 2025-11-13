import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Case, CaseStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'latest';

    // Build where clause for filtering
    const where: any = {
      status: 'APPROVED', // Only show approved cases publicly
      isPublic: true
    };

    // Add state filter if specified
    if (state && state !== 'All States') {
      where.hospitalState = state;
    }

    // Add search filter if specified
    if (search) {
      where.OR = [
        { hospitalName: { contains: search, mode: 'insensitive' } },
        { patientName: { contains: search, mode: 'insensitive' } },
        { detailedDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add category filter if specified
    if (category && category !== 'All Categories') {
      where.issueCategories = {
        some: {
          category: category
        }
      };
    }

    // Build order by clause
    let orderBy: any = { submittedAt: 'desc' }; // Default: latest first
    
    if (sortBy === 'oldest') {
      orderBy = { submittedAt: 'asc' };
    } else if (sortBy === 'popular') {
      orderBy = { viewCount: 'desc' };
    }

    // Fetch cases with filters
    const cases = await db.case.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            fullName: true
          }
        },
        issueCategories: true,
        attachments: true
      }
    });

    // Transform data to match Case interface
    const caseResponse: Case[] = cases.map(case_ => ({
      id: case_.id,
      userId: case_.userId,
      status: case_.status as CaseStatus,
      
      // Patient Info (anonymized for public view)
      patientName: case_.patientName,
      patientAge: case_.patientAge,
      patientGender: case_.patientGender,
      relationshipToPatient: case_.relationshipToPatient,
      
      // Hospital Info
      hospitalName: case_.hospitalName,
      hospitalAddress: case_.hospitalAddress,
      hospitalState: case_.hospitalState,
      hospitalRegistrationNo: case_.hospitalRegistrationNo,
      department: case_.department,
      
      // Timeline
      admissionDate: case_.admissionDate,
      dischargeDate: case_.dischargeDate,
      isDischarged: case_.isDischarged,
      
      // Complaint
      detailedDescription: case_.detailedDescription,
      voiceRecordingUrl: case_.voiceRecordingUrl,
      voiceRecordingDuration: case_.voiceRecordingDuration,
      
      // Location
      gpsLatitude: case_.gpsLatitude,
      gpsLongitude: case_.gpsLongitude,
      capturedAddress: case_.capturedAddress,
      
      // Attachments
      attachments: case_.attachments || [],
      
      // Metadata
      submittedAt: case_.submittedAt,
      reviewedAt: case_.reviewedAt,
      reviewedBy: case_.reviewedBy,
      adminComments: case_.adminComments,
      rejectionReason: case_.rejectionReason,
      resolvedAt: case_.resolvedAt,
      viewCount: case_.viewCount,
      
      // Privacy
      isPublic: case_.isPublic,
      
      // Relations
      user: case_.user ? {
        id: case_.user.id,
        phoneNumber: case_.user.phoneNumber,
        fullName: case_.user.fullName,
        email: case_.user.email,
        address: case_.user.address,
        profilePictureUrl: case_.user.profilePictureUrl,
        role: case_.user.role as any,
        createdAt: case_.user.createdAt,
        updatedAt: case_.user.updatedAt,
        lastLoginAt: case_.user.lastLoginAt,
        isActive: case_.user.isActive,
        totalCasesFiled: case_.user.totalCasesFiled
      } : undefined,
      
      issueCategories: case_.issueCategories
    }));

    const response: ApiResponse<Case[]> = {
      success: true,
      data: caseResponse
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Public cases fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}