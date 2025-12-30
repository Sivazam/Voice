import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    
    if (!caseId) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      );
    }

    console.log('📥 Fetching case with ID:', caseId);
    
    // Fetch case using FirestoreService
    const caseData = await FirestoreService.getCase(caseId);
    
    if (!caseData) {
      console.log('❌ Case not found:', caseId);
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    console.log('✅ Successfully fetched case:', caseId);
    
    return NextResponse.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    console.error('🔥 Error fetching case:', error);
    console.error('Error details:', {
      message: (error as Error).message || 'Unknown error',
      stack: (error as Error).stack || 'No stack available',
      code: (error as any).code || 'Unknown code'
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}