/**
 * AI Processing Pipeline for Brain Dumps
 * Processes raw ADHD thoughts and converts them into structured, actionable content
 */

export interface AIProcessingResult {
  interpretation: string;
  suggestedAction: 'create_quest' | 'create_task' | 'add_note' | 'create_reminder' | 'add_to_reflection' | 'ignore';
  detectedUrgency: 'now' | 'today' | 'this_week' | 'someday' | 'unknown';
  detectedEmotions: string[];
  suggestedSkillTrees: string[];
  suggestedQuestType?: string;
  extractedEntities: Record<string, unknown>;
  confidenceScore: number;
  requiresHumanReview: boolean;
  detectedMood?: 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
  categories: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  extractedTasks: ExtractedTask[];
  patterns: DetectedPattern[];
  tags: string[];
}

export interface ExtractedTask {
  text: string;
  urgency: 'now' | 'today' | 'this_week' | 'someday' | 'unknown';
  category: string;
  estimatedDuration?: string;
  dependencies?: string[];
}

export interface DetectedPattern {
  pattern: string;
  confidence: number;
  frequency: 'first_time' | 'occasional' | 'recurring' | 'persistent';
  suggestion?: string;
}

/**
 * Main AI processing function
 */
export async function processWithAI(rawText: string): Promise<AIProcessingResult> {
  const text = rawText.trim().toLowerCase();
  
  // Basic text analysis
  const wordCount = rawText.split(' ').length;
  const hasExclamation = rawText.includes('!');
  const hasQuestion = rawText.includes('?');
  const hasCapitalWords = /[A-Z]{2,}/.test(rawText);
  
  // Detect urgency from text patterns
  const urgency = detectUrgency(text);
  
  // Detect emotions from text
  const emotions = detectEmotions(text);
  
  // Detect mood
  const mood = detectMood(text, emotions);
  
  // Categorize the content
  const categories = categorizeContent(text);
  
  // Extract potential tasks
  const extractedTasks = extractTasks(rawText);
  
  // Detect patterns
  const patterns = detectPatterns(text);
  
  // Generate tags
  const tags = generateTags(text, categories, emotions);
  
  // Determine suggested action
  const suggestedAction = determineSuggestedAction(text, extractedTasks, urgency, categories);
  
  // Calculate priority
  const priority = calculatePriority(urgency, emotions, hasExclamation, hasCapitalWords);
  
  // Determine if human review is needed
  const requiresHumanReview = shouldRequireHumanReview(text, emotions, priority, wordCount);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(wordCount, categories.length, extractedTasks.length);
  
  // Generate interpretation
  const interpretation = generateInterpretation(rawText, categories, extractedTasks, emotions, urgency);
  
  // Suggest skill trees
  const suggestedSkillTrees = suggestSkillTrees(categories, extractedTasks);
  
  // Suggest quest type
  const suggestedQuestType = suggestQuestType(urgency, priority, extractedTasks.length);
  
  return {
    interpretation,
    suggestedAction,
    detectedUrgency: urgency,
    detectedEmotions: emotions,
    suggestedSkillTrees,
    suggestedQuestType,
    extractedEntities: {
      wordCount,
      hasExclamation,
      hasQuestion,
      hasCapitalWords,
      textLength: rawText.length
    },
    confidenceScore,
    requiresHumanReview,
    detectedMood: mood,
    categories,
    priority,
    extractedTasks,
    patterns,
    tags
  };
}

function detectUrgency(text: string): 'now' | 'today' | 'this_week' | 'someday' | 'unknown' {
  const urgentWords = ['urgent', 'asap', 'now', 'immediately', 'emergency', 'crisis', 'help', 'panic'];
  const todayWords = ['today', 'deadline', 'due', 'meeting', 'appointment'];
  const weekWords = ['this week', 'soon', 'friday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const somedayWords = ['someday', 'eventually', 'maybe', 'consider', 'idea', 'think about'];
  
  if (urgentWords.some(word => text.includes(word))) return 'now';
  if (todayWords.some(word => text.includes(word))) return 'today';
  if (weekWords.some(word => text.includes(word))) return 'this_week';
  if (somedayWords.some(word => text.includes(word))) return 'someday';
  
  return 'unknown';
}

function detectEmotions(text: string): string[] {
  const emotionPatterns = {
    anxiety: ['worried', 'anxious', 'stressed', 'panic', 'overwhelmed', 'scared'],
    excitement: ['excited', 'awesome', 'amazing', 'great', 'fantastic', 'love'],
    frustration: ['frustrated', 'annoyed', 'angry', 'mad', 'hate', 'ugh'],
    sadness: ['sad', 'depressed', 'down', 'terrible', 'awful', 'horrible'],
    confusion: ['confused', 'lost', 'dont know', 'unclear', 'mixed up'],
    motivation: ['motivated', 'ready', 'determined', 'focused', 'energized'],
    fatigue: ['tired', 'exhausted', 'drained', 'burnt out', 'worn out']
  };
  
  const detectedEmotions: string[] = [];
  
  Object.entries(emotionPatterns).forEach(([emotion, patterns]) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      detectedEmotions.push(emotion);
    }
  });
  
  return detectedEmotions;
}

function detectMood(text: string, emotions: string[]): 'terrible' | 'bad' | 'okay' | 'good' | 'amazing' {
  const moodWords = {
    terrible: ['terrible', 'awful', 'horrible', 'worst', 'crisis'],
    bad: ['bad', 'sad', 'frustrated', 'stressed', 'worried'],
    okay: ['okay', 'fine', 'normal', 'alright', 'meh'],
    good: ['good', 'better', 'positive', 'happy', 'nice'],
    amazing: ['amazing', 'awesome', 'fantastic', 'excellent', 'perfect']
  };
  
  for (const [mood, words] of Object.entries(moodWords)) {
    if (words.some(word => text.includes(word))) {
      return mood as 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
    }
  }
  
  // Infer from emotions
  if (emotions.includes('excitement') || emotions.includes('motivation')) return 'good';
  if (emotions.includes('anxiety') || emotions.includes('sadness')) return 'bad';
  if (emotions.includes('frustration') && emotions.includes('fatigue')) return 'terrible';
  
  return 'okay';
}

function categorizeContent(text: string): string[] {
  const categoryPatterns = {
    work: ['work', 'job', 'meeting', 'project', 'deadline', 'boss', 'client', 'office'],
    personal: ['personal', 'family', 'relationship', 'friend', 'home', 'life'],
    health: ['health', 'doctor', 'exercise', 'diet', 'sleep', 'medication', 'therapy'],
    finance: ['money', 'budget', 'bill', 'payment', 'expense', 'income', 'bank'],
    learning: ['learn', 'study', 'course', 'book', 'skill', 'practice', 'research'],
    creative: ['creative', 'art', 'music', 'write', 'design', 'photography', 'idea'],
    maintenance: ['clean', 'organize', 'fix', 'repair', 'maintain', 'update'],
    social: ['social', 'party', 'event', 'hangout', 'visit', 'call', 'text']
  };
  
  const categories: string[] = [];
  
  Object.entries(categoryPatterns).forEach(([category, patterns]) => {
    if (patterns.some(pattern => text.includes(pattern))) {
      categories.push(category);
    }
  });
  
  if (categories.length === 0) {
    categories.push('general');
  }
  
  return categories;
}

function extractTasks(text: string): ExtractedTask[] {
  const tasks: ExtractedTask[] = [];
  
  // Look for common task patterns
  const taskPatterns = [
    /need to (.+?)(?:\.|$)/gi,
    /should (.+?)(?:\.|$)/gi,
    /must (.+?)(?:\.|$)/gi,
    /have to (.+?)(?:\.|$)/gi,
    /remember to (.+?)(?:\.|$)/gi,
    /don't forget (.+?)(?:\.|$)/gi,
    /- (.+?)(?:\n|$)/gi,
    /\* (.+?)(?:\n|$)/gi,
    /\d+\. (.+?)(?:\n|$)/gi
  ];
  
  taskPatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      if (match[1] && match[1].trim().length > 3) {
        tasks.push({
          text: match[1].trim(),
          urgency: detectUrgency(match[1].toLowerCase()),
          category: categorizeContent(match[1].toLowerCase())[0] || 'general'
        });
      }
    });
  });
  
  return tasks;
}

function detectPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  
  // Common ADHD patterns
  if (text.includes('forgot') || text.includes('remember')) {
    patterns.push({
      pattern: 'memory_issues',
      confidence: 0.8,
      frequency: 'recurring',
      suggestion: 'Consider using reminders or memory aids'
    });
  }
  
  if (text.includes('overwhelmed') || text.includes('too much')) {
    patterns.push({
      pattern: 'overwhelm',
      confidence: 0.9,
      frequency: 'recurring',
      suggestion: 'Break tasks into smaller, manageable pieces'
    });
  }
  
  if (text.includes('procrastinating') || text.includes('putting off')) {
    patterns.push({
      pattern: 'procrastination',
      confidence: 0.85,
      frequency: 'recurring',
      suggestion: 'Use time-blocking or the Pomodoro technique'
    });
  }
  
  return patterns;
}

function generateTags(text: string, categories: string[], emotions: string[]): string[] {
  const tags = new Set<string>();
  
  // Add categories as tags
  categories.forEach(cat => tags.add(cat));
  
  // Add emotions as tags
  emotions.forEach(emotion => tags.add(emotion));
  
  // Add urgency-based tags
  if (text.includes('urgent') || text.includes('asap')) tags.add('urgent');
  if (text.includes('idea') || text.includes('thought')) tags.add('idea');
  if (text.includes('reminder') || text.includes('remember')) tags.add('reminder');
  
  return Array.from(tags);
}

function determineSuggestedAction(
  text: string,
  tasks: ExtractedTask[],
  urgency: string,
  _categories: string[]
): 'create_quest' | 'create_task' | 'add_note' | 'create_reminder' | 'add_to_reflection' | 'ignore' {
  
  if (tasks.length > 0 && urgency !== 'unknown') {
    return tasks.length > 1 ? 'create_quest' : 'create_task';
  }
  
  if (text.includes('reminder') || text.includes('remember') || text.includes('don\'t forget')) {
    return 'create_reminder';
  }
  
  if (text.includes('feeling') || text.includes('thinking') || text.includes('reflect')) {
    return 'add_to_reflection';
  }
  
  if (text.includes('idea') || text.includes('thought') || text.includes('note')) {
    return 'add_note';
  }
  
  return tasks.length > 0 ? 'create_task' : 'add_note';
}

function calculatePriority(
  urgency: string,
  emotions: string[],
  hasExclamation: boolean,
  hasCapitalWords: boolean
): 'low' | 'medium' | 'high' | 'critical' {
  
  if (urgency === 'now' || emotions.includes('anxiety')) return 'critical';
  if (urgency === 'today' || hasExclamation || hasCapitalWords) return 'high';
  if (urgency === 'this_week' || emotions.includes('frustration')) return 'medium';
  
  return 'low';
}

function shouldRequireHumanReview(
  text: string,
  emotions: string[],
  priority: string,
  wordCount: number
): boolean {
  
  // Require review for complex emotional content
  if (emotions.includes('anxiety') && emotions.includes('sadness')) return true;
  
  // Require review for critical priority items
  if (priority === 'critical') return true;
  
  // Require review for very long or very short dumps
  if (wordCount > 200 || wordCount < 3) return true;
  
  // Require review for certain keywords
  const reviewKeywords = ['crisis', 'emergency', 'help', 'suicide', 'harm'];
  if (reviewKeywords.some(keyword => text.includes(keyword))) return true;
  
  return false;
}

function calculateConfidenceScore(wordCount: number, categoryCount: number, taskCount: number): number {
  let score = 0.5; // Base confidence
  
  // More words = higher confidence in analysis
  if (wordCount > 10) score += 0.2;
  if (wordCount > 50) score += 0.1;
  
  // Clear categorization increases confidence
  if (categoryCount > 0) score += 0.1;
  if (categoryCount > 1) score += 0.05;
  
  // Clear tasks increase confidence
  if (taskCount > 0) score += 0.1;
  if (taskCount > 2) score += 0.05;
  
  return Math.min(score, 1.0);
}

function generateInterpretation(
  rawText: string,
  categories: string[],
  tasks: ExtractedTask[],
  emotions: string[],
  urgency: string
): string {
  const parts = [];
  
  parts.push(`This appears to be a ${categories.join('/')}-related brain dump.`);
  
  if (emotions.length > 0) {
    parts.push(`Detected emotions: ${emotions.join(', ')}.`);
  }
  
  if (tasks.length > 0) {
    parts.push(`Found ${tasks.length} potential task(s) or action item(s).`);
  }
  
  if (urgency !== 'unknown') {
    parts.push(`Urgency level: ${urgency}.`);
  }
  
  if (rawText.length < 20) {
    parts.push('This is a brief capture that might benefit from expansion.');
  }
  
  return parts.join(' ');
}

function suggestSkillTrees(categories: string[], _tasks: ExtractedTask[]): string[] {
  const skillTrees: string[] = [];
  
  const skillMapping = {
    work: ['productivity', 'organization', 'communication'],
    health: ['self-care', 'wellness', 'routine-building'],
    learning: ['focus', 'memory', 'skill-development'],
    creative: ['creativity', 'expression', 'innovation'],
    finance: ['organization', 'planning', 'responsibility']
  };
  
  categories.forEach(category => {
    const skills = skillMapping[category as keyof typeof skillMapping];
    if (skills) {
      skillTrees.push(...skills);
    }
  });
  
  // Remove duplicates
  return Array.from(new Set(skillTrees));
}

function suggestQuestType(urgency: string, priority: string, taskCount: number): string {
  if (urgency === 'now' || priority === 'critical') return 'urgent';
  if (taskCount > 2) return 'multi-step';
  if (urgency === 'today') return 'daily';
  if (urgency === 'this_week') return 'weekly';
  
  return 'standard';
}