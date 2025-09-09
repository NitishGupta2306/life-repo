import { db } from '../db';
import { tasks, projects } from '../../../database/simple-schema';
import { eq, desc, and } from 'drizzle-orm';

// Get all tasks with their projects
export async function getAllTasks() {
  try {
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        checklist: tasks.checklist,
        priority: tasks.priority,
        difficulty: tasks.difficulty,
        dueDate: tasks.dueDate,
        status: tasks.status,
        area: tasks.area,
        createdAt: tasks.createdAt,
        completedAt: tasks.completedAt,
        projectId: tasks.projectId,
        projectName: projects.name,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .orderBy(desc(tasks.createdAt));

    // Parse checklist JSON
    return allTasks.map(task => ({
      ...task,
      checklist: task.checklist ? JSON.parse(task.checklist) : [],
    }));
  } catch (error) {
    console.error('Failed to get all tasks:', error);
    throw error;
  }
}

// Update task status
export async function updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    const updateData: any = { status };
    
    // Set completedAt when marking as completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'todo' || status === 'in_progress') {
      updateData.completedAt = null;
    }

    const updatedTask = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask[0];
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw error;
  }
}

// Update task details
export async function updateTask(taskId: string, updates: {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  difficulty?: 'easy' | 'medium' | 'hard';
  dueDate?: Date | string | null;
  checklist?: string[];
  projectId?: string;
  area?: string;
}) {
  try {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? 
        (typeof updates.dueDate === 'string' ? new Date(updates.dueDate) : updates.dueDate) : 
        null;
    }
    if (updates.checklist !== undefined) updateData.checklist = JSON.stringify(updates.checklist);
    if (updates.projectId !== undefined) updateData.projectId = updates.projectId;
    if (updates.area !== undefined) updateData.area = updates.area;

    const updatedTask = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask[0];
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
}

// Delete task
export async function deleteTask(taskId: string) {
  try {
    await db
      .delete(tasks)
      .where(eq(tasks.id, taskId));

    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
}

// Update checklist item
export async function updateChecklistItem(taskId: string, itemIndex: number, completed: boolean) {
  try {
    // First get the current task
    const currentTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!currentTask[0]) {
      throw new Error('Task not found');
    }

    const checklist = currentTask[0].checklist ? JSON.parse(currentTask[0].checklist) : [];
    
    // Update the specific checklist item
    if (checklist[itemIndex]) {
      if (typeof checklist[itemIndex] === 'string') {
        // Convert to object format if it's still a string
        checklist[itemIndex] = {
          text: checklist[itemIndex],
          completed: completed
        };
      } else {
        checklist[itemIndex].completed = completed;
      }
    }

    // Save back to database
    const updatedTask = await db
      .update(tasks)
      .set({ checklist: JSON.stringify(checklist) })
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask[0];
  } catch (error) {
    console.error('Failed to update checklist item:', error);
    throw error;
  }
}