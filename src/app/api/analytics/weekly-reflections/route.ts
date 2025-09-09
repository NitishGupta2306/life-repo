import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { weeklyReflections, behaviorPatterns } from '../../../../../database/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

// Validation schemas
const weeklyReflectionInsertSchema = createInsertSchema(weeklyReflections);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    const limit = searchParams.get('limit');
    const includePatterns = searchParams.get('includePatterns') === 'true';

    let query = db.select().from(weeklyReflections);

    if (weekStart) {
      // Get reflection for specific week
      query = query.where(eq(weeklyReflections.weekStart, weekStart));
    } else {
      // Get recent weekly reflections with optional limit
      query = query.orderBy(desc(weeklyReflections.weekStart));
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          query = query.limit(limitNum);
        }
      }
    }

    const reflections = await query;

    let patterns = null;
    if (includePatterns) {
      // Get behavior patterns observed in the last 4 weeks
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      patterns = await db
        .select()
        .from(behaviorPatterns)
        .where(gte(behaviorPatterns.lastObserved, fourWeeksAgo.toISOString().split('T')[0]))
        .orderBy(desc(behaviorPatterns.frequency));
    }

    return NextResponse.json({
      success: true,
      data: {
        reflections,
        patterns: patterns || []
      },
      count: reflections.length
    });

  } catch (error) {
    console.error('Error fetching weekly reflections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly reflections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = weeklyReflectionInsertSchema.parse(body);

    // Check if a reflection already exists for this week
    const existingReflection = await db
      .select()
      .from(weeklyReflections)
      .where(
        and(
          eq(weeklyReflections.weekStart, validatedData.weekStart),
          eq(weeklyReflections.weekEnd, validatedData.weekEnd)
        )
      )
      .limit(1);

    let result;
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      [result] = await db
        .update(weeklyReflections)
        .set({
          ...validatedData,
          createdAt: new Date()
        })
        .where(eq(weeklyReflections.id, existingReflection[0].id))
        .returning();
    } else {
      // Create new reflection
      [result] = await db
        .insert(weeklyReflections)
        .values({
          ...validatedData,
          createdAt: new Date()
        })
        .returning();
    }

    // Process patterns noticed and update behavior patterns table
    if (validatedData.patternsNoticed && validatedData.patternsNoticed.length > 0) {
      for (const patternText of validatedData.patternsNoticed) {
        // Check if this pattern already exists
        const existingPattern = await db
          .select()
          .from(behaviorPatterns)
          .where(eq(behaviorPatterns.patternName, patternText))
          .limit(1);

        if (existingPattern.length > 0) {
          // Update frequency and last observed date
          await db
            .update(behaviorPatterns)
            .set({
              frequency: existingPattern[0].frequency + 1,
              lastObserved: new Date().toISOString().split('T')[0]
            })
            .where(eq(behaviorPatterns.id, existingPattern[0].id));
        } else {
          // Create new pattern
          await db
            .insert(behaviorPatterns)
            .values({
              patternName: patternText,
              patternType: 'neutral', // Default to neutral, can be updated later
              frequency: 1,
              firstObserved: new Date().toISOString().split('T')[0],
              lastObserved: new Date().toISOString().split('T')[0]
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingReflection.length > 0 ? 'Weekly reflection updated successfully' : 'Weekly reflection created successfully'
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

    console.error('Error creating/updating weekly reflection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save weekly reflection' },
      { status: 500 }
    );
  }
}