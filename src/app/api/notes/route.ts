import { NextRequest, NextResponse } from 'next/server';
import { getAllNotes } from '@/lib/services/note-manager';

export async function GET(request: NextRequest) {
  try {
    const notes = await getAllNotes();
    
    return NextResponse.json({
      success: true,
      notes: notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' }, 
      { status: 500 }
    );
  }
}