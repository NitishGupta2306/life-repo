import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// Mock brain dump data
const mockBrainDumps = [
  {
    id: 'dump-1',
    content: 'I need to organize my workspace better, it\'s getting cluttered and affecting my focus',
    mood: 'frustrated',
    energyLevel: 6,
    urgencyLevel: 7,
    tags: ['workspace', 'organization', 'focus'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    processedAt: new Date(Date.now() - 60 * 60 * 1000),
    aiAnalysis: {
      sentiment: 'concerned',
      categories: ['productivity', 'environment'],
      actionItems: [
        'Clear desk surface',
        'Organize filing system',
        'Create designated spaces for items'
      ],
      suggestedQuests: [
        {
          title: 'Declutter workspace',
          type: 'productivity',
          estimatedTime: 30,
          xpReward: 75,
        }
      ],
    },
  },
  {
    id: 'dump-2',
    content: 'Feeling overwhelmed with all the tasks I have to do. Need to prioritize better.',
    mood: 'overwhelmed',
    energyLevel: 4,
    urgencyLevel: 8,
    tags: ['stress', 'planning', 'priorities'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    aiAnalysis: {
      sentiment: 'stressed',
      categories: ['planning', 'mental_health'],
      actionItems: [
        'List all current tasks',
        'Use eisenhower matrix for prioritization',
        'Schedule breaks between tasks'
      ],
      suggestedQuests: [
        {
          title: 'Create priority task matrix',
          type: 'planning',
          estimatedTime: 20,
          xpReward: 50,
        },
        {
          title: 'Take a mindful break',
          type: 'self_care',
          estimatedTime: 10,
          xpReward: 25,
        }
      ],
    },
  },
];

// GET /api/brain-dump - Get brain dumps for a character
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  const limit = searchParams.get('limit');
  const processed = searchParams.get('processed');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  let filteredDumps = mockBrainDumps;

  // Filter by processed status
  if (processed !== null) {
    const isProcessed = processed === 'true';
    filteredDumps = filteredDumps.filter(dump => 
      isProcessed ? dump.processedAt : !dump.processedAt
    );
  }

  // Apply limit
  if (limit && !isNaN(parseInt(limit))) {
    filteredDumps = filteredDumps.slice(0, parseInt(limit));
  }

  const response = {
    dumps: filteredDumps,
    total: filteredDumps.length,
    stats: {
      totalDumps: mockBrainDumps.length,
      processedDumps: mockBrainDumps.filter(d => d.processedAt).length,
      averageEnergyLevel: mockBrainDumps.reduce((acc, d) => acc + d.energyLevel, 0) / mockBrainDumps.length,
      averageUrgencyLevel: mockBrainDumps.reduce((acc, d) => acc + d.urgencyLevel, 0) / mockBrainDumps.length,
    },
  };

  return ApiResponseHelper.success(response);
});

// POST /api/brain-dump - Create new brain dump
const createBrainDumpSchema = z.object({
  characterId: z.string(),
  content: z.string().min(10).max(5000),
  mood: z.enum(['excited', 'happy', 'neutral', 'frustrated', 'overwhelmed', 'anxious', 'sad']).optional(),
  energyLevel: z.number().min(1).max(10).default(5),
  urgencyLevel: z.number().min(1).max(10).default(5),
  tags: z.array(z.string()).default([]),
  processImmediately: z.boolean().default(false),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = createBrainDumpSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const dumpData = validation.data;

  // Create new brain dump
  const newDump = {
    id: `dump_${Date.now()}`,
    ...dumpData,
    createdAt: new Date(),
    processedAt: null,
    aiAnalysis: null,
  };

  // If immediate processing is requested, simulate AI analysis
  if (dumpData.processImmediately) {
    newDump.processedAt = new Date();
    newDump.aiAnalysis = {
      sentiment: dumpData.mood || 'neutral',
      categories: ['general'],
      actionItems: [
        'Break down the situation into smaller steps',
        'Identify the most important action to take',
        'Set a specific time to address this'
      ],
      suggestedQuests: [
        {
          title: 'Address brain dump concern',
          type: 'general',
          estimatedTime: 30,
          xpReward: 50,
        }
      ],
    };
  }

  // Mock save - in real app would save to database and potentially trigger AI processing
  console.log('Creating brain dump:', newDump);

  return ApiResponseHelper.created(newDump, 'Brain dump saved successfully');
});