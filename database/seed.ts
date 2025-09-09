import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import {
  characterProfile,
  characterStats,
  characterResources,
  skillTrees,
  skills,
  quests,
  questObjectives,
  basicNeeds,
  dailyQuests,
  achievements,
  brainDumps,
  adhdPowerups,
  reflectionQuests
} from './schema';

dotenv.config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema: {} });

async function seed() {
  console.log('🎮 Seeding Life RPG Database...');

  // 1. Create Character Profile
  const [character] = await db.insert(characterProfile).values({
    characterName: "Nat",
    characterLevel: 25, // Your age!
    totalXp: 0,
    characterClass: "Full-Stack Developer"
  }).returning();

  console.log('✅ Character created:', character.characterName, 'Level', character.characterLevel);

  // 2. Create Character Stats
  const stats = [
    { statName: "Strength", baseValue: 60, currentValue: 60, statCategory: "primary" as const },
    { statName: "Intelligence", baseValue: 85, currentValue: 85, statCategory: "primary" as const },
    { statName: "Dexterity", baseValue: 70, currentValue: 70, statCategory: "primary" as const },
    { statName: "Charisma", baseValue: 65, currentValue: 65, statCategory: "primary" as const },
    { statName: "Wisdom", baseValue: 55, currentValue: 55, statCategory: "secondary" as const },
    { statName: "Constitution", baseValue: 50, currentValue: 50, statCategory: "secondary" as const }
  ];

  await db.insert(characterStats).values(stats);
  console.log('✅ Character stats created');

  // 3. Create Character Resources (Mana System)
  const resources = [
    { resourceType: "energy" as const, currentValue: 75, maxValue: 100 },
    { resourceType: "focus" as const, currentValue: 60, maxValue: 100 },
    { resourceType: "motivation" as const, currentValue: 80, maxValue: 100 },
    { resourceType: "spoons" as const, currentValue: 12, maxValue: 20 } // ADHD spoon theory
  ];

  await db.insert(characterResources).values(resources);
  console.log('✅ Character resources created');

  // 4. Create Skill Trees (Life Domains)
  const skillTreeData = [
    { 
      treeName: "Career", 
      treeLevel: 8, 
      totalTreeXp: 3200, 
      masteryPercentage: "65.00", 
      icon: "💻", 
      colorHex: "#3B82F6" 
    },
    { 
      treeName: "Health & Fitness", 
      treeLevel: 3, 
      totalTreeXp: 450, 
      masteryPercentage: "25.00", 
      icon: "💪", 
      colorHex: "#EF4444" 
    },
    { 
      treeName: "Learning & Growth", 
      treeLevel: 7, 
      totalTreeXp: 2800, 
      masteryPercentage: "70.00", 
      icon: "📚", 
      colorHex: "#10B981" 
    },
    { 
      treeName: "Finance", 
      treeLevel: 5, 
      totalTreeXp: 1200, 
      masteryPercentage: "40.00", 
      icon: "💰", 
      colorHex: "#F59E0B" 
    },
    { 
      treeName: "Relationships", 
      treeLevel: 4, 
      totalTreeXp: 800, 
      masteryPercentage: "35.00", 
      icon: "❤️", 
      colorHex: "#EC4899" 
    },
    { 
      treeName: "Home & Environment", 
      treeLevel: 2, 
      totalTreeXp: 300, 
      masteryPercentage: "20.00", 
      icon: "🏠", 
      colorHex: "#8B5CF6" 
    }
  ];

  const insertedSkillTrees = await db.insert(skillTrees).values(skillTreeData).returning();
  console.log('✅ Skill trees created');

  // 5. Create Skills within trees
  const careerTree = insertedSkillTrees.find(t => t.treeName === "Career");
  const learningTree = insertedSkillTrees.find(t => t.treeName === "Learning & Growth");
  
  if (careerTree && learningTree) {
    const skillsData = [
      { treeId: careerTree.id, skillName: "TypeScript Mastery", skillLevel: 15, currentXp: 850, unlocked: true, skillRank: "expert" as const },
      { treeId: careerTree.id, skillName: "React Development", skillLevel: 12, currentXp: 720, unlocked: true, skillRank: "journeyman" as const },
      { treeId: careerTree.id, skillName: "Database Design", skillLevel: 8, currentXp: 480, unlocked: true, skillRank: "journeyman" as const },
      { treeId: careerTree.id, skillName: "Leadership", skillLevel: 5, currentXp: 300, unlocked: true, skillRank: "apprentice" as const },
      { treeId: learningTree.id, skillName: "AI & Machine Learning", skillLevel: 6, currentXp: 360, unlocked: true, skillRank: "apprentice" as const },
      { treeId: learningTree.id, skillName: "System Design", skillLevel: 9, currentXp: 540, unlocked: true, skillRank: "journeyman" as const }
    ];

    await db.insert(skills).values(skillsData);
    console.log('✅ Skills created');
  }

  // 6. Create Basic Needs (ADHD Support)
  const basicNeedsData = [
    { needName: "Shower", needCategory: "hygiene", priority: "medium" as const, idealFrequency: "24 hours", xpReward: 5 },
    { needName: "Eat Breakfast", needCategory: "nutrition", priority: "high" as const, idealFrequency: "24 hours", xpReward: 8 },
    { needName: "Drink Water", needCategory: "hydration", priority: "critical" as const, idealFrequency: "2 hours", xpReward: 3 },
    { needName: "Take Medication", needCategory: "medication", priority: "critical" as const, idealFrequency: "24 hours", xpReward: 10 },
    { needName: "Light Exercise", needCategory: "movement", priority: "medium" as const, idealFrequency: "24 hours", xpReward: 15 },
    { needName: "Brush Teeth", needCategory: "hygiene", priority: "high" as const, idealFrequency: "12 hours", xpReward: 5 }
  ];

  await db.insert(basicNeeds).values(basicNeedsData);
  console.log('✅ Basic needs created');

  // 7. Create ADHD Power-ups
  const powerupsData = [
    {
      powerupName: "Pomodoro Timer",
      powerupType: "consumable",
      description: "25 minutes of focused work time",
      energyCost: 10,
      effect: { focus: 25, duration: "25 minutes" },
      isUnlocked: true
    },
    {
      powerupName: "Body Doubling Session",
      powerupType: "equipment",
      description: "Work alongside someone for accountability",
      energyCost: 5,
      effect: { motivation: 30, focus: 15 },
      isUnlocked: true
    },
    {
      powerupName: "Brain Dump",
      powerupType: "consumable",
      description: "Clear mental clutter by writing everything down",
      energyCost: 0,
      effect: { mental_clarity: 40 },
      isUnlocked: true
    },
    {
      powerupName: "Movement Break",
      powerupType: "consumable", 
      description: "Short physical activity to reset focus",
      energyCost: -5, // Actually restores energy
      effect: { energy: 10, focus: 15 },
      isUnlocked: true
    }
  ];

  await db.insert(adhdPowerups).values(powerupsData);
  console.log('✅ ADHD power-ups created');

  // 8. Create Sample Quests
  const questsData = [
    {
      questName: "Complete Life RPG Database Schema",
      questDescription: "Design and implement the complete database structure for the Life RPG system",
      questType: "main" as const,
      difficulty: "hard" as const,
      status: "active" as const,
      xpReward: 500,
      skillTreeRewards: { career: 300, learning: 200 }
    },
    {
      questName: "Set Up Development Environment", 
      questDescription: "Configure all tools and dependencies for the project",
      questType: "side" as const,
      difficulty: "normal" as const, 
      status: "completed" as const,
      xpReward: 150,
      skillTreeRewards: { career: 150 }
    },
    {
      questName: "Daily Reflection Practice",
      questDescription: "Establish a consistent daily reflection routine",
      questType: "daily" as const,
      difficulty: "easy" as const,
      status: "active" as const, 
      xpReward: 25,
      skillTreeRewards: { learning: 25 }
    }
  ];

  const insertedQuests = await db.insert(quests).values(questsData).returning();
  console.log('✅ Quests created');

  // 9. Create Quest Objectives
  const mainQuest = insertedQuests.find(q => q.questName.includes("Database Schema"));
  if (mainQuest) {
    const objectivesData = [
      { questId: mainQuest.id, objectiveText: "Design character and stats system", objectiveOrder: 1, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Create skill trees and progression", objectiveOrder: 2, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Implement quest and objectives system", objectiveOrder: 3, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Add ADHD support features", objectiveOrder: 4, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Create brain dump processing system", objectiveOrder: 5, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Generate and apply migrations", objectiveOrder: 6, isCompleted: true, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Create seed data", objectiveOrder: 7, isCompleted: false, xpReward: 50 },
      { questId: mainQuest.id, objectiveText: "Build basic UI components", objectiveOrder: 8, isCompleted: false, xpReward: 100 }
    ];

    await db.insert(questObjectives).values(objectivesData);
    console.log('✅ Quest objectives created');
  }

  // 10. Create Daily Quests
  const dailyQuestsData = [
    { questName: "Morning Intention Setting", xpReward: 15, skillTreeId: learningTree?.id },
    { questName: "Evening Reflection", xpReward: 20, skillTreeId: learningTree?.id },
    { questName: "Hydration Check", xpReward: 10 },
    { questName: "Movement Break", xpReward: 15 }
  ];

  await db.insert(dailyQuests).values(dailyQuestsData);
  console.log('✅ Daily quests created');

  // 11. Create Reflection Quests
  const reflectionQuestsData = [
    {
      questName: "Morning Intention Ritual", 
      questType: "morning_ritual",
      xpReward: 25,
      wisdomPoints: 5,
      prompts: [
        "What do I want to accomplish today?",
        "How am I feeling right now?", 
        "What would make today feel successful?"
      ]
    },
    {
      questName: "Evening Wind-Down Reflection",
      questType: "evening_reflection", 
      xpReward: 30,
      wisdomPoints: 8,
      prompts: [
        "What went well today?",
        "What was challenging?",
        "What did I learn about myself?",
        "What am I grateful for?"
      ]
    }
  ];

  await db.insert(reflectionQuests).values(reflectionQuestsData);
  console.log('✅ Reflection quests created');

  // 12. Create Achievements  
  const achievementsData = [
    {
      achievementName: "Database Architect",
      description: "Successfully design and implement a complex database schema",
      category: "engineering",
      rarity: "epic" as const,
      xpBonus: 100,
      progressRequired: 1,
      unlocked: false
    },
    {
      achievementName: "ADHD Warrior",
      description: "Complete 7 days of consistent basic needs",
      category: "self_care", 
      rarity: "rare" as const,
      xpBonus: 75,
      progressRequired: 7,
      unlocked: false
    },
    {
      achievementName: "Reflection Master",
      description: "Complete 30 days of daily reflections",
      category: "growth",
      rarity: "legendary" as const, 
      xpBonus: 250,
      progressRequired: 30,
      unlocked: false
    }
  ];

  await db.insert(achievements).values(achievementsData);
  console.log('✅ Achievements created');

  // 13. Create Sample Brain Dumps
  const brainDumpsData = [
    {
      rawText: "Need to finish the database schema and make sure all tables are properly connected",
      inputMethod: "text" as const,
      dumpCategory: "task" as const,
      processed: false
    },
    {
      rawText: "Feeling overwhelmed with all the different tables and relationships to track",
      inputMethod: "text" as const, 
      dumpCategory: "worry" as const,
      processed: false
    },
    {
      rawText: "Remember to add proper indexes for performance and create seed data",
      inputMethod: "text" as const,
      dumpCategory: "memory" as const, 
      processed: false
    }
  ];

  await db.insert(brainDumps).values(brainDumpsData);
  console.log('✅ Brain dumps created');

  console.log('🎉 Life RPG Database seeded successfully!');
  console.log(`
🎮 Welcome to Your Life RPG!

Character: ${character.characterName} (Level ${character.characterLevel})
Class: ${character.characterClass}

Your adventure begins now...
  `);
}

async function main() {
  try {
    await seed();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();