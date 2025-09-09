"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Code2, 
  CheckSquare, 
  BookOpen, 
  Play,
  Sparkles,
  Home,
  Zap
} from "lucide-react";
import Link from "next/link";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  area: string;
  technologies: string[];
  estimatedDuration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  taskTemplate: string[];
  checklistTemplate: string[];
  prerequisites: string[];
  learningObjectives: string[];
  popularityScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectTemplatesPage() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializeDialogOpen, setInitializeDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  // Category icons mapping
  const categoryIcons = {
    dashboard: "📊",
    website: "🌐", 
    mobile: "📱",
    automation: "⚡",
    learning: "📚",
    business: "💼",
    creative: "🎨",
    research: "🔬"
  };

  // Difficulty colors
  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    hard: "bg-red-100 text-red-800 border-red-200"
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/project-templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        setFilteredTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.technologies.some(tech => 
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory, selectedDifficulty]);

  // Initialize project from template
  const initializeProject = async () => {
    if (!selectedTemplate) return;
    
    setIsInitializing(true);
    
    try {
      const response = await fetch(`/api/project-templates/${selectedTemplate.id}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectName || selectedTemplate.name,
          customDescription: customDescription || selectedTemplate.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInitializeDialogOpen(false);
        setProjectName("");
        setCustomDescription("");
        setSelectedTemplate(null);
        // Redirect to tasks page to see the new project
        window.location.href = '/tasks';
      } else {
        console.error('Failed to initialize project:', data.error);
      }
    } catch (error) {
      console.error('Failed to initialize project:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const openInitializeDialog = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectName(template.name);
    setCustomDescription(template.description);
    setInitializeDialogOpen(true);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">🚀 Project Templates</h1>
              <p className="text-muted-foreground">
                Kickstart your next project with professionally designed templates and proven tech stacks
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates, technologies, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{filteredTemplates.length} templates available</span>
            <span>•</span>
            <span>{categories.length} categories</span>
            <span>•</span>
            <span>Ready to deploy</span>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading project templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{categoryIcons[template.category]}</span>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{template.popularityScore}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Tech Stack */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Tech Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {template.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.technologies.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedDuration}
                    </div>
                    <Badge className={`text-xs ${difficultyColors[template.difficulty]}`}>
                      {template.difficulty}
                    </Badge>
                  </div>

                  {/* Tasks Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {template.taskTemplate.length} Initial Tasks
                      </span>
                    </div>
                    <div className="space-y-1">
                      {template.taskTemplate.slice(0, 3).map((task, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          {task.length > 50 ? task.substring(0, 50) + '...' : task}
                        </div>
                      ))}
                      {template.taskTemplate.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{template.taskTemplate.length - 3} more tasks...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BookOpen className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{categoryIcons[template.category]}</span>
                            {template.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-muted-foreground">{template.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Code2 className="h-4 w-4" />
                                Technologies ({template.technologies.length})
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {template.technologies.map((tech) => (
                                  <Badge key={tech} variant="outline">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Prerequisites ({template.prerequisites.length})
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {template.prerequisites.map((prereq, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                    {prereq}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckSquare className="h-4 w-4" />
                              Task Breakdown ({template.taskTemplate.length} tasks)
                            </h4>
                            <div className="grid gap-2">
                              {template.taskTemplate.map((task, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                  <span className="text-xs font-mono bg-primary/10 px-2 py-1 rounded">
                                    {(index + 1).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-sm">{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              What you'll learn ({template.learningObjectives.length})
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {template.learningObjectives.map((objective, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {template.estimatedDuration}
                              </div>
                              <Badge className={difficultyColors[template.difficulty]}>
                                {template.difficulty}
                              </Badge>
                            </div>
                            <Button 
                              onClick={() => openInitializeDialog(template)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Project
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      onClick={() => openInitializeDialog(template)} 
                      className="flex-1"
                      size="sm"
                    >
                      <Zap className="h-3 w-3 mr-2" />
                      Start Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Initialize Project Dialog */}
      <Dialog open={initializeDialogOpen} onOpenChange={setInitializeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Initialize Project: {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Custom Description (Optional)</label>
              <Textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Customize the project description..."
                className="min-h-[100px]"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What will be created:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• New project: "{projectName}"</li>
                <li>• {selectedTemplate?.taskTemplate.length} initial tasks with detailed checklists</li>
                <li>• Organized in "{selectedTemplate?.area}" area</li>
                <li>• Ready to start development immediately</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={initializeProject}
                disabled={!projectName.trim() || isInitializing}
                className="flex-1"
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isInitializing ? 'Creating Project...' : 'Create Project'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setInitializeDialogOpen(false)}
                disabled={isInitializing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}