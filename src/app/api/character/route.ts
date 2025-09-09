import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';
import { characterProfileInsertSchema } from '../../../../database/schema';

// GET /api/character - Get character profile
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get('id');
  
  if (!characterId) {
    return ApiResponseHelper.validationError('Character ID is required');
  }

  // Mock character data - in real app would query database
  const mockCharacter = {
    id: characterId,
    characterName: 'Life Hero',
    characterLevel: 25,
    totalXp: 24500,
    characterClass: 'Life Explorer',
    avatarUrl: null,
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  return ApiResponseHelper.success(mockCharacter);
});

// POST /api/character - Create new character
const createCharacterSchema = z.object({
  characterName: z.string().min(1).max(50),
  characterClass: z.string().optional(),
  age: z.number().min(1).max(150).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = createCharacterSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterName, characterClass, age } = validation.data;

  try {
    const initializedCharacter = await CharacterService.initializeCharacter({
      characterName,
      characterClass,
      age,
    });

    return ApiResponseHelper.created(initializedCharacter, 'Character created successfully');
  } catch (error) {
    console.error('Character creation failed:', error);
    return ApiResponseHelper.serverError('Failed to create character');
  }
});

// PUT /api/character - Update character
const updateCharacterSchema = z.object({
  id: z.string(),
  characterName: z.string().min(1).max(50).optional(),
  characterClass: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = updateCharacterSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { id, ...updates } = validation.data;

  // Mock update - in real app would update database
  const updatedCharacter = {
    id,
    characterName: updates.characterName || 'Life Hero',
    characterLevel: 25,
    totalXp: 24500,
    characterClass: updates.characterClass || 'Life Explorer',
    avatarUrl: updates.avatarUrl || null,
    createdAt: new Date(),
    lastLogin: new Date(),
  };

  return ApiResponseHelper.success(updatedCharacter, 'Character updated successfully');
});