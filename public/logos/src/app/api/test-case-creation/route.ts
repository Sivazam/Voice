import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore'; // Add import

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing actual form submission...');
    
    const formData = await request.json();
    console.log('📥 Received form data:', formData);
    
    // Test case creation without attachments
    const caseData = {
      userId: formData.userId || 'test-user',
      patientName: formData.patientName || 'Test Patient',
      hospitalName: formData.hospitalName || 'Test Hospital',
      // ... all other fields from form
      issueCategories: formData.issueCategories || [],
      detailedDescription: formData.detailedDescription || 'Test description',
      attachments: formData.attachments || [] // This is the key field
    };
    
    console.log('📤 Creating case with data:', caseData);
    console.log('📥 Attachments in caseData:', caseData.attachments);
    
    // Create the case
    const newCase = await FirestoreService.createCase({
      userId: caseData.userId,
      status: 'PENDING',
      patientName: caseData.patientName,
      hospitalName: caseData.hospitalName,
      issueCategories: caseData.issueCategories,
      detailedDescription: caseData.detailedDescription,
      // ... other fields
    });
    
    console.log('✅ Case created with ID:', newCase.id);
    
    // Create attachment records if attachments exist
    if (caseData.attachments && caseData.attachments.length > 0) {
      console.log('📤 Creating attachment records:', caseData.attachments.length);
      
      for (const attachment of caseData.attachments) {
        try {
          const attachmentRecord = await FirestoreService.createAttachment({
            caseId: newCase.id,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            storagePath: attachment.storagePath || null
          });
          console.log('✅ Attachment record created:', attachment.fileName);
        } catch (error) {
          console.error('❌ Error creating attachment record:', error);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        caseId: newCase.id,
        message: 'Test case created successfully',
        attachmentsCreated: caseData.attachments?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Test case creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test case creation failed'
    });
  }
}