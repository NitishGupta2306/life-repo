import { NextRequest, NextResponse } from 'next/server';
import { getRecentIdeaDumps } from '@/lib/services/idea-processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const recentSubmissions = await getRecentIdeaDumps(limit);
    
    return NextResponse.json({
      success: true,
      submissions: recentSubmissions
    });
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent submissions' }, 
      { status: 500 }
    );
  }
}