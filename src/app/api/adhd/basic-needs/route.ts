<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { basicNeeds, needCompletions } from '../../../../../database/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all basic needs with their completion status
    const needs = await db
      .select({
        id: basicNeeds.id,
        needName: basicNeeds.needName,
        needCategory: basicNeeds.needCategory,
        priority: basicNeeds.priority,
        idealFrequency: basicNeeds.idealFrequency,
        lastCompleted: basicNeeds.lastCompleted,
        streakCount: basicNeeds.streakCount,
        isOverdue: basicNeeds.isOverdue,
        reminderEnabled: basicNeeds.reminderEnabled,
        xpReward: basicNeeds.xpReward,
      })
      .from(basicNeeds);

    return NextResponse.json({ needs });
  } catch (error) {
    console.error('Error fetching basic needs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic needs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { needId, difficultyRating, energyBefore, energyAfter, notes } = body;

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Record the completion
    const completion = await db
      .insert(needCompletions)
      .values({
        needId,
        difficultyRating: difficultyRating || null,
        energyBefore: energyBefore || null,
        energyAfter: energyAfter || null,
        notes: notes || null,
      })
      .returning();

    // Update the basic need record
    await db
      .update(basicNeeds)
      .set({
        lastCompleted: new Date(),
        streakCount: db.$count(), // This should be calculated properly
        isOverdue: false,
      })
      .where(eq(basicNeeds.id, needId));

    return NextResponse.json({ 
      message: 'Need completed successfully!',
      completion: completion[0]
    });
  } catch (error) {
    console.error('Error completing basic need:', error);
    return NextResponse.json(
      { error: 'Failed to complete basic need' },
      { status: 500 }
    );
  }
}
=======
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// Mock basic needs data
const mockBasicNeeds = [
  {
    id: 'need-1',
    needType: 'hydration',
    status: 'satisfied',
    lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reminderFrequency: 120, // minutes
    priority: 'high',
    notes: 'Had a glass of water 2 hours ago',
  },
  {
    id: 'need-2',
    needType: 'nutrition',
    status: 'needs_attention',
    lastChecked: new Date(Date.now() - 5 * 60 * 60 * 1000),
    reminderFrequency: 240, // minutes
    priority: 'high',
    notes: 'Last meal was 5 hours ago',
  },
  {
    id: 'need-3',
    needType: 'sleep',
    status: 'satisfied',
    lastChecked: new Date(Date.now() - 8 * 60 * 60 * 1000),
    reminderFrequency: 480, // minutes
    priority: 'medium',
    notes: 'Got 7 hours of sleep last night',
  },
  {
    id: 'need-4',
    needType: 'movement',
    status: 'overdue',
    lastChecked: new Date(Date.now() - 3 * 60 * 60 * 1000),
    reminderFrequency: 60, // minutes
    priority: 'medium',
    notes: 'Been sitting for 3 hours',
  },
];

// GET /api/adhd/basic-needs - Get basic needs status
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const needType = searchParams.get('type');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredNeeds = mockBasicNeeds;

  if (needType) {
    filteredNeeds = filteredNeeds.filter(need => need.needType === needType);
  }

  // Calculate which needs need attention
  const now = new Date();
  const needsAttention = filteredNeeds.filter(need => {
    const timeSinceCheck = now.getTime() - need.lastChecked.getTime();
    const reminderThreshold = need.reminderFrequency * 60 * 1000; // Convert to milliseconds
    return timeSinceCheck >= reminderThreshold;
  });

  const response = {
    basicNeeds: filteredNeeds,
    summary: {
      total: filteredNeeds.length,
      satisfied: filteredNeeds.filter(n => n.status === 'satisfied').length,
      needsAttention: filteredNeeds.filter(n => n.status === 'needs_attention').length,
      overdue: filteredNeeds.filter(n => n.status === 'overdue').length,
      nextReminder: needsAttention.length > 0 ? needsAttention[0] : null,
    },
  };

  return ApiResponseHelper.success(response);
});

// POST /api/adhd/basic-needs - Update basic need status
const updateBasicNeedSchema = z.object({
  characterId: z.string(),
  needType: z.enum(['hydration', 'nutrition', 'sleep', 'movement', 'medication', 'bathroom']),
  status: z.enum(['satisfied', 'needs_attention', 'overdue']).optional(),
  notes: z.string().max(500).optional(),
  markSatisfied: z.boolean().default(false),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = updateBasicNeedSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, needType, status, notes, markSatisfied } = validation.data;

  // Mock update - in real app would update database
  const updatedNeed = {
    id: `need_${Date.now()}`,
    needType,
    status: markSatisfied ? 'satisfied' : status || 'satisfied',
    lastChecked: markSatisfied ? new Date() : new Date(Date.now() - 2 * 60 * 60 * 1000),
    reminderFrequency: 120,
    priority: 'high',
    notes: notes || `${needType} checked`,
  };

  // Award small XP for checking basic needs
  const xpReward = markSatisfied ? 10 : 5;

  const response = {
    basicNeed: updatedNeed,
    xpAwarded: xpReward,
    message: markSatisfied 
      ? `Great job taking care of your ${needType}! +${xpReward} XP`
      : `Basic need status updated`,
  };

  return ApiResponseHelper.success(response, response.message);
});
>>>>>>> feature/backend-infrastructure
