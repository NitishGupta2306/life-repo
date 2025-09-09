import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  decimal, 
  boolean, 
  jsonb, 
  date
} from 'drizzle-orm/pg-core';

// ============================================
// REFLECTION & PATTERN TRACKING
// ============================================

export const dailyReflections = pgTable('daily_reflections', {
  id: uuid('id').primaryKey().defaultRandom(),
  reflectionDate: date('reflection_date').notNull().defaultNow(),
  morningIntention: text('morning_intention'),
  eveningReflection: text('evening_reflection'),
  energyLevel: integer('energy_level'), // 1-10
  focusLevel: integer('focus_level'), // 1-10
  moodTags: text('mood_tags').array().default([]),
  gratitudeList: text('gratitude_list').array().default([]),
  completedAt: timestamp('completed_at'),
  reflectionPrompt: text('reflection_prompt'),
  isComplete: boolean('is_complete').notNull().default(false)
});

export const taskReflections = pgTable('task_reflections', {
  id: uuid('id').primaryKey().defaultRandom(),
  questObjectiveId: uuid('quest_objective_id').notNull(), // References quest_objectives.id
  reflectionDate: date('reflection_date').notNull().defaultNow(),
  whyIncomplete: text('why_incomplete').notNull(),
  blockers: text('blockers').array().default([]),
  whatWouldHelp: text('what_would_help'),
  selfCompassionNote: text('self_compassion_note'),
  patternIdentified: text('pattern_identified'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const weeklyReflections = pgTable('weekly_reflections', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStart: date('week_start').notNull(),
  weekEnd: date('week_end').notNull(),
  keyWins: text('key_wins').array().default([]),
  keyStruggles: text('key_struggles').array().default([]),
  patternsNoticed: text('patterns_noticed').array().default([]),
  energyPattern: jsonb('energy_pattern').default({}),
  focusPattern: jsonb('focus_pattern').default({}),
  basicNeedsCompletion: decimal('basic_needs_completion', { precision: 5, scale: 2 }),
  questCompletionRate: decimal('quest_completion_rate', { precision: 5, scale: 2 }),
  selfInsight: text('self_insight'),
  nextWeekIntention: text('next_week_intention'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const behaviorPatterns = pgTable('behavior_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternName: text('pattern_name').notNull(),
  patternType: text('pattern_type').notNull(), // 'helpful', 'harmful', 'neutral'
  triggerConditions: jsonb('trigger_conditions').default({}),
  outcome: text('outcome'),
  frequency: integer('frequency').notNull().default(1),
  firstObserved: date('first_observed').notNull().defaultNow(),
  lastObserved: date('last_observed').notNull().defaultNow(),
  strategyId: uuid('strategy_id') // References adhd_powerups.id
});