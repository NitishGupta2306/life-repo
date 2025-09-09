import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyReflections } from '../../../../../database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Validation schemas
const dailyReflectionInsertSchema = createInsertSchema(dailyReflections);
const dailyReflectionSelectSchema = createSelectSchema(dailyReflections);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = searchParams.get('limit');

    let query = db.select().from(dailyReflections);

    if (date) {
      // Get reflection for specific date
      query = query.where(eq(dailyReflections.reflectionDate, date));
    } else {
      // Get recent reflections with optional limit
      query = query.orderBy(desc(dailyReflections.reflectionDate));
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          query = query.limit(limitNum);
        }
      }
    }

    const reflections = await query;

    return NextResponse.json({
      success: true,
      data: reflections,
      count: reflections.length
    });

  } catch (error) {
    console.error('Error fetching daily reflections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = dailyReflectionInsertSchema.parse(body);

    // Check if a reflection already exists for this date
    const existingReflection = await db
      .select()
      .from(dailyReflections)
      .where(eq(dailyReflections.reflectionDate, validatedData.reflectionDate))
      .limit(1);

    let result;
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      [result] = await db
        .update(dailyReflections)
        .set({
          ...validatedData,
          completedAt: validatedData.isComplete ? new Date() : null
        })
        .where(eq(dailyReflections.reflectionDate, validatedData.reflectionDate))
        .returning();
    } else {
      // Create new reflection
      [result] = await db
        .insert(dailyReflections)
        .values({
          ...validatedData,
          completedAt: validatedData.isComplete ? new Date() : null
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingReflection.length > 0 ? 'Reflection updated successfully' : 'Reflection created successfully'
    });

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

    console.error('Error creating/updating daily reflection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}