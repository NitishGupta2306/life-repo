import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  characterProfile, 
  characterStats,
  quests, 
  questObjectives,
  dailyQuests,
  dailyReflections,
  weeklyReflections 
} from '../../../../../database/schema';
import { eq, desc, gte, count, sum, avg, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period, 10);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    // Character progress
    const character = await db
      .select()
      .from(characterProfile)
      .limit(1);

    const characterStatsData = await db
      .select()
      .from(characterStats);

    // Quest completion stats
    const questStats = await db
      .select({
        total: count(),
        completed: count(quests.completedAt)
      })
      .from(quests);

    const recentQuests = await db
      .select({
        completed: count()
      })
      .from(quests)
      .where(
        and(
          gte(quests.completedAt, startDate),
          eq(quests.status, 'completed')
        )
      );

    // Daily quest streaks
    const dailyQuestStats = await db
      .select({
        totalQuests: count(),
        avgStreak: avg(dailyQuests.streakCount),
        bestStreak: sum(dailyQuests.bestStreak)
      })
      .from(dailyQuests);

    // Reflection consistency
    const reflectionStats = await db
      .select({
        dailyCount: count()
      })
      .from(dailyReflections)
      .where(gte(dailyReflections.reflectionDate, startDateString));

    const weeklyReflectionCount = await db
      .select({
        weeklyCount: count()
      })
      .from(weeklyReflections)
      .where(gte(weeklyReflections.weekStart, startDateString));

    // Recent mood trends (from daily reflections)
    const moodTrends = await db
      .select({
        date: dailyReflections.reflectionDate,
        energyLevel: dailyReflections.energyLevel,
        focusLevel: dailyReflections.focusLevel,
        moodTags: dailyReflections.moodTags
      })
      .from(dailyReflections)
      .where(gte(dailyReflections.reflectionDate, startDateString))
      .orderBy(desc(dailyReflections.reflectionDate))
      .limit(30);

    // Calculate streak for daily reflections
    let reflectionStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();
    
    // Check if today has a reflection first
    const todayReflection = await db
      .select()
      .from(dailyReflections)
      .where(eq(dailyReflections.reflectionDate, today))
      .limit(1);

    if (todayReflection.length === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count consecutive days with reflections
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

    // Aggregate the stats
    const progressStats = {
      character: {
        level: character[0]?.characterLevel || 0,
        totalXp: character[0]?.totalXp || 0,
        name: character[0]?.characterName || 'Unnamed Hero',
        stats: characterStatsData
      },
      quests: {
        totalQuests: questStats[0]?.total || 0,
        completedQuests: questStats[0]?.completed || 0,
        recentCompletions: recentQuests[0]?.completed || 0,
        completionRate: questStats[0]?.total > 0 
          ? ((questStats[0]?.completed || 0) / questStats[0].total * 100).toFixed(1)
          : '0'
      },
      dailyQuests: {
        totalDailyQuests: dailyQuestStats[0]?.totalQuests || 0,
        averageStreak: Math.round(Number(dailyQuestStats[0]?.avgStreak) || 0),
        bestCombinedStreak: dailyQuestStats[0]?.bestStreak || 0
      },
      reflections: {
        dailyReflectionsCount: reflectionStats[0]?.dailyCount || 0,
        weeklyReflectionsCount: weeklyReflectionCount[0]?.weeklyCount || 0,
        currentStreak: reflectionStreak,
        consistencyRate: periodDays > 0 
          ? ((reflectionStats[0]?.dailyCount || 0) / periodDays * 100).toFixed(1)
          : '0'
      },
      mood: {
        trends: moodTrends.map(trend => ({
          date: trend.date,
          energy: trend.energyLevel,
          focus: trend.focusLevel,
          tags: trend.moodTags || []
        })),
        averageEnergy: moodTrends.length > 0 
          ? (moodTrends.reduce((sum, trend) => sum + (trend.energyLevel || 0), 0) / moodTrends.length).toFixed(1)
          : '0',
        averageFocus: moodTrends.length > 0 
          ? (moodTrends.reduce((sum, trend) => sum + (trend.focusLevel || 0), 0) / moodTrends.length).toFixed(1)
          : '0'
      },
      period: `${periodDays} days`
    };

    return NextResponse.json({
      success: true,
      data: progressStats
    });

  } catch (error) {
    console.error('Error fetching progress stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress statistics' },
      { status: 500 }
    );
  }
}