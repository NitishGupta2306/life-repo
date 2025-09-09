import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyQuests, characterProfile } from '../../../../../database/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuestsData = await db
      .select()
      .from(dailyQuests)
      .orderBy(dailyQuests.questName);

    // Calculate streaks and completion status for today
    const dailyQuestsWithStatus = dailyQuestsData.map(quest => {
      const lastCompleted = quest.lastCompleted;
      const isCompletedToday = lastCompleted && 
        new Date(lastCompleted).toDateString() === today.toDateString();

      // Check if streak is still active (completed yesterday or today)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let currentStreak = quest.streakCount;
      if (lastCompleted) {
        const lastCompletedDate = new Date(lastCompleted);
        const daysDiff = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
          // Streak is broken
          currentStreak = 0;
        }
      }

      return {
        ...quest,
        isCompletedToday,
        currentStreak,
        canComplete: !isCompletedToday,
      };
    });

    return NextResponse.json({
      success: true,
      data: dailyQuestsWithStatus,
    });

  } catch (error) {
    console.error('Error fetching daily quests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily quests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questName,
      xpReward = 5,
      skillTreeId,
      action = 'create' // 'create' or 'complete'
    } = body;

    if (action === 'complete') {
      // Complete an existing daily quest
      const questId = body.questId;
      if (!questId) {
        return NextResponse.json(
          { success: false, error: 'Quest ID is required for completion' },
          { status: 400 }
        );
      }

      const [dailyQuest] = await db
        .select()
        .from(dailyQuests)
        .where(eq(dailyQuests.id, questId));

      if (!dailyQuest) {
        return NextResponse.json(
          { success: false, error: 'Daily quest not found' },
          { status: 404 }
        );
      }

      // Check if already completed today
      const today = new Date();
      const lastCompleted = dailyQuest.lastCompleted;
      const isCompletedToday = lastCompleted && 
        new Date(lastCompleted).toDateString() === today.toDateString();

      if (isCompletedToday) {
        return NextResponse.json(
          { success: false, error: 'Quest already completed today' },
          { status: 400 }
        );
      }

      // Calculate new streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = dailyQuest.streakCount;
      if (lastCompleted) {
        const lastCompletedDate = new Date(lastCompleted);
        const daysDiff = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Continuing streak
          newStreak = dailyQuest.streakCount + 1;
        } else if (daysDiff > 1) {
          // Starting new streak
          newStreak = 1;
        } else {
          // Same day (shouldn't happen due to check above)
          newStreak = dailyQuest.streakCount;
        }
      } else {
        // First completion ever
        newStreak = 1;
      }

      // Update quest with completion
      const [updatedQuest] = await db
        .update(dailyQuests)
        .set({
          lastCompleted: today,
          streakCount: newStreak,
          bestStreak: Math.max(dailyQuest.bestStreak, newStreak),
        })
        .where(eq(dailyQuests.id, questId))
        .returning();

      // Award XP (with streak bonus)
      const streakBonus = Math.min(newStreak - 1, 10); // Max 10 bonus XP
      const totalXp = dailyQuest.xpReward + streakBonus;

      try {
        const [characterProfiles] = await db
          .select()
          .from(characterProfile)
          .limit(1);

        if (characterProfiles) {
          await db
            .update(characterProfile)
            .set({
              totalXp: (characterProfiles.totalXp || 0) + totalXp,
            })
            .where(eq(characterProfile.id, characterProfiles.id));
        }
      } catch (characterError) {
        console.warn('Could not update character XP:', characterError);
      }

      return NextResponse.json({
        success: true,
        message: 'Daily quest completed!',
        data: {
          ...updatedQuest,
          isCompletedToday: true,
          currentStreak: newStreak,
          canComplete: false,
        },
        rewards: {
          baseXp: dailyQuest.xpReward,
          streakBonus,
          totalXp,
        },
      });

    } else {
      // Create new daily quest
      if (!questName) {
        return NextResponse.json(
          { success: false, error: 'Quest name is required' },
          { status: 400 }
        );
      }

      const [newDailyQuest] = await db
        .insert(dailyQuests)
        .values({
          questName,
          xpReward,
          skillTreeId,
          streakCount: 0,
          bestStreak: 0,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: {
          ...newDailyQuest,
          isCompletedToday: false,
          currentStreak: 0,
          canComplete: true,
        },
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error with daily quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process daily quest' },
      { status: 500 }
    );
  }
}