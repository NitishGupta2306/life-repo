import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  jsonb, 
  boolean
} from 'drizzle-orm/pg-core';
import { statCategoryEnum, debuffSeverityEnum, resourceTypeEnum } from './enums';

// ============================================
// CHARACTER SYSTEM TABLES
// ============================================

export const characterProfile = pgTable('character_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterName: text('character_name').notNull(),
  characterLevel: integer('character_level').notNull(), // Age
  totalXp: integer('total_xp').notNull().default(0),
  characterClass: text('character_class'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login')
});

export const characterStats = pgTable('character_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  statName: text('stat_name').notNull(),
  baseValue: integer('base_value').notNull().default(0),
  currentValue: integer('current_value').notNull().default(0),
  maxValue: integer('max_value').notNull().default(100),
  statCategory: statCategoryEnum('stat_category').notNull().default('primary'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const characterResources = pgTable('character_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceType: resourceTypeEnum('resource_type').notNull(),
  currentValue: integer('current_value').notNull().default(50),
  maxValue: integer('max_value').notNull().default(100),
  regenRate: integer('regen_rate').notNull().default(5), // Per hour
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  modifiers: jsonb('modifiers').default({})
});

export const characterDebuffs = pgTable('character_debuffs', {
  id: uuid('id').primaryKey().defaultRandom(),
  debuffName: text('debuff_name').notNull(),
  debuffIcon: text('debuff_icon'),
  triggeredBy: text('triggered_by'),
  statPenalty: jsonb('stat_penalty').notNull().default({}),
  severity: debuffSeverityEnum('severity').notNull().default('minor'),
  activeSince: timestamp('active_since').notNull().defaultNow(),
  canStack: boolean('can_stack').notNull().default(false),
  removalCondition: text('removal_condition')
});