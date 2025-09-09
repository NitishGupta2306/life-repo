import { pgEnum } from 'drizzle-orm/pg-core';

// ============================================
// SHARED ENUMS
// ============================================

export const questTypeEnum = pgEnum('quest_type', [
  'main', 'side', 'daily', 'weekly', 'epic'
]);

export const difficultyEnum = pgEnum('difficulty', [
  'trivial', 'easy', 'normal', 'hard', 'legendary'
]);

export const questStatusEnum = pgEnum('quest_status', [
  'available', 'active', 'completed', 'failed', 'abandoned'
]);

export const priorityEnum = pgEnum('priority', [
  'low', 'medium', 'high', 'critical'
]);

export const rarityEnum = pgEnum('rarity', [
  'common', 'uncommon', 'rare', 'epic', 'legendary'
]);

export const statCategoryEnum = pgEnum('stat_category', [
  'primary', 'secondary', 'special'
]);

export const skillRankEnum = pgEnum('skill_rank', [
  'novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster'
]);

export const buffTypeEnum = pgEnum('buff_type', [
  'hygiene', 'nutrition', 'hydration', 'movement', 'medication'
]);

export const debuffSeverityEnum = pgEnum('debuff_severity', [
  'minor', 'moderate', 'severe'
]);

export const resourceTypeEnum = pgEnum('resource_type', [
  'energy', 'focus', 'motivation', 'spoons'
]);

export const inputMethodEnum = pgEnum('input_method', [
  'text', 'voice', 'screenshot', 'email'
]);

export const dumpCategoryEnum = pgEnum('dump_category', [
  'urgent', 'random', 'idea', 'worry', 'task', 'memory'
]);

export const processingStatusEnum = pgEnum('processing_status', [
  'pending', 'processing', 'completed', 'needs_review', 'failed'
]);

export const suggestedActionEnum = pgEnum('suggested_action', [
  'create_quest', 'create_task', 'add_note', 'create_reminder', 'add_to_reflection', 'ignore'
]);

export const urgencyEnum = pgEnum('urgency', [
  'now', 'today', 'this_week', 'someday', 'unknown'
]);