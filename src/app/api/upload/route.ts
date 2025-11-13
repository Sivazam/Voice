import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images, PDFs, and audio files are allowed' },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    try {
      const uploadResult = await FirestoreService.uploadFile(file, caseId);
      
      // Create attachment record in Firestore
      const attachment = await FirestoreService.createAttachment({
        caseId,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        uploadedAt: uploadResult.uploadedAt
      });

      return NextResponse.json({
        success: true,
        data: {
          attachmentId: attachment.id,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize
        }
      });

    } catch (error) {
      console.error('File upload error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to Firebase Storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}