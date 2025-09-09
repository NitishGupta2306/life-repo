import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { basicNeeds, needCompletions } from '../../../../../database/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all basic needs with their completion status
    const needs = await db
      .select({
        id: basicNeeds.id,
        needName: basicNeeds.needName,
        needCategory: basicNeeds.needCategory,
        priority: basicNeeds.priority,
        idealFrequency: basicNeeds.idealFrequency,
        lastCompleted: basicNeeds.lastCompleted,
        streakCount: basicNeeds.streakCount,
        isOverdue: basicNeeds.isOverdue,
        reminderEnabled: basicNeeds.reminderEnabled,
        xpReward: basicNeeds.xpReward,
      })
      .from(basicNeeds);

    return NextResponse.json({ needs });
  } catch (error) {
    console.error('Error fetching basic needs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic needs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { needId, difficultyRating, energyBefore, energyAfter, notes } = body;

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Record the completion
    const completion = await db
      .insert(needCompletions)
      .values({
        needId,
        difficultyRating: difficultyRating || null,
        energyBefore: energyBefore || null,
        energyAfter: energyAfter || null,
        notes: notes || null,
      })
      .returning();

    // Update the basic need record
    await db
      .update(basicNeeds)
      .set({
        lastCompleted: new Date(),
        streakCount: db.$count(), // This should be calculated properly
        isOverdue: false,
      })
      .where(eq(basicNeeds.id, needId));

    return NextResponse.json({ 
      message: 'Need completed successfully!',
      completion: completion[0]
    });
  } catch (error) {
    console.error('Error completing basic need:', error);
    return NextResponse.json(
      { error: 'Failed to complete basic need' },
      { status: 500 }
    );
  }
}