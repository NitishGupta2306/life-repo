import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brainDumps, aiProcessingResults } from '../../../../../database/schemas/brain-dump';
import { eq } from 'drizzle-orm';
import { processWithAI } from '@/lib/ai-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brainDumpId } = body;

    if (!brainDumpId) {
      return NextResponse.json(
        { error: 'Brain dump ID is required' },
        { status: 400 }
      );
    }

    // First, get the brain dump
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

    // Check if already processed
    if (brainDump.processed) {
      return NextResponse.json(
        { error: 'Brain dump already processed' },
        { status: 400 }
      );
    }

    // Update status to processing
    await db.update(brainDumps)
      .set({ 
        processingStatus: 'processing' 
      })
      .where(eq(brainDumps.id, brainDumpId));

    try {
      // Process with AI
      const aiResult = await processWithAI(brainDump.rawText);
      
      // Save AI processing results
      const [processingResult] = await db.insert(aiProcessingResults).values({
        brainDumpId: brainDumpId,
        aiInterpretation: aiResult.interpretation,
        suggestedAction: aiResult.suggestedAction,
        detectedUrgency: aiResult.detectedUrgency,
        detectedEmotion: aiResult.detectedEmotions,
        suggestedSkillTrees: aiResult.suggestedSkillTrees,
        suggestedQuestType: aiResult.suggestedQuestType,
        extractedEntities: aiResult.extractedEntities,
      }).returning();

      // Update brain dump as processed
      await db.update(brainDumps)
        .set({ 
          processed: true,
          processingStatus: 'completed',
          confidenceScore: aiResult.confidenceScore.toString(),
          requiresHumanReview: aiResult.requiresHumanReview
        })
        .where(eq(brainDumps.id, brainDumpId));

      return NextResponse.json({
        success: true,
        data: {
          brainDump,
          processingResult,
          aiResult
        }
      });

    } catch (aiError) {
      console.error('AI processing failed:', aiError);
      
      // Update status to failed
      await db.update(brainDumps)
        .set({ 
          processingStatus: 'failed' 
        })
        .where(eq(brainDumps.id, brainDumpId));

      return NextResponse.json(
        { error: 'AI processing failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing brain dump:', error);
    return NextResponse.json(
      { error: 'Failed to process brain dump' },
      { status: 500 }
    );
  }
}