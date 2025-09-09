import { apiClient } from './api-client';

export interface SystemActivity {
  type: 'quest_complete' | 'focus_session' | 'reflection' | 'brain_dump' | 'basic_need' | 'level_up';
  characterId: string;
  xpReward: number;
  resourceChanges: Array<{
    type: 'energy' | 'focus' | 'motivation' | 'spoons';
    change: number;
    reason: string;
  }>;
  source: string;
  data?: Record<string, any>;
}

export interface IntegrationResult {
  xpAdded: number;
  newLevel?: number;
  leveledUp: boolean;
  resourcesUpdated: Array<{
    type: string;
    oldValue: number;
    newValue: number;
    change: number;
  }>;
  achievementsUnlocked: Array<{
    id: string;
    title: string;
    xpAwarded: number;
  }>;
  notifications: string[];
}

/**
 * Central service for managing cross-system integrations
 * Handles XP flow, resource updates, and achievement checking across all Life RPG systems
 */
export class IntegrationService {
  /**
   * Process a system activity and handle all cross-system effects
   */
  static async processActivity(activity: SystemActivity): Promise<IntegrationResult> {
    try {
      const result: IntegrationResult = {
        xpAdded: 0,
        leveledUp: false,
        resourcesUpdated: [],
        achievementsUnlocked: [],
        notifications: [],
      };

      // 1. Award XP and check for level up
      if (activity.xpReward > 0) {
        const xpResult = await apiClient.addXP(
          activity.characterId,
          activity.xpReward,
          activity.source,
          `XP from ${activity.type}`
        );

        result.xpAdded = activity.xpReward;
        result.newLevel = xpResult.newLevel;
        result.leveledUp = xpResult.leveledUp;

        if (result.leveledUp) {
          result.notifications.push(
            `🎉 Level Up! You've reached level ${result.newLevel}!`
          );
        }
      }

      // 2. Update character resources
      for (const resourceChange of activity.resourceChanges) {
        try {
          const resourceResult = await apiClient.updateResource(
            activity.characterId,
            resourceChange.type,
            resourceChange.change,
            resourceChange.reason
          );

          result.resourcesUpdated.push({
            type: resourceChange.type,
            oldValue: resourceResult.previousValue || 0,
            newValue: resourceResult.currentValue,
            change: resourceChange.change,
          });

          // Add notification for significant resource changes
          if (Math.abs(resourceChange.change) >= 10) {
            const verb = resourceChange.change > 0 ? 'increased' : 'decreased';
            result.notifications.push(
              `${resourceChange.type} ${verb} by ${Math.abs(resourceChange.change)}`
            );
          }
        } catch (error) {
          console.warn(`Failed to update resource ${resourceChange.type}:`, error);
        }
      }

      // 3. Check for achievement unlocks
      try {
        const achievementResult = await apiClient.checkAchievements({
          characterId: activity.characterId,
          triggerType: activity.type,
          triggerData: activity.data,
        });

        result.achievementsUnlocked = achievementResult.newlyUnlocked || [];

        // Add achievement notifications
        result.achievementsUnlocked.forEach(achievement => {
          result.notifications.push(
            `🏆 Achievement Unlocked: ${achievement.title}! +${achievement.xpAwarded} XP`
          );
          result.xpAdded += achievement.xpAwarded;
        });
      } catch (error) {
        console.warn('Failed to check achievements:', error);
      }

      return result;
    } catch (error) {
      console.error('Failed to process system activity:', error);
      throw error;
    }
  }

  /**
   * Quest completion integration
   */
  static async handleQuestCompletion(
    questId: string,
    characterId: string,
    questData: {
      title: string;
      type: string;
      xpReward: number;
      energyCost: number;
    }
  ): Promise<IntegrationResult> {
    const activity: SystemActivity = {
      type: 'quest_complete',
      characterId,
      xpReward: questData.xpReward,
      resourceChanges: [
        {
          type: 'energy',
          change: -questData.energyCost,
          reason: `Energy used for quest: ${questData.title}`,
        },
        {
          type: 'motivation',
          change: 5, // Boost motivation for completing quests
          reason: 'Motivation boost from quest completion',
        },
      ],
      source: 'Quest System',
      data: {
        questId,
        questType: questData.type,
        questTitle: questData.title,
      },
    };

    return this.processActivity(activity);
  }

  /**
   * Focus session completion integration
   */
  static async handleFocusSessionCompletion(
    sessionId: string,
    characterId: string,
    sessionData: {
      duration: number;
      focusLevel: number;
      technique: string;
      xpAwarded: number;
    }
  ): Promise<IntegrationResult> {
    const focusBoost = Math.min(sessionData.focusLevel, 10);
    const energyCost = Math.max(1, Math.floor(sessionData.duration / 10));

    const activity: SystemActivity = {
      type: 'focus_session',
      characterId,
      xpReward: sessionData.xpAwarded,
      resourceChanges: [
        {
          type: 'focus',
          change: focusBoost,
          reason: `Focus improved by ${sessionData.duration}-minute session`,
        },
        {
          type: 'energy',
          change: -energyCost,
          reason: `Energy used during focus session`,
        },
      ],
      source: 'Focus System',
      data: {
        sessionId,
        duration: sessionData.duration,
        focusLevel: sessionData.focusLevel,
        technique: sessionData.technique,
      },
    };

    return this.processActivity(activity);
  }

  /**
   * Reflection completion integration
   */
  static async handleReflectionCompletion(
    reflectionId: string,
    characterId: string,
    reflectionData: {
      type: 'daily' | 'weekly' | 'monthly';
      moodScore: number;
      energyScore: number;
      xpAwarded: number;
    }
  ): Promise<IntegrationResult> {
    const motivationBoost = reflectionData.type === 'daily' ? 10 : reflectionData.type === 'weekly' ? 20 : 30;

    const activity: SystemActivity = {
      type: 'reflection',
      characterId,
      xpReward: reflectionData.xpAwarded,
      resourceChanges: [
        {
          type: 'motivation',
          change: motivationBoost,
          reason: `Motivation boost from ${reflectionData.type} reflection`,
        },
      ],
      source: 'Reflection System',
      data: {
        reflectionId,
        reflectionType: reflectionData.type,
        moodScore: reflectionData.moodScore,
        energyScore: reflectionData.energyScore,
      },
    };

    return this.processActivity(activity);
  }

  /**
   * Brain dump processing integration
   */
  static async handleBrainDumpProcessing(
    dumpId: string,
    characterId: string,
    dumpData: {
      mood: string;
      urgencyLevel: number;
      questsGenerated: number;
    }
  ): Promise<IntegrationResult> {
    const xpReward = 25 + (dumpData.questsGenerated * 10);
    const motivationChange = dumpData.urgencyLevel > 7 ? 5 : -2; // High urgency items can be stressful

    const activity: SystemActivity = {
      type: 'brain_dump',
      characterId,
      xpReward,
      resourceChanges: [
        {
          type: 'motivation',
          change: motivationChange,
          reason: 'Brain dump processing effect',
        },
      ],
      source: 'Brain Dump System',
      data: {
        dumpId,
        mood: dumpData.mood,
        urgencyLevel: dumpData.urgencyLevel,
        questsGenerated: dumpData.questsGenerated,
      },
    };

    return this.processActivity(activity);
  }

  /**
   * Basic need satisfaction integration
   */
  static async handleBasicNeedSatisfaction(
    needId: string,
    characterId: string,
    needData: {
      needType: string;
      priority: 'low' | 'medium' | 'high';
    }
  ): Promise<IntegrationResult> {
    const xpReward = needData.priority === 'high' ? 15 : needData.priority === 'medium' ? 10 : 5;
    let resourceChanges: SystemActivity['resourceChanges'] = [];

    // Different needs affect different resources
    switch (needData.needType) {
      case 'hydration':
        resourceChanges.push({
          type: 'energy',
          change: 5,
          reason: 'Hydration boost',
        });
        break;
      case 'nutrition':
        resourceChanges.push({
          type: 'energy',
          change: 10,
          reason: 'Nutrition boost',
        });
        break;
      case 'movement':
        resourceChanges.push({
          type: 'energy',
          change: 3,
          reason: 'Movement benefit',
        }, {
          type: 'focus',
          change: 2,
          reason: 'Movement mental clarity',
        });
        break;
      case 'sleep':
        resourceChanges.push({
          type: 'energy',
          change: 20,
          reason: 'Rest recovery',
        }, {
          type: 'focus',
          change: 10,
          reason: 'Sleep mental restoration',
        });
        break;
    }

    const activity: SystemActivity = {
      type: 'basic_need',
      characterId,
      xpReward,
      resourceChanges,
      source: 'ADHD Support System',
      data: {
        needId,
        needType: needData.needType,
        priority: needData.priority,
      },
    };

    return this.processActivity(activity);
  }

  /**
   * Daily resource regeneration (called by cron job or scheduler)
   */
  static async handleDailyRegeneration(characterId: string): Promise<IntegrationResult> {
    try {
      await apiClient.regenerateResources(characterId);

      return {
        xpAdded: 0,
        leveledUp: false,
        resourcesUpdated: [
          { type: 'energy', oldValue: 0, newValue: 0, change: 0 },
          { type: 'focus', oldValue: 0, newValue: 0, change: 0 },
          { type: 'motivation', oldValue: 0, newValue: 0, change: 0 },
          { type: 'spoons', oldValue: 0, newValue: 0, change: 0 },
        ],
        achievementsUnlocked: [],
        notifications: ['🌅 Daily resources regenerated! Ready for a new day!'],
      };
    } catch (error) {
      console.error('Daily regeneration failed:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive character dashboard data
   */
  static async getCharacterDashboard(characterId: string) {
    try {
      const [
        character,
        resources,
        quests,
        achievements,
        focusSessions,
        reflections,
        basicNeeds,
      ] = await Promise.all([
        apiClient.getCharacter(characterId),
        apiClient.getCharacterResources(characterId),
        apiClient.getQuests(characterId, { limit: 5 }),
        apiClient.getAchievements(characterId, { unlocked: true, limit: 3 }),
        apiClient.getFocusSessions(characterId, { limit: 3 }),
        apiClient.getReflections(characterId, { limit: 3 }),
        apiClient.getBasicNeeds(characterId),
      ]);

      return {
        character,
        resources,
        quests: quests.quests,
        achievements: achievements.achievements,
        focusSessions: focusSessions.sessions,
        reflections: reflections.reflections,
        basicNeeds: basicNeeds.basicNeeds,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to load character dashboard:', error);
      throw error;
    }
  }
}