import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyBuffs, buffCombos } from '../../../../../database/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all active buffs (not expired)
    const activeBuffs = await db
      .select()
      .from(dailyBuffs)
      .where(
        and(
          eq(dailyBuffs.isActive, true),
          gte(dailyBuffs.expiresAt, new Date())
        )
      )
      .orderBy(desc(dailyBuffs.lastActivated));

    // Get available buff combos
    const combos = await db
      .select()
      .from(buffCombos)
      .orderBy(desc(buffCombos.lastAchieved));

    return NextResponse.json({
      activeBuffs,
      availableCombos: combos,
      totalActiveBuffs: activeBuffs.length
    });
  } catch (error) {
    console.error('Error fetching buffs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buffs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, buffName, buffType, duration = 60, statBoost = {} } = body;

    if (action === 'activate') {
      // Calculate expiration time (duration in minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + duration);

      // Check if buff already exists and is active
      const existingBuff = await db
        .select()
        .from(dailyBuffs)
        .where(
          and(
            eq(dailyBuffs.buffName, buffName),
            eq(dailyBuffs.isActive, true),
            gte(dailyBuffs.expiresAt, new Date())
          )
        )
        .limit(1);

      if (existingBuff.length > 0) {
        // Stack the buff or extend duration
        const updatedBuff = await db
          .update(dailyBuffs)
          .set({
            stackCount: existingBuff[0].stackCount + 1,
            expiresAt: expiresAt,
            lastActivated: new Date(),
          })
          .where(eq(dailyBuffs.id, existingBuff[0].id))
          .returning();

        return NextResponse.json({
          message: `${buffName} buff stacked!`,
          buff: updatedBuff[0]
        });
      } else {
        // Create new buff
        const newBuff = await db
          .insert(dailyBuffs)
          .values({
            buffName,
            buffType,
            statBoost,
            duration: `${duration} minutes`,
            stackCount: 1,
            xpReward: calculateBuffXP(buffType, duration),
            lastActivated: new Date(),
            expiresAt,
            isActive: true,
          })
          .returning();

        return NextResponse.json({
          message: `${buffName} buff activated!`,
          buff: newBuff[0]
        });
      }
    }

    if (action === 'deactivate' && body.buffId) {
      // Deactivate a specific buff
      const deactivatedBuff = await db
        .update(dailyBuffs)
        .set({
          isActive: false,
          expiresAt: new Date(), // Set to now to mark as expired
        })
        .where(eq(dailyBuffs.id, body.buffId))
        .returning();

      return NextResponse.json({
        message: 'Buff deactivated',
        buff: deactivatedBuff[0]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing buffs:', error);
    return NextResponse.json(
      { error: 'Failed to manage buffs' },
      { status: 500 }
    );
  }
}

function calculateBuffXP(buffType: string, duration: number): number {
  const baseXP = {
    'hygiene': 15,
    'nutrition': 20,
    'hydration': 10,
    'movement': 25,
    'medication': 30
  };

  const base = baseXP[buffType as keyof typeof baseXP] || 15;
  const durationMultiplier = Math.max(1, duration / 60); // Base is 1 hour
  
  return Math.floor(base * durationMultiplier);
}