"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  X, 
  Edit, 
  Trash2, 
  Calendar,
  Target,
  Gauge,
  Home,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description?: string;
  checklist: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'easy' | 'medium' | 'hard';
  dueDate?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  area: string;
  createdAt: string;
  completedAt?: string;
  projectId: string;
  projectName: string;
}

interface Project {
  id: string;
  name: string;
  area: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load tasks
  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  // Update task status
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await loadTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Update task details
  const updateTask = async (taskId: string, updates: any) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadTasks(); // Refresh tasks
        setIsEditDialogOpen(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and track all your tasks
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Notes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.replace('_', ' ')}
                <span className="ml-2 text-xs">
                  {filterOption === 'all' 
                    ? tasks.length 
                    : tasks.filter(t => t.status === filterOption).length
                  }
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === 'all' ? 'No tasks found.' : `No ${filter.replace('_', ' ')} tasks.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                    <div className="flex gap-1">
                      <Dialog 
                        open={isEditDialogOpen && editingTask?.id === task.id} 
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingTask(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Basic Info */}
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <Input
                                defaultValue={task.title}
                                onChange={(e) => {
                                  if (editingTask) {
                                    setEditingTask({ ...editingTask, title: e.target.value });
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <Textarea
                                className="min-h-[100px]"
                                defaultValue={task.description || ''}
                                onChange={(e) => {
                                  if (editingTask) {
                                    setEditingTask({ ...editingTask, description: e.target.value });
                                  }
                                }}
                              />
                            </div>

                            {/* Priority & Difficulty */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Select
                                  defaultValue={task.priority}
                                  onValueChange={(value) => {
                                    if (editingTask) {
                                      setEditingTask({ ...editingTask, priority: value as any });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Difficulty</label>
                                <Select
                                  defaultValue={task.difficulty}
                                  onValueChange={(value) => {
                                    if (editingTask) {
                                      setEditingTask({ ...editingTask, difficulty: value as any });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Project & Area */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Project</label>
                                <Select
                                  defaultValue={task.projectId}
                                  onValueChange={(value) => {
                                    if (editingTask) {
                                      const selectedProject = projects.find(p => p.id === value);
                                      setEditingTask({ 
                                        ...editingTask, 
                                        projectId: value,
                                        area: selectedProject?.area || editingTask.area
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {projects.map((project) => (
                                      <SelectItem key={project.id} value={project.id}>
                                        {project.name} ({project.area})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Area</label>
                                <Select
                                  value={editingTask?.area || task.area}
                                  onValueChange={(value) => {
                                    if (editingTask) {
                                      setEditingTask({ ...editingTask, area: value });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Work">Work</SelectItem>
                                    <SelectItem value="Health">Health</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="Learning">Learning</SelectItem>
                                    <SelectItem value="Creative">Creative</SelectItem>
                                    <SelectItem value="Travel">Travel</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Due Date */}
                            <div>
                              <label className="text-sm font-medium">Due Date</label>
                              <Input
                                type="date"
                                defaultValue={task.dueDate ? task.dueDate.split('T')[0] : ''}
                                onChange={(e) => {
                                  if (editingTask) {
                                    setEditingTask({ 
                                      ...editingTask, 
                                      dueDate: e.target.value ? e.target.value : undefined 
                                    });
                                  }
                                }}
                              />
                            </div>

                            {/* Checklist */}
                            <div>
                              <label className="text-sm font-medium">Checklist (one item per line)</label>
                              <Textarea
                                className="min-h-[120px]"
                                defaultValue={task.checklist.join('\n')}
                                onChange={(e) => {
                                  if (editingTask) {
                                    const checklist = e.target.value
                                      .split('\n')
                                      .map(item => item.trim())
                                      .filter(Boolean);
                                    setEditingTask({ ...editingTask, checklist });
                                  }
                                }}
                                placeholder="Enter checklist items, one per line"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => {
                                  if (editingTask) {
                                    updateTask(task.id, {
                                      title: editingTask.title,
                                      description: editingTask.description,
                                      priority: editingTask.priority,
                                      difficulty: editingTask.difficulty,
                                      projectId: editingTask.projectId,
                                      area: editingTask.area,
                                      dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : null,
                                      checklist: editingTask.checklist,
                                    });
                                  }
                                }}
                              >
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false);
                                  setEditingTask(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getPriorityColor(task.priority)}>
                      <Target className="h-3 w-3 mr-1" />
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">
                      <Gauge className="h-3 w-3 mr-1" />
                      {task.difficulty}
                    </Badge>
                    <Badge variant="secondary">
                      {task.projectName}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Checklist:</p>
                      {task.checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            id={`${task.id}-${index}`}
                            defaultChecked={false}
                          />
                          <label
                            htmlFor={`${task.id}-${index}`}
                            className="text-sm"
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className={`flex items-center gap-2 text-sm ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      {task.status.replace('_', ' ')}
                    </div>
                    
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'todo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'todo')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}