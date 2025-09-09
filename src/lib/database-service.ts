import { eq, and, desc, asc, sql, count, exists, or, like, gt, lt, gte, lte } from 'drizzle-orm';
import { db, withDatabase, DatabaseError, ValidationError, NotFoundError } from './db';
import {
  characterProfile,
  characterStats,
  characterResources,
  quests,
  questObjectives,
  brainDumps,
  basicNeeds,
  focusSessions,
  reflections,
  achievements,
  type CharacterProfile,
  type CharacterStats,
  type CharacterResources,
  type Quest,
  type BrainDump,
} from '../../database/schema';

export class DatabaseService {
  // ============================================
  // CHARACTER OPERATIONS
  // ============================================

  static async getCharacterProfile(characterId: string): Promise<CharacterProfile | null> {
    return withDatabase(async () => {
      const [profile] = await db
        .select()
        .from(characterProfile)
        .where(eq(characterProfile.id, characterId))
        .limit(1);
      
      return profile || null;
    }, 'getCharacterProfile');
  }

  static async createCharacterProfile(data: Partial<CharacterProfile>): Promise<CharacterProfile> {
    return withDatabase(async () => {
      const [newProfile] = await db
        .insert(characterProfile)
        .values(data)
        .returning();
      
      if (!newProfile) {
        throw new DatabaseError('Failed to create character profile');
      }
      
      return newProfile;
    }, 'createCharacterProfile');
  }

  static async updateCharacterProfile(
    characterId: string, 
    updates: Partial<CharacterProfile>
  ): Promise<CharacterProfile> {
    return withDatabase(async () => {
      const [updatedProfile] = await db
        .update(characterProfile)
        .set(updates)
        .where(eq(characterProfile.id, characterId))
        .returning();
      
      if (!updatedProfile) {
        throw new NotFoundError('Character', characterId);
      }
      
      return updatedProfile;
    }, 'updateCharacterProfile');
  }

  static async getCharacterStats(characterId: string): Promise<CharacterStats[]> {
    return withDatabase(async () => {
      return db
        .select()
        .from(characterStats)
        .where(eq(characterStats.characterId, characterId))
        .orderBy(asc(characterStats.statCategory), asc(characterStats.statName));
    }, 'getCharacterStats');
  }

  static async getCharacterResources(characterId: string): Promise<CharacterResources[]> {
    return withDatabase(async () => {
      return db
        .select()
        .from(characterResources)
        .where(eq(characterResources.characterId, characterId))
        .orderBy(asc(characterResources.resourceType));
    }, 'getCharacterResources');
  }

  static async updateCharacterResource(
    characterId: string,
    resourceType: string,
    updates: Partial<CharacterResources>
  ): Promise<CharacterResources> {
    return withDatabase(async () => {
      const [updatedResource] = await db
        .update(characterResources)
        .set({
          ...updates,
          lastUpdated: new Date(),
        })
        .where(
          and(
            eq(characterResources.characterId, characterId),
            eq(characterResources.resourceType, resourceType)
          )
        )
        .returning();
      
      if (!updatedResource) {
        throw new NotFoundError('Resource', `${characterId}:${resourceType}`);
      }
      
      return updatedResource;
    }, 'updateCharacterResource');
  }

  // ============================================
  // QUEST OPERATIONS
  // ============================================

  static async getQuests(
    characterId: string,
    options: {
      status?: string;
      type?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ quests: Quest[]; total: number }> {
    return withDatabase(async () => {
      let query = db
        .select()
        .from(quests)
        .where(eq(quests.characterId, characterId));

      // Apply filters
      if (options.status) {
        query = query.where(and(
          eq(quests.characterId, characterId),
          eq(quests.status, options.status)
        ));
      }

      if (options.type) {
        query = query.where(and(
          eq(quests.characterId, characterId),
          eq(quests.questType, options.type)
        ));
      }

      // Get total count
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(quests)
        .where(eq(quests.characterId, characterId));

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      // Order by priority and creation date
      query = query.orderBy(desc(quests.createdAt));

      const questResults = await query;

      return {
        quests: questResults,
        total: total || 0,
      };
    }, 'getQuests');
  }

  static async getQuestById(questId: string): Promise<Quest | null> {
    return withDatabase(async () => {
      const [quest] = await db
        .select()
        .from(quests)
        .where(eq(quests.id, questId))
        .limit(1);
      
      return quest || null;
    }, 'getQuestById');
  }

  static async createQuest(data: Partial<Quest>): Promise<Quest> {
    return withDatabase(async () => {
      const [newQuest] = await db
        .insert(quests)
        .values(data)
        .returning();
      
      if (!newQuest) {
        throw new DatabaseError('Failed to create quest');
      }
      
      return newQuest;
    }, 'createQuest');
  }

  static async updateQuest(questId: string, updates: Partial<Quest>): Promise<Quest> {
    return withDatabase(async () => {
      const [updatedQuest] = await db
        .update(quests)
        .set(updates)
        .where(eq(quests.id, questId))
        .returning();
      
      if (!updatedQuest) {
        throw new NotFoundError('Quest', questId);
      }
      
      return updatedQuest;
    }, 'updateQuest');
  }

  // ============================================
  // BRAIN DUMP OPERATIONS
  // ============================================

  static async getBrainDumps(
    characterId: string,
    options: {
      processed?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ dumps: BrainDump[]; total: number }> {
    return withDatabase(async () => {
      let whereConditions = [eq(brainDumps.characterId, characterId)];

      if (options.processed !== undefined) {
        if (options.processed) {
          whereConditions.push(sql`${brainDumps.processedAt} IS NOT NULL`);
        } else {
          whereConditions.push(sql`${brainDumps.processedAt} IS NULL`);
        }
      }

      // Get total count
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(brainDumps)
        .where(and(...whereConditions));

      let query = db
        .select()
        .from(brainDumps)
        .where(and(...whereConditions))
        .orderBy(desc(brainDumps.createdAt));

      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      const dumps = await query;

      return {
        dumps,
        total: total || 0,
      };
    }, 'getBrainDumps');
  }

  static async createBrainDump(data: Partial<BrainDump>): Promise<BrainDump> {
    return withDatabase(async () => {
      const [newDump] = await db
        .insert(brainDumps)
        .values(data)
        .returning();
      
      if (!newDump) {
        throw new DatabaseError('Failed to create brain dump');
      }
      
      return newDump;
    }, 'createBrainDump');
  }

  // ============================================
  // AGGREGATION QUERIES
  // ============================================

  static async getCharacterSummary(characterId: string) {
    return withDatabase(async () => {
      // Get character profile with stats
      const profile = await this.getCharacterProfile(characterId);
      if (!profile) {
        throw new NotFoundError('Character', characterId);
      }

      // Get quest statistics
      const [questStats] = await db
        .select({
          total: count(),
          completed: sql`COUNT(CASE WHEN ${quests.status} = 'completed' THEN 1 END)`,
          inProgress: sql`COUNT(CASE WHEN ${quests.status} = 'in_progress' THEN 1 END)`,
          pending: sql`COUNT(CASE WHEN ${quests.status} = 'pending' THEN 1 END)`,
        })
        .from(quests)
        .where(eq(quests.characterId, characterId));

      // Get recent activity (last 7 days)
      const recentActivity = await db
        .select({
          type: sql`'quest'`,
          title: quests.title,
          date: quests.createdAt,
          xp: quests.xpReward,
        })
        .from(quests)
        .where(
          and(
            eq(quests.characterId, characterId),
            gte(quests.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(quests.createdAt))
        .limit(10);

      return {
        profile,
        questStats,
        recentActivity,
      };
    }, 'getCharacterSummary');
  }

  // ============================================
  // PERFORMANCE ANALYTICS
  // ============================================

  static async getPerformanceMetrics(characterId: string, days: number = 30) {
    return withDatabase(async () => {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Quest completion rate
      const [questMetrics] = await db
        .select({
          totalQuests: count(),
          completedQuests: sql`COUNT(CASE WHEN ${quests.status} = 'completed' THEN 1 END)`,
          averageXp: sql`AVG(${quests.xpReward})`,
        })
        .from(quests)
        .where(
          and(
            eq(quests.characterId, characterId),
            gte(quests.createdAt, startDate)
          )
        );

      // Focus session metrics
      const [focusMetrics] = await db
        .select({
          totalSessions: count(),
          totalMinutes: sql`SUM(${focusSessions.duration})`,
          averageFocus: sql`AVG(${focusSessions.focusLevel})`,
        })
        .from(focusSessions)
        .where(
          and(
            eq(focusSessions.characterId, characterId),
            gte(focusSessions.startedAt, startDate)
          )
        );

      // Reflection consistency
      const [reflectionMetrics] = await db
        .select({
          totalReflections: count(),
          averageMood: sql`AVG(${reflections.moodScore})`,
          averageEnergy: sql`AVG(${reflections.energyScore})`,
        })
        .from(reflections)
        .where(
          and(
            eq(reflections.characterId, characterId),
            gte(reflections.createdAt, startDate)
          )
        );

      return {
        period: `${days} days`,
        quests: questMetrics,
        focus: focusMetrics,
        reflections: reflectionMetrics,
      };
    }, 'getPerformanceMetrics');
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  static async batchUpdateResources(
    characterId: string,
    resourceUpdates: Array<{
      resourceType: string;
      currentValue: number;
    }>
  ): Promise<CharacterResources[]> {
    return withDatabase(async () => {
      const results: CharacterResources[] = [];

      // Use transaction for batch updates
      for (const update of resourceUpdates) {
        const [updatedResource] = await db
          .update(characterResources)
          .set({
            currentValue: update.currentValue,
            lastUpdated: new Date(),
          })
          .where(
            and(
              eq(characterResources.characterId, characterId),
              eq(characterResources.resourceType, update.resourceType)
            )
          )
          .returning();

        if (updatedResource) {
          results.push(updatedResource);
        }
      }

      return results;
    }, 'batchUpdateResources');
  }

  // ============================================
  // SEARCH OPERATIONS
  // ============================================

  static async searchQuests(characterId: string, searchTerm: string): Promise<Quest[]> {
    return withDatabase(async () => {
      return db
        .select()
        .from(quests)
        .where(
          and(
            eq(quests.characterId, characterId),
            or(
              like(quests.title, `%${searchTerm}%`),
              like(quests.description, `%${searchTerm}%`)
            )
          )
        )
        .orderBy(desc(quests.createdAt))
        .limit(50);
    }, 'searchQuests');
  }

  static async searchBrainDumps(characterId: string, searchTerm: string): Promise<BrainDump[]> {
    return withDatabase(async () => {
      return db
        .select()
        .from(brainDumps)
        .where(
          and(
            eq(brainDumps.characterId, characterId),
            like(brainDumps.content, `%${searchTerm}%`)
          )
        )
        .orderBy(desc(brainDumps.createdAt))
        .limit(50);
    }, 'searchBrainDumps');
  }
}