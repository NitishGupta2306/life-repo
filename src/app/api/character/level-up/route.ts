import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characterProfile, xpTransactions } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

// XP required for each level (exponential growth)
function calculateXpForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.1, level - 1));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { xpAmount, source, description } = body;
    
    if (!xpAmount || xpAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid XP amount is required' },
        { status: 400 }
      );
    }
    
    // Get current character profile
    const profile = await db.select().from(characterProfile).limit(1);
    
    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Character profile not found' },
        { status: 404 }
      );
    }
    
    const currentProfile = profile[0];
    const newTotalXp = currentProfile.totalXp + xpAmount;
    let newLevel = currentProfile.characterLevel;
    let leveledUp = false;
    
    // Check if we should level up
    const xpForNextLevel = calculateXpForLevel(newLevel + 1);
    if (newTotalXp >= xpForNextLevel) {
      newLevel++;
      leveledUp = true;
    }
    
    // Update the character profile
    const updatedProfile = await db
      .update(characterProfile)
      .set({
        totalXp: newTotalXp,
        characterLevel: newLevel,
      })
      .where(eq(characterProfile.id, currentProfile.id))
      .returning();
    
    // Record the XP transaction
    await db.insert(xpTransactions).values({
      sourceType: source || 'manual',
      xpAmount,
      description,
      earnedAt: new Date(),
    });
    
    return NextResponse.json({
      profile: updatedProfile[0],
      leveledUp,
      xpGained: xpAmount,
      xpToNextLevel: calculateXpForLevel(newLevel + 1) - newTotalXp,
    });
  } catch (error) {
    console.error('Error processing level up:', error);
    return NextResponse.json(
      { error: 'Failed to process level up' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current character profile and calculate XP info
    const profile = await db.select().from(characterProfile).limit(1);
    
    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Character profile not found' },
        { status: 404 }
      );
    }
    
    const currentProfile = profile[0];
    const currentLevelXp = calculateXpForLevel(currentProfile.characterLevel);
    const nextLevelXp = calculateXpForLevel(currentProfile.characterLevel + 1);
    const xpInCurrentLevel = currentProfile.totalXp - currentLevelXp;
    const xpToNextLevel = nextLevelXp - currentProfile.totalXp;
    const progressPercent = Math.max(0, (xpInCurrentLevel / (nextLevelXp - currentLevelXp)) * 100);
    
    return NextResponse.json({
      currentLevel: currentProfile.characterLevel,
      totalXp: currentProfile.totalXp,
      xpInCurrentLevel,
      xpToNextLevel,
      progressPercent: Math.min(100, progressPercent),
      nextLevelXp,
    });
  } catch (error) {
    console.error('Error fetching level info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level info' },
      { status: 500 }
    );
  }
}