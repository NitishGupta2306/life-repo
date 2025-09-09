import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skillTrees, skills } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

// Default skill trees for life domains
const DEFAULT_SKILL_TREES = [
  {
    treeName: 'Health & Wellness',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 3,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '💪',
    colorHex: '#10b981', // emerald-500
  },
  {
    treeName: 'Career & Finance',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 2,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '💼',
    colorHex: '#3b82f6', // blue-500
  },
  {
    treeName: 'Relationships',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 2,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '❤️',
    colorHex: '#ef4444', // red-500
  },
  {
    treeName: 'Learning & Growth',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 3,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '📚',
    colorHex: '#8b5cf6', // violet-500
  },
  {
    treeName: 'Creativity & Hobbies',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 1,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '🎨',
    colorHex: '#f59e0b', // amber-500
  },
  {
    treeName: 'ADHD Mastery',
    treeLevel: 1,
    totalTreeXp: 0,
    skillPointsAvailable: 4,
    masteryPercentage: '0.00',
    isUnlocked: true,
    icon: '🧠',
    colorHex: '#06b6d4', // cyan-500
  },
];

export async function GET() {
  try {
    const trees = await db.select().from(skillTrees);
    
    if (trees.length === 0) {
      // Create default skill trees if none exist
      const createdTrees = await db.insert(skillTrees).values(DEFAULT_SKILL_TREES).returning();
      
      // Create some sample skills for each tree
      const skillsToCreate = [];
      
      for (const tree of createdTrees) {
        switch (tree.treeName) {
          case 'Health & Wellness':
            skillsToCreate.push(
              { treeId: tree.id, skillName: 'Morning Routine', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Exercise Consistency', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Nutrition Planning', skillLevel: 0, unlocked: false },
              { treeId: tree.id, skillName: 'Sleep Optimization', skillLevel: 0, unlocked: false }
            );
            break;
          case 'Career & Finance':
            skillsToCreate.push(
              { treeId: tree.id, skillName: 'Time Management', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Budget Planning', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Skill Development', skillLevel: 0, unlocked: false },
              { treeId: tree.id, skillName: 'Networking', skillLevel: 0, unlocked: false }
            );
            break;
          case 'ADHD Mastery':
            skillsToCreate.push(
              { treeId: tree.id, skillName: 'Focus Techniques', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Executive Function', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Emotional Regulation', skillLevel: 0, unlocked: false },
              { treeId: tree.id, skillName: 'Sensory Management', skillLevel: 0, unlocked: false }
            );
            break;
          default:
            skillsToCreate.push(
              { treeId: tree.id, skillName: 'Foundation Skills', skillLevel: 0, unlocked: true },
              { treeId: tree.id, skillName: 'Intermediate Skills', skillLevel: 0, unlocked: false }
            );
        }
      }
      
      if (skillsToCreate.length > 0) {
        await db.insert(skills).values(skillsToCreate);
      }
      
      return NextResponse.json(createdTrees);
    }
    
    return NextResponse.json(trees);
  } catch (error) {
    console.error('Error fetching skill trees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill trees' },
      { status: 500 }
    );
  }
}

// Get skills for a specific tree
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { treeId } = body;
    
    if (!treeId) {
      return NextResponse.json(
        { error: 'Tree ID is required' },
        { status: 400 }
      );
    }
    
    const treeSkills = await db.select().from(skills).where(eq(skills.treeId, treeId));
    
    return NextResponse.json(treeSkills);
  } catch (error) {
    console.error('Error fetching tree skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tree skills' },
      { status: 500 }
    );
  }
}