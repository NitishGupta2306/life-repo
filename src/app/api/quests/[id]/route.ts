import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';

// GET /api/quests/[id] - Get specific quest
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Mock quest lookup - in real app would query database
  const mockQuest = {
    id,
    title: 'Complete morning routine',
    description: 'Start your day with intention: wake up, hydrate, exercise, and plan your day',
    questType: 'daily',
    status: 'in_progress',
    xpReward: 50,
    energyCost: 5,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    objectives: [
      { id: 'obj-1', description: 'Drink a glass of water', completed: true },
      { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: false },
      { id: 'obj-3', description: 'Plan top 3 priorities', completed: false },
    ],
  };

  return ApiResponseHelper.success(mockQuest);
});

// PUT /api/quests/[id] - Update quest
const updateQuestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body = await request.json();
  
  const validation = updateQuestSchema.safeParse(body);
  if (!validation.success) {
    return ApiResponseHelper.validationError(validation.error.message);
  }

  const updates = validation.data;

  // Mock quest update - in real app would update database
  const updatedQuest = {
    id,
    title: updates.title || 'Complete morning routine',
    description: updates.description || 'Start your day with intention',
    questType: 'daily',
    status: updates.status || 'in_progress',
    xpReward: 50,
    energyCost: 5,
    createdAt: new Date(),
    dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
    objectives: [
      { id: 'obj-1', description: 'Drink a glass of water', completed: true },
      { id: 'obj-2', description: 'Do 10 minutes of exercise', completed: false },
      { id: 'obj-3', description: 'Plan top 3 priorities', completed: false },
    ],
  };

  return ApiResponseHelper.success(updatedQuest, 'Quest updated successfully');
});

// DELETE /api/quests/[id] - Delete quest
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Mock quest deletion - in real app would delete from database
  console.log('Deleting quest:', id);

  return ApiResponseHelper.success({ deletedId: id }, 'Quest deleted successfully');
});