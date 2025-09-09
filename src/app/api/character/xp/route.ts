import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { CharacterService } from '@/lib/character-service';

// POST /api/character/xp - Add XP to character
const addXpSchema = z.object({
  characterId: z.string(),
  xpAmount: z.number().positive(),
  source: z.string().optional(),
  description: z.string().optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  
  const validation = addXpSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const { characterId, xpAmount, source, description } = validation.data;

  try {
    const result = await CharacterService.addXP(characterId, xpAmount);
    
    const response = {
      characterId,
      xpAdded: xpAmount,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp,
      source,
      description,
      timestamp: new Date().toISOString(),
    };

    if (result.leveledUp) {
      return ApiResponseHelper.success(
        response, 
        `Congratulations! You've reached level ${result.newLevel}!`
      );
    }

    return ApiResponseHelper.success(response, `Added ${xpAmount} XP`);
  } catch (error) {
    console.error('Failed to add XP:', error);
    return ApiResponseHelper.serverError('Failed to add XP');
  }
});