import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';

// GET /api/character/resources - Get character resources
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('characterId');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  // Mock resources data - in real app would query database
  const mockResources = [
    {
      id: 'res-1',
      resourceType: 'energy',
      currentValue: 75,
      maxValue: 100,
      regenRate: 5,
      lastUpdated: new Date(),
      modifiers: {},
    },
    {
      id: 'res-2',
      resourceType: 'focus',
      currentValue: 60,
      maxValue: 100,
      regenRate: 3,
      lastUpdated: new Date(),
      modifiers: {},
    },
    {
      id: 'res-3',
      resourceType: 'motivation',
      currentValue: 85,
      maxValue: 100,
      regenRate: 2,
      lastUpdated: new Date(),
      modifiers: {},
    },
    {
      id: 'res-4',
      resourceType: 'spoons',
      currentValue: 4,
      maxValue: 8,
      regenRate: 1,
      lastUpdated: new Date(),
      modifiers: {},
    },
  ];

  return ApiResponseHelper.success(mockResources);
});

// PUT /api/character/resources - Update character resource
const updateResourceSchema = z.object({
  characterId: z.string(),
  resourceType: z.enum(['energy', 'focus', 'motivation', 'spoons']),
  change: z.number(),
  reason: z.string().optional(),
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = updateResourceSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, resourceType, change, reason } = validation.data;

  try {
    const updatedResource = await CharacterService.updateResource(
      characterId, 
      resourceType, 
      change
    );

    const response = {
      ...updatedResource,
      changeAmount: change,
      reason,
      previousValue: updatedResource.currentValue - change,
    };

    return ApiResponseHelper.success(
      response, 
      `${resourceType} ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}`
    );
  } catch (error) {
    console.error('Failed to update resource:', error);
    return ApiResponseHelper.serverError('Failed to update resource');
  }
});

// POST /api/character/resources/regenerate - Regenerate all resources
const regenerateSchema = z.object({
  characterId: z.string(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = regenerateSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId } = validation.data;

  try {
    const regeneratedResources = await CharacterService.regenerateResources(characterId);

    return ApiResponseHelper.success(
      regeneratedResources, 
      'Resources regenerated successfully'
    );
  } catch (error) {
    console.error('Failed to regenerate resources:', error);
    return ApiResponseHelper.serverError('Failed to regenerate resources');
  }
});