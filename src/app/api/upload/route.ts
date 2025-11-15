import { NextRequest, NextResponse } from 'next/server';
import { FileUploadService } from '@/lib/attachment-service';

export async function POST(request: NextRequest) {
  try {
    // Check if content type is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;

    console.log('📥 Upload API request:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      caseId
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: 'No case ID provided' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'audio/webm', 'audio/ogg', 'audio/wav'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Upload file using FileUploadService
    const uploadResult = await FileUploadService.uploadFile(file, caseId);

    if (uploadResult) {
      console.log('✅ Upload successful:', {
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        storagePath: uploadResult.storagePath
      });

      return NextResponse.json({
        success: true,
        data: {
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
          storagePath: uploadResult.storagePath
        }
      });
    } else {
      console.error('❌ Upload failed');
      return NextResponse.json(
        { success: false, error: 'Upload failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}