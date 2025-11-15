import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing document upload flow...');
    
    const formData = await request.json();
    console.log('📥 Received form data:', formData);
    
    // Simulate file upload without actual files
    const mockUploadResult = {
      success: true,
      data: {
        fileName: 'test-document.pdf',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        storagePath: 'cases/2025/11/14/testcase123/documents/1234567890_test-document.pdf'
      }
    };
    
    // Simulate case creation
    const mockCaseData = {
      userId: formData.userId || 'test-user',
      patientName: 'Test Patient',
      attachments: [mockUploadResult] // Test with mock attachment
    };
    
    console.log('📤 Simulating case creation with attachments:', mockCaseData.attachments?.length);
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Test case created successfully',
        caseId: 'test-case-123',
        attachments: mockCaseData.attachments
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed'
    });
  }
}