<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quests, questObjectives, questSkillTrees } from '../../../../database/schema';
import { eq, desc, and, or, SQL, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereConditions: SQL<unknown>[] = [];

    if (status) {
      whereConditions.push(eq(quests.status, status as any));
    }
    if (type) {
      whereConditions.push(eq(quests.questType, type as any));
    }
    if (difficulty) {
      whereConditions.push(eq(quests.difficulty, difficulty as any));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions)
      : undefined;

    // Fetch quests with their objectives
    const questsData = await db
      .select({
        id: quests.id,
        questName: quests.questName,
        questDescription: quests.questDescription,
        questType: quests.questType,
        difficulty: quests.difficulty,
        status: quests.status,
        xpReward: quests.xpReward,
        goldReward: quests.goldReward,
        skillTreeRewards: quests.skillTreeRewards,
        prerequisites: quests.prerequisites,
        timeLimit: quests.timeLimit,
        startedAt: quests.startedAt,
        completedAt: quests.completedAt,
        createdAt: quests.createdAt,
      })
      .from(quests)
      .where(whereClause)
      .orderBy(desc(quests.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch objectives for all quests
    const questIds = questsData.map(q => q.id);
    const objectives = questIds.length > 0 
      ? await db
          .select()
          .from(questObjectives)
          .where(sql`${questObjectives.questId} = ANY(${questIds})`)
          .orderBy(questObjectives.objectiveOrder)
      : [];

    // Group objectives by quest ID
    const objectivesByQuest = objectives.reduce((acc, obj) => {
      if (!acc[obj.questId]) {
        acc[obj.questId] = [];
      }
      acc[obj.questId].push(obj);
      return acc;
    }, {} as Record<string, typeof objectives>);

    // Combine quests with their objectives and calculate progress
    const questsWithObjectives = questsData.map(quest => {
      const questObjectivesList = objectivesByQuest[quest.id] || [];
      const completedObjectives = questObjectivesList.filter(obj => obj.isCompleted).length;
      const totalObjectives = questObjectivesList.length;
      const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

      return {
        ...quest,
        objectives: questObjectivesList,
        progress: Math.round(progress),
        totalObjectives,
        completedObjectives,
      };
    });

    return NextResponse.json({
      success: true,
      data: questsWithObjectives,
      pagination: {
        limit,
        offset,
        total: questsWithObjectives.length,
      },
    });

  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      questName, 
      questDescription, 
      questType = 'side',
      difficulty = 'normal',
      xpReward = 50,
      goldReward,
      skillTreeRewards = {},
      objectives = [],
      timeLimit,
    } = body;

    // Validate required fields
    if (!questName) {
      return NextResponse.json(
        { success: false, error: 'Quest name is required' },
        { status: 400 }
      );
    }

    // Create the quest
    const [newQuest] = await db
      .insert(quests)
      .values({
        questName,
        questDescription,
        questType,
        difficulty,
        xpReward,
        goldReward,
        skillTreeRewards,
        timeLimit,
        status: 'available',
      })
      .returning();

    // Create objectives if provided
    let questObjectivesList = [];
    if (objectives.length > 0) {
      const objectivesToInsert = objectives.map((obj: any, index: number) => ({
        questId: newQuest.id,
        objectiveText: obj.text || obj.objectiveText,
        objectiveOrder: obj.order || index + 1,
        isRequired: obj.isRequired !== undefined ? obj.isRequired : true,
        xpReward: obj.xpReward || 10,
      }));

      questObjectivesList = await db
        .insert(questObjectives)
        .values(objectivesToInsert)
        .returning();
    }

    const questWithObjectives = {
      ...newQuest,
      objectives: questObjectivesList,
      progress: 0,
      totalObjectives: questObjectivesList.length,
      completedObjectives: 0,
    };

    return NextResponse.json({
      success: true,
      data: questWithObjectives,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quest' },
      { status: 500 }
    );
  }
}
=======
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
>>>>>>> feature/backend-infrastructure
