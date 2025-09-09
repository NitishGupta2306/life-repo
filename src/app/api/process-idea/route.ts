import { NextRequest, NextResponse } from 'next/server';
import { saveProcessedTask, saveProcessedNote } from '@/lib/services/idea-processor';

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();
    
    if (!text || !type) {
      return NextResponse.json({ error: 'Missing text or type' }, { status: 400 });
    }

    // Process the idea based on type
    if (type === 'task') {
      const processedTask = await processAsTask(text);
      
      // Save to database
      const saveResult = await saveProcessedTask(text, processedTask);
      
      return NextResponse.json({
        success: true,
        type: 'task',
        result: processedTask,
        message: `🚀 Project planned: "${processedTask.title}" with ${processedTask.checklist.length} action items`,
        saved: saveResult
      });
    } else if (type === 'note') {
      const processedNote = await processAsNote(text);
      
      // Save to database
      const saveResult = await saveProcessedNote(text, processedNote);
      
      return NextResponse.json({
        success: true,
        type: 'note',
        result: processedNote,
        message: `📝 Note enhanced: "${processedNote.title}" categorized in ${processedNote.area}`,
        saved: saveResult
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error processing idea:', error);
    return NextResponse.json({ error: 'Failed to process idea' }, { status: 500 });
  }
}

async function processAsTask(text: string) {
  // Advanced project planning and automation using Claude Code intelligence
  const projectAnalysis = await analyzeProjectIntent(text);
  
  // Generate intelligent recommendations based on project type
  const recommendations = await generateProjectRecommendations(projectAnalysis);
  
  return {
    title: recommendations.title,
    description: recommendations.description,
    priority: recommendations.priority,
    difficulty: recommendations.difficulty,
    project: recommendations.project,
    area: recommendations.area,
    dueDate: recommendations.dueDate,
    checklist: recommendations.checklist,
  };
}

async function processAsNote(text: string) {
  // Enhanced note analysis with intelligent insights
  const noteAnalysis = await analyzeNoteContent(text);
  const recommendations = await generateNoteRecommendations(noteAnalysis);
  
  return {
    title: recommendations.title,
    content: recommendations.content,
    project: recommendations.project,
    area: recommendations.area,
    subAreas: recommendations.subAreas,
  };
}

// Advanced Project Intelligence Engine
async function analyzeProjectIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  // Detect project patterns and intent
  const projectPatterns = {
    dashboard: /dashboard|analytics|metrics|visualization|reporting|charts/,
    website: /website|web app|landing page|portfolio|blog|ecommerce/,
    mobile: /mobile app|ios|android|react native|flutter/,
    automation: /automate|script|workflow|process|integration|api/,
    learning: /learn|study|course|tutorial|skill|education|training/,
    business: /business|startup|company|venture|plan|strategy/,
    health: /fitness|diet|workout|health|wellness|medical/,
    creative: /design|art|creative|writing|music|video|content/,
    productivity: /organize|system|workflow|productivity|efficiency/,
    research: /research|analyze|investigate|study|explore/,
    technical: /build|develop|code|program|engineer|software/
  };
  
  // Identify primary project type
  let projectType = 'general';
  let confidence = 0;
  
  for (const [type, pattern] of Object.entries(projectPatterns)) {
    const matches = text.match(pattern);
    if (matches && matches.length > confidence) {
      projectType = type;
      confidence = matches.length;
    }
  }
  
  // Extract specific technologies, frameworks, or tools mentioned
  const technologies = extractTechnologies(text);
  
  // Determine project scope and complexity
  const scope = analyzeProjectScope(text);
  
  // Extract timeline indicators
  const timeline = extractTimelineHints(text);
  
  return {
    originalText: text,
    projectType,
    technologies,
    scope,
    timeline,
    confidence
  };
}

async function generateProjectRecommendations(analysis: any) {
  const { originalText, projectType, technologies, scope, timeline } = analysis;
  
  // Generate contextual title
  const title = generateProjectTitle(originalText, projectType);
  
  // Determine appropriate priority and difficulty
  const { priority, difficulty } = assessProjectComplexity(scope, technologies);
  
  // Generate intelligent project breakdown
  const checklist = await generateIntelligentChecklist(projectType, technologies, scope);
  
  // Calculate realistic timeline
  const dueDate = calculateProjectDeadline(scope, difficulty, timeline);
  
  // Assign to appropriate project and area
  const { project, area } = categorizeProject(projectType, originalText);
  
  return {
    title,
    description: enhanceProjectDescription(originalText, projectType, technologies),
    priority,
    difficulty,
    project,
    area,
    dueDate,
    checklist,
  };
}

function extractTechnologies(text: string) {
  const techPatterns = {
    frontend: ['react', 'vue', 'angular', 'svelte', 'nextjs', 'typescript', 'javascript'],
    backend: ['nodejs', 'python', 'java', 'golang', 'php', 'ruby', 'express', 'fastapi'],
    database: ['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'firebase'],
    cloud: ['aws', 'azure', 'gcp', 'vercel', 'netlify', 'heroku'],
    mobile: ['react native', 'flutter', 'swift', 'kotlin'],
    analytics: ['tableau', 'power bi', 'grafana', 'metabase', 'd3js'],
    design: ['figma', 'sketch', 'adobe', 'canva']
  };
  
  const foundTechs: string[] = [];
  const lowerText = text.toLowerCase();
  
  Object.values(techPatterns).flat().forEach(tech => {
    if (lowerText.includes(tech.toLowerCase())) {
      foundTechs.push(tech);
    }
  });
  
  return foundTechs;
}

function analyzeProjectScope(text: string) {
  const lowerText = text.toLowerCase();
  const indicators = {
    small: ['quick', 'simple', 'basic', 'minimal', 'prototype', 'poc'],
    medium: ['full', 'complete', 'robust', 'production', 'scalable'],
    large: ['enterprise', 'complex', 'advanced', 'comprehensive', 'full-featured', 'platform']
  };
  
  for (const [scope, keywords] of Object.entries(indicators)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return scope;
    }
  }
  
  // Default based on text length and complexity
  if (text.length < 50) return 'small';
  if (text.length < 150) return 'medium';
  return 'large';
}

function extractTimelineHints(text: string) {
  const lowerText = text.toLowerCase();
  const timePatterns = {
    urgent: ['asap', 'urgent', 'immediately', 'rush', 'emergency'],
    short: ['today', 'tomorrow', 'this week', 'few days', 'quick'],
    medium: ['next week', 'two weeks', 'month', 'few weeks'],
    long: ['quarter', 'months', 'year', 'long term', 'eventually']
  };
  
  for (const [timeline, keywords] of Object.entries(timePatterns)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return timeline;
    }
  }
  
  return 'medium';
}

function generateProjectTitle(text: string, projectType: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  let baseTitle = sentences[0]?.trim() || text.substring(0, 60).trim();
  
  // Enhance title based on project type
  const enhancements = {
    dashboard: 'Analytics Dashboard',
    website: 'Website Development',
    mobile: 'Mobile App',
    automation: 'Automation System',
    learning: 'Learning Project',
    business: 'Business Initiative',
    health: 'Health & Wellness',
    creative: 'Creative Project',
    productivity: 'Productivity System',
    research: 'Research Project',
    technical: 'Technical Implementation'
  };
  
  // If title doesn't clearly indicate project type, enhance it
  if (!baseTitle.toLowerCase().includes(projectType) && projectType !== 'general') {
    baseTitle = `${baseTitle} - ${enhancements[projectType] || 'Project'}`;
  }
  
  return baseTitle.length > 80 ? baseTitle.substring(0, 77) + '...' : baseTitle;
}

function assessProjectComplexity(scope: string, technologies: string[]) {
  let difficulty = 'medium';
  let priority = 'medium';
  
  // Assess difficulty
  if (scope === 'large' || technologies.length > 3) {
    difficulty = 'hard';
  } else if (scope === 'small' && technologies.length <= 1) {
    difficulty = 'easy';
  }
  
  // Business and technical projects often have higher priority
  if (technologies.length > 0 || scope === 'large') {
    priority = 'high';
  }
  
  return { priority, difficulty };
}

async function generateIntelligentChecklist(projectType: string, technologies: string[], scope: string) {
  const basePhases = ['Planning', 'Development', 'Testing', 'Deployment'];
  let checklist: string[] = [];
  
  // Project-specific checklists
  switch (projectType) {
    case 'dashboard':
      checklist = [
        'Define data sources and metrics to track',
        'Design dashboard wireframes and layout',
        'Set up database/API connections',
        'Implement data visualization components',
        'Add filtering and interactive features',
        'Optimize performance and loading times',
        'Test with real data scenarios',
        'Deploy and set up monitoring'
      ];
      break;
      
    case 'website':
      checklist = [
        'Define website goals and target audience',
        'Create sitemap and wireframes',
        'Design visual identity and style guide',
        'Set up development environment',
        'Implement responsive layouts',
        'Add content and optimize SEO',
        'Test across devices and browsers',
        'Deploy and configure domain'
      ];
      break;
      
    case 'mobile':
      checklist = [
        'Research target platform requirements',
        'Design user interface mockups',
        'Set up development environment',
        'Implement core app features',
        'Add navigation and state management',
        'Test on real devices',
        'Optimize app performance',
        'Prepare for app store submission'
      ];
      break;
      
    case 'automation':
      checklist = [
        'Map out current manual process',
        'Identify automation opportunities',
        'Research tools and APIs needed',
        'Build core automation logic',
        'Add error handling and logging',
        'Test with sample data',
        'Set up monitoring and alerts',
        'Document the automation process'
      ];
      break;
      
    case 'learning':
      checklist = [
        'Define learning objectives and goals',
        'Research best resources and materials',
        'Create study schedule and milestones',
        'Set up practice environment',
        'Complete foundational concepts',
        'Work on practical projects',
        'Join communities and find mentors',
        'Build portfolio of learned skills'
      ];
      break;
      
    default:
      // Generic project checklist
      checklist = [
        'Research and plan project requirements',
        'Break down project into smaller tasks',
        'Set up necessary tools and environment',
        'Start with core functionality',
        'Iterate and add additional features',
        'Test thoroughly and fix issues',
        'Document and finalize project',
        'Launch and monitor results'
      ];
  }
  
  // Adjust checklist based on scope
  if (scope === 'small') {
    checklist = checklist.slice(0, Math.ceil(checklist.length / 2));
  } else if (scope === 'large') {
    // Add additional planning and architecture steps
    checklist.unshift('Conduct stakeholder interviews');
    checklist.unshift('Create detailed technical architecture');
    checklist.push('Plan rollout and adoption strategy');
    checklist.push('Set up long-term maintenance plan');
  }
  
  return checklist;
}

function calculateProjectDeadline(scope: string, difficulty: string, timeline: string) {
  const now = new Date();
  let daysToAdd = 14; // Default 2 weeks
  
  // Base timeline by timeline hints
  const timelineMultipliers = {
    urgent: 0.25, // Few days
    short: 0.5,   // 1 week
    medium: 1,    // 2 weeks
    long: 3       // 6 weeks
  };
  
  // Adjust by scope
  const scopeMultipliers = {
    small: 0.5,
    medium: 1,
    large: 2.5
  };
  
  // Adjust by difficulty
  const difficultyMultipliers = {
    easy: 0.7,
    medium: 1,
    hard: 1.8
  };
  
  daysToAdd = daysToAdd 
    * (timelineMultipliers[timeline] || 1)
    * (scopeMultipliers[scope] || 1)
    * (difficultyMultipliers[difficulty] || 1);
  
  const deadline = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  return deadline.toISOString().split('T')[0];
}

function enhanceProjectDescription(originalText: string, projectType: string, technologies: string[]) {
  let enhanced = originalText;
  
  // Add context and recommendations
  if (technologies.length > 0) {
    enhanced += `\n\nRecommended Technologies: ${technologies.join(', ')}`;
  }
  
  // Add project-specific insights
  const insights = {
    dashboard: '\n\nConsider: Real-time data updates, user permissions, mobile responsiveness, and data export features.',
    website: '\n\nConsider: SEO optimization, performance monitoring, analytics integration, and accessibility standards.',
    mobile: '\n\nConsider: Platform-specific guidelines, offline functionality, push notifications, and app store optimization.',
    automation: '\n\nConsider: Error handling, monitoring, scalability, and documentation for maintenance.',
    learning: '\n\nConsider: Hands-on projects, community engagement, progress tracking, and practical applications.'
  };
  
  if (insights[projectType]) {
    enhanced += insights[projectType];
  }
  
  return enhanced;
}

function categorizeProject(projectType: string, text: string) {
  const lowerText = text.toLowerCase();
  
  // Default categorization by project type
  const projectMapping = {
    dashboard: { area: 'Work', project: 'Analytics & Reporting' },
    website: { area: 'Work', project: 'Web Development' },
    mobile: { area: 'Work', project: 'Mobile Development' },
    automation: { area: 'Work', project: 'Process Automation' },
    learning: { area: 'Learning', project: 'Skill Development' },
    business: { area: 'Work', project: 'Business Development' },
    health: { area: 'Health', project: 'Health & Wellness' },
    creative: { area: 'Creative', project: 'Creative Projects' },
    productivity: { area: 'Personal', project: 'Productivity Systems' },
    research: { area: 'Learning', project: 'Research Projects' },
    technical: { area: 'Work', project: 'Technical Development' }
  };
  
  // Override with explicit mentions
  if (lowerText.includes('personal') || lowerText.includes('side project')) {
    return { area: 'Personal', project: projectMapping[projectType]?.project || 'Personal Projects' };
  }
  
  if (lowerText.includes('work') || lowerText.includes('client') || lowerText.includes('business')) {
    return { area: 'Work', project: projectMapping[projectType]?.project || 'Work Projects' };
  }
  
  return projectMapping[projectType] || { area: 'Personal', project: 'General Projects' };
}

// Enhanced Note Intelligence System
async function analyzeNoteContent(text: string) {
  const lowerText = text.toLowerCase();
  
  // Detect note patterns and content types
  const contentPatterns = {
    insight: /insight|realization|discovery|learning|aha|understanding/,
    idea: /idea|concept|thought|brainstorm|innovation|creative/,
    meeting: /meeting|discussion|call|standup|retrospective|planning/,
    research: /research|analysis|study|investigation|findings|data/,
    reflection: /reflection|thoughts|feelings|experience|journey/,
    goal: /goal|objective|target|aim|plan|strategy|roadmap/,
    quote: /quote|wisdom|advice|lesson|principle|philosophy/,
    reference: /reference|bookmark|link|resource|documentation|guide/,
    decision: /decision|choice|option|pros|cons|evaluation/,
    feedback: /feedback|review|assessment|criticism|suggestions/
  };
  
  // Identify content type
  let contentType = 'general';
  let confidence = 0;
  
  for (const [type, pattern] of Object.entries(contentPatterns)) {
    const matches = text.match(pattern);
    if (matches && matches.length > confidence) {
      contentType = type;
      confidence = matches.length;
    }
  }
  
  // Extract key concepts and topics
  const topics = extractNoteTopics(text);
  
  // Analyze context and purpose
  const context = analyzeNoteContext(text);
  
  // Determine importance and urgency
  const priority = assessNotePriority(text);
  
  return {
    originalText: text,
    contentType,
    topics,
    context,
    priority,
    confidence
  };
}

async function generateNoteRecommendations(analysis: any) {
  const { originalText, contentType, topics, context, priority } = analysis;
  
  // Generate intelligent title
  const title = generateNoteTitle(originalText, contentType, topics);
  
  // Enhance content with metadata and insights
  const enhancedContent = enhanceNoteContent(originalText, contentType, topics);
  
  // Categorize note appropriately
  const { project, area, subAreas } = categorizeNote(contentType, context, topics, originalText);
  
  return {
    title,
    content: enhancedContent,
    project,
    area,
    subAreas,
  };
}

function extractNoteTopics(text: string) {
  const lowerText = text.toLowerCase();
  const topicCategories = {
    technology: ['ai', 'machine learning', 'blockchain', 'cloud', 'api', 'database', 'frontend', 'backend', 'mobile', 'security'],
    business: ['strategy', 'marketing', 'sales', 'product', 'customer', 'revenue', 'growth', 'partnership', 'competition'],
    design: ['ux', 'ui', 'user experience', 'interface', 'wireframe', 'prototype', 'usability', 'accessibility'],
    finance: ['investment', 'savings', 'budget', 'expense', 'income', 'tax', 'retirement', 'portfolio'],
    health: ['exercise', 'nutrition', 'mental health', 'sleep', 'stress', 'meditation', 'wellness'],
    productivity: ['time management', 'workflow', 'automation', 'efficiency', 'focus', 'planning', 'organization'],
    learning: ['skill', 'course', 'tutorial', 'book', 'certification', 'training', 'education', 'knowledge']
  };
  
  const foundTopics: string[] = [];
  
  Object.entries(topicCategories).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundTopics.push(keyword);
      }
    });
  });
  
  return foundTopics;
}

function analyzeNoteContext(text: string) {
  const lowerText = text.toLowerCase();
  
  // Determine context
  if (lowerText.includes('meeting') || lowerText.includes('call') || lowerText.includes('discussion')) {
    return 'meeting';
  } else if (lowerText.includes('book') || lowerText.includes('article') || lowerText.includes('video')) {
    return 'learning';
  } else if (lowerText.includes('project') || lowerText.includes('work') || lowerText.includes('task')) {
    return 'project';
  } else if (lowerText.includes('personal') || lowerText.includes('life') || lowerText.includes('reflection')) {
    return 'personal';
  } else if (lowerText.includes('idea') || lowerText.includes('brainstorm') || lowerText.includes('creative')) {
    return 'ideation';
  }
  
  return 'general';
}

function assessNotePriority(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('important') || lowerText.includes('critical') || lowerText.includes('remember')) {
    return 'high';
  } else if (lowerText.includes('interesting') || lowerText.includes('useful') || lowerText.includes('consider')) {
    return 'medium';
  }
  
  return 'low';
}

function generateNoteTitle(text: string, contentType: string, topics: string[]) {
  const lines = text.split('\n').filter(l => l.trim());
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  let baseTitle = lines[0]?.trim() || sentences[0]?.trim() || 'Untitled Note';
  
  // Enhance title based on content type
  const typeEnhancements = {
    insight: '💡 Insight:',
    idea: '🧠 Idea:',
    meeting: '🤝 Meeting:',
    research: '🔍 Research:',
    reflection: '🤔 Reflection:',
    goal: '🎯 Goal:',
    quote: '💬 Quote:',
    reference: '📚 Reference:',
    decision: '⚖️ Decision:',
    feedback: '📝 Feedback:'
  };
  
  // Add appropriate emoji and context
  if (typeEnhancements[contentType] && !baseTitle.includes(':')) {
    baseTitle = `${typeEnhancements[contentType]} ${baseTitle}`;
  }
  
  // Add topic context if relevant
  if (topics.length > 0 && topics.length <= 2) {
    const topicContext = topics.join(', ');
    if (!baseTitle.toLowerCase().includes(topicContext.toLowerCase())) {
      baseTitle += ` (${topicContext})`;
    }
  }
  
  return baseTitle.length > 80 ? baseTitle.substring(0, 77) + '...' : baseTitle;
}

function enhanceNoteContent(originalText: string, contentType: string, topics: string[]) {
  let enhanced = originalText;
  
  // Add metadata footer
  const metadata = [];
  if (contentType !== 'general') {
    metadata.push(`Content Type: ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`);
  }
  if (topics.length > 0) {
    metadata.push(`Topics: ${topics.join(', ')}`);
  }
  metadata.push(`Created: ${new Date().toLocaleDateString()}`);
  
  if (metadata.length > 0) {
    enhanced += '\n\n---\n' + metadata.join(' | ');
  }
  
  // Add contextual suggestions
  const suggestions = {
    insight: '\n\n💭 Consider: How can this insight be applied? What actions should follow?',
    idea: '\n\n🚀 Next Steps: Validate this idea, research feasibility, or start prototyping.',
    research: '\n\n📊 Follow-up: Organize findings, identify gaps, plan next research phase.',
    goal: '\n\n📋 Action Items: Break down into specific tasks and set deadlines.',
    meeting: '\n\n✅ Action Items: Extract key decisions and follow-up tasks.'
  };
  
  if (suggestions[contentType]) {
    enhanced += suggestions[contentType];
  }
  
  return enhanced;
}

function categorizeNote(contentType: string, context: string, topics: string[], text: string) {
  const lowerText = text.toLowerCase();
  
  // Default categorization
  let area = 'Personal';
  let project = 'General Notes';
  let subAreas = [contentType.charAt(0).toUpperCase() + contentType.slice(1)];
  
  // Technology-focused notes
  if (topics.some(t => ['ai', 'machine learning', 'blockchain', 'api', 'database', 'frontend', 'backend'].includes(t))) {
    area = 'Work';
    project = 'Tech Learning';
    subAreas = ['Technology', 'Development'];
  }
  // Business-focused notes
  else if (topics.some(t => ['strategy', 'marketing', 'sales', 'product', 'customer'].includes(t))) {
    area = 'Work';
    project = 'Business Strategy';
    subAreas = ['Business', 'Strategy'];
  }
  // Learning-focused notes
  else if (context === 'learning' || topics.some(t => ['course', 'tutorial', 'book', 'skill'].includes(t))) {
    area = 'Learning';
    project = 'Knowledge Base';
    subAreas = ['Learning', 'Resources'];
  }
  // Health-focused notes
  else if (topics.some(t => ['exercise', 'nutrition', 'health', 'wellness'].includes(t))) {
    area = 'Health';
    project = 'Health & Wellness';
    subAreas = ['Health', 'Wellness'];
  }
  // Work context
  else if (context === 'meeting' || context === 'project' || lowerText.includes('work')) {
    area = 'Work';
    project = 'Work Notes';
    if (context === 'meeting') subAreas = ['Meetings'];
    else if (context === 'project') subAreas = ['Projects'];
  }
  
  // Add content-specific sub-areas
  if (contentType === 'idea' && !subAreas.includes('Ideas')) {
    subAreas.push('Ideas');
  } else if (contentType === 'goal' && !subAreas.includes('Goals')) {
    subAreas.push('Goals');
  } else if (contentType === 'reference' && !subAreas.includes('References')) {
    subAreas.push('References');
  }
  
  return {
    area,
    project,
    subAreas: subAreas.slice(0, 3) // Limit to 3 sub-areas
  };
}