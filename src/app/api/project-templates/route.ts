import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectTemplates } from '../../../../database/simple-schema';
import { desc, eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const area = searchParams.get('area');
    const difficulty = searchParams.get('difficulty');
    
    let query = db.select().from(projectTemplates).where(eq(projectTemplates.isActive, true));
    
    // Add filters if provided
    const conditions = [];
    if (category) conditions.push(eq(projectTemplates.category, category as any));
    if (area) conditions.push(eq(projectTemplates.area, area));
    if (difficulty) conditions.push(eq(projectTemplates.difficulty, difficulty as any));
    
    if (conditions.length > 0) {
      query = db.select().from(projectTemplates).where(and(eq(projectTemplates.isActive, true), ...conditions));
    }
    
    const templates = await query.orderBy(desc(projectTemplates.popularityScore));
    
    // Parse JSON fields for client
    const templatesWithParsedData = templates.map(template => ({
      ...template,
      technologies: template.technologies ? JSON.parse(template.technologies) : [],
      taskTemplate: template.taskTemplate ? JSON.parse(template.taskTemplate) : [],
      checklistTemplate: template.checklistTemplate ? JSON.parse(template.checklistTemplate) : [],
      prerequisites: template.prerequisites ? JSON.parse(template.prerequisites) : [],
      learningObjectives: template.learningObjectives ? JSON.parse(template.learningObjectives) : [],
    }));
    
    return NextResponse.json({
      success: true,
      templates: templatesWithParsedData
    });
  } catch (error) {
    console.error('Error fetching project templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project templates' },
      { status: 500 }
    );
  }
}