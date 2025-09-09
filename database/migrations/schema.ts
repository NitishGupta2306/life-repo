import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, interval, numeric, date, time, unique, foreignKey, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const buffType = pgEnum("buff_type", ['hygiene', 'nutrition', 'hydration', 'movement', 'medication'])
export const debuffSeverity = pgEnum("debuff_severity", ['minor', 'moderate', 'severe'])
export const difficulty = pgEnum("difficulty", ['trivial', 'easy', 'normal', 'hard', 'legendary'])
export const dumpCategory = pgEnum("dump_category", ['urgent', 'random', 'idea', 'worry', 'task', 'memory'])
export const inputMethod = pgEnum("input_method", ['text', 'voice', 'screenshot', 'email'])
export const priority = pgEnum("priority", ['low', 'medium', 'high', 'critical'])
export const processingStatus = pgEnum("processing_status", ['pending', 'processing', 'completed', 'needs_review', 'failed'])
export const questStatus = pgEnum("quest_status", ['available', 'active', 'completed', 'failed', 'abandoned'])
export const questType = pgEnum("quest_type", ['main', 'side', 'daily', 'weekly', 'epic'])
export const rarity = pgEnum("rarity", ['common', 'uncommon', 'rare', 'epic', 'legendary'])
export const resourceType = pgEnum("resource_type", ['energy', 'focus', 'motivation', 'spoons'])
export const skillRank = pgEnum("skill_rank", ['novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster'])
export const statCategory = pgEnum("stat_category", ['primary', 'secondary', 'special'])
export const suggestedAction = pgEnum("suggested_action", ['create_quest', 'create_task', 'add_note', 'create_reminder', 'add_to_reflection', 'ignore'])
export const urgency = pgEnum("urgency", ['now', 'today', 'this_week', 'someday', 'unknown'])


export const characterDebuffs = pgTable("character_debuffs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	debuffName: text("debuff_name").notNull(),
	debuffIcon: text("debuff_icon"),
	triggeredBy: text("triggered_by"),
	statPenalty: jsonb("stat_penalty").default({}).notNull(),
	severity: debuffSeverity().default('minor').notNull(),
	activeSince: timestamp("active_since", { mode: 'string' }).defaultNow().notNull(),
	canStack: boolean("can_stack").default(false).notNull(),
	removalCondition: text("removal_condition"),
});

export const characterProfile = pgTable("character_profile", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	characterName: text("character_name").notNull(),
	characterLevel: integer("character_level").notNull(),
	totalXp: integer("total_xp").default(0).notNull(),
	characterClass: text("character_class"),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
});

export const characterResources = pgTable("character_resources", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	resourceType: resourceType("resource_type").notNull(),
	currentValue: integer("current_value").default(50).notNull(),
	maxValue: integer("max_value").default(100).notNull(),
	regenRate: integer("regen_rate").default(5).notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	modifiers: jsonb().default({}),
});

export const characterStats = pgTable("character_stats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	statName: text("stat_name").notNull(),
	baseValue: integer("base_value").default(0).notNull(),
	currentValue: integer("current_value").default(0).notNull(),
	maxValue: integer("max_value").default(100).notNull(),
	statCategory: statCategory("stat_category").default('primary').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const statProgression = pgTable("stat_progression", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	statId: uuid("stat_id").notNull(),
	xpCurrent: integer("xp_current").default(0).notNull(),
	xpToNextLevel: integer("xp_to_next_level").default(1000).notNull(),
	levelUpHistory: jsonb("level_up_history").default([]).notNull(),
	lastLevelUp: timestamp("last_level_up", { mode: 'string' }),
});

export const bossBattles = pgTable("boss_battles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bossName: text("boss_name").notNull(),
	hpTotal: integer("hp_total").default(100).notNull(),
	hpCurrent: integer("hp_current").default(100).notNull(),
	weakness: text().array().default([""]),
	appearsWhen: jsonb("appears_when").default({}),
	defeatReward: jsonb("defeat_reward").default({}),
	strategiesTried: uuid("strategies_tried").array().default([""]),
	defeated: boolean().default(false).notNull(),
	defeatedAt: timestamp("defeated_at", { mode: 'string' }),
});

export const dailyQuests = pgTable("daily_quests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questName: text("quest_name").notNull(),
	xpReward: integer("xp_reward").default(5).notNull(),
	streakCount: integer("streak_count").default(0).notNull(),
	bestStreak: integer("best_streak").default(0).notNull(),
	lastCompleted: timestamp("last_completed", { mode: 'string' }),
	skillTreeId: uuid("skill_tree_id"),
});

export const adhdPowerups = pgTable("adhd_powerups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	powerupName: text("powerup_name").notNull(),
	powerupType: text("powerup_type").notNull(),
	description: text(),
	cooldown: interval(),
	energyCost: integer("energy_cost").default(0).notNull(),
	effect: jsonb().default({}).notNull(),
	timesUsed: integer("times_used").default(0).notNull(),
	successRate: numeric("success_rate", { precision: 5, scale:  2 }),
	unlockCondition: text("unlock_condition"),
	isUnlocked: boolean("is_unlocked").default(false).notNull(),
});

export const buffCombos = pgTable("buff_combos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	comboName: text("combo_name").notNull(),
	requiredBuffs: uuid("required_buffs").array().notNull(),
	comboMultiplier: numeric("combo_multiplier", { precision: 3, scale:  2 }).default('1.50').notNull(),
	bonusXp: integer("bonus_xp").default(50).notNull(),
	specialEffect: text("special_effect"),
	timesAchieved: integer("times_achieved").default(0).notNull(),
	lastAchieved: timestamp("last_achieved", { mode: 'string' }),
});

export const dailyBuffs = pgTable("daily_buffs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	buffName: text("buff_name").notNull(),
	buffIcon: text("buff_icon"),
	buffType: buffType("buff_type").notNull(),
	statBoost: jsonb("stat_boost").default({}).notNull(),
	duration: interval().notNull(),
	stackCount: integer("stack_count").default(1).notNull(),
	xpReward: integer("xp_reward").default(5).notNull(),
	achievementId: uuid("achievement_id"),
	lastActivated: timestamp("last_activated", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: boolean("is_active"),
});

export const reflectionQuests = pgTable("reflection_quests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questName: text("quest_name").notNull(),
	questType: text("quest_type").notNull(),
	xpReward: integer("xp_reward").default(25).notNull(),
	bonusXpStreak: integer("bonus_xp_streak").default(0).notNull(),
	wisdomPoints: integer("wisdom_points").default(5).notNull(),
	streakCount: integer("streak_count").default(0).notNull(),
	bestStreak: integer("best_streak").default(0).notNull(),
	lastCompleted: date("last_completed"),
	prompts: text().array().default([""]),
	timeOfDay: time("time_of_day"),
});

export const supportGuild = pgTable("support_guild", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	memberName: text("member_name").notNull(),
	memberRole: text("member_role").notNull(),
	assistanceType: text("assistance_type").array().default([""]),
	trustLevel: integer("trust_level").default(50).notNull(),
	lastInteraction: timestamp("last_interaction", { mode: 'string' }),
	buffsProvided: jsonb("buffs_provided").default({}),
});

export const wisdomInsights = pgTable("wisdom_insights", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	insightText: text("insight_text").notNull(),
	insightType: text("insight_type").notNull(),
	wisdomPointsEarned: integer("wisdom_points_earned").default(10).notNull(),
	timesValidated: integer("times_validated").default(0).notNull(),
	confidenceLevel: numeric("confidence_level", { precision: 5, scale:  2 }),
	discoveredDate: date("discovered_date").defaultNow().notNull(),
	relatedQuests: uuid("related_quests").array().default([""]),
	relatedBuffs: uuid("related_buffs").array().default([""]),
});

export const magicPhrases = pgTable("magic_phrases", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	phrase: text().notNull(),
	action: jsonb().notNull(),
	createsBuffs: boolean("creates_buffs").default(false).notNull(),
	xpModifier: numeric("xp_modifier", { precision: 3, scale:  2 }).default('1.00').notNull(),
	personalMeaning: text("personal_meaning"),
}, (table) => [
	unique("magic_phrases_phrase_unique").on(table.phrase),
]);

export const parsingPatterns = pgTable("parsing_patterns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	triggerPhrase: text("trigger_phrase").notNull(),
	actionType: text("action_type").notNull(),
	priorityModifier: integer("priority_modifier").default(0).notNull(),
	skillTreeHint: text("skill_tree_hint"),
	learnedFromUser: boolean("learned_from_user").default(false).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	successRate: numeric("success_rate", { precision: 5, scale:  2 }),
});

export const processingQueue = pgTable("processing_queue", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	brainDumpIds: uuid("brain_dump_ids").array().notNull(),
	processingType: text("processing_type").notNull(),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	completed: boolean().default(false).notNull(),
	totalCreatedQuests: integer("total_created_quests").default(0).notNull(),
	totalCreatedNotes: integer("total_created_notes").default(0).notNull(),
	summary: text(),
});

export const quickCaptureTemplates = pgTable("quick_capture_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	templateName: text("template_name").notNull(),
	triggerKeywords: text("trigger_keywords").array().default([""]),
	templateStructure: jsonb("template_structure").notNull(),
	autoCreates: text("auto_creates").notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
});

export const userPatterns = pgTable("user_patterns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	patternText: text("pattern_text").notNull(),
	patternMeaning: text("pattern_meaning"),
	frequency: integer().default(1).notNull(),
	confirmedByUser: boolean("confirmed_by_user").default(false).notNull(),
	lastSeen: timestamp("last_seen", { mode: 'string' }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	achievementName: text("achievement_name").notNull(),
	description: text(),
	category: text().notNull(),
	rarity: rarity().default('common').notNull(),
	icon: text(),
	xpBonus: integer("xp_bonus").default(0).notNull(),
	unlocked: boolean().default(false).notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
	progressCurrent: integer("progress_current").default(0).notNull(),
	progressRequired: integer("progress_required").default(1).notNull(),
});

export const adhdAchievements = pgTable("adhd_achievements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	achievementName: text("achievement_name").notNull(),
	description: text(),
	category: text().notNull(),
	rarity: rarity().default('common').notNull(),
	unlockCondition: jsonb("unlock_condition").notNull(),
	badgeIcon: text("badge_icon"),
	xpReward: integer("xp_reward").default(0).notNull(),
	wisdomBonus: integer("wisdom_bonus").default(0).notNull(),
	titleGranted: text("title_granted"),
	unlocked: boolean().default(false).notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
});

export const smartReminders = pgTable("smart_reminders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reminderType: text("reminder_type").notNull(),
	targetId: uuid("target_id"),
	reminderText: text("reminder_text").notNull(),
	scheduledTime: time("scheduled_time"),
	isAdaptive: boolean("is_adaptive").default(false).notNull(),
	snoozeCount: integer("snooze_count").default(0).notNull(),
	completed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const behaviorPatterns = pgTable("behavior_patterns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	patternName: text("pattern_name").notNull(),
	patternType: text("pattern_type").notNull(),
	triggerConditions: jsonb("trigger_conditions").default({}),
	outcome: text(),
	frequency: integer().default(1).notNull(),
	firstObserved: date("first_observed").defaultNow().notNull(),
	lastObserved: date("last_observed").defaultNow().notNull(),
	strategyId: uuid("strategy_id"),
});

export const dailyReflections = pgTable("daily_reflections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reflectionDate: date("reflection_date").defaultNow().notNull(),
	morningIntention: text("morning_intention"),
	eveningReflection: text("evening_reflection"),
	energyLevel: integer("energy_level"),
	focusLevel: integer("focus_level"),
	moodTags: text("mood_tags").array().default([""]),
	gratitudeList: text("gratitude_list").array().default([""]),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	reflectionPrompt: text("reflection_prompt"),
	isComplete: boolean("is_complete").default(false).notNull(),
});

export const taskReflections = pgTable("task_reflections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questObjectiveId: uuid("quest_objective_id").notNull(),
	reflectionDate: date("reflection_date").defaultNow().notNull(),
	whyIncomplete: text("why_incomplete").notNull(),
	blockers: text().array().default([""]),
	whatWouldHelp: text("what_would_help"),
	selfCompassionNote: text("self_compassion_note"),
	patternIdentified: text("pattern_identified"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const weeklyReflections = pgTable("weekly_reflections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	weekStart: date("week_start").notNull(),
	weekEnd: date("week_end").notNull(),
	keyWins: text("key_wins").array().default([""]),
	keyStruggles: text("key_struggles").array().default([""]),
	patternsNoticed: text("patterns_noticed").array().default([""]),
	energyPattern: jsonb("energy_pattern").default({}),
	focusPattern: jsonb("focus_pattern").default({}),
	basicNeedsCompletion: numeric("basic_needs_completion", { precision: 5, scale:  2 }),
	questCompletionRate: numeric("quest_completion_rate", { precision: 5, scale:  2 }),
	selfInsight: text("self_insight"),
	nextWeekIntention: text("next_week_intention"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const skillTrees = pgTable("skill_trees", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	treeName: text("tree_name").notNull(),
	treeLevel: integer("tree_level").default(1).notNull(),
	totalTreeXp: integer("total_tree_xp").default(0).notNull(),
	skillPointsAvailable: integer("skill_points_available").default(0).notNull(),
	masteryPercentage: numeric("mastery_percentage", { precision: 5, scale:  2 }).default('0.00').notNull(),
	isUnlocked: boolean("is_unlocked").default(true).notNull(),
	icon: text(),
	colorHex: text("color_hex"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const skills = pgTable("skills", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	treeId: uuid("tree_id").notNull(),
	skillName: text("skill_name").notNull(),
	skillLevel: integer("skill_level").default(0).notNull(),
	currentXp: integer("current_xp").default(0).notNull(),
	xpToNextLevel: integer("xp_to_next_level").default(100).notNull(),
	skillRank: skillRank("skill_rank").default('novice').notNull(),
	unlocked: boolean().default(false).notNull(),
	prerequisites: uuid().array().default([""]),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.treeId],
			foreignColumns: [skillTrees.id],
			name: "skills_tree_id_skill_trees_id_fk"
		}),
]);

export const xpTransactions = pgTable("xp_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceType: text("source_type").notNull(),
	sourceId: uuid("source_id"),
	skillTreeId: uuid("skill_tree_id"),
	xpAmount: integer("xp_amount").notNull(),
	description: text(),
	earnedAt: timestamp("earned_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.skillTreeId],
			foreignColumns: [skillTrees.id],
			name: "xp_transactions_skill_tree_id_skill_trees_id_fk"
		}),
]);

export const quests = pgTable("quests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questName: text("quest_name").notNull(),
	questDescription: text("quest_description"),
	questType: questType("quest_type").default('side').notNull(),
	difficulty: difficulty().default('normal').notNull(),
	status: questStatus().default('available').notNull(),
	xpReward: integer("xp_reward").default(50).notNull(),
	goldReward: integer("gold_reward"),
	skillTreeRewards: jsonb("skill_tree_rewards").default({}),
	prerequisites: uuid().array().default([""]),
	timeLimit: interval("time_limit"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const questObjectives = pgTable("quest_objectives", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questId: uuid("quest_id").notNull(),
	objectiveText: text("objective_text").notNull(),
	objectiveOrder: integer("objective_order").default(1).notNull(),
	isRequired: boolean("is_required").default(true).notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	xpReward: integer("xp_reward").default(10).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_objectives_quest_id_quests_id_fk"
		}),
]);

export const basicNeeds = pgTable("basic_needs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	needName: text("need_name").notNull(),
	needCategory: text("need_category").notNull(),
	priority: priority().default('medium').notNull(),
	idealFrequency: interval("ideal_frequency").notNull(),
	lastCompleted: timestamp("last_completed", { mode: 'string' }),
	streakCount: integer("streak_count").default(0).notNull(),
	isOverdue: boolean("is_overdue"),
	reminderEnabled: boolean("reminder_enabled").default(true).notNull(),
	xpReward: integer("xp_reward").default(3).notNull(),
});

export const needCompletions = pgTable("need_completions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	needId: uuid("need_id").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow().notNull(),
	difficultyRating: integer("difficulty_rating"),
	energyBefore: integer("energy_before"),
	energyAfter: integer("energy_after"),
	notes: text(),
}, (table) => [
	foreignKey({
			columns: [table.needId],
			foreignColumns: [basicNeeds.id],
			name: "need_completions_need_id_basic_needs_id_fk"
		}),
]);

export const brainDumps = pgTable("brain_dumps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	rawText: text("raw_text").notNull(),
	inputMethod: inputMethod("input_method").default('text').notNull(),
	dumpCategory: dumpCategory("dump_category"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	processed: boolean().default(false).notNull(),
	processingStatus: processingStatus("processing_status").default('pending').notNull(),
	confidenceScore: numeric("confidence_score", { precision: 5, scale:  2 }),
	requiresHumanReview: boolean("requires_human_review").default(false).notNull(),
});

export const aiProcessingResults = pgTable("ai_processing_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	brainDumpId: uuid("brain_dump_id").notNull(),
	aiInterpretation: text("ai_interpretation"),
	suggestedAction: suggestedAction("suggested_action").notNull(),
	detectedUrgency: urgency("detected_urgency").default('unknown').notNull(),
	detectedEmotion: text("detected_emotion").array().default([""]),
	suggestedSkillTrees: uuid("suggested_skill_trees").array().default([""]),
	suggestedQuestType: text("suggested_quest_type"),
	extractedEntities: jsonb("extracted_entities").default({}),
	processedAt: timestamp("processed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.brainDumpId],
			foreignColumns: [brainDumps.id],
			name: "ai_processing_results_brain_dump_id_brain_dumps_id_fk"
		}),
]);

export const autoGeneratedContent = pgTable("auto_generated_content", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceDumpId: uuid("source_dump_id").notNull(),
	contentType: text("content_type").notNull(),
	contentId: uuid("content_id").notNull(),
	autoGenerated: boolean("auto_generated").default(true).notNull(),
	humanModified: boolean("human_modified").default(false).notNull(),
	accepted: boolean(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sourceDumpId],
			foreignColumns: [brainDumps.id],
			name: "auto_generated_content_source_dump_id_brain_dumps_id_fk"
		}),
]);

export const inventoryItems = pgTable("inventory_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itemName: text("item_name").notNull(),
	itemType: text("item_type").notNull(),
	description: text(),
	quantity: integer().default(1).notNull(),
	rarity: rarity().default('common').notNull(),
	tags: text().array().default([""]),
	acquiredFrom: text("acquired_from"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const itemAssociations = pgTable("item_associations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itemId: uuid("item_id").notNull(),
	associatedType: text("associated_type").notNull(),
	associatedId: uuid("associated_id").notNull(),
	relevance: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [inventoryItems.id],
			name: "item_associations_item_id_inventory_items_id_fk"
		}),
]);

export const questSkillTrees = pgTable("quest_skill_trees", {
	questId: uuid("quest_id").notNull(),
	treeId: uuid("tree_id").notNull(),
	xpReward: integer("xp_reward").default(50).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_skill_trees_quest_id_quests_id_fk"
		}),
	primaryKey({ columns: [table.questId, table.treeId], name: "quest_skill_trees_quest_id_tree_id_pk"}),
]);
