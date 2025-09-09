import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  interval,
  primaryKey
} from 'drizzle-orm/pg-core';
import { questTypeEnum, difficultyEnum, questStatusEnum } from './enums';

// ============================================
// QUEST SYSTEM
// ============================================

export const quests = pgTable('quests', {
  id: uuid('id').primaryKey().defaultRandom(),
  questName: text('quest_name').notNull(),
  questDescription: text('quest_description'),
  questType: questTypeEnum('quest_type').notNull().default('side'),
  difficulty: difficultyEnum('difficulty').notNull().default('normal'),
  status: questStatusEnum('status').notNull().default('available'),
  xpReward: integer('xp_reward').notNull().default(50),
  goldReward: integer('gold_reward'),
  skillTreeRewards: jsonb('skill_tree_rewards').default({}),
  prerequisites: uuid('prerequisites').array().default([]),
  timeLimit: interval('time_limit'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const questObjectives = pgTable('quest_objectives', {
  id: uuid('id').primaryKey().defaultRandom(),
  questId: uuid('quest_id').notNull().references(() => quests.id),
  objectiveText: text('objective_text').notNull(),
  objectiveOrder: integer('objective_order').notNull().default(1),
  isRequired: boolean('is_required').notNull().default(true),
  isCompleted: boolean('is_completed').notNull().default(false),
  xpReward: integer('xp_reward').notNull().default(10),
  completedAt: timestamp('completed_at')
});

export const questSkillTrees = pgTable('quest_skill_trees', {
  questId: uuid('quest_id').notNull().references(() => quests.id),
  treeId: uuid('tree_id').notNull(), // References skill_trees.id
  xpReward: integer('xp_reward').notNull().default(50),
  isPrimary: boolean('is_primary').notNull().default(false)
}, (table) => ({
  pk: primaryKey({ columns: [table.questId, table.treeId] })
}));

export const dailyQuests = pgTable('daily_quests', {
  id: uuid('id').primaryKey().defaultRandom(),
  questName: text('quest_name').notNull(),
  xpReward: integer('xp_reward').notNull().default(5),
  streakCount: integer('streak_count').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastCompleted: timestamp('last_completed'),
  skillTreeId: uuid('skill_tree_id') // References skill_trees.id
});

export const bossBattles = pgTable('boss_battles', {
  id: uuid('id').primaryKey().defaultRandom(),
  bossName: text('boss_name').notNull(),
  hpTotal: integer('hp_total').notNull().default(100),
  hpCurrent: integer('hp_current').notNull().default(100),
  weakness: text('weakness').array().default([]),
  appearsWhen: jsonb('appears_when').default({}),
  defeatReward: jsonb('defeat_reward').default({}),
  strategiesTried: uuid('strategies_tried').array().default([]),
  defeated: boolean('defeated').notNull().default(false),
  defeatedAt: timestamp('defeated_at')
});