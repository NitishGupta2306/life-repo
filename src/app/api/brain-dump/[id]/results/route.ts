import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brainDumps, aiProcessingResults } from '../../../../../../database/schemas/brain-dump';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brainDumpId } = await params;

    if (!brainDumpId) {
      return NextResponse.json(
        { error: 'Brain dump ID is required' },
        { status: 400 }
      );
    }

    // Get the brain dump with its processing results
    const [brainDump] = await db.select()
      .from(brainDumps)
      .where(eq(brainDumps.id, brainDumpId))
      .limit(1);

    if (!brainDump) {
      return NextResponse.json(
        { error: 'Brain dump not found' },
        { status: 404 }
      );
    }

    // Get AI processing results if they exist
    const processingResults = await db.select()
      .from(aiProcessingResults)
      .where(eq(aiProcessingResults.brainDumpId, brainDumpId));

    return NextResponse.json({
      success: true,
      data: {
        brainDump,
        processingResults,
        isProcessed: brainDump.processed,
        processingStatus: brainDump.processingStatus
      }
    });

  } catch (error) {
    console.error('Error fetching brain dump results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brain dump results' },
      { status: 500 }
    );
  }
}