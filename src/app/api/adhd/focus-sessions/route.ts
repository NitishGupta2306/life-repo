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