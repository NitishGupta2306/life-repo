import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questObjectives, quests } from '../../../../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const questId = searchParams.get('questId');
    const completed = searchParams.get('completed');

    let whereConditions = [];

    if (questId) {
      whereConditions.push(eq(questObjectives.questId, questId));
    }

    if (completed !== null) {
      whereConditions.push(eq(questObjectives.isCompleted, completed === 'true'));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions)
      : undefined;

    const objectives = await db
      .select()
      .from(questObjectives)
      .where(whereClause)
      .orderBy(questObjectives.objectiveOrder);

    return NextResponse.json({
      success: true,
      data: objectives,
    });

  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch objectives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questId,
      objectiveText,
      objectiveOrder = 1,
      isRequired = true,
      xpReward = 10,
    } = body;

    // Validate required fields
    if (!questId || !objectiveText) {
      return NextResponse.json(
        { success: false, error: 'Quest ID and objective text are required' },
        { status: 400 }
      );
    }

    // Verify quest exists
    const [quest] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, questId));

    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Create the objective
    const [newObjective] = await db
      .insert(questObjectives)
      .values({
        questId,
        objectiveText,
        objectiveOrder,
        isRequired,
        xpReward,
        isCompleted: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newObjective,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create objective' },
      { status: 500 }
    );
  }
}