"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Edit, 
  Trash2, 
  Home,
  CheckSquare,
  FileText,
  Calendar,
  Tag
} from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  area: string;
  subAreas: string[];
  createdAt: string;
  updatedAt: string;
  projectId: string;
  projectName: string;
}

interface Project {
  id: string;
  name: string;
  area: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get unique areas for filtering
  const uniqueAreas = Array.from(new Set(notes.map(note => note.area)));

  // Load notes
  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
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
    loadNotes();
    loadProjects();
  }, []);

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadNotes(); // Refresh notes
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Update note
  const updateNote = async (noteId: string, updates: any) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadNotes(); // Refresh notes
        setIsEditDialogOpen(false);
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    return note.area === filter;
  });

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Notes</h1>
              <p className="text-muted-foreground">
                Browse and manage all your notes and ideas
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
              <span className="ml-2 text-xs">{notes.length}</span>
            </Button>
            {uniqueAreas.map((area) => (
              <Button
                key={area}
                variant={filter === area ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(area)}
              >
                {area}
                <span className="ml-2 text-xs">
                  {notes.filter(n => n.area === area).length}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === 'all' ? 'No notes found.' : `No notes in ${filter} area.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
                    <div className="flex gap-1">
                      <Dialog 
                        open={isEditDialogOpen && editingNote?.id === note.id} 
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingNote(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Note</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Title */}
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <Input
                                defaultValue={note.title}
                                onChange={(e) => {
                                  if (editingNote) {
                                    setEditingNote({ ...editingNote, title: e.target.value });
                                  }
                                }}
                              />
                            </div>

                            {/* Content */}
                            <div>
                              <label className="text-sm font-medium">Content</label>
                              <Textarea
                                className="min-h-[300px]"
                                defaultValue={note.content}
                                onChange={(e) => {
                                  if (editingNote) {
                                    setEditingNote({ ...editingNote, content: e.target.value });
                                  }
                                }}
                              />
                            </div>

                            {/* Project & Area */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Project</label>
                                <Select
                                  defaultValue={note.projectId}
                                  onValueChange={(value) => {
                                    if (editingNote) {
                                      const selectedProject = projects.find(p => p.id === value);
                                      setEditingNote({ 
                                        ...editingNote, 
                                        projectId: value,
                                        area: selectedProject?.area || editingNote.area
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
                                  value={editingNote?.area || note.area}
                                  onValueChange={(value) => {
                                    if (editingNote) {
                                      setEditingNote({ ...editingNote, area: value });
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

                            {/* Sub Areas */}
                            <div>
                              <label className="text-sm font-medium">Sub Areas (comma separated)</label>
                              <Input
                                defaultValue={note.subAreas.join(', ')}
                                onChange={(e) => {
                                  if (editingNote) {
                                    const subAreas = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    setEditingNote({ ...editingNote, subAreas });
                                  }
                                }}
                                placeholder="e.g. Ideas, Research, Planning, Goals"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Use sub-areas to further categorize your notes (e.g., "Goals", "Ideas", "Research")
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => {
                                  if (editingNote) {
                                    updateNote(note.id, {
                                      title: editingNote.title,
                                      content: editingNote.content,
                                      subAreas: editingNote.subAreas,
                                      projectId: editingNote.projectId,
                                      area: editingNote.area,
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
                                  setEditingNote(null);
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
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      <FileText className="h-3 w-3 mr-1" />
                      {note.area}
                    </Badge>
                    <Badge variant="outline">
                      {note.projectName}
                    </Badge>
                    {note.subAreas.map((subArea) => (
                      <Badge key={subArea} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {subArea}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {truncateContent(note.content)}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    {note.updatedAt !== note.createdAt && (
                      <div className="flex items-center gap-2">
                        <Edit className="h-3 w-3" />
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    )}
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