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
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'application/pdf', 
      'audio/webm', 
      'audio/ogg', 
      'audio/wav',
      'audio/mp4',
      'audio/mpeg',
      'audio/mp3',
      'audio/x-m4a',
      'audio/mp4a-latm',
      'audio/3gpp',
      'audio/3gpp2'
    ];
    
    // Special handling for iOS Safari - sometimes reports generic MIME types
    const isIOS = request.headers.get('user-agent')?.includes('iPhone') || 
                   request.headers.get('user-agent')?.includes('iPad') || 
                   request.headers.get('user-agent')?.includes('iPod');
    
    let isValidType = allowedTypes.includes(file.type);
    
    // For iOS Safari, also accept empty or generic MIME types for audio files
    if (isIOS && file.name && (
        file.name.endsWith('.mp4') || 
        file.name.endsWith('.m4a') || 
        file.name.endsWith('.wav') || 
        file.name.endsWith('.mp3')
    )) {
      isValidType = true;
      console.log('🍎 iOS Safari audio file accepted by filename:', file.name);
    }
    
    if (!isValidType) {
      console.error('❌ File type validation failed:', {
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        isIOS,
        allowedTypes
      });
      return NextResponse.json(
        { success: false, error: `File type not allowed: ${file.type || 'unknown'}` },
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