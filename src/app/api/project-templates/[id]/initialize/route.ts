import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectTemplates, projects, tasks } from '../../../../../../database/simple-schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { projectName, customDescription } = body;
    
    // Get the template
    const template = await db.select().from(projectTemplates).where(eq(projectTemplates.id, id)).limit(1);
    
    if (!template || template.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    const templateData = template[0];
    
    // Parse template data
    const taskTemplateData = templateData.taskTemplate ? JSON.parse(templateData.taskTemplate) : [];
    const checklistTemplateData = templateData.checklistTemplate ? JSON.parse(templateData.checklistTemplate) : [];
    
    // Create the project
    const newProject = await db.insert(projects).values({
      name: projectName || templateData.name,
      description: customDescription || templateData.description,
      area: templateData.area,
    }).returning();
    
    const createdProject = newProject[0];
    
    // Create initial tasks from template
    const tasksToCreate = taskTemplateData.map((taskTitle: string, index: number) => ({
      projectId: createdProject.id,
      title: taskTitle,
      description: `${taskTitle} - Part of ${templateData.name} project template`,
      checklist: JSON.stringify(checklistTemplateData),
      priority: templateData.difficulty === 'hard' ? 'high' : 'medium',
      difficulty: templateData.difficulty,
      area: templateData.area,
    }));
    
    let createdTasks = [];
    if (tasksToCreate.length > 0) {
      createdTasks = await db.insert(tasks).values(tasksToCreate).returning();
    }
    
    // Update template popularity score
    await db.update(projectTemplates)
      .set({ 
        popularityScore: templateData.popularityScore + 1,
        updatedAt: new Date()
      })
      .where(eq(projectTemplates.id, id));
    
    return NextResponse.json({
      success: true,
      project: {
        ...createdProject,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      },
      message: `Project "${createdProject.name}" created successfully with ${createdTasks.length} initial tasks!`
    });
    
  } catch (error) {
    console.error('Error initializing project from template:', error);
    return NextResponse.json(
      { error: 'Failed to initialize project from template' },
      { status: 500 }
    );
  }
}