import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  dailyReflections, 
  weeklyReflections,
  behaviorPatterns,
  quests,
  dailyQuests,
  characterProfile
} from '../../../../../database/schema';
import { desc, gte, eq, count, avg } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'patterns', 'mood', 'progress', 'recommendations', 'all'
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period, 10);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    const insights: any = {
      generatedAt: new Date().toISOString(),
      period: `${periodDays} days`,
      insights: []
    };

    // Pattern insights
    if (type === 'patterns' || type === 'all') {
      const patternInsights = await generatePatternInsights(startDateString);
      insights.insights.push(...patternInsights);
    }

    // Mood insights
    if (type === 'mood' || type === 'all') {
      const moodInsights = await generateMoodInsights(startDateString);
      insights.insights.push(...moodInsights);
    }

    // Progress insights
    if (type === 'progress' || type === 'all') {
      const progressInsights = await generateProgressInsights(startDateString);
      insights.insights.push(...progressInsights);
    }

    // Personalized recommendations
    if (type === 'recommendations' || type === 'all') {
      const recommendations = await generateRecommendations(startDateString);
      insights.insights.push(...recommendations);
    }

    // Sort insights by priority
    insights.insights.sort((a: any, b: any) => b.priority - a.priority);

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

async function generatePatternInsights(startDate: string) {
  const insights = [];

  // Get behavioral patterns
  const patterns = await db
    .select()
    .from(behaviorPatterns)
    .where(gte(behaviorPatterns.lastObserved, startDate))
    .orderBy(desc(behaviorPatterns.frequency));

  // Identify frequent harmful patterns
  const harmfulPatterns = patterns.filter(p => p.patternType === 'harmful' && p.frequency >= 3);
  if (harmfulPatterns.length > 0) {
    insights.push({
      type: 'pattern_warning',
      priority: 9,
      title: 'Recurring Challenge Detected',
      description: `You've experienced "${harmfulPatterns[0].patternName}" ${harmfulPatterns[0].frequency} times recently. Consider developing strategies to address this pattern.`,
      actionable: true,
      category: 'patterns',
      data: { pattern: harmfulPatterns[0] }
    });
  }

  // Highlight helpful patterns
  const helpfulPatterns = patterns.filter(p => p.patternType === 'helpful' && p.frequency >= 2);
  if (helpfulPatterns.length > 0) {
    insights.push({
      type: 'pattern_success',
      priority: 7,
      title: 'Positive Pattern Identified',
      description: `Great job! "${helpfulPatterns[0].patternName}" has been working well for you. Consider leveraging this strategy more often.`,
      actionable: false,
      category: 'patterns',
      data: { pattern: helpfulPatterns[0] }
    });
  }

  return insights;
}

async function generateMoodInsights(startDate: string) {
  const insights = [];

  // Get mood data
  const moodData = await db
    .select({
      date: dailyReflections.reflectionDate,
      energyLevel: dailyReflections.energyLevel,
      focusLevel: dailyReflections.focusLevel,
      moodTags: dailyReflections.moodTags
    })
    .from(dailyReflections)
    .where(gte(dailyReflections.reflectionDate, startDate))
    .orderBy(desc(dailyReflections.reflectionDate));

  if (moodData.length > 0) {
    const avgEnergy = moodData.reduce((sum, d) => sum + (d.energyLevel || 0), 0) / moodData.length;
    const avgFocus = moodData.reduce((sum, d) => sum + (d.focusLevel || 0), 0) / moodData.length;

    // Low energy pattern
    if (avgEnergy < 4) {
      insights.push({
        type: 'mood_concern',
        priority: 8,
        title: 'Energy Levels Need Attention',
        description: `Your average energy level has been ${avgEnergy.toFixed(1)}/10 recently. Consider reviewing your sleep, nutrition, and basic needs.`,
        actionable: true,
        category: 'mood',
        data: { avgEnergy, recommendation: 'focus_on_basic_needs' }
      });
    }

    // Focus challenges
    if (avgFocus < 4) {
      insights.push({
        type: 'focus_concern',
        priority: 8,
        title: 'Focus Challenges Detected',
        description: `Your focus levels have averaged ${avgFocus.toFixed(1)}/10. Consider ADHD support strategies or adjusting your environment.`,
        actionable: true,
        category: 'mood',
        data: { avgFocus, recommendation: 'adhd_strategies' }
      });
    }

    // Good energy/focus streak
    const recentGoodDays = moodData.slice(0, 7).filter(d => (d.energyLevel || 0) >= 6 && (d.focusLevel || 0) >= 6);
    if (recentGoodDays.length >= 5) {
      insights.push({
        type: 'mood_celebration',
        priority: 6,
        title: 'Excellent Week!',
        description: `You've had ${recentGoodDays.length} good days this week with both energy and focus above 6. Keep up whatever you're doing!`,
        actionable: false,
        category: 'mood',
        data: { goodDaysCount: recentGoodDays.length }
      });
    }

    // Mood tag analysis
    const allMoodTags = moodData.flatMap(d => d.moodTags || []);
    const moodTagFreq: { [key: string]: number } = {};
    allMoodTags.forEach(tag => {
      moodTagFreq[tag] = (moodTagFreq[tag] || 0) + 1;
    });

    const mostCommonMood = Object.entries(moodTagFreq)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonMood && mostCommonMood[1] >= 3) {
      const isNegativeMood = ['anxious', 'stressed', 'overwhelmed', 'frustrated', 'tired'].includes(mostCommonMood[0]);
      if (isNegativeMood) {
        insights.push({
          type: 'mood_pattern',
          priority: 7,
          title: 'Recurring Mood Pattern',
          description: `You've been feeling "${mostCommonMood[0]}" frequently (${mostCommonMood[1]} times). Consider strategies to address this recurring state.`,
          actionable: true,
          category: 'mood',
          data: { mood: mostCommonMood[0], frequency: mostCommonMood[1] }
        });
      }
    }
  }

  return insights;
}

async function generateProgressInsights(startDate: string) {
  const insights = [];

  // Get character and quest data
  const character = await db.select().from(characterProfile).limit(1);
  const completedQuests = await db
    .select({ count: count() })
    .from(quests)
    .where(eq(quests.status, 'completed'));

  const recentQuests = await db
    .select({ count: count() })
    .from(quests)
    .where(
      gte(quests.completedAt, new Date(startDate))
    );

  // Quest completion insights
  if (recentQuests[0]?.count === 0) {
    insights.push({
      type: 'progress_concern',
      priority: 8,
      title: 'No Recent Quest Completions',
      description: 'You haven\'t completed any quests recently. Consider starting with smaller, achievable goals to build momentum.',
      actionable: true,
      category: 'progress',
      data: { recommendation: 'start_small_quests' }
    });
  } else if ((recentQuests[0]?.count || 0) >= 5) {
    insights.push({
      type: 'progress_celebration',
      priority: 6,
      title: 'Quest Completion Streak!',
      description: `Excellent work! You've completed ${recentQuests[0]?.count} quests recently. You're building great momentum.`,
      actionable: false,
      category: 'progress',
      data: { questsCompleted: recentQuests[0]?.count }
    });
  }

  // Character level insights
  if (character[0] && character[0].characterLevel >= 25) {
    insights.push({
      type: 'progress_milestone',
      priority: 5,
      title: 'Wisdom Milestone Reached',
      description: `At level ${character[0].characterLevel}, you've gained significant life experience. Consider mentoring others or taking on leadership quests.`,
      actionable: true,
      category: 'progress',
      data: { level: character[0].characterLevel }
    });
  }

  return insights;
}

async function generateRecommendations(startDate: string) {
  const recommendations = [];

  // Get reflection consistency
  const reflectionCount = await db
    .select({ count: count() })
    .from(dailyReflections)
    .where(gte(dailyReflections.reflectionDate, startDate));

  const expectedReflections = Math.min(30, parseInt((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const reflectionRate = expectedReflections > 0 ? (reflectionCount[0]?.count || 0) / expectedReflections : 0;

  // Reflection consistency recommendations
  if (reflectionRate < 0.3) {
    recommendations.push({
      type: 'recommendation',
      priority: 7,
      title: 'Build a Reflection Habit',
      description: 'Regular self-reflection is key to personal growth. Try setting a daily reminder for just 2 minutes of reflection.',
      actionable: true,
      category: 'recommendations',
      data: { 
        action: 'daily_reflection_reminder',
        currentRate: Math.round(reflectionRate * 100)
      }
    });
  }

  // Weekly reflection recommendation
  const weeklyReflectionCount = await db
    .select({ count: count() })
    .from(weeklyReflections)
    .where(gte(weeklyReflections.weekStart, startDate));

  if ((weeklyReflectionCount[0]?.count || 0) === 0) {
    recommendations.push({
      type: 'recommendation',
      priority: 6,
      title: 'Try Weekly Reflection',
      description: 'Weekly reflections help you see bigger patterns and plan ahead. Spend 10 minutes each Sunday reviewing your week.',
      actionable: true,
      category: 'recommendations',
      data: { action: 'weekly_reflection' }
    });
  }

  return recommendations;
}