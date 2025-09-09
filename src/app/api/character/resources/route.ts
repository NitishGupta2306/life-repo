import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characterResources } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

// Default resource values
const DEFAULT_RESOURCES = [
  { resourceType: 'energy' as const, currentValue: 75, maxValue: 100, regenRate: 8 },
  { resourceType: 'focus' as const, currentValue: 60, maxValue: 100, regenRate: 5 },
  { resourceType: 'motivation' as const, currentValue: 80, maxValue: 100, regenRate: 3 },
  { resourceType: 'spoons' as const, currentValue: 12, maxValue: 20, regenRate: 1 },
];

export async function GET() {
  try {
    const resources = await db.select().from(characterResources);
    
    if (resources.length === 0) {
      // Create default resources if none exist
      const createdResources = await db.insert(characterResources)
        .values(DEFAULT_RESOURCES)
        .returning();
      
      return NextResponse.json(createdResources);
    }
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching character resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character resources' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { resourceType, currentValue, maxValue } = body;
    
    if (!resourceType) {
      return NextResponse.json(
        { error: 'Resource type is required' },
        { status: 400 }
      );
    }
    
    // Find the resource to update
    const existingResource = await db
      .select()
      .from(characterResources)
      .where(eq(characterResources.resourceType, resourceType))
      .limit(1);
    
    if (existingResource.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    const updatedResource = await db
      .update(characterResources)
      .set({
        currentValue: Math.max(0, Math.min(currentValue, maxValue || existingResource[0].maxValue)),
        maxValue: maxValue || existingResource[0].maxValue,
        lastUpdated: new Date(),
      })
      .where(eq(characterResources.resourceType, resourceType))
      .returning();
    
    return NextResponse.json(updatedResource[0]);
  } catch (error) {
    console.error('Error updating character resource:', error);
    return NextResponse.json(
      { error: 'Failed to update character resource' },
      { status: 500 }
    );
  }
}