import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questObjectives, quests, characterProfile } from '../../../../../../../database/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const objectiveId = params.id;

    // Fetch the objective
    const [objective] = await db
      .select()
      .from(questObjectives)
      .where(eq(questObjectives.id, objectiveId));

    if (!objective) {
      return NextResponse.json(
        { success: false, error: 'Objective not found' },
        { status: 404 }
      );
    }

    if (objective.isCompleted) {
      return NextResponse.json(
        { success: false, error: 'Objective is already completed' },
        { status: 400 }
      );
    }

    // Mark the objective as completed
    const [completedObjective] = await db
      .update(questObjectives)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(eq(questObjectives.id, objectiveId))
      .returning();

    // Award XP for the objective completion
    try {
      const [characterProfiles] = await db
        .select()
        .from(characterProfile)
        .limit(1);

      if (characterProfiles) {
        await db
          .update(characterProfile)
          .set({
            totalXp: (characterProfiles.totalXp || 0) + objective.xpReward,
          })
          .where(eq(characterProfile.id, characterProfiles.id));
      }
    } catch (characterError) {
      console.warn('Could not update character XP for objective:', characterError);
    }

    // Check if this completes the quest (all required objectives done)
    const allObjectives = await db
      .select()
      .from(questObjectives)
      .where(eq(questObjectives.questId, objective.questId));

    const requiredObjectives = allObjectives.filter(obj => obj.isRequired);
    const completedRequiredObjectives = requiredObjectives.filter(obj => obj.isCompleted || obj.id === objectiveId);

    let questCompleted = false;
    let updatedQuest = null;

    if (completedRequiredObjectives.length === requiredObjectives.length) {
      // All required objectives are complete, auto-complete the quest
      const [quest] = await db
        .select()
        .from(quests)
        .where(eq(quests.id, objective.questId));

      if (quest && quest.status !== 'completed') {
        [updatedQuest] = await db
          .update(quests)
          .set({
            status: 'completed',
            completedAt: new Date(),
          })
          .where(eq(quests.id, objective.questId))
          .returning();

        questCompleted = true;

        // Award quest XP
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
          console.warn('Could not update character XP for quest completion:', characterError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Objective completed successfully!',
      data: {
        objective: completedObjective,
        questCompleted,
        quest: updatedQuest,
      },
      rewards: {
        objectiveXp: objective.xpReward,
        questXp: questCompleted && updatedQuest ? updatedQuest.xpReward : 0,
      },
    });

  } catch (error) {
    console.error('Error completing objective:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete objective' },
      { status: 500 }
    );
  }
}