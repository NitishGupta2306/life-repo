import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';

// Mock reflections data
const mockReflections = [
  {
    id: 'reflection-1',
    type: 'daily',
    date: new Date().toISOString().split('T')[0],
    responses: {
      accomplishments: 'Completed morning routine and finished 2 important tasks',
      challenges: 'Got distracted during afternoon work session',
      mood: 'good',
      energy: 7,
      gratitude: 'Grateful for a productive morning and good weather',
      tomorrow: 'Want to improve afternoon focus and take more breaks',
    },
    moodScore: 7,
    energyScore: 7,
    productivityScore: 8,
    wellnessScore: 6,
    createdAt: new Date(),
    xpAwarded: 50,
  },
  {
    id: 'reflection-2',
    type: 'weekly',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responses: {
      weekHighlights: 'Completed major project milestone, had good social connections',
      weekChallenges: 'Struggled with time management mid-week',
      patterns: 'Notice I work better in the mornings, afternoons are harder',
      improvements: 'Better planning for afternoon energy dips',
      nextWeekGoals: 'Focus on consistent sleep schedule and structured afternoon breaks',
    },
    moodScore: 6,
    energyScore: 6,
    productivityScore: 7,
    wellnessScore: 7,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    xpAwarded: 100,
  },
];

// GET /api/reflections - Get reflections for a character
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const type = searchParams.get('type');
  const limit = searchParams.get('limit');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredReflections = mockReflections;

  // Filter by type
  if (type) {
    filteredReflections = filteredReflections.filter(r => r.type === type);
  }

  // Filter by date range
  if (dateFrom) {
    filteredReflections = filteredReflections.filter(r => r.date >= dateFrom);
  }
  if (dateTo) {
    filteredReflections = filteredReflections.filter(r => r.date <= dateTo);
  }

  // Apply limit
  if (limit && !isNaN(parseInt(limit))) {
    filteredReflections = filteredReflections.slice(0, parseInt(limit));
  }

  // Calculate reflection stats
  const stats = {
    totalReflections: filteredReflections.length,
    averageMood: filteredReflections.length > 0 
      ? filteredReflections.reduce((acc, r) => acc + r.moodScore, 0) / filteredReflections.length 
      : 0,
    averageEnergy: filteredReflections.length > 0 
      ? filteredReflections.reduce((acc, r) => acc + r.energyScore, 0) / filteredReflections.length 
      : 0,
    currentStreak: 14, // Mock streak calculation
    longestStreak: 28,
    totalXpEarned: filteredReflections.reduce((acc, r) => acc + r.xpAwarded, 0),
  };

  const response = {
    reflections: filteredReflections,
    stats,
  };

  return ApiResponseHelper.success(response);
});

// POST /api/reflections - Create new reflection
const createReflectionSchema = z.object({
  characterId: z.string(),
  type: z.enum(['daily', 'weekly', 'monthly']),
  responses: z.record(z.string()),
  moodScore: z.number().min(1).max(10),
  energyScore: z.number().min(1).max(10),
  productivityScore: z.number().min(1).max(10).optional(),
  wellnessScore: z.number().min(1).max(10).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = createReflectionSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, type, responses, moodScore, energyScore, productivityScore, wellnessScore } = validation.data;

  try {
    // Calculate XP reward based on reflection type and completeness
    const baseXP = type === 'daily' ? 50 : type === 'weekly' ? 100 : 200;
    const completenessBonus = Object.keys(responses).length * 5;
    const totalXP = baseXP + completenessBonus;

    // Create new reflection
    const newReflection = {
      id: `reflection_${Date.now()}`,
      characterId,
      type,
      date: new Date().toISOString().split('T')[0],
      responses,
      moodScore,
      energyScore,
      productivityScore: productivityScore || 5,
      wellnessScore: wellnessScore || 5,
      createdAt: new Date(),
      xpAwarded: totalXP,
    };

    // Award XP for reflection
    const xpResult = await CharacterService.addXP(characterId, totalXP);

    // Update motivation resource (reflections boost motivation)
    const motivationUpdate = await CharacterService.updateResource(characterId, 'motivation', 10);

    const response = {
      reflection: newReflection,
      rewards: {
        xp: totalXP,
        motivationBoost: 10,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
      },
      insights: {
        moodTrend: 'stable', // Would calculate from historical data
        energyPattern: 'morning_focused', // Would analyze from patterns
        recommendations: [
          'Keep up the consistent reflection habit!',
          'Consider exploring the patterns you mentioned',
          'Your mood scores show positive trending',
        ],
      },
      message: xpResult.leveledUp 
        ? `Reflection completed! Congratulations on reaching level ${xpResult.newLevel}!`
        : 'Reflection completed successfully!',
    };

    return ApiResponseHelper.created(response, response.message);
  } catch (error) {
    console.error('Failed to create reflection:', error);
    return ApiResponseHelper.serverError('Failed to create reflection');
  }
});