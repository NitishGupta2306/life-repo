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