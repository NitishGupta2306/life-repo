import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  date,
  time
} from 'drizzle-orm/pg-core';
import { rarityEnum } from './enums';

// ============================================
// SUPPORTING SYSTEMS
// ============================================

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemName: text('item_name').notNull(),
  itemType: text('item_type').notNull(), // 'resource', 'note', 'tool', 'reference', 'consumable'
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  rarity: rarityEnum('rarity').notNull().default('common'),
  tags: text('tags').array().default([]),
  acquiredFrom: text('acquired_from'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const itemAssociations = pgTable('item_associations', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull().references(() => inventoryItems.id),
  associatedType: text('associated_type').notNull(), // 'quest', 'skill_tree', 'skill'
  associatedId: uuid('associated_id').notNull(),
  relevance: text('relevance').notNull() // 'required', 'helpful', 'reference'
});

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  achievementName: text('achievement_name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'combat', 'exploration', 'crafting', 'social', 'legendary'
  rarity: rarityEnum('rarity').notNull().default('common'),
  icon: text('icon'),
  xpBonus: integer('xp_bonus').notNull().default(0),
  unlocked: boolean('unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at'),
  progressCurrent: integer('progress_current').notNull().default(0),
  progressRequired: integer('progress_required').notNull().default(1)
});

export const adhdAchievements = pgTable('adhd_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  achievementName: text('achievement_name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'self_care', 'reflection', 'streak', 'combo', 'boss_defeat'
  rarity: rarityEnum('rarity').notNull().default('common'),
  unlockCondition: jsonb('unlock_condition').notNull(),
  badgeIcon: text('badge_icon'),
  xpReward: integer('xp_reward').notNull().default(0),
  wisdomBonus: integer('wisdom_bonus').notNull().default(0),
  titleGranted: text('title_granted'),
  unlocked: boolean('unlocked').notNull().default(false),
  unlockedAt: timestamp('unlocked_at')
});

export const smartReminders = pgTable('smart_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  reminderType: text('reminder_type').notNull(), // 'basic_need', 'reflection', 'quest', 'break'
  targetId: uuid('target_id'),
  reminderText: text('reminder_text').notNull(),
  scheduledTime: time('scheduled_time'),
  isAdaptive: boolean('is_adaptive').notNull().default(false),
  snoozeCount: integer('snooze_count').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});