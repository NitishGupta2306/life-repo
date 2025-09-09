import { db } from '../db';
import { notes, projects } from '../../../database/simple-schema';
import { eq, desc } from 'drizzle-orm';

// Get all notes with their projects
export async function getAllNotes() {
  try {
    const allNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        area: notes.area,
        subAreas: notes.subAreas,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        projectId: notes.projectId,
        projectName: projects.name,
      })
      .from(notes)
      .leftJoin(projects, eq(notes.projectId, projects.id))
      .orderBy(desc(notes.updatedAt));

    // Parse subAreas JSON
    return allNotes.map(note => ({
      ...note,
      subAreas: note.subAreas ? JSON.parse(note.subAreas) : [],
    }));
  } catch (error) {
    console.error('Failed to get all notes:', error);
    throw error;
  }
}

// Update note
export async function updateNote(noteId: string, updates: {
  title?: string;
  content?: string;
  subAreas?: string[];
  projectId?: string;
  area?: string;
}) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.subAreas !== undefined) updateData.subAreas = JSON.stringify(updates.subAreas);
    if (updates.projectId !== undefined) updateData.projectId = updates.projectId;
    if (updates.area !== undefined) updateData.area = updates.area;

    const updatedNote = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, noteId))
      .returning();

    return updatedNote[0];
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
}

// Delete note
export async function deleteNote(noteId: string) {
  try {
    await db
      .delete(notes)
      .where(eq(notes.id, noteId));

    return { success: true };
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
}