import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks } from '@/lib/services/task-manager';

export async function GET(request: NextRequest) {
  try {
    const tasks = await getAllTasks();
    
    return NextResponse.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}