import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pgTable, uuid, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { eq, desc, and } from 'drizzle-orm';

// Define ADHD strategies table (this might be moved to schema later)
const adhdStrategies = pgTable('adhd_strategies', {
  id: uuid('id').primaryKey().defaultRandom(),
  strategyName: text('strategy_name').notNull(),
  category: text('category').notNull(), // 'focus', 'organization', 'emotional_regulation', 'energy_management'
  description: text('description').notNull(),
  instructions: text('instructions').array().default([]),
  difficulty: text('difficulty').notNull().default('easy'), // 'easy', 'medium', 'hard'
  timeRequired: integer('time_required').notNull().default(5), // minutes
  successRate: integer('success_rate').notNull().default(50), // percentage
  timesUsed: integer('times_used').notNull().default(0),
  effectiveness: integer('effectiveness').notNull().default(3), // 1-5 scale
  isPersonalized: boolean('is_personalized').notNull().default(false),
  tags: text('tags').array().default([]),
  prerequisites: text('prerequisites').array().default([]),
  benefits: text('benefits').array().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Pre-defined ADHD strategies
const defaultStrategies = [
  {
    strategyName: "Pomodoro Technique",
    category: "focus",
    description: "Work in focused 25-minute intervals followed by 5-minute breaks",
    instructions: [
      "Set a timer for 25 minutes",
      "Work on one task without interruption",
      "Take a 5-minute break when timer goes off",
      "Repeat 3-4 times, then take a longer break"
    ],
    difficulty: "easy",
    timeRequired: 25,
    benefits: ["Improved focus", "Reduced overwhelm", "Built-in breaks"],
    tags: ["productivity", "time-management", "breaks"]
  },
  {
    strategyName: "Body Doubling",
    category: "focus",
    description: "Work alongside another person (virtually or in-person) for accountability",
    instructions: [
      "Find a body doubling partner or join a virtual session",
      "Share what you plan to work on",
      "Work quietly alongside each other",
      "Check in periodically for encouragement"
    ],
    difficulty: "easy",
    timeRequired: 60,
    benefits: ["Increased accountability", "Reduced procrastination", "Social connection"],
    tags: ["accountability", "social", "focus"]
  },
  {
    strategyName: "The 2-Minute Rule",
    category: "organization",
    description: "If a task takes less than 2 minutes, do it immediately",
    instructions: [
      "When you encounter a small task, estimate if it takes under 2 minutes",
      "If yes, do it right away instead of adding it to your to-do list",
      "If no, write it down properly or schedule it"
    ],
    difficulty: "easy",
    timeRequired: 2,
    benefits: ["Prevents small tasks from piling up", "Reduces mental load", "Quick wins"],
    tags: ["organization", "productivity", "quick-wins"]
  },
  {
    strategyName: "Energy-Based Scheduling",
    category: "energy_management",
    description: "Schedule tasks based on your energy levels rather than arbitrary times",
    instructions: [
      "Track your energy patterns for a week",
      "Identify your high, medium, and low energy times",
      "Schedule demanding tasks during high energy periods",
      "Save routine or easy tasks for low energy times"
    ],
    difficulty: "medium",
    timeRequired: 15,
    benefits: ["Better task completion", "Reduced frustration", "Respects natural rhythms"],
    tags: ["energy", "scheduling", "self-awareness"]
  }
];

export async function GET() {
  try {
    // Get all strategies
    const strategies = await db
      .select()
      .from(adhdStrategies)
      .orderBy(desc(adhdStrategies.effectiveness), desc(adhdStrategies.timesUsed));

    // If no strategies exist, seed with defaults
    if (strategies.length === 0) {
      const seededStrategies = await db
        .insert(adhdStrategies)
        .values(defaultStrategies)
        .returning();

      return NextResponse.json({
        strategies: seededStrategies,
        categories: ['focus', 'organization', 'emotional_regulation', 'energy_management']
      });
    }

    // Group strategies by category
    const categorized = strategies.reduce((acc, strategy) => {
      if (!acc[strategy.category]) {
        acc[strategy.category] = [];
      }
      acc[strategy.category].push(strategy);
      return acc;
    }, {} as Record<string, typeof strategies>);

    return NextResponse.json({
      strategies,
      categorized,
      categories: Object.keys(categorized)
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'use_strategy' && body.strategyId) {
      // Record that a strategy was used
      const updatedStrategy = await db
        .update(adhdStrategies)
        .set({
          timesUsed: db.$increment(adhdStrategies.timesUsed, 1),
        })
        .where(eq(adhdStrategies.id, body.strategyId))
        .returning();

      return NextResponse.json({
        message: 'Strategy usage recorded',
        strategy: updatedStrategy[0]
      });
    }

    if (action === 'rate_strategy' && body.strategyId && body.rating) {
      const { rating } = body; // 1-5 scale

      // Update effectiveness based on rating
      const strategy = await db
        .select()
        .from(adhdStrategies)
        .where(eq(adhdStrategies.id, body.strategyId))
        .limit(1);

      if (!strategy.length) {
        return NextResponse.json(
          { error: 'Strategy not found' },
          { status: 404 }
        );
      }

      // Calculate new effectiveness (weighted average)
      const currentEffectiveness = strategy[0].effectiveness;
      const timesUsed = strategy[0].timesUsed;
      const newEffectiveness = Math.round(
        (currentEffectiveness * timesUsed + rating) / (timesUsed + 1)
      );

      const updatedStrategy = await db
        .update(adhdStrategies)
        .set({
          effectiveness: newEffectiveness,
        })
        .where(eq(adhdStrategies.id, body.strategyId))
        .returning();

      return NextResponse.json({
        message: 'Strategy rating updated',
        strategy: updatedStrategy[0]
      });
    }

    if (action === 'create_custom') {
      const {
        strategyName,
        category,
        description,
        instructions = [],
        difficulty = 'medium',
        timeRequired = 10,
        tags = [],
        benefits = []
      } = body;

      if (!strategyName || !category || !description) {
        return NextResponse.json(
          { error: 'Strategy name, category, and description are required' },
          { status: 400 }
        );
      }

      const customStrategy = await db
        .insert(adhdStrategies)
        .values({
          strategyName,
          category,
          description,
          instructions,
          difficulty,
          timeRequired,
          tags,
          benefits,
          isPersonalized: true,
        })
        .returning();

      return NextResponse.json({
        message: 'Custom strategy created',
        strategy: customStrategy[0]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing strategies:', error);
    return NextResponse.json(
      { error: 'Failed to manage strategies' },
      { status: 500 }
    );
  }
}