import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { CaseStatus, Gender } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const {
      userId,
      patientName,
      patientAge,
      patientGender,
      relationshipToPatient,
      hospitalName,
      hospitalAddress,
      hospitalState,
      hospitalRegistrationNo,
      department,
      admissionDate,
      isDischarged,
      dischargeDate,
      issueCategories,
      detailedDescription,
      gpsLatitude,
      gpsLongitude,
      capturedAddress,
      voiceRecordingUrl,
      voiceRecordingDuration
    } = formData;

    // Validate required fields
    if (!userId || !patientName || !patientAge || !patientGender || !hospitalName || !hospitalAddress || !hospitalState || !department || !admissionDate || !detailedDescription) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the case using Firestore service
    const newCase = await FirestoreService.createCase({
      userId,
      status: CaseStatus.PENDING,
      patientName,
      patientAge: parseInt(patientAge),
      patientGender: patientGender as Gender,
      relationshipToPatient,
      hospitalName,
      hospitalAddress,
      hospitalState,
      hospitalRegistrationNo: hospitalRegistrationNo || null,
      department,
      admissionDate: new Date(admissionDate),
      isDischarged: Boolean(isDischarged),
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
      detailedDescription,
      gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
      gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
      capturedAddress: capturedAddress || null,
      voiceRecordingUrl: formData.voiceRecordingUrl || null,
      voiceRecordingDuration: formData.voiceRecordingDuration || null
    });

    // Create issue categories using Firestore service
    if (issueCategories && issueCategories.length > 0) {
      const categoryData = issueCategories.map((category: string) => ({
        caseId: newCase.id,
        category
      }));
      
      await FirestoreService.createIssueCategories(categoryData);
    }

    // Update user's total cases filed
    const user = await FirestoreService.getUser(userId);
    if (user) {
      await FirestoreService.updateUser(userId, {
        totalCasesFiled: (user.totalCasesFiled || 0) + 1
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        caseId: newCase.id,
        message: 'Case submitted successfully'
      }
    });

  } catch (error) {
    console.error('Case submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const isPublic = searchParams.get('public') === 'true';

    let cases;

    if (userId) {
      cases = await FirestoreService.getUserCases(userId);
    } else {
      cases = await FirestoreService.getAllCases(status);
    }

    // Filter for public cases if requested
    if (isPublic) {
      cases = cases.filter((case_: any) => case_.isPublic);
    }

    return NextResponse.json({
      success: true,
      data: cases
    });

  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}