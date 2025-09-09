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