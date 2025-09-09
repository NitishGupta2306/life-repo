import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brainDumps } from '../../../../database/schemas/brain-dump';
import { eq, desc, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, inputMethod = 'text', dumpCategory } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Raw text is required' },
        { status: 400 }
      );
    }

    // Insert the brain dump
    const [brainDump] = await db.insert(brainDumps).values({
      rawText: rawText.trim(),
      inputMethod,
      dumpCategory,
    }).returning();

    return NextResponse.json({
      success: true,
      data: brainDump
    });
  } catch (error) {
    console.error('Error creating brain dump:', error);
    return NextResponse.json(
      { error: 'Failed to create brain dump' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query with conditions
    let dumps;
    if (status && category) {
      dumps = await db.select()
        .from(brainDumps)
        .where(and(
          eq(brainDumps.processingStatus, status as 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed'),
          eq(brainDumps.dumpCategory, category as 'urgent' | 'random' | 'idea' | 'worry' | 'task' | 'memory')
        ))
        .orderBy(desc(brainDumps.createdAt))
        .limit(limit);
    } else if (status) {
      dumps = await db.select()
        .from(brainDumps)
        .where(eq(brainDumps.processingStatus, status as 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed'))
        .orderBy(desc(brainDumps.createdAt))
        .limit(limit);
    } else if (category) {
      dumps = await db.select()
        .from(brainDumps)
        .where(eq(brainDumps.dumpCategory, category as 'urgent' | 'random' | 'idea' | 'worry' | 'task' | 'memory'))
        .orderBy(desc(brainDumps.createdAt))
        .limit(limit);
    } else {
      dumps = await db.select()
        .from(brainDumps)
        .orderBy(desc(brainDumps.createdAt))
        .limit(limit);
    }

    return NextResponse.json({
      success: true,
      data: dumps
    });
  } catch (error) {
    console.error('Error fetching brain dumps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brain dumps' },
      { status: 500 }
    );
  }
}