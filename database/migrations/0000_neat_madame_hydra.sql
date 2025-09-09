CREATE TYPE "public"."buff_type" AS ENUM('hygiene', 'nutrition', 'hydration', 'movement', 'medication');--> statement-breakpoint
CREATE TYPE "public"."debuff_severity" AS ENUM('minor', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('trivial', 'easy', 'normal', 'hard', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."dump_category" AS ENUM('urgent', 'random', 'idea', 'worry', 'task', 'memory');--> statement-breakpoint
CREATE TYPE "public"."input_method" AS ENUM('text', 'voice', 'screenshot', 'email');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'completed', 'needs_review', 'failed');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('available', 'active', 'completed', 'failed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."quest_type" AS ENUM('main', 'side', 'daily', 'weekly', 'epic');--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('energy', 'focus', 'motivation', 'spoons');--> statement-breakpoint
CREATE TYPE "public"."skill_rank" AS ENUM('novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster');--> statement-breakpoint
CREATE TYPE "public"."stat_category" AS ENUM('primary', 'secondary', 'special');--> statement-breakpoint
CREATE TYPE "public"."suggested_action" AS ENUM('create_quest', 'create_task', 'add_note', 'create_reminder', 'add_to_reflection', 'ignore');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('now', 'today', 'this_week', 'someday', 'unknown');--> statement-breakpoint
CREATE TABLE "character_debuffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debuff_name" text NOT NULL,
	"debuff_icon" text,
	"triggered_by" text,
	"stat_penalty" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"severity" "debuff_severity" DEFAULT 'minor' NOT NULL,
	"active_since" timestamp DEFAULT now() NOT NULL,
	"can_stack" boolean DEFAULT false NOT NULL,
	"removal_condition" text
);
--> statement-breakpoint
CREATE TABLE "character_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_name" text NOT NULL,
	"character_level" integer NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"character_class" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp
);
--> statement-breakpoint
CREATE TABLE "character_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"current_value" integer DEFAULT 50 NOT NULL,
	"max_value" integer DEFAULT 100 NOT NULL,
	"regen_rate" integer DEFAULT 5 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"modifiers" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stat_name" text NOT NULL,
	"base_value" integer DEFAULT 0 NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"max_value" integer DEFAULT 100 NOT NULL,
	"stat_category" "stat_category" DEFAULT 'primary' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_trees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tree_name" text NOT NULL,
	"tree_level" integer DEFAULT 1 NOT NULL,
	"total_tree_xp" integer DEFAULT 0 NOT NULL,
	"skill_points_available" integer DEFAULT 0 NOT NULL,
	"mastery_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"is_unlocked" boolean DEFAULT true NOT NULL,
	"icon" text,
	"color_hex" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tree_id" uuid NOT NULL,
	"skill_name" text NOT NULL,
	"skill_level" integer DEFAULT 0 NOT NULL,
	"current_xp" integer DEFAULT 0 NOT NULL,
	"xp_to_next_level" integer DEFAULT 100 NOT NULL,
	"skill_rank" "skill_rank" DEFAULT 'novice' NOT NULL,
	"unlocked" boolean DEFAULT false NOT NULL,
	"prerequisites" uuid[] DEFAULT '{}',
	"unlocked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stat_progression" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stat_id" uuid NOT NULL,
	"xp_current" integer DEFAULT 0 NOT NULL,
	"xp_to_next_level" integer DEFAULT 1000 NOT NULL,
	"level_up_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_level_up" timestamp
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"skill_tree_id" uuid,
	"xp_amount" integer NOT NULL,
	"description" text,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_battles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boss_name" text NOT NULL,
	"hp_total" integer DEFAULT 100 NOT NULL,
	"hp_current" integer DEFAULT 100 NOT NULL,
	"weakness" text[] DEFAULT '{}',
	"appears_when" jsonb DEFAULT '{}'::jsonb,
	"defeat_reward" jsonb DEFAULT '{}'::jsonb,
	"strategies_tried" uuid[] DEFAULT '{}',
	"defeated" boolean DEFAULT false NOT NULL,
	"defeated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_name" text NOT NULL,
	"xp_reward" integer DEFAULT 5 NOT NULL,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"last_completed" timestamp,
	"skill_tree_id" uuid
);
--> statement-breakpoint
CREATE TABLE "quest_objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_id" uuid NOT NULL,
	"objective_text" text NOT NULL,
	"objective_order" integer DEFAULT 1 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"xp_reward" integer DEFAULT 10 NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quest_skill_trees" (
	"quest_id" uuid NOT NULL,
	"tree_id" uuid NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "quest_skill_trees_quest_id_tree_id_pk" PRIMARY KEY("quest_id","tree_id")
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_name" text NOT NULL,
	"quest_description" text,
	"quest_type" "quest_type" DEFAULT 'side' NOT NULL,
	"difficulty" "difficulty" DEFAULT 'normal' NOT NULL,
	"status" "quest_status" DEFAULT 'available' NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"gold_reward" integer,
	"skill_tree_rewards" jsonb DEFAULT '{}'::jsonb,
	"prerequisites" uuid[] DEFAULT '{}',
	"time_limit" interval,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adhd_powerups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"powerup_name" text NOT NULL,
	"powerup_type" text NOT NULL,
	"description" text,
	"cooldown" interval,
	"energy_cost" integer DEFAULT 0 NOT NULL,
	"effect" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL,
	"success_rate" numeric(5, 2),
	"unlock_condition" text,
	"is_unlocked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "basic_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"need_name" text NOT NULL,
	"need_category" text NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"ideal_frequency" interval NOT NULL,
	"last_completed" timestamp,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"is_overdue" boolean,
	"reminder_enabled" boolean DEFAULT true NOT NULL,
	"xp_reward" integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buff_combos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_name" text NOT NULL,
	"required_buffs" uuid[] NOT NULL,
	"combo_multiplier" numeric(3, 2) DEFAULT '1.50' NOT NULL,
	"bonus_xp" integer DEFAULT 50 NOT NULL,
	"special_effect" text,
	"times_achieved" integer DEFAULT 0 NOT NULL,
	"last_achieved" timestamp
);
--> statement-breakpoint
CREATE TABLE "daily_buffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buff_name" text NOT NULL,
	"buff_icon" text,
	"buff_type" "buff_type" NOT NULL,
	"stat_boost" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration" interval NOT NULL,
	"stack_count" integer DEFAULT 1 NOT NULL,
	"xp_reward" integer DEFAULT 5 NOT NULL,
	"achievement_id" uuid,
	"last_activated" timestamp,
	"expires_at" timestamp,
	"is_active" boolean
);
--> statement-breakpoint
CREATE TABLE "need_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"need_id" uuid NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"difficulty_rating" integer,
	"energy_before" integer,
	"energy_after" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "reflection_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_name" text NOT NULL,
	"quest_type" text NOT NULL,
	"xp_reward" integer DEFAULT 25 NOT NULL,
	"bonus_xp_streak" integer DEFAULT 0 NOT NULL,
	"wisdom_points" integer DEFAULT 5 NOT NULL,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"best_streak" integer DEFAULT 0 NOT NULL,
	"last_completed" date,
	"prompts" text[] DEFAULT '{}',
	"time_of_day" time
);
--> statement-breakpoint
CREATE TABLE "support_guild" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_name" text NOT NULL,
	"member_role" text NOT NULL,
	"assistance_type" text[] DEFAULT '{}',
	"trust_level" integer DEFAULT 50 NOT NULL,
	"last_interaction" timestamp,
	"buffs_provided" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "wisdom_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insight_text" text NOT NULL,
	"insight_type" text NOT NULL,
	"wisdom_points_earned" integer DEFAULT 10 NOT NULL,
	"times_validated" integer DEFAULT 0 NOT NULL,
	"confidence_level" numeric(5, 2),
	"discovered_date" date DEFAULT now() NOT NULL,
	"related_quests" uuid[] DEFAULT '{}',
	"related_buffs" uuid[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "ai_processing_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_dump_id" uuid NOT NULL,
	"ai_interpretation" text,
	"suggested_action" "suggested_action" NOT NULL,
	"detected_urgency" "urgency" DEFAULT 'unknown' NOT NULL,
	"detected_emotion" text[] DEFAULT '{}',
	"suggested_skill_trees" uuid[] DEFAULT '{}',
	"suggested_quest_type" text,
	"extracted_entities" jsonb DEFAULT '{}'::jsonb,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto_generated_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_dump_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"auto_generated" boolean DEFAULT true NOT NULL,
	"human_modified" boolean DEFAULT false NOT NULL,
	"accepted" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brain_dumps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_text" text NOT NULL,
	"input_method" "input_method" DEFAULT 'text' NOT NULL,
	"dump_category" "dump_category",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processing_status" "processing_status" DEFAULT 'pending' NOT NULL,
	"confidence_score" numeric(5, 2),
	"requires_human_review" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_phrases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phrase" text NOT NULL,
	"action" jsonb NOT NULL,
	"creates_buffs" boolean DEFAULT false NOT NULL,
	"xp_modifier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"personal_meaning" text,
	CONSTRAINT "magic_phrases_phrase_unique" UNIQUE("phrase")
);
--> statement-breakpoint
CREATE TABLE "parsing_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_phrase" text NOT NULL,
	"action_type" text NOT NULL,
	"priority_modifier" integer DEFAULT 0 NOT NULL,
	"skill_tree_hint" text,
	"learned_from_user" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"success_rate" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "processing_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brain_dump_ids" uuid[] NOT NULL,
	"processing_type" text NOT NULL,
	"scheduled_for" timestamp,
	"completed" boolean DEFAULT false NOT NULL,
	"total_created_quests" integer DEFAULT 0 NOT NULL,
	"total_created_notes" integer DEFAULT 0 NOT NULL,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "quick_capture_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" text NOT NULL,
	"trigger_keywords" text[] DEFAULT '{}',
	"template_structure" jsonb NOT NULL,
	"auto_creates" text NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_text" text NOT NULL,
	"pattern_meaning" text,
	"frequency" integer DEFAULT 1 NOT NULL,
	"confirmed_by_user" boolean DEFAULT false NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"achievement_name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"icon" text,
	"xp_bonus" integer DEFAULT 0 NOT NULL,
	"unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"progress_current" integer DEFAULT 0 NOT NULL,
	"progress_required" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adhd_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"achievement_name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"unlock_condition" jsonb NOT NULL,
	"badge_icon" text,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"wisdom_bonus" integer DEFAULT 0 NOT NULL,
	"title_granted" text,
	"unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" text NOT NULL,
	"item_type" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"rarity" "rarity" DEFAULT 'common' NOT NULL,
	"tags" text[] DEFAULT '{}',
	"acquired_from" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_associations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"associated_type" text NOT NULL,
	"associated_id" uuid NOT NULL,
	"relevance" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reminder_type" text NOT NULL,
	"target_id" uuid,
	"reminder_text" text NOT NULL,
	"scheduled_time" time,
	"is_adaptive" boolean DEFAULT false NOT NULL,
	"snooze_count" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "behavior_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_name" text NOT NULL,
	"pattern_type" text NOT NULL,
	"trigger_conditions" jsonb DEFAULT '{}'::jsonb,
	"outcome" text,
	"frequency" integer DEFAULT 1 NOT NULL,
	"first_observed" date DEFAULT now() NOT NULL,
	"last_observed" date DEFAULT now() NOT NULL,
	"strategy_id" uuid
);
--> statement-breakpoint
CREATE TABLE "daily_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reflection_date" date DEFAULT now() NOT NULL,
	"morning_intention" text,
	"evening_reflection" text,
	"energy_level" integer,
	"focus_level" integer,
	"mood_tags" text[] DEFAULT '{}',
	"gratitude_list" text[] DEFAULT '{}',
	"completed_at" timestamp,
	"reflection_prompt" text,
	"is_complete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quest_objective_id" uuid NOT NULL,
	"reflection_date" date DEFAULT now() NOT NULL,
	"why_incomplete" text NOT NULL,
	"blockers" text[] DEFAULT '{}',
	"what_would_help" text,
	"self_compassion_note" text,
	"pattern_identified" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_reflections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"key_wins" text[] DEFAULT '{}',
	"key_struggles" text[] DEFAULT '{}',
	"patterns_noticed" text[] DEFAULT '{}',
	"energy_pattern" jsonb DEFAULT '{}'::jsonb,
	"focus_pattern" jsonb DEFAULT '{}'::jsonb,
	"basic_needs_completion" numeric(5, 2),
	"quest_completion_rate" numeric(5, 2),
	"self_insight" text,
	"next_week_intention" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_tree_id_skill_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."skill_trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_skill_tree_id_skill_trees_id_fk" FOREIGN KEY ("skill_tree_id") REFERENCES "public"."skill_trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_objectives" ADD CONSTRAINT "quest_objectives_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_skill_trees" ADD CONSTRAINT "quest_skill_trees_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_completions" ADD CONSTRAINT "need_completions_need_id_basic_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."basic_needs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_processing_results" ADD CONSTRAINT "ai_processing_results_brain_dump_id_brain_dumps_id_fk" FOREIGN KEY ("brain_dump_id") REFERENCES "public"."brain_dumps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_generated_content" ADD CONSTRAINT "auto_generated_content_source_dump_id_brain_dumps_id_fk" FOREIGN KEY ("source_dump_id") REFERENCES "public"."brain_dumps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_associations" ADD CONSTRAINT "item_associations_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;