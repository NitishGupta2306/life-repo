import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characterStats, statProgression } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

// Default RPG-style stats
const DEFAULT_STATS = [
  { statName: 'Strength', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Intelligence', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Wisdom', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Charisma', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Constitution', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Dexterity', baseValue: 10, currentValue: 10, statCategory: 'primary' as const },
  { statName: 'Focus', baseValue: 5, currentValue: 5, statCategory: 'secondary' as const },
  { statName: 'Creativity', baseValue: 5, currentValue: 5, statCategory: 'secondary' as const },
  { statName: 'Organization', baseValue: 5, currentValue: 5, statCategory: 'secondary' as const },
  { statName: 'Social Skills', baseValue: 5, currentValue: 5, statCategory: 'secondary' as const },
];

export async function GET() {
  try {
    const stats = await db.select().from(characterStats);
    
    if (stats.length === 0) {
      // Create default stats if none exist
      const createdStats = await db.insert(characterStats).values(DEFAULT_STATS).returning();
      
      // Create corresponding stat progression records
      const progressionRecords = createdStats.map(stat => ({
        statId: stat.id,
        xpCurrent: 0,
        xpToNextLevel: 1000,
        levelUpHistory: [],
      }));
      
      await db.insert(statProgression).values(progressionRecords);
      
      return NextResponse.json(createdStats);
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching character stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character stats' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { statId, baseValue, currentValue } = body;
    
    if (!statId) {
      return NextResponse.json(
        { error: 'Stat ID is required' },
        { status: 400 }
      );
    }
    
    const updatedStat = await db
      .update(characterStats)
      .set({
        baseValue,
        currentValue,
        updatedAt: new Date(),
      })
      .where(eq(characterStats.id, statId))
      .returning();
    
    if (updatedStat.length === 0) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedStat[0]);
  } catch (error) {
    console.error('Error updating character stat:', error);
    return NextResponse.json(
      { error: 'Failed to update character stat' },
      { status: 500 }
    );
  }
}