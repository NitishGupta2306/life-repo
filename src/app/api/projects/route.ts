import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '../../../../database/simple-schema';

export async function GET(request: NextRequest) {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.name);
    
    return NextResponse.json({
      success: true,
      projects: allProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' }, 
      { status: 500 }
    );
  }
}