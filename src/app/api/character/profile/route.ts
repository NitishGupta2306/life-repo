import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characterProfile } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // For now, get the first character profile (in a real app, this would be user-specific)
    const profile = await db.select().from(characterProfile).limit(1);
    
    if (profile.length === 0) {
      // Create a default character profile if none exists
      const defaultProfile = await db.insert(characterProfile).values({
        characterName: 'New Adventurer',
        characterLevel: 25, // Default level (age)
        totalXp: 0,
        characterClass: 'Life Explorer',
      }).returning();
      
      return NextResponse.json(defaultProfile[0]);
    }
    
    return NextResponse.json(profile[0]);
  } catch (error) {
    console.error('Error fetching character profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { characterName, characterClass, avatarUrl } = body;
    
    // Get the existing profile
    const existingProfile = await db.select().from(characterProfile).limit(1);
    
    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: 'Character profile not found' },
        { status: 404 }
      );
    }
    
    // Update the profile
    const updatedProfile = await db
      .update(characterProfile)
      .set({
        characterName,
        characterClass,
        avatarUrl,
        lastLogin: new Date(),
      })
      .where(eq(characterProfile.id, existingProfile[0].id))
      .returning();
    
    return NextResponse.json(updatedProfile[0]);
  } catch (error) {
    console.error('Error updating character profile:', error);
    return NextResponse.json(
      { error: 'Failed to update character profile' },
      { status: 500 }
    );
  }
}