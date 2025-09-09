import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  decimal, 
  boolean, 
  jsonb
} from 'drizzle-orm/pg-core';
import { skillRankEnum } from './enums';

// ============================================
// SKILL & PROGRESSION SYSTEM
// ============================================

export const skillTrees = pgTable('skill_trees', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeName: text('tree_name').notNull(),
  treeLevel: integer('tree_level').notNull().default(1),
  totalTreeXp: integer('total_tree_xp').notNull().default(0),
  skillPointsAvailable: integer('skill_points_available').notNull().default(0),
  masteryPercentage: decimal('mastery_percentage', { precision: 5, scale: 2 }).notNull().default('0.00'),
  isUnlocked: boolean('is_unlocked').notNull().default(true),
  icon: text('icon'),
  colorHex: text('color_hex'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  treeId: uuid('tree_id').notNull().references(() => skillTrees.id),
  skillName: text('skill_name').notNull(),
  skillLevel: integer('skill_level').notNull().default(0),
  currentXp: integer('current_xp').notNull().default(0),
  xpToNextLevel: integer('xp_to_next_level').notNull().default(100),
  skillRank: skillRankEnum('skill_rank').notNull().default('novice'),
  unlocked: boolean('unlocked').notNull().default(false),
  prerequisites: uuid('prerequisites').array().default([]),
  unlockedAt: timestamp('unlocked_at')
});

export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceType: text('source_type').notNull(), // 'quest', 'objective', 'daily', 'achievement', 'bonus'
  sourceId: uuid('source_id'),
  skillTreeId: uuid('skill_tree_id').references(() => skillTrees.id),
  xpAmount: integer('xp_amount').notNull(),
  description: text('description'),
  earnedAt: timestamp('earned_at').notNull().defaultNow()
});

export const statProgression = pgTable('stat_progression', {
  id: uuid('id').primaryKey().defaultRandom(),
  statId: uuid('stat_id').notNull(), // References character_stats.id
  xpCurrent: integer('xp_current').notNull().default(0),
  xpToNextLevel: integer('xp_to_next_level').notNull().default(1000),
  levelUpHistory: jsonb('level_up_history').notNull().default([]),
  lastLevelUp: timestamp('last_level_up')
});