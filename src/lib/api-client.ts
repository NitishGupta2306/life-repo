export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      let responseData: ApiResponse<T>;
      
      try {
        responseData = await response.json();
      } catch {
        // If response is not JSON, create a generic response
        responseData = {
          success: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok) {
        throw new ApiError(
          responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError();
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    
    const response = await this.request<T>(url);
    return response.data as T;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data as T;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'DELETE',
    });
    return response.data as T;
  }

  // ============================================
  // CHARACTER API METHODS
  // ============================================

  async getCharacter(characterId: string) {
    return this.get(`/character?id=${characterId}`);
  }

  async createCharacter(data: {
    characterName: string;
    characterClass?: string;
    age?: number;
  }) {
    return this.post('/character', data);
  }

  async updateCharacter(id: string, updates: any) {
    return this.put('/character', { id, ...updates });
  }

  async addXP(characterId: string, xpAmount: number, source?: string, description?: string) {
    return this.post('/character/xp', {
      characterId,
      xpAmount,
      source,
      description,
    });
  }

  async getCharacterResources(characterId: string) {
    return this.get(`/character/resources?characterId=${characterId}`);
  }

  async updateResource(characterId: string, resourceType: string, change: number, reason?: string) {
    return this.put('/character/resources', {
      characterId,
      resourceType,
      change,
      reason,
    });
  }

  async regenerateResources(characterId: string) {
    return this.post('/character/resources/regenerate', { characterId });
  }

  // ============================================
  // QUEST API METHODS
  // ============================================

  async getQuests(characterId: string, options?: {
    status?: string;
    type?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams({ characterId });
    if (options?.status) params.set('status', options.status);
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', options.limit.toString());
    
    return this.get(`/quests?${params}`);
  }

  async getQuest(questId: string) {
    return this.get(`/quests/${questId}`);
  }

  async createQuest(data: {
    title: string;
    description: string;
    questType: string;
    xpReward?: number;
    energyCost?: number;
    dueDate?: string;
    objectives?: Array<{ description: string }>;
  }) {
    return this.post('/quests', data);
  }

  async updateQuest(questId: string, updates: any) {
    return this.put(`/quests/${questId}`, updates);
  }

  async completeQuest(questId: string, characterId: string, completedObjectives?: string[]) {
    return this.post(`/quests/${questId}/complete`, {
      characterId,
      completedObjectives,
    });
  }

  async deleteQuest(questId: string) {
    return this.delete(`/quests/${questId}`);
  }

  // ============================================
  // BRAIN DUMP API METHODS
  // ============================================

  async getBrainDumps(characterId: string, options?: {
    processed?: boolean;
    limit?: number;
  }) {
    const params = new URLSearchParams({ characterId });
    if (options?.processed !== undefined) params.set('processed', options.processed.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    
    return this.get(`/brain-dump?${params}`);
  }

  async createBrainDump(data: {
    characterId: string;
    content: string;
    mood?: string;
    energyLevel?: number;
    urgencyLevel?: number;
    tags?: string[];
    processImmediately?: boolean;
  }) {
    return this.post('/brain-dump', data);
  }

  async processBrainDump(dumpId: string, characterId: string, generateQuests = true) {
    return this.post(`/brain-dump/${dumpId}/process`, {
      characterId,
      generateQuests,
    });
  }

  // ============================================
  // ADHD SUPPORT API METHODS
  // ============================================

  async getBasicNeeds(characterId: string, type?: string) {
    const params = new URLSearchParams({ characterId });
    if (type) params.set('type', type);
    
    return this.get(`/adhd/basic-needs?${params}`);
  }

  async updateBasicNeed(data: {
    characterId: string;
    needType: string;
    status?: string;
    notes?: string;
    markSatisfied?: boolean;
  }) {
    return this.post('/adhd/basic-needs', data);
  }

  async getFocusSessions(characterId: string, options?: {
    limit?: number;
    status?: string;
  }) {
    const params = new URLSearchParams({ characterId });
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.status) params.set('status', options.status);
    
    return this.get(`/adhd/focus-sessions?${params}`);
  }

  async startFocusSession(data: {
    characterId: string;
    duration?: number;
    technique?: string;
    goal?: string;
  }) {
    return this.post('/adhd/focus-sessions', data);
  }

  async completeFocusSession(data: {
    sessionId: string;
    characterId: string;
    focusLevel: number;
    distractions?: number;
    notes?: string;
    completedEarly?: boolean;
  }) {
    return this.put('/adhd/focus-sessions', data);
  }

  // ============================================
  // REFLECTION API METHODS
  // ============================================

  async getReflections(characterId: string, options?: {
    type?: string;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params = new URLSearchParams({ characterId });
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.dateFrom) params.set('dateFrom', options.dateFrom);
    if (options?.dateTo) params.set('dateTo', options.dateTo);
    
    return this.get(`/reflections?${params}`);
  }

  async createReflection(data: {
    characterId: string;
    type: string;
    responses: Record<string, string>;
    moodScore: number;
    energyScore: number;
    productivityScore?: number;
    wellnessScore?: number;
  }) {
    return this.post('/reflections', data);
  }

  // ============================================
  // ACHIEVEMENT API METHODS
  // ============================================

  async getAchievements(characterId: string, options?: {
    unlocked?: boolean;
    category?: string;
    rarity?: string;
  }) {
    const params = new URLSearchParams({ characterId });
    if (options?.unlocked !== undefined) params.set('unlocked', options.unlocked.toString());
    if (options?.category) params.set('category', options.category);
    if (options?.rarity) params.set('rarity', options.rarity);
    
    return this.get(`/achievements?${params}`);
  }

  async checkAchievements(data: {
    characterId: string;
    triggerType: string;
    triggerData?: Record<string, any>;
  }) {
    return this.post('/achievements/check', data);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export error types for use in components
export { ApiError, NetworkError };