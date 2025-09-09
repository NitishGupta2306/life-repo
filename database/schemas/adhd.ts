import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  decimal, 
  boolean, 
  jsonb, 
  interval,
  date,
  time
} from 'drizzle-orm/pg-core';
import { buffTypeEnum, priorityEnum } from './enums';

// ============================================
// ADHD SUPPORT SYSTEM
// ============================================

export const dailyBuffs = pgTable('daily_buffs', {
  id: uuid('id').primaryKey().defaultRandom(),
  buffName: text('buff_name').notNull(),
  buffIcon: text('buff_icon'),
  buffType: buffTypeEnum('buff_type').notNull(),
  statBoost: jsonb('stat_boost').notNull().default({}),
  duration: interval('duration').notNull(),
  stackCount: integer('stack_count').notNull().default(1),
  xpReward: integer('xp_reward').notNull().default(5),
  achievementId: uuid('achievement_id'),
  lastActivated: timestamp('last_activated'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active')
});

export const buffCombos = pgTable('buff_combos', {
  id: uuid('id').primaryKey().defaultRandom(),
  comboName: text('combo_name').notNull(),
  requiredBuffs: uuid('required_buffs').array().notNull(),
  comboMultiplier: decimal('combo_multiplier', { precision: 3, scale: 2 }).notNull().default('1.50'),
  bonusXp: integer('bonus_xp').notNull().default(50),
  specialEffect: text('special_effect'),
  timesAchieved: integer('times_achieved').notNull().default(0),
  lastAchieved: timestamp('last_achieved')
});

export const adhdPowerups = pgTable('adhd_powerups', {
  id: uuid('id').primaryKey().defaultRandom(),
  powerupName: text('powerup_name').notNull(),
  powerupType: text('powerup_type').notNull(), // 'consumable', 'equipment', 'passive'
  description: text('description'),
  cooldown: interval('cooldown'),
  energyCost: integer('energy_cost').notNull().default(0),
  effect: jsonb('effect').notNull().default({}),
  timesUsed: integer('times_used').notNull().default(0),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }),
  unlockCondition: text('unlock_condition'),
  isUnlocked: boolean('is_unlocked').notNull().default(false)
});

export const reflectionQuests = pgTable('reflection_quests', {
  id: uuid('id').primaryKey().defaultRandom(),
  questName: text('quest_name').notNull(),
  questType: text('quest_type').notNull(), // 'morning_ritual', 'evening_reflection', 'weekly_review'
  xpReward: integer('xp_reward').notNull().default(25),
  bonusXpStreak: integer('bonus_xp_streak').notNull().default(0),
  wisdomPoints: integer('wisdom_points').notNull().default(5),
  streakCount: integer('streak_count').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastCompleted: date('last_completed'),
  prompts: text('prompts').array().default([]),
  timeOfDay: time('time_of_day')
});

export const wisdomInsights = pgTable('wisdom_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  insightText: text('insight_text').notNull(),
  insightType: text('insight_type').notNull(), // 'pattern', 'trigger', 'strategy', 'self_discovery'
  wisdomPointsEarned: integer('wisdom_points_earned').notNull().default(10),
  timesValidated: integer('times_validated').notNull().default(0),
  confidenceLevel: decimal('confidence_level', { precision: 5, scale: 2 }),
  discoveredDate: date('discovered_date').notNull().defaultNow(),
  relatedQuests: uuid('related_quests').array().default([]),
  relatedBuffs: uuid('related_buffs').array().default([])
});

export const supportGuild = pgTable('support_guild', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberName: text('member_name').notNull(),
  memberRole: text('member_role').notNull(), // 'healer', 'tank', 'dps', 'support'
  assistanceType: text('assistance_type').array().default([]),
  trustLevel: integer('trust_level').notNull().default(50),
  lastInteraction: timestamp('last_interaction'),
  buffsProvided: jsonb('buffs_provided').default({})
});

export const basicNeeds = pgTable('basic_needs', {
  id: uuid('id').primaryKey().defaultRandom(),
  needName: text('need_name').notNull(),
  needCategory: text('need_category').notNull(), // 'hygiene', 'nutrition', 'hydration', 'movement', 'medication'
  priority: priorityEnum('priority').notNull().default('medium'),
  idealFrequency: interval('ideal_frequency').notNull(),
  lastCompleted: timestamp('last_completed'),
  streakCount: integer('streak_count').notNull().default(0),
  isOverdue: boolean('is_overdue'),
  reminderEnabled: boolean('reminder_enabled').notNull().default(true),
  xpReward: integer('xp_reward').notNull().default(3)
});

export const needCompletions = pgTable('need_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  needId: uuid('need_id').notNull().references(() => basicNeeds.id),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  difficultyRating: integer('difficulty_rating'), // 1-5
  energyBefore: integer('energy_before'), // 1-10
  energyAfter: integer('energy_after'), // 1-10
  notes: text('notes')
});