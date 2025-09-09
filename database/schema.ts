// ============================================
// LIFE RPG DATABASE SCHEMA
// ============================================
// 
// This is the main schema file that exports all tables and types.
// Individual table definitions are organized in separate files.
//
// Schema Organization:
// - enums.ts          - Shared enum definitions
// - character.ts      - Character profile, stats, resources, debuffs
// - skills.ts         - Skill trees, skills, XP tracking
// - quests.ts         - Quests, objectives, boss battles
// - adhd.ts           - ADHD support, buffs, powerups, basic needs
// - brain-dump.ts     - Brain dump processing and AI integration
// - support.ts        - Achievements, inventory, reminders
// - reflections.ts    - Daily/weekly reflections, patterns

// ============================================
// ENUM EXPORTS
// ============================================
export * from './schemas/enums';

// ============================================
// TABLE EXPORTS
// ============================================

// Character System
export * from './schemas/character';

// Skill & Progression System
export * from './schemas/skills';

// Quest System
export * from './schemas/quests';

// ADHD Support System
export * from './schemas/adhd';

// Brain Dump System
export * from './schemas/brain-dump';

// Supporting Systems
export * from './schemas/support';

// Reflection & Pattern Tracking
export * from './schemas/reflections';

// ============================================
// TYPE EXPORTS (for convenience)
// ============================================
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { characterProfile, characterStats, characterResources } from './schemas/character';
import { skillTrees, skills } from './schemas/skills';
import { quests, questObjectives } from './schemas/quests';
import { brainDumps } from './schemas/brain-dump';
import { basicNeeds } from './schemas/adhd';

// Character types
export type CharacterProfile = typeof characterProfile.$inferSelect;
export type NewCharacterProfile = typeof characterProfile.$inferInsert;
export type CharacterStats = typeof characterStats.$inferSelect;
export type NewCharacterStats = typeof characterStats.$inferInsert;
export type CharacterResources = typeof characterResources.$inferSelect;
export type NewCharacterResources = typeof characterResources.$inferInsert;

// Skill types
export type SkillTree = typeof skillTrees.$inferSelect;
export type NewSkillTree = typeof skillTrees.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

// Quest types
export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
export type QuestObjective = typeof questObjectives.$inferSelect;
export type NewQuestObjective = typeof questObjectives.$inferInsert;

// Brain dump types
export type BrainDump = typeof brainDumps.$inferSelect;
export type NewBrainDump = typeof brainDumps.$inferInsert;

// ADHD support types
export type BasicNeed = typeof basicNeeds.$inferSelect;
export type NewBasicNeed = typeof basicNeeds.$inferInsert;

// Zod schemas for validation
export const characterProfileInsertSchema = createInsertSchema(characterProfile);
export const characterProfileSelectSchema = createSelectSchema(characterProfile);
export const brainDumpInsertSchema = createInsertSchema(brainDumps);
export const brainDumpSelectSchema = createSelectSchema(brainDumps);