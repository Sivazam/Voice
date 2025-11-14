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

    // Simplified approach - just get cases without complex queries
    console.log('📥 Using simplified case retrieval');
    const cases = await FirestoreService.getAllCases();
    console.log('📥 All cases count:', cases?.length || 0);
    
    // Filter cases by userId on client side
    const userCases = cases.filter(case_ => case_.userId === userId);
    console.log('📥 Filtered user cases count:', userCases?.length || 0);

    return NextResponse.json({
      success: true,
      data: userCases
    });
  } catch (error) {
    console.error('Get user cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}