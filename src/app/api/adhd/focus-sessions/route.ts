<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

// Define focus sessions table (this might be moved to schema later)
const focusSessions = pgTable('focus_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionType: text('session_type').notNull(), // 'pomodoro', 'deep_work', 'break'
  plannedDuration: integer('planned_duration').notNull(), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  wasCompleted: boolean('was_completed').notNull().default(false),
  wasInterrupted: boolean('was_interrupted').notNull().default(false),
  taskWorkedOn: text('task_worked_on'),
  productivityRating: integer('productivity_rating'), // 1-5 scale
  energyBefore: integer('energy_before'), // 1-10 scale
  energyAfter: integer('energy_after'), // 1-10 scale
  notes: text('notes'),
  xpEarned: integer('xp_earned').notNull().default(0),
});

export async function GET() {
  try {
    // Get recent focus sessions (last 30)
    const sessions = await db
      .select()
      .from(focusSessions)
      .orderBy(desc(focusSessions.startTime))
      .limit(30);

    // Calculate some stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.wasCompleted).length;
    const totalMinutes = sessions
      .filter(s => s.actualDuration)
      .reduce((sum, s) => sum + (s.actualDuration || 0), 0);

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        totalFocusTime: totalMinutes,
        averageSessionLength: completedSessions > 0 ? totalMinutes / completedSessions : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch focus sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      sessionId,
      sessionType = 'pomodoro',
      plannedDuration = 25,
      taskWorkedOn,
      productivityRating,
      energyBefore,
      energyAfter,
      notes,
      wasInterrupted = false
    } = body;

    if (action === 'start') {
      // Start a new focus session
      const session = await db
        .insert(focusSessions)
        .values({
          sessionType,
          plannedDuration,
          startTime: new Date(),
          taskWorkedOn: taskWorkedOn || null,
          energyBefore: energyBefore || null,
        })
        .returning();

      return NextResponse.json({
        message: 'Focus session started',
        session: session[0]
      });
    }

    if (action === 'complete' && sessionId) {
      // Complete an existing session
      const actualDuration = Math.floor((Date.now() - new Date().getTime()) / 60000); // approximate
      
      const xpEarned = calculateSessionXP(sessionType, plannedDuration, !wasInterrupted);

      const updatedSession = await db
        .update(focusSessions)
        .set({
          endTime: new Date(),
          actualDuration: actualDuration > 0 ? actualDuration : plannedDuration,
          wasCompleted: true,
          wasInterrupted,
          productivityRating: productivityRating || null,
          energyAfter: energyAfter || null,
          notes: notes || null,
          xpEarned,
        })
        .where(eq(focusSessions.id, sessionId))
        .returning();

      return NextResponse.json({
        message: 'Focus session completed!',
        session: updatedSession[0],
        xpEarned
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing sessionId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing focus session:', error);
    return NextResponse.json(
      { error: 'Failed to manage focus session' },
      { status: 500 }
    );
  }
}

function calculateSessionXP(sessionType: string, duration: number, wasCompleted: boolean): number {
  if (!wasCompleted) return 0;
  
  const baseXP = {
    'pomodoro': 25,
    'deep_work': 50,
    'break': 10
  };

  const base = baseXP[sessionType as keyof typeof baseXP] || 25;
  const durationMultiplier = Math.max(1, duration / 25); // Standard pomodoro is 25 min
  
  return Math.floor(base * durationMultiplier);
}
=======
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';

// Mock focus sessions data
const mockFocusSessions = [
  {
    id: 'session-1',
    duration: 25, // minutes
    technique: 'pomodoro',
    status: 'completed',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000),
    focusLevel: 8,
    distractions: 2,
    notes: 'Good session, minimal distractions',
    xpAwarded: 25,
  },
  {
    id: 'session-2',
    duration: 15, // minutes
    technique: 'deep_work',
    status: 'completed',
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 15 * 60 * 1000),
    focusLevel: 6,
    distractions: 5,
    notes: 'Some difficulty concentrating',
    xpAwarded: 15,
  },
];

// GET /api/adhd/focus-sessions - Get focus sessions
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const limit = searchParams.get('limit');
  const status = searchParams.get('status');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredSessions = mockFocusSessions;

  if (status) {
    filteredSessions = filteredSessions.filter(session => session.status === status);
  }

  if (limit && !isNaN(parseInt(limit))) {
    filteredSessions = filteredSessions.slice(0, parseInt(limit));
  }

  // Calculate statistics
  const completedSessions = filteredSessions.filter(s => s.status === 'completed');
  const totalMinutes = completedSessions.reduce((acc, s) => acc + s.duration, 0);
  const averageFocus = completedSessions.length > 0 
    ? completedSessions.reduce((acc, s) => acc + s.focusLevel, 0) / completedSessions.length 
    : 0;

  const response = {
    sessions: filteredSessions,
    stats: {
      totalSessions: completedSessions.length,
      totalMinutes,
      averageFocusLevel: Math.round(averageFocus * 10) / 10,
      totalXpEarned: completedSessions.reduce((acc, s) => acc + s.xpAwarded, 0),
      streak: 3, // Mock streak calculation
    },
  };

  return ApiResponseHelper.success(response);
});

// POST /api/adhd/focus-sessions - Start new focus session
const startFocusSessionSchema = z.object({
  characterId: z.string(),
  duration: z.number().min(5).max(180).default(25),
  technique: z.enum(['pomodoro', 'deep_work', 'timeboxing', 'flowtime']).default('pomodoro'),
  goal: z.string().max(200).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = startFocusSessionSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, duration, technique, goal } = validation.data;

  // Create new focus session
  const newSession = {
    id: `session_${Date.now()}`,
    characterId,
    duration,
    technique,
    goal,
    status: 'in_progress' as const,
    startedAt: new Date(),
    completedAt: null,
    focusLevel: null,
    distractions: 0,
    notes: null,
    xpAwarded: 0,
    targetEndTime: new Date(Date.now() + duration * 60 * 1000),
  };

  // Mock save - in real app would save to database
  console.log('Starting focus session:', newSession);

  return ApiResponseHelper.created(newSession, `Focus session started for ${duration} minutes`);
});

// PUT /api/adhd/focus-sessions - Complete focus session
const completeFocusSessionSchema = z.object({
  sessionId: z.string(),
  characterId: z.string(),
  focusLevel: z.number().min(1).max(10),
  distractions: z.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  completedEarly: z.boolean().default(false),
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = completeFocusSessionSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { sessionId, characterId, focusLevel, distractions, notes, completedEarly } = validation.data;

  try {
    // Calculate XP based on session performance
    const baseXP = 25; // Base XP for 25-minute session
    const focusBonus = Math.round((focusLevel - 5) * 2); // Bonus/penalty based on focus level
    const distractionPenalty = Math.min(distractions * 2, 10); // Up to -10 XP for distractions
    const earlyCompletionPenalty = completedEarly ? -5 : 0;
    
    const totalXP = Math.max(5, baseXP + focusBonus - distractionPenalty + earlyCompletionPenalty);

    // Complete the session
    const completedSession = {
      id: sessionId,
      duration: 25,
      technique: 'pomodoro',
      status: 'completed' as const,
      startedAt: new Date(Date.now() - 25 * 60 * 1000),
      completedAt: new Date(),
      focusLevel,
      distractions,
      notes: notes || '',
      xpAwarded: totalXP,
      completedEarly,
    };

    // Award XP and update focus resource
    const xpResult = await CharacterService.addXP(characterId, totalXP);
    const focusUpdate = await CharacterService.updateResource(characterId, 'focus', 5);

    const response = {
      session: completedSession,
      rewards: {
        xp: totalXP,
        focusImprovement: 5,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
      },
      message: xpResult.leveledUp 
        ? `Focus session completed! Level up to ${xpResult.newLevel}! +${totalXP} XP`
        : `Focus session completed! +${totalXP} XP`,
    };

    return ApiResponseHelper.success(response, response.message);
  } catch (error) {
    console.error('Failed to complete focus session:', error);
    return ApiResponseHelper.serverError('Failed to complete focus session');
  }
});
>>>>>>> feature/backend-infrastructure
