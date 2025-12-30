import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('📥 Cases user API called with userId:', userId);
    
    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('📥 About to call FirestoreService.getUserCases');
    const cases = await FirestoreService.getUserCases(userId);
    console.log('📥 Firestore returned cases:', cases?.length || 0);

    return NextResponse.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('Get user cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}