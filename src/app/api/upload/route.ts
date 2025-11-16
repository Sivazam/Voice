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

    // Validate file size (adjust for mobile devices)
    const maxSize = 50 * 1024 * 1024; // 50MB max
    const isMobile = request.headers.get('user-agent')?.includes('Android') || 
                   request.headers.get('user-agent')?.includes('iPhone') || 
                   request.headers.get('user-agent')?.includes('iPad');
    
    // For mobile devices, be more lenient with file size warnings
    const mobileMaxSize = isMobile ? 30 * 1024 * 1024 : 50 * 1024 * 1024; // 30MB for mobile, 50MB for desktop
    
    if (file.size > mobileMaxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (mobileMaxSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { success: false, error: `File size ${sizeMB}MB exceeds ${isMobile ? 'mobile' : 'desktop'} limit of ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'image/gif',  // Add GIF support
      'image/webp',  // Add WebP support
      'image/svg+xml',  // Add SVG support
      'application/pdf', 
      'audio/webm', 
      'audio/webm;codecs=opus',  // Android WebM with Opus codec
      'audio/webm;codecs=vorbis',  // WebM with Vorbis codec
      'audio/ogg', 
      'audio/ogg;codecs=opus',  // Ogg with Opus codec
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
        file.name.endsWith('.mp3') ||
        file.name.endsWith('.webm') ||  // Also accept WebM files
        file.name.endsWith('.ogg')
    )) {
      isValidType = true;
      console.log('🍎 iOS Safari audio file accepted by filename:', file.name);
    }
    
    // For Android, also accept WebM with codec variants
    const isAndroid = request.headers.get('user-agent')?.includes('Android');
    if (isAndroid && file.name && (
        file.name.endsWith('.webm') || 
        file.name.endsWith('.ogg')
    )) {
      isValidType = true;
      console.log('🤖 Android audio file accepted by filename:', file.name);
    }
    
    // For all devices, accept common image formats by filename if MIME type is missing
    if (file.name && (
        file.name.toLowerCase().endsWith('.jpg') || 
        file.name.toLowerCase().endsWith('.jpeg') || 
        file.name.toLowerCase().endsWith('.png') || 
        file.name.toLowerCase().endsWith('.gif') || 
        file.name.toLowerCase().endsWith('.webp') || 
        file.name.toLowerCase().endsWith('.svg') ||
        file.name.toLowerCase().endsWith('.pdf')
    )) {
      isValidType = true;
      console.log('📄 Document file accepted by filename:', file.name);
    }
    
    if (!isValidType) {
      console.error('❌ File type validation failed:', {
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        isIOS,
        isAndroid,
        userAgent: request.headers.get('user-agent'),
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