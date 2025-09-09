import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// Mock quest data
const mockQuests = [
  {
    id: 'quest-1',
    title: 'Complete morning routine',
    description: 'Start your day with intention: wake up, hydrate, exercise, and plan your day',
    questType: 'daily',
    status: 'in_progress',
    xpReward: 50,
    energyCost: 5,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    objectives: [
      { id: 'obj-1', description: 'Drink a glass of water', completed: true },
      { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: false },
      { id: 'obj-3', description: 'Plan top 3 priorities', completed: false },
    ],
  },
  {
    id: 'quest-2',
    title: 'Finish project documentation',
    description: 'Complete the technical documentation for the current project',
    questType: 'main',
    status: 'pending',
    xpReward: 200,
    energyCost: 20,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    objectives: [
      { id: 'obj-4', description: 'Write API documentation', completed: false },
      { id: 'obj-5', description: 'Create user guide', completed: false },
      { id: 'obj-6', description: 'Review and finalize', completed: false },
    ],
  },
  {
    id: 'quest-3',
    title: 'Take a mindful break',
    description: 'Step away from work and practice mindfulness for mental well-being',
    questType: 'self_care',
    status: 'pending',
    xpReward: 25,
    energyCost: -10, // Negative cost means it restores energy
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
    objectives: [
      { id: 'obj-7', description: '5 minutes of deep breathing', completed: false },
    ],
  },
];

// GET /api/quests - Get all quests for a character
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const limit = searchParams.get('limit');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredQuests = mockQuests;

  // Apply filters
  if (status) {
    filteredQuests = filteredQuests.filter(quest => quest.status === status);
  }
  
  if (type) {
    filteredQuests = filteredQuests.filter(quest => quest.questType === type);
  }

  // Apply limit
  if (limit && !isNaN(parseInt(limit))) {
    filteredQuests = filteredQuests.slice(0, parseInt(limit));
  }

  const response = {
    quests: filteredQuests,
    total: filteredQuests.length,
    filters: { status, type, limit },
  };

  return ApiResponseHelper.success(response);
});

// POST /api/quests - Create new quest
const createQuestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  questType: z.enum(['daily', 'main', 'side', 'boss', 'self_care']),
  xpReward: z.number().positive().default(50),
  energyCost: z.number().default(5),
  dueDate: z.string().datetime().optional(),
  objectives: z.array(z.object({
    description: z.string().min(1).max(200),
    completed: z.boolean().default(false),
  })).default([]),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = createQuestSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const questData = validation.data;

  // Create new quest with generated ID
  const newQuest = {
    id: `quest_${Date.now()}`,
    ...questData,
    status: 'pending' as const,
    createdAt: new Date(),
    dueDate: questData.dueDate ? new Date(questData.dueDate) : null,
    objectives: questData.objectives.map((obj, index) => ({
      id: `obj_${Date.now()}_${index}`,
      ...obj,
    })),
  };

  // Mock save - in real app would save to database
  console.log('Creating quest:', newQuest);

  return ApiResponseHelper.created(newQuest, 'Quest created successfully');
});