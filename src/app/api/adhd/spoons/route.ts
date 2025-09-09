import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characterResources } from '../../../../../database/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get current spoon count from character resources
    const spoonResource = await db
      .select()
      .from(characterResources)
      .where(eq(characterResources.resourceType, 'spoons'))
      .limit(1);

    if (!spoonResource.length) {
      // Initialize spoon resource if it doesn't exist
      const newSpoonResource = await db
        .insert(characterResources)
        .values({
          resourceType: 'spoons',
          currentValue: 12, // Default starting spoons
          maxValue: 12,
          regenRate: 1, // Regenerate 1 spoon per hour of rest
        })
        .returning();

      return NextResponse.json({ spoons: newSpoonResource[0] });
    }

    return NextResponse.json({ spoons: spoonResource[0] });
  } catch (error) {
    console.error('Error fetching spoon data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spoon data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, activityName } = body;

    if (!['spend', 'recover', 'set'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be spend, recover, or set' },
        { status: 400 }
      );
    }

    // Get current spoon resource
    const spoonResource = await db
      .select()
      .from(characterResources)
      .where(eq(characterResources.resourceType, 'spoons'))
      .limit(1);

    if (!spoonResource.length) {
      return NextResponse.json(
        { error: 'Spoon resource not found' },
        { status: 404 }
      );
    }

    let newValue = spoonResource[0].currentValue;
    
    switch (action) {
      case 'spend':
        newValue = Math.max(0, newValue - (amount || 1));
        break;
      case 'recover':
        newValue = Math.min(spoonResource[0].maxValue, newValue + (amount || 1));
        break;
      case 'set':
        newValue = Math.max(0, Math.min(spoonResource[0].maxValue, amount || 0));
        break;
    }

    // Update spoon count
    const updatedSpoons = await db
      .update(characterResources)
      .set({
        currentValue: newValue,
        lastUpdated: new Date(),
      })
      .where(eq(characterResources.resourceType, 'spoons'))
      .returning();

    return NextResponse.json({
      message: `Successfully ${action}ed spoons`,
      spoons: updatedSpoons[0],
      activity: activityName || null,
    });
  } catch (error) {
    console.error('Error updating spoon data:', error);
    return NextResponse.json(
      { error: 'Failed to update spoon data' },
      { status: 500 }
    );
  }
}