<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quests, questObjectives, characterProfile } from '../../../../../../database/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
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

    if (quest.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Quest is already completed' },
        { status: 400 }
      );
    }

    // Check if all required objectives are completed
    const objectives = await db
      .select()
      .from(questObjectives)
      .where(eq(questObjectives.questId, questId));

    const requiredObjectives = objectives.filter(obj => obj.isRequired);
    const completedRequiredObjectives = requiredObjectives.filter(obj => obj.isCompleted);

    if (completedRequiredObjectives.length < requiredObjectives.length) {
      const remainingObjectives = requiredObjectives.filter(obj => !obj.isCompleted);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot complete quest: required objectives are not finished',
          remainingObjectives: remainingObjectives.map(obj => obj.objectiveText)
        },
        { status: 400 }
      );
    }

    // Mark the quest as completed
    const [completedQuest] = await db
      .update(quests)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(quests.id, questId))
      .returning();

    // Award XP to character profile (assuming there's a character profile)
    // Note: This assumes there's a single character profile. In a multi-user system,
    // you'd need to identify the specific user/character
    try {
      const [characterProfiles] = await db
        .select()
        .from(characterProfile)
        .limit(1);

      if (characterProfiles) {
        await db
          .update(characterProfile)
          .set({
            totalXp: (characterProfiles.totalXp || 0) + quest.xpReward,
          })
          .where(eq(characterProfile.id, characterProfiles.id));
      }
    } catch (characterError) {
      // Log the error but don't fail the quest completion
      console.warn('Could not update character XP:', characterError);
    }

    // Calculate final progress
    const completedObjectives = objectives.filter(obj => obj.isCompleted).length;
    const totalObjectives = objectives.length;
    const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 100;

    const questWithDetails = {
      ...completedQuest,
      objectives,
      progress: Math.round(progress),
      totalObjectives,
      completedObjectives,
    };

    return NextResponse.json({
      success: true,
      message: 'Quest completed successfully!',
      data: questWithDetails,
      rewards: {
        xp: quest.xpReward,
        gold: quest.goldReward,
        skillTreeRewards: quest.skillTreeRewards,
      },
    });

  } catch (error) {
    console.error('Error completing quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete quest' },
      { status: 500 }
    );
  }
}
=======
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';

// POST /api/quests/[id]/complete - Complete a quest
const completeQuestSchema = z.object({
  characterId: z.string(),
  completedObjectives: z.array(z.string()).optional(),
});

export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body = await request.json();
  
  const validation = completeQuestSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, completedObjectives } = validation.data;

  try {
    // Mock quest completion - in real app would:
    // 1. Update quest status to completed
    // 2. Mark objectives as completed
    // 3. Award XP and update resources
    // 4. Check for achievements
    // 5. Generate completion notifications

    const completedQuest = {
      id,
      title: 'Complete morning routine',
      description: 'Start your day with intention',
      questType: 'daily',
      status: 'completed',
      xpReward: 50,
      energyCost: 5,
      completedAt: new Date(),
      objectives: [
        { id: 'obj-1', description: 'Drink a glass of water', completed: true },
        { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: true },
        { id: 'obj-3', description: 'Plan top 3 priorities', completed: true },
      ],
    };

    // Award XP for quest completion
    const xpResult = await CharacterService.addXP(characterId, completedQuest.xpReward);

    // Update character resources (restore energy if negative cost, consume if positive)
    const resourceUpdate = await CharacterService.updateResource(
      characterId, 
      'energy', 
      -completedQuest.energyCost
    );

    const response = {
      quest: completedQuest,
      rewards: {
        xp: completedQuest.xpReward,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
        energyChange: -completedQuest.energyCost,
        newEnergyValue: resourceUpdate.currentValue,
      },
      achievements: [], // Would check for new achievements in real app
      message: xpResult.leveledUp 
        ? `Quest completed! Congratulations on reaching level ${xpResult.newLevel}!`
        : 'Quest completed successfully!',
    };

    return ApiResponseHelper.success(response, response.message);
  } catch (error) {
    console.error('Failed to complete quest:', error);
    return ApiResponseHelper.serverError('Failed to complete quest');
  }
});
>>>>>>> feature/backend-infrastructure
