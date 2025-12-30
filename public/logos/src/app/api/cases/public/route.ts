import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/lib/firestore';
import { ApiResponse, Case, CaseStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'latest';

    // Get all approved cases from Firestore
    let cases = await FirestoreService.getAllCases(CaseStatus.APPROVED) as unknown as Case[];

    // Filter for public cases only
    cases = cases.filter(case_ => case_.isPublic);

    // Apply additional filters
    if (state && state !== 'All States') {
      cases = cases.filter(case_ => case_.capturedAddress && case_.capturedAddress.toLowerCase().includes(state.toLowerCase()));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      cases = cases.filter(case_ => 
        case_.caseTitle.toLowerCase().includes(searchLower) ||
        case_.name.toLowerCase().includes(searchLower) ||
        case_.caseDescription.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'All Categories') {
      cases = cases.filter(case_ => case_.mainCategory === category);
    }

    // Sort cases
    if (sortBy === 'oldest') {
      cases.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    } else if (sortBy === 'popular') {
      cases.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      // Default: latest first
      cases.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    const response: ApiResponse<Case[]> = {
      success: true,
      data: cases
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Public cases fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}