import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyReflections } from '../../../../../database/schema';
import { gte, desc, sql, eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const aggregation = searchParams.get('aggregation') || 'daily'; // daily, weekly, monthly
    const periodDays = parseInt(period, 10);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateString = startDate.toISOString().split('T')[0];

    // Get mood data for the period
    const moodData = await db
      .select({
        date: dailyReflections.reflectionDate,
        energyLevel: dailyReflections.energyLevel,
        focusLevel: dailyReflections.focusLevel,
        moodTags: dailyReflections.moodTags,
        gratitudeList: dailyReflections.gratitudeList,
        morningIntention: dailyReflections.morningIntention,
        eveningReflection: dailyReflections.eveningReflection
      })
      .from(dailyReflections)
      .where(gte(dailyReflections.reflectionDate, startDateString))
      .orderBy(desc(dailyReflections.reflectionDate));

    // Aggregate mood tags frequency
    const moodTagFrequency: { [key: string]: number } = {};
    const dailyAverages: { [key: string]: { energy: number[], focus: number[], count: number } } = {};

    moodData.forEach((entry) => {
      // Process mood tags
      if (entry.moodTags) {
        entry.moodTags.forEach((tag: string) => {
          moodTagFrequency[tag] = (moodTagFrequency[tag] || 0) + 1;
        });
      }

      // Process energy and focus levels for aggregation
      if (entry.date && entry.energyLevel !== null && entry.focusLevel !== null) {
        let aggregationKey = entry.date;
        
        if (aggregation === 'weekly') {
          const date = new Date(entry.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          aggregationKey = weekStart.toISOString().split('T')[0];
        } else if (aggregation === 'monthly') {
          const date = new Date(entry.date);
          aggregationKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!dailyAverages[aggregationKey]) {
          dailyAverages[aggregationKey] = { energy: [], focus: [], count: 0 };
        }
        
        dailyAverages[aggregationKey].energy.push(entry.energyLevel);
        dailyAverages[aggregationKey].focus.push(entry.focusLevel);
        dailyAverages[aggregationKey].count++;
      }
    });

    // Calculate averages for each aggregation period
    const aggregatedData = Object.entries(dailyAverages).map(([date, data]) => ({
      date,
      averageEnergy: data.energy.length > 0 
        ? Number((data.energy.reduce((sum, val) => sum + val, 0) / data.energy.length).toFixed(1))
        : 0,
      averageFocus: data.focus.length > 0 
        ? Number((data.focus.reduce((sum, val) => sum + val, 0) / data.focus.length).toFixed(1))
        : 0,
      entryCount: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate overall statistics
    const allEnergyLevels = moodData
      .map(entry => entry.energyLevel)
      .filter((level): level is number => level !== null);
    
    const allFocusLevels = moodData
      .map(entry => entry.focusLevel)
      .filter((level): level is number => level !== null);

    const overallStats = {
      totalEntries: moodData.length,
      averageEnergy: allEnergyLevels.length > 0 
        ? Number((allEnergyLevels.reduce((sum, val) => sum + val, 0) / allEnergyLevels.length).toFixed(1))
        : 0,
      averageFocus: allFocusLevels.length > 0 
        ? Number((allFocusLevels.reduce((sum, val) => sum + val, 0) / allFocusLevels.length).toFixed(1))
        : 0,
      highEnergyDays: allEnergyLevels.filter(level => level >= 7).length,
      lowEnergyDays: allEnergyLevels.filter(level => level <= 4).length,
      highFocusDays: allFocusLevels.filter(level => level >= 7).length,
      lowFocusDays: allFocusLevels.filter(level => level <= 4).length
    };

    // Sort mood tags by frequency
    const topMoodTags = Object.entries(moodTagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, frequency]) => ({ tag, frequency }));

    // Identify patterns and trends
    const trends = {
      energyTrend: calculateTrend(aggregatedData.map(d => d.averageEnergy)),
      focusTrend: calculateTrend(aggregatedData.map(d => d.averageFocus)),
      mostCommonMood: topMoodTags[0]?.tag || 'No data',
      consistencyScore: moodData.length > 0 
        ? Math.round((moodData.length / periodDays) * 100)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        aggregatedData,
        overallStats,
        topMoodTags,
        trends,
        rawData: moodData,
        period: `${periodDays} days`,
        aggregation
      }
    });

  } catch (error) {
    console.error('Error fetching mood tracking data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mood tracking data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate simple trend (increasing, decreasing, stable)
function calculateTrend(values: number[]): string {
  if (values.length < 3) return 'insufficient_data';
  
  const firstThird = values.slice(0, Math.floor(values.length / 3));
  const lastThird = values.slice(-Math.floor(values.length / 3));
  
  const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
  
  const difference = lastAvg - firstAvg;
  
  if (Math.abs(difference) < 0.5) return 'stable';
  return difference > 0 ? 'improving' : 'declining';
}