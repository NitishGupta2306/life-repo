import { db } from "./db";
import type { 
  NewCharacterProfile,
  NewCharacterStats,
  NewCharacterResources,
  CharacterProfile,
  CharacterStats,
  CharacterResources 
} from "../../database/schema";

export interface CharacterInitializationData {
  characterName: string;
  characterClass?: string;
  age?: number;
}

export interface InitializedCharacter {
  profile: CharacterProfile;
  stats: CharacterStats[];
  resources: CharacterResources[];
}

// Default character stats for new users
const DEFAULT_STATS = [
  { statName: 'Productivity', baseValue: 50, category: 'primary' as const },
  { statName: 'Wellness', baseValue: 50, category: 'primary' as const },
  { statName: 'Social', baseValue: 50, category: 'primary' as const },
  { statName: 'Creativity', baseValue: 50, category: 'secondary' as const },
  { statName: 'Learning', baseValue: 50, category: 'secondary' as const },
  { statName: 'Organization', baseValue: 50, category: 'secondary' as const },
];

// Default resources for new users
const DEFAULT_RESOURCES = [
  { resourceType: 'energy' as const, currentValue: 80, maxValue: 100, regenRate: 5 },
  { resourceType: 'focus' as const, currentValue: 70, maxValue: 100, regenRate: 3 },
  { resourceType: 'motivation' as const, currentValue: 85, maxValue: 100, regenRate: 2 },
  { resourceType: 'spoons' as const, currentValue: 8, maxValue: 12, regenRate: 1 },
];

export class CharacterService {
  /**
   * Initialize a new character with default stats and resources
   */
  static async initializeCharacter(data: CharacterInitializationData): Promise<InitializedCharacter> {
    try {
      // Create character profile
      const characterProfile: NewCharacterProfile = {
        characterName: data.characterName,
        characterLevel: data.age || 25,
        totalXp: 0,
        characterClass: data.characterClass || 'Life Explorer',
        avatarUrl: null,
      };

      // In a real implementation, this would insert to the database
      const mockProfile: CharacterProfile = {
        id: `char_${Date.now()}`,
        ...characterProfile,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      // Create initial stats
      const stats: CharacterStats[] = DEFAULT_STATS.map((stat, index) => ({
        id: `stat_${Date.now()}_${index}`,
        statName: stat.statName,
        baseValue: stat.baseValue,
        currentValue: stat.baseValue,
        maxValue: 100,
        statCategory: stat.category,
        updatedAt: new Date(),
      }));

      // Create initial resources
      const resources: CharacterResources[] = DEFAULT_RESOURCES.map((resource, index) => ({
        id: `res_${Date.now()}_${index}`,
        resourceType: resource.resourceType,
        currentValue: resource.currentValue,
        maxValue: resource.maxValue,
        regenRate: resource.regenRate,
        lastUpdated: new Date(),
        modifiers: {},
      }));

      return {
        profile: mockProfile,
        stats,
        resources,
      };
    } catch (error) {
      console.error('Failed to initialize character:', error);
      throw new Error('Character initialization failed');
    }
  }

  /**
   * Update character XP and level
   */
  static async addXP(characterId: string, xpAmount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
    try {
      // In a real implementation, this would update the database
      console.log(`Adding ${xpAmount} XP to character ${characterId}`);
      
      // Mock level calculation
      const currentXP = 1000; // This would be fetched from DB
      const newXP = currentXP + xpAmount;
      const currentLevel = 25; // This would be fetched from DB
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > currentLevel;

      return { newLevel, leveledUp };
    } catch (error) {
      console.error('Failed to add XP:', error);
      throw new Error('XP addition failed');
    }
  }

  /**
   * Update character resources
   */
  static async updateResource(
    characterId: string,
    resourceType: string,
    change: number
  ): Promise<CharacterResources> {
    try {
      // In a real implementation, this would update the database
      console.log(`Updating ${resourceType} by ${change} for character ${characterId}`);
      
      // Mock resource update
      const mockUpdatedResource: CharacterResources = {
        id: `res_${Date.now()}`,
        resourceType: resourceType as any,
        currentValue: Math.max(0, Math.min(100, 75 + change)),
        maxValue: 100,
        regenRate: 5,
        lastUpdated: new Date(),
        modifiers: {},
      };

      return mockUpdatedResource;
    } catch (error) {
      console.error('Failed to update resource:', error);
      throw new Error('Resource update failed');
    }
  }

  /**
   * Calculate level based on XP
   */
  static calculateLevel(totalXP: number): number {
    // Simple formula: 1000 XP per level
    return Math.floor(totalXP / 1000) + 1;
  }

  /**
   * Calculate XP needed for next level
   */
  static calculateXPForNextLevel(currentXP: number): { current: number; needed: number; total: number } {
    const currentLevel = this.calculateLevel(currentXP);
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNext = 1000 - xpInCurrentLevel;
    
    return {
      current: xpInCurrentLevel,
      needed: xpNeededForNext,
      total: 1000,
    };
  }

  /**
   * Get character class bonuses
   */
  static getClassBonuses(characterClass: string): Record<string, number> {
    const classBonuses: Record<string, Record<string, number>> = {
      'Life Explorer': { productivity: 5, learning: 10 },
      'Wellness Warrior': { wellness: 15, energy: 10 },
      'Social Butterfly': { social: 15, motivation: 5 },
      'Creative Genius': { creativity: 20, focus: 5 },
      'Productivity Master': { productivity: 20, organization: 10 },
    };

    return classBonuses[characterClass] || {};
  }

  /**
   * Apply daily resource regeneration
   */
  static async regenerateResources(characterId: string): Promise<CharacterResources[]> {
    try {
      // In a real implementation, this would update the database
      console.log(`Regenerating resources for character ${characterId}`);
      
      // Mock resource regeneration
      const mockResources: CharacterResources[] = DEFAULT_RESOURCES.map((resource, index) => ({
        id: `res_${Date.now()}_${index}`,
        resourceType: resource.resourceType,
        currentValue: Math.min(resource.maxValue, resource.currentValue + resource.regenRate),
        maxValue: resource.maxValue,
        regenRate: resource.regenRate,
        lastUpdated: new Date(),
        modifiers: {},
      }));

      return mockResources;
    } catch (error) {
      console.error('Failed to regenerate resources:', error);
      throw new Error('Resource regeneration failed');
    }
  }
}