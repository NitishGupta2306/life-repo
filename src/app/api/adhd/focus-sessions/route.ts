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