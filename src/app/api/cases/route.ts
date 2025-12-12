import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { CaseStatus, User } from '@/types';

// Import FileUploadService for file upload functionality
import { FileUploadService, AttachmentService } from '@/lib/attachment-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('📥 Received case submission data');
    
    // Extract form fields
    const mainCategory = formData.get('mainCategory') as string;
    const caseTitle = formData.get('caseTitle') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const caseDescription = formData.get('caseDescription') as string;
    const gpsLatitude = formData.get('gpsLatitude') as string;
    const gpsLongitude = formData.get('gpsLongitude') as string;
    const capturedAddress = formData.get('capturedAddress') as string;
    
    // Get user ID from auth store or session (for now, we'll get it from the request)
    const userId = formData.get('userId') as string || 'temp-user-id'; // This should come from authentication
    
    // Validate required fields
    if (!mainCategory || !caseTitle || !name || !email || !phoneNumber || !caseDescription) {
      console.error('❌ Missing required fields:', {
        mainCategory: !!mainCategory,
        caseTitle: !!caseTitle,
        name: !!name,
        email: !!email,
        phoneNumber: !!phoneNumber,
        caseDescription: !!caseDescription
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle voice recording upload
    let voiceRecordingUrl: string | undefined;
    let voiceRecordingDuration: number | undefined;
    
    const voiceRecording = formData.get('voiceRecording') as File;
    if (voiceRecording) {
      try {
        const voiceResult = await FileUploadService.uploadFile(voiceRecording, 'temp-case-id', 'voice-recordings');
        voiceRecordingUrl = voiceResult.fileUrl;
        voiceRecordingDuration = 0; // We could calculate this from the file
        console.log('✅ Voice recording uploaded:', voiceRecordingUrl);
      } catch (error) {
        console.error('❌ Error uploading voice recording:', error);
        // Continue without voice recording as it's optional
      }
    }

    // Create the case using Firestore service
    const newCase = await FirestoreService.createCase({
      userId,
      status: CaseStatus.PENDING,
      mainCategory,
      caseTitle,
      name,
      email,
      phoneNumber,
      caseDescription,
      gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : undefined,
      gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : undefined,
      capturedAddress: capturedAddress || undefined,
      voiceRecordingUrl,
      voiceRecordingDuration
    });

    console.log('✅ Case created successfully:', newCase.id);

    // Handle file attachments
    const attachments: Array<{fileName: string, fileUrl: string, fileType: string, fileSize: number}> = [];
    let attachmentIndex = 0;
    
    while (true) {
      const attachment = formData.get(`attachment_${attachmentIndex}`) as File;
      if (!attachment) break;
      
      try {
        const attachmentResult = await FileUploadService.uploadFile(attachment, newCase.id, 'case-attachments');
        
        const attachmentRecord = await AttachmentService.createAttachment({
          caseId: newCase.id,
          fileName: attachment.name,
          fileUrl: attachmentResult.fileUrl,
          fileType: attachment.type,
          fileSize: attachment.size,
          storagePath: attachmentResult.storagePath || undefined
        });
        
        attachments.push({
          fileName: attachment.name,
          fileUrl: attachmentResult.fileUrl,
          fileType: attachment.type,
          fileSize: attachment.size
        });
        
        console.log('✅ Attachment uploaded:', attachment.name);
      } catch (error) {
        console.error('❌ Error uploading attachment:', error);
        // Continue with other attachments
      }
      
      attachmentIndex++;
    }

    // Update user's total cases filed
    try {
      const user = await FirestoreService.getUser(userId) as User | null;
      if (user) {
        await FirestoreService.updateUser(userId, {
          totalCasesFiled: (user.totalCasesFiled || 0) + 1
        });
      }
    } catch (error) {
      console.error('❌ Error updating user case count:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        caseId: newCase.id,
        message: 'Case submitted successfully',
        attachments
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
    const mainCategory = searchParams.get('mainCategory');
    const isPublic = searchParams.get('public') === 'true';

    let cases;

    if (userId) {
      cases = await FirestoreService.getUserCases(userId);
    } else {
      cases = await FirestoreService.getAllCases(status || undefined);
    }

    // Filter by category if specified
    if (mainCategory && mainCategory !== 'All Categories') {
      cases = cases.filter((case_: any) => case_.mainCategory === mainCategory);
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