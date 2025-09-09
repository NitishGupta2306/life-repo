import { NextRequest, NextResponse } from 'next/server';
import { updateTask, updateTaskStatus, deleteTask } from '@/lib/services/task-manager';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Handle status updates
    if (body.status) {
      const updatedTask = await updateTaskStatus(id, body.status);
      return NextResponse.json({
        success: true,
        task: updatedTask
      });
    }
    
    // Handle other field updates
    const updatedTask = await updateTask(id, body);
    
    return NextResponse.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTask(id);
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' }, 
      { status: 500 }
    );
  }
}