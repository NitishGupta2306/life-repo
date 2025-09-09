# Life RPG Database Schema Visualization

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Character System (Blue)
    character_profile {
        uuid id PK
        text character_name
        integer character_level "Age"
        integer total_xp
        text character_class
        text avatar_url
        timestamp created_at
        timestamp last_login
    }
    
    character_stats {
        uuid id PK
        text stat_name
        integer base_value
        integer current_value
        integer max_value
        stat_category_enum stat_category
        timestamp updated_at
    }
    
    character_resources {
        uuid id PK
        resource_type_enum resource_type "energy, focus, motivation, spoons"
        integer current_value
        integer max_value
        integer regen_rate
        timestamp last_updated
        jsonb modifiers
    }
    
    character_debuffs {
        uuid id PK
        text debuff_name
        text description
        debuff_type_enum debuff_type
        integer severity
        timestamp applied_at
        timestamp expires_at
        boolean is_active
        jsonb metadata
    }

    %% Skill System (Green)
    skill_trees {
        uuid id PK
        text tree_name "Career, Health, etc."
        integer tree_level
        integer total_tree_xp
        integer skill_points_available
        decimal mastery_percentage
        boolean is_unlocked
        text icon
        text color_hex
        timestamp created_at
        timestamp updated_at
    }
    
    skills {
        uuid id PK
        uuid tree_id FK
        text skill_name
        integer skill_level
        integer current_xp
        integer xp_to_next_level
        skill_rank_enum skill_rank
        boolean unlocked
        uuid[] prerequisites
        timestamp unlocked_at
    }
    
    xp_transactions {
        uuid id PK
        uuid skill_id FK
        integer xp_amount
        text source_type "quest, task, manual"
        text source_description
        timestamp earned_at
        jsonb metadata
    }

    %% Quest System (Orange)
    quests {
        uuid id PK
        text quest_title
        text description
        quest_type_enum quest_type "main, side, daily"
        quest_status_enum quest_status
        priority_enum priority
        difficulty_enum difficulty
        integer xp_reward
        uuid[] skill_rewards
        timestamp due_date
        timestamp created_at
        timestamp completed_at
        boolean is_recurring
        text recurrence_pattern
    }
    
    quest_objectives {
        uuid id PK
        uuid quest_id FK
        text objective_description
        boolean is_completed
        integer completion_value
        integer target_value
        text completion_criteria
        timestamp completed_at
    }
    
    boss_battles {
        uuid id PK
        text boss_name
        text description
        text challenge_type
        difficulty_enum difficulty
        integer health_points
        integer current_health
        boolean is_defeated
        integer xp_reward
        uuid[] loot_rewards
        timestamp created_at
        timestamp defeated_at
        jsonb battle_data
    }

    %% ADHD Support System (Red)
    basic_needs {
        uuid id PK
        text need_name "shower, eat, drink water, medication"
        boolean is_completed
        timestamp completed_at
        timestamp due_at
        integer streak_count
        importance_enum importance
        text completion_notes
        integer energy_cost
        integer focus_cost
    }
    
    buffs {
        uuid id PK
        text buff_name
        text description
        buff_type_enum buff_type
        integer duration_minutes
        timestamp applied_at
        timestamp expires_at
        boolean is_active
        jsonb effect_data
    }
    
    powerups {
        uuid id PK
        text powerup_name
        text description
        powerup_type_enum powerup_type
        rarity_enum rarity
        integer charges_remaining
        integer max_charges
        boolean is_consumable
        timestamp acquired_at
        jsonb effect_data
    }
    
    reflection_quests {
        uuid id PK
        text quest_title
        text reflection_prompt
        text user_response
        text insights_generated
        reflection_type_enum reflection_type
        mood_enum mood_before
        mood_enum mood_after
        timestamp created_at
        timestamp completed_at
        integer xp_awarded
    }
    
    spoon_tracker {
        uuid id PK
        integer spoons_available
        integer spoons_used
        integer spoons_recovered
        date tracking_date
        text energy_notes
        text activities_completed
        mood_enum overall_mood
        timestamp recorded_at
    }
    
    adhd_strategies {
        uuid id PK
        text strategy_name
        text description
        strategy_type_enum strategy_type
        integer effectiveness_rating
        integer usage_count
        boolean is_favorite
        text personal_notes
        timestamp last_used
        jsonb customization_data
    }
    
    focus_sessions {
        uuid id PK
        integer duration_minutes
        session_type_enum session_type "pomodoro, deep_work, break"
        boolean completed_successfully
        text task_worked_on
        integer productivity_rating
        text notes
        timestamp started_at
        timestamp ended_at
        jsonb session_data
    }
    
    gentle_reminders {
        uuid id PK
        text reminder_text
        reminder_type_enum reminder_type
        boolean is_active
        text trigger_condition
        integer frequency_hours
        timestamp last_triggered
        timestamp next_trigger
        boolean is_encouraging
        jsonb customization
    }

    %% Brain Dump System (Purple)
    brain_dumps {
        uuid id PK
        text raw_content
        text processed_content
        processing_status_enum status
        text mood_detected
        text[] tags_detected
        uuid[] related_quests
        uuid[] related_skills
        priority_enum priority_detected
        timestamp created_at
        timestamp processed_at
        jsonb ai_insights
    }
    
    ai_processing_results {
        uuid id PK
        uuid brain_dump_id FK
        text processing_type "categorization, task_extraction, mood_analysis"
        text result_data
        decimal confidence_score
        boolean human_validated
        timestamp processed_at
        text model_version
        jsonb raw_response
    }
    
    auto_generated_quests {
        uuid id PK
        uuid brain_dump_id FK
        uuid generated_quest_id FK
        decimal confidence_score
        boolean user_approved
        text generation_reasoning
        timestamp generated_at
        timestamp approved_at
        jsonb generation_metadata
    }
    
    auto_categorized_notes {
        uuid id PK
        uuid brain_dump_id FK
        text category_assigned
        text[] tags_assigned
        decimal confidence_score
        boolean user_validated
        text categorization_reasoning
        timestamp categorized_at
        text ai_model_used
    }
    
    thought_patterns {
        uuid id PK
        text pattern_name
        text pattern_description
        text[] associated_keywords
        integer frequency_count
        text emotional_context
        boolean is_helpful_pattern
        text suggested_intervention
        timestamp first_detected
        timestamp last_detected
    }
    
    magic_phrases {
        uuid id PK
        text phrase_text
        phrase_type_enum phrase_type
        text trigger_context
        text suggested_response
        integer usage_count
        decimal effectiveness_rating
        boolean is_active
        text personal_notes
        timestamp created_at
    }
    
    mood_correlations {
        uuid id PK
        text trigger_activity
        mood_enum mood_before
        mood_enum mood_after
        integer correlation_strength
        text correlation_type
        integer sample_size
        text insights_notes
        timestamp analysis_date
        boolean is_significant
    }
    
    brain_dump_analytics {
        uuid id PK
        date analysis_date
        integer total_dumps_count
        text top_categories
        text mood_trends
        text productivity_insights
        text recommended_actions
        jsonb detailed_metrics
        timestamp generated_at
    }
    
    pattern_recognition_results {
        uuid id PK
        text pattern_type
        text pattern_description
        text[] evidence_examples
        integer confidence_score
        text actionable_insight
        boolean user_acknowledged
        timestamp detected_at
        jsonb pattern_metadata
    }

    %% Support Systems (Cyan)
    achievements {
        uuid id PK
        text achievement_name
        text description
        achievement_type_enum achievement_type
        rarity_enum rarity
        integer xp_reward
        text icon_url
        boolean is_unlocked
        decimal progress_percentage
        timestamp unlocked_at
        jsonb unlock_criteria
    }
    
    inventory {
        uuid id PK
        text item_name
        text description
        item_type_enum item_type
        rarity_enum rarity
        integer quantity
        boolean is_consumable
        text icon_url
        timestamp acquired_at
        jsonb item_data
    }
    
    reminders {
        uuid id PK
        text reminder_text
        reminder_type_enum reminder_type
        timestamp due_at
        boolean is_completed
        boolean is_recurring
        text recurrence_pattern
        priority_enum priority
        timestamp created_at
        timestamp completed_at
    }

    %% Reflection System (Pink)
    daily_reflections {
        uuid id PK
        date reflection_date
        mood_enum morning_mood
        mood_enum evening_mood
        integer energy_level
        integer productivity_rating
        text gratitude_notes
        text challenges_faced
        text wins_celebrated
        text tomorrow_intentions
        timestamp created_at
    }
    
    weekly_reflections {
        uuid id PK
        date week_start_date
        text weekly_theme
        text[] goals_achieved
        text[] goals_missed
        text key_learnings
        text relationship_notes
        text health_notes
        text next_week_focus
        integer overall_satisfaction
        timestamp created_at
    }
    
    pattern_tracking {
        uuid id PK
        text pattern_name
        text pattern_type
        text[] data_points
        date tracking_date
        text insights_notes
        decimal trend_direction
        boolean is_positive_pattern
        text action_items
        timestamp recorded_at
    }

    %% Relationships
    character_profile ||--o{ character_stats : "has"
    character_profile ||--o{ character_resources : "has"
    character_profile ||--o{ character_debuffs : "has"
    character_profile ||--o{ skill_trees : "owns"
    character_profile ||--o{ quests : "undertakes"
    character_profile ||--o{ boss_battles : "fights"
    character_profile ||--o{ basic_needs : "tracks"
    character_profile ||--o{ brain_dumps : "creates"
    character_profile ||--o{ achievements : "earns"
    character_profile ||--o{ daily_reflections : "writes"
    character_profile ||--o{ weekly_reflections : "writes"
    
    skill_trees ||--o{ skills : "contains"
    skills ||--o{ xp_transactions : "receives"
    
    quests ||--o{ quest_objectives : "has"
    quests ||--o{ auto_generated_quests : "generated_from"
    
    brain_dumps ||--o{ ai_processing_results : "processed_by"
    brain_dumps ||--o{ auto_generated_quests : "generates"
    brain_dumps ||--o{ auto_categorized_notes : "categorized_as"
    
    basic_needs ||--o{ spoon_tracker : "affects"
    buffs ||--o{ character_resources : "modifies"
    powerups ||--o{ character_resources : "enhances"
```

## System Color Coding

- **Blue**: Character System - Core profile, stats, and resources
- **Green**: Skill System - Skill trees, individual skills, and XP tracking  
- **Orange**: Quest System - Quests, objectives, and boss battles
- **Red**: ADHD Support - Basic needs, buffs, powerups, focus sessions
- **Purple**: Brain Dump - AI processing and pattern recognition
- **Cyan**: Support Systems - Achievements, inventory, reminders
- **Pink**: Reflection System - Daily/weekly reflections and pattern tracking

## Key Features

### 🎮 **Gamification Elements**
- Character level = Your actual age
- XP system for skill progression
- Quests for goal achievement
- Boss battles for major life challenges
- Achievement system with rewards

### 🧠 **ADHD Support Features**
- Spoon theory implementation for energy management
- Basic needs tracking (shower, eat, medication, etc.)
- Gentle reminders with encouraging tone
- Focus session tracking (Pomodoro, deep work)
- Coping strategy library

### 🤖 **AI-Powered Brain Dump**
- Automatic categorization of thoughts
- Quest generation from brain dumps  
- Pattern recognition in thinking
- Mood analysis and correlations
- Magic phrases for common situations

### 📊 **Progress Tracking**
- Daily and weekly reflections
- Pattern tracking across time
- Mood correlation analysis
- Productivity insights
- Personal growth metrics

## Database Statistics

- **38 Tables** total
- **332 Columns** across all tables
- **15 Enums** for structured data
- **8+ Foreign Key relationships** connecting systems
- Modular schema organized into 7 distinct systems

Your database is accessible at:
- **Local URL**: `postgresql://postgres:postgres@localhost:5433/life_rpg`
- **Drizzle Studio**: https://local.drizzle.studio