<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quests, questObjectives, questSkillTrees } from '../../../../../database/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id;

    // Fetch the quest
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

    // Fetch objectives
    const objectives = await db
      .select()
      .from(questObjectives)
      .where(eq(questObjectives.questId, questId))
      .orderBy(questObjectives.objectiveOrder);

    // Calculate progress
    const completedObjectives = objectives.filter(obj => obj.isCompleted).length;
    const totalObjectives = objectives.length;
    const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

    const questWithDetails = {
      ...quest,
      objectives,
      progress: Math.round(progress),
      totalObjectives,
      completedObjectives,
    };

    return NextResponse.json({
      success: true,
      data: questWithDetails,
    });

  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quest' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id;
    const body = await request.json();
    const { 
      questName, 
      questDescription, 
      questType,
      difficulty,
      xpReward,
      goldReward,
      skillTreeRewards,
      status,
      timeLimit,
    } = body;

    // Check if quest exists
    const [existingQuest] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, questId));

    if (!existingQuest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Update the quest
    const [updatedQuest] = await db
      .update(quests)
      .set({
        questName: questName || existingQuest.questName,
        questDescription: questDescription !== undefined ? questDescription : existingQuest.questDescription,
        questType: questType || existingQuest.questType,
        difficulty: difficulty || existingQuest.difficulty,
        xpReward: xpReward !== undefined ? xpReward : existingQuest.xpReward,
        goldReward: goldReward !== undefined ? goldReward : existingQuest.goldReward,
        skillTreeRewards: skillTreeRewards !== undefined ? skillTreeRewards : existingQuest.skillTreeRewards,
        status: status || existingQuest.status,
        timeLimit: timeLimit !== undefined ? timeLimit : existingQuest.timeLimit,
      })
      .where(eq(quests.id, questId))
      .returning();

    // If status changed to 'active', set startedAt
    if (status === 'active' && !existingQuest.startedAt) {
      await db
        .update(quests)
        .set({ startedAt: new Date() })
        .where(eq(quests.id, questId));
    }

    // If status changed to 'completed', set completedAt
    if (status === 'completed' && !existingQuest.completedAt) {
      await db
        .update(quests)
        .set({ completedAt: new Date() })
        .where(eq(quests.id, questId));
    }

    // Fetch updated quest with objectives
    const objectives = await db
      .select()
      .from(questObjectives)
      .where(eq(questObjectives.questId, questId))
      .orderBy(questObjectives.objectiveOrder);

    const completedObjectives = objectives.filter(obj => obj.isCompleted).length;
    const totalObjectives = objectives.length;
    const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

    const questWithDetails = {
      ...updatedQuest,
      objectives,
      progress: Math.round(progress),
      totalObjectives,
      completedObjectives,
    };

    return NextResponse.json({
      success: true,
      data: questWithDetails,
    });

  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quest' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = params.id;

    // Check if quest exists
    const [existingQuest] = await db
      .select()
      .from(quests)
      .where(eq(quests.id, questId));

    if (!existingQuest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Delete objectives first (foreign key constraint)
    await db
      .delete(questObjectives)
      .where(eq(questObjectives.questId, questId));

    // Delete quest skill trees
    await db
      .delete(questSkillTrees)
      .where(eq(questSkillTrees.questId, questId));

    // Delete the quest
    await db
      .delete(quests)
      .where(eq(quests.id, questId));

    return NextResponse.json({
      success: true,
      message: 'Quest deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quest' },
      { status: 500 }
    );
  }
}
=======
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// GET /api/quests/[id] - Get specific quest
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Mock quest lookup - in real app would query database
  const mockQuest = {
    id,
    title: 'Complete morning routine',
    description: 'Start your day with intention: wake up, hydrate, exercise, and plan your day',
    questType: 'daily',
    status: 'in_progress',
    xpReward: 50,
    energyCost: 5,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    objectives: [
      { id: 'obj-1', description: 'Drink a glass of water', completed: true },
      { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: false },
      { id: 'obj-3', description: 'Plan top 3 priorities', completed: false },
    ],
  };

  return ApiResponseHelper.success(mockQuest);
});

// PUT /api/quests/[id] - Update quest
const updateQuestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body = await request.json();
  
  const validation = updateQuestSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const updates = validation.data;

  // Mock quest update - in real app would update database
  const updatedQuest = {
    id,
    title: updates.title || 'Complete morning routine',
    description: updates.description || 'Start your day with intention',
    questType: 'daily',
    status: updates.status || 'in_progress',
    xpReward: 50,
    energyCost: 5,
    createdAt: new Date(),
    dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
    objectives: [
      { id: 'obj-1', description: 'Drink a glass of water', completed: true },
      { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: false },
      { id: 'obj-3', description: 'Plan top 3 priorities', completed: false },
    ],
  };

  return ApiResponseHelper.success(updatedQuest, 'Quest updated successfully');
});

// DELETE /api/quests/[id] - Delete quest
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Mock quest deletion - in real app would delete from database
  console.log('Deleting quest:', id);

  return ApiResponseHelper.success({ deletedId: id }, 'Quest deleted successfully');
});
>>>>>>> feature/backend-infrastructure
