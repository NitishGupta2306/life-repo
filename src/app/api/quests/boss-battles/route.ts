import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bossBattles } from '../../../../../database/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const defeated = searchParams.get('defeated');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause;
    if (defeated !== null) {
      whereClause = eq(bossBattles.defeated, defeated === 'true');
    }

    const battles = await db
      .select()
      .from(bossBattles)
      .where(whereClause)
      .orderBy(desc(bossBattles.defeatedAt), desc(bossBattles.id))
      .limit(limit)
      .offset(offset);

    // Calculate progress for each boss battle
    const battlesWithProgress = battles.map(battle => ({
      ...battle,
      progress: Math.round(((battle.hpTotal - battle.hpCurrent) / battle.hpTotal) * 100),
      healthPercentage: Math.round((battle.hpCurrent / battle.hpTotal) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: battlesWithProgress,
      pagination: {
        limit,
        offset,
        total: battlesWithProgress.length,
      },
    });

  } catch (error) {
    console.error('Error fetching boss battles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch boss battles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bossName,
      hpTotal = 100,
      weakness = [],
      appearsWhen = {},
      defeatReward = {},
    } = body;

    // Validate required fields
    if (!bossName) {
      return NextResponse.json(
        { success: false, error: 'Boss name is required' },
        { status: 400 }
      );
    }

    // Create the boss battle
    const [newBoss] = await db
      .insert(bossBattles)
      .values({
        bossName,
        hpTotal,
        hpCurrent: hpTotal, // Boss starts at full health
        weakness,
        appearsWhen,
        defeatReward,
        strategiesTried: [],
        defeated: false,
      })
      .returning();

    const bossWithProgress = {
      ...newBoss,
      progress: 0,
      healthPercentage: 100,
    };

    return NextResponse.json({
      success: true,
      data: bossWithProgress,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating boss battle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create boss battle' },
      { status: 500 }
    );
  }
}