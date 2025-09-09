import { db } from '../db';
import { projects, tasks, notes, ideaDumps } from '../../../database/simple-schema';
import type { NewProject, NewTask, NewNote, NewIdeaDump } from '../../../database/simple-schema';
import { eq } from 'drizzle-orm';

// Find or create a project based on area and project name
async function findOrCreateProject(projectName: string, area: string): Promise<string> {
  // First, try to find existing project
  const existingProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.name, projectName))
    .limit(1);

  if (existingProjects.length > 0) {
    return existingProjects[0].id;
  }

  // Create new project if it doesn't exist
  const newProject: NewProject = {
    name: projectName,
    area: area,
    description: `Auto-created project for ${area} related items`,
  };

  const createdProjects = await db
    .insert(projects)
    .values(newProject)
    .returning({ id: projects.id });

  return createdProjects[0].id;
}

// Save a processed task to the database
export async function saveProcessedTask(
  originalText: string,
  processedTask: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    difficulty: 'easy' | 'medium' | 'hard';
    project: string;
    area: string;
    dueDate?: string | null;
    checklist?: string[];
  }
) {
  try {
    // First, save the idea dump record
    const ideaDumpRecord: NewIdeaDump = {
      rawContent: originalText,
      processedContent: JSON.stringify(processedTask),
      processingStatus: 'completed',
      resultType: 'task',
      processedAt: new Date(),
    };

    const createdIdeaDump = await db
      .insert(ideaDumps)
      .values(ideaDumpRecord)
      .returning({ id: ideaDumps.id });

    // Find or create the project
    const projectId = await findOrCreateProject(processedTask.project, processedTask.area);

    // Create the task
    const newTask: NewTask = {
      projectId: projectId,
      title: processedTask.title,
      description: processedTask.description,
      checklist: processedTask.checklist ? JSON.stringify(processedTask.checklist) : null,
      priority: processedTask.priority,
      difficulty: processedTask.difficulty,
      dueDate: processedTask.dueDate ? new Date(processedTask.dueDate) : null,
      area: processedTask.area,
      status: 'todo',
    };

    const createdTask = await db
      .insert(tasks)
      .values(newTask)
      .returning();

    // Update idea dump with result ID
    await db
      .update(ideaDumps)
      .set({ resultId: createdTask[0].id })
      .where(eq(ideaDumps.id, createdIdeaDump[0].id));

    return {
      success: true,
      taskId: createdTask[0].id,
      projectId: projectId,
      ideaDumpId: createdIdeaDump[0].id,
    };
  } catch (error) {
    console.error('Failed to save processed task:', error);
    throw error;
  }
}

// Save a processed note to the database
export async function saveProcessedNote(
  originalText: string,
  processedNote: {
    title: string;
    content: string;
    project: string;
    area: string;
    subAreas?: string[];
  }
) {
  try {
    // First, save the idea dump record
    const ideaDumpRecord: NewIdeaDump = {
      rawContent: originalText,
      processedContent: JSON.stringify(processedNote),
      processingStatus: 'completed',
      resultType: 'note',
      processedAt: new Date(),
    };

    const createdIdeaDump = await db
      .insert(ideaDumps)
      .values(ideaDumpRecord)
      .returning({ id: ideaDumps.id });

    // Find or create the project
    const projectId = await findOrCreateProject(processedNote.project, processedNote.area);

    // Create the note
    const newNote: NewNote = {
      projectId: projectId,
      title: processedNote.title,
      content: processedNote.content,
      area: processedNote.area,
      subAreas: processedNote.subAreas ? JSON.stringify(processedNote.subAreas) : null,
    };

    const createdNote = await db
      .insert(notes)
      .values(newNote)
      .returning();

    // Update idea dump with result ID
    await db
      .update(ideaDumps)
      .set({ resultId: createdNote[0].id })
      .where(eq(ideaDumps.id, createdIdeaDump[0].id));

    return {
      success: true,
      noteId: createdNote[0].id,
      projectId: projectId,
      ideaDumpId: createdIdeaDump[0].id,
    };
  } catch (error) {
    console.error('Failed to save processed note:', error);
    throw error;
  }
}

// Get recent processed items for display
export async function getRecentIdeaDumps(limit: number = 5) {
  try {
    const recentDumps = await db
      .select({
        id: ideaDumps.id,
        rawContent: ideaDumps.rawContent,
        processedContent: ideaDumps.processedContent,
        resultType: ideaDumps.resultType,
        createdAt: ideaDumps.createdAt,
        processedAt: ideaDumps.processedAt,
      })
      .from(ideaDumps)
      .where(eq(ideaDumps.processingStatus, 'completed'))
      .orderBy(ideaDumps.createdAt)
      .limit(limit);

    // Parse processed content and format for display
    const formattedResults = recentDumps.map(dump => {
      const processedData = dump.processedContent ? JSON.parse(dump.processedContent) : null;
      
      return {
        id: dump.id,
        text: dump.rawContent,
        type: dump.resultType as 'task' | 'note',
        result: dump.resultType === 'task' 
          ? `Task created: "${processedData?.title || 'Untitled'}"` 
          : `Note created: "${processedData?.title || 'Untitled'}"`,
        status: 'completed',
        timestamp: formatTimestamp(dump.processedAt || dump.createdAt),
        details: processedData,
      };
    });

    return formattedResults.reverse(); // Most recent first
  } catch (error) {
    console.error('Failed to get recent idea dumps:', error);
    throw error;
  }
}

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}