import { NextRequest, NextResponse } from 'next/server';
import { AttachmentService } from '@/lib/attachment-service';
import { FirestoreService } from '@/lib/firestore';
import { CaseStatus, Gender, User } from '@/types';

// Fixed attachment validation and error handling

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('📥 Received case submission data:', formData);
    console.log('📥 Form data keys:', Object.keys(formData));
    console.log('📥 Attachments field:', formData.attachments);
    console.log('📥 Attachments type:', typeof formData.attachments);
    console.log('📥 Attachments length:', formData.attachments?.length);
    
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
      voiceRecordingDuration,
      attachments,
      tempCaseId
    } = formData;

    // Validate required fields
    if (!userId || !patientName || !patientAge || !patientGender || !hospitalName || !hospitalAddress || !hospitalState || !department || !admissionDate) {
      console.error('❌ Missing required fields:', {
        userId: !!userId,
        patientName: !!patientName,
        patientAge: !!patientAge,
        patientGender: !!patientGender,
        hospitalName: !!hospitalName,
        hospitalAddress: !!hospitalAddress,
        hospitalState: !!hospitalState,
        department: !!department,
        admissionDate: !!admissionDate
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate relationshipToPatient specifically
    if (!relationshipToPatient) {
      console.error('❌ Missing relationshipToPatient');
      return NextResponse.json(
        { success: false, error: 'Relationship to patient is required' },
        { status: 400 }
      );
    }

    // Validate voice recording is required
    if (!voiceRecordingUrl) {
      console.error('❌ Missing voice recording');
      return NextResponse.json(
        { success: false, error: 'Voice recording is required' },
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

    // Create attachment records if files were uploaded
    if (attachments && attachments.length > 0) {
      console.log('📤 Creating attachment records:', attachments.length);
      
      for (const attachment of attachments) {
        console.log('📤 Processing attachment:', attachment);
        
        // Validate attachment data before creating record
        if (!attachment || !attachment.fileName || !attachment.fileUrl) {
          console.error('❌ Invalid attachment data:', attachment);
          continue; // Skip this attachment
        }
        
        try {
          const attachmentRecord = await AttachmentService.createAttachment({
            caseId: newCase.id,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            storagePath: attachment.storagePath || null
          });
          console.log('✅ Attachment record created successfully:', {
            fileName: attachment.fileName,
            id: attachmentRecord.id,
            storagePath: attachment.storagePath
          });
        } catch (error) {
          console.error('❌ Error creating attachment record:', error);
          // Continue with other attachments instead of failing the whole case
        }
      }
    }

    // Update user's total cases filed
    const user = await FirestoreService.getUser(userId) as User | null;
    if (user) {
      await FirestoreService.updateUser(userId, {
        totalCasesFiled: (user.totalCasesFiled || 0) + 1
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        caseId: newCase.id,
        message: 'Case submitted successfully',
        attachments: attachments || [] // Include attachments in response
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
      cases = await FirestoreService.getAllCases(status || undefined);
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