import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  achievements, 
  adhdAchievements, 
  characterProfile,
  dailyReflections,
  quests,
  dailyQuests
} from '../../../../../database/schema';
import { eq, desc, gte, count, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for updating achievement progress
const updateAchievementSchema = z.object({
  achievementId: z.string().uuid(),
  progress: z.number().min(0),
  unlocked: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const unlocked = searchParams.get('unlocked');
    const includeProgress = searchParams.get('includeProgress') === 'true';

    // Get all achievements
    let achievementQuery = db.select().from(achievements);
    if (category) {
      achievementQuery = achievementQuery.where(eq(achievements.category, category));
    }
    if (unlocked !== null) {
      const isUnlocked = unlocked === 'true';
      achievementQuery = achievementQuery.where(eq(achievements.unlocked, isUnlocked));
    }

    const regularAchievements = await achievementQuery.orderBy(desc(achievements.unlockedAt));

    // Get ADHD-specific achievements
    let adhdQuery = db.select().from(adhdAchievements);
    if (category) {
      adhdQuery = adhdQuery.where(eq(adhdAchievements.category, category));
    }
    if (unlocked !== null) {
      const isUnlocked = unlocked === 'true';
      adhdQuery = adhdQuery.where(eq(adhdAchievements.unlocked, isUnlocked));
    }

    const adhdAchievementsData = await adhdQuery.orderBy(desc(adhdAchievements.unlockedAt));

    let progressData = null;
    if (includeProgress) {
      // Calculate current progress towards locked achievements
      progressData = await calculateAchievementProgress();
    }

    // Categorize achievements
    const categorizedAchievements = {
      character: regularAchievements.filter(a => a.category === 'character'),
      quest: regularAchievements.filter(a => a.category === 'quest'),
      social: regularAchievements.filter(a => a.category === 'social'),
      exploration: regularAchievements.filter(a => a.category === 'exploration'),
      legendary: regularAchievements.filter(a => a.category === 'legendary'),
      adhd: {
        self_care: adhdAchievementsData.filter(a => a.category === 'self_care'),
        reflection: adhdAchievementsData.filter(a => a.category === 'reflection'),
        streak: adhdAchievementsData.filter(a => a.category === 'streak'),
        combo: adhdAchievementsData.filter(a => a.category === 'combo'),
        boss_defeat: adhdAchievementsData.filter(a => a.category === 'boss_defeat')
      }
    };

    // Calculate achievement statistics
    const stats = {
      totalAchievements: regularAchievements.length + adhdAchievementsData.length,
      unlockedAchievements: regularAchievements.filter(a => a.unlocked).length + 
                           adhdAchievementsData.filter(a => a.unlocked).length,
      totalXpEarned: regularAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpBonus, 0) +
                     adhdAchievementsData.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
      recentUnlocks: [
        ...regularAchievements.filter(a => a.unlocked && a.unlockedAt).slice(0, 5),
        ...adhdAchievementsData.filter(a => a.unlocked && a.unlockedAt).slice(0, 5)
      ].sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()).slice(0, 5)
    };

    stats.completionPercentage = stats.totalAchievements > 0 
      ? Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        achievements: categorizedAchievements,
        stats,
        progress: progressData
      }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateAchievementSchema.parse(body);

    const { achievementId, progress, unlocked } = validatedData;

    // Update regular achievement
    const regularAchievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (regularAchievement.length > 0) {
      const updateData: any = { progressCurrent: progress };
      
      // Check if achievement should be unlocked
      if (progress >= regularAchievement[0].progressRequired || unlocked === true) {
        updateData.unlocked = true;
        updateData.unlockedAt = new Date();
      }

      const [updatedAchievement] = await db
        .update(achievements)
        .set(updateData)
        .where(eq(achievements.id, achievementId))
        .returning();

      return NextResponse.json({
        success: true,
        data: updatedAchievement,
        message: updateData.unlocked ? 'Achievement unlocked!' : 'Progress updated'
      });
    }

    // Try ADHD achievements
    const adhdAchievement = await db
      .select()
      .from(adhdAchievements)
      .where(eq(adhdAchievements.id, achievementId))
      .limit(1);

    if (adhdAchievement.length > 0) {
      const updateData: any = {};
      
      if (unlocked === true) {
        updateData.unlocked = true;
        updateData.unlockedAt = new Date();
      }

      const [updatedAchievement] = await db
        .update(adhdAchievements)
        .set(updateData)
        .where(eq(adhdAchievements.id, achievementId))
        .returning();

      return NextResponse.json({
        success: true,
        data: updatedAchievement,
        message: 'ADHD Achievement unlocked!'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Achievement not found' },
      { status: 404 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}

// Helper function to calculate current progress towards achievements
async function calculateAchievementProgress() {
  try {
    // Get character data
    const character = await db.select().from(characterProfile).limit(1);
    const characterData = character[0];

    // Get quest completion counts
    const questStats = await db
      .select({
        completed: count()
      })
      .from(quests)
      .where(eq(quests.status, 'completed'));

    // Get daily quest streak info
    const dailyQuestStreaks = await db
      .select()
      .from(dailyQuests);

    // Get reflection streak
    const reflectionCount = await db
      .select({
        count: count()
      })
      .from(dailyReflections);

    // Calculate current reflection streak
    let reflectionStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();
    
    const todayReflection = await db
      .select()
      .from(dailyReflections)
      .where(eq(dailyReflections.reflectionDate, today))
      .limit(1);

    if (todayReflection.length === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const reflection = await db
        .select()
        .from(dailyReflections)
        .where(eq(dailyReflections.reflectionDate, dateStr))
        .limit(1);
      
      if (reflection.length === 0) break;
      
      reflectionStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      characterLevel: characterData?.characterLevel || 0,
      totalXp: characterData?.totalXp || 0,
      questsCompleted: questStats[0]?.completed || 0,
      bestDailyStreak: Math.max(...dailyQuestStreaks.map(q => q.bestStreak), 0),
      currentReflectionStreak: reflectionStreak,
      totalReflections: reflectionCount[0]?.count || 0
    };

  } catch (error) {
    console.error('Error calculating achievement progress:', error);
    return null;
  }
}