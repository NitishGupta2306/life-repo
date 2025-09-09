import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// Mock achievements data
const mockAchievements = [
  {
    id: 'achievement-1',
    title: 'Early Bird',
    description: 'Complete your morning routine 7 days in a row',
    category: 'habits',
    type: 'streak',
    icon: '🌅',
    xpReward: 100,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    progress: {
      current: 7,
      target: 7,
      percentage: 100,
    },
    rarity: 'common',
  },
  {
    id: 'achievement-2',
    title: 'Focus Master',
    description: 'Complete 25 focus sessions',
    category: 'focus',
    type: 'count',
    icon: '🎯',
    xpReward: 250,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    progress: {
      current: 25,
      target: 25,
      percentage: 100,
    },
    rarity: 'uncommon',
  },
  {
    id: 'achievement-3',
    title: 'Quest Completionist',
    description: 'Complete 100 quests of any type',
    category: 'quests',
    type: 'count',
    icon: '🏆',
    xpReward: 500,
    unlocked: false,
    unlockedAt: null,
    progress: {
      current: 67,
      target: 100,
      percentage: 67,
    },
    rarity: 'rare',
  },
  {
    id: 'achievement-4',
    title: 'Reflection Sage',
    description: 'Maintain a 30-day reflection streak',
    category: 'reflection',
    type: 'streak',
    icon: '🧙‍♂️',
    xpReward: 750,
    unlocked: false,
    unlockedAt: null,
    progress: {
      current: 14,
      target: 30,
      percentage: 47,
    },
    rarity: 'epic',
  },
  {
    id: 'achievement-5',
    title: 'Life Level Legend',
    description: 'Reach character level 50',
    category: 'progression',
    type: 'milestone',
    icon: '⭐',
    xpReward: 1000,
    unlocked: false,
    unlockedAt: null,
    progress: {
      current: 25,
      target: 50,
      percentage: 50,
    },
    rarity: 'legendary',
  },
];

// GET /api/achievements - Get achievements for a character
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const unlocked = searchParams.get('unlocked');
  const category = searchParams.get('category');
  const rarity = searchParams.get('rarity');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredAchievements = mockAchievements;

  // Filter by unlocked status
  if (unlocked !== null) {
    const isUnlocked = unlocked === 'true';
    filteredAchievements = filteredAchievements.filter(a => a.unlocked === isUnlocked);
  }

  // Filter by category
  if (category) {
    filteredAchievements = filteredAchievements.filter(a => a.category === category);
  }

  // Filter by rarity
  if (rarity) {
    filteredAchievements = filteredAchievements.filter(a => a.rarity === rarity);
  }

  // Calculate achievement stats
  const stats = {
    total: mockAchievements.length,
    unlocked: mockAchievements.filter(a => a.unlocked).length,
    inProgress: mockAchievements.filter(a => !a.unlocked && a.progress.current > 0).length,
    totalXpEarned: mockAchievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xpReward, 0),
    completionPercentage: (mockAchievements.filter(a => a.unlocked).length / mockAchievements.length) * 100,
    categories: {
      habits: mockAchievements.filter(a => a.category === 'habits').length,
      focus: mockAchievements.filter(a => a.category === 'focus').length,
      quests: mockAchievements.filter(a => a.category === 'quests').length,
      reflection: mockAchievements.filter(a => a.category === 'reflection').length,
      progression: mockAchievements.filter(a => a.category === 'progression').length,
    },
  };

  const response = {
    achievements: filteredAchievements,
    stats,
  };

  return ApiResponseHelper.success(response);
});

// POST /api/achievements/check - Check for new achievement unlocks
const checkAchievementsSchema = z.object({
  characterId: z.string(),
  triggerType: z.enum(['quest_complete', 'focus_session', 'reflection', 'level_up', 'streak_update']),
  triggerData: z.record(z.any()).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = checkAchievementsSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, triggerType, triggerData } = validation.data;

  // Mock achievement checking logic - in real app would:
  // 1. Check character's current stats and progress
  // 2. Compare against achievement requirements
  // 3. Unlock achievements that meet criteria
  // 4. Award XP and update character progression

  const newlyUnlocked = [];
  const updatedProgress = [];

  // Simulate checking achievements based on trigger
  switch (triggerType) {
    case 'quest_complete':
      // Check quest-related achievements
      updatedProgress.push({
        id: 'achievement-3',
        title: 'Quest Completionist',
        progress: {
          current: 68,
          target: 100,
          percentage: 68,
        },
      });
      break;

    case 'focus_session':
      // Check focus-related achievements
      if (triggerData?.sessionCount >= 25) {
        newlyUnlocked.push({
          id: 'achievement-2',
          title: 'Focus Master',
          xpAwarded: 250,
        });
      }
      break;

    case 'reflection':
      // Check reflection-related achievements
      updatedProgress.push({
        id: 'achievement-4',
        title: 'Reflection Sage',
        progress: {
          current: triggerData?.streakCount || 15,
          target: 30,
          percentage: ((triggerData?.streakCount || 15) / 30) * 100,
        },
      });
      break;

    case 'level_up':
      // Check level-based achievements
      updatedProgress.push({
        id: 'achievement-5',
        title: 'Life Level Legend',
        progress: {
          current: triggerData?.newLevel || 26,
          target: 50,
          percentage: ((triggerData?.newLevel || 26) / 50) * 100,
        },
      });
      break;
  }

  const response = {
    newlyUnlocked,
    updatedProgress,
    totalXpAwarded: newlyUnlocked.reduce((acc, a) => acc + a.xpAwarded, 0),
    message: newlyUnlocked.length > 0 
      ? `Congratulations! You've unlocked ${newlyUnlocked.length} new achievement(s)!`
      : 'Achievement progress updated',
  };

  return ApiResponseHelper.success(response, response.message);
});