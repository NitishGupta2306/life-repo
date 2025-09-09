"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Send, CheckCircle2, Clock, AlertCircle, CheckSquare, BookOpen, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [ideaText, setIdeaText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent submissions from database
  const loadRecentSubmissions = async () => {
    try {
      const response = await fetch('/api/recent-submissions?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setRecentSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to load recent submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load submissions on component mount
  useEffect(() => {
    loadRecentSubmissions();
  }, []);

  const handleIdeaSubmit = async (type: "task" | "note") => {
    if (!ideaText.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/process-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ideaText,
          type: type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reload recent submissions to get fresh data from database
        await loadRecentSubmissions();
        setIdeaText("");
      } else {
        console.error('Error:', data.error);
        // Handle error - maybe show a toast notification
      }
    } catch (error) {
      console.error('Failed to process idea:', error);
      // Handle error - maybe show a toast notification
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2">🧠 Intelligent Project Assistant</h1>
              <p className="text-muted-foreground mb-4">
                <strong>Next-Level AI Planning:</strong> Describe any project, goal, or idea, and I'll create detailed action plans, smart checklists, realistic deadlines, and perfect organization.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Badge variant="secondary">📋 Smart Checklists</Badge>
                <Badge variant="secondary">⏰ Deadline Suggestions</Badge>
                <Badge variant="secondary">🎯 Priority Assessment</Badge>
                <Badge variant="secondary">🔧 Tech Stack Recognition</Badge>
                <Badge variant="secondary">📊 Scope Analysis</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/templates">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tasks
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

        {/* Main Idea Dump Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              What's on your mind?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Try: 'Create a dashboard for tracking user analytics with React and PostgreSQL' or 'Plan a mobile app for fitness tracking with real-time data' or 'Research machine learning tools for data analysis'..."
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              className="min-h-[150px] text-base"
              disabled={isProcessing}
            />
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
              💡 <strong>Smart Examples:</strong> "Build a dashboard for xyz", "Learn React with TypeScript", "Automate my email workflow", "Create budget plan with emergency fund", "Design portfolio website"
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleIdeaSubmit("task")} 
                disabled={!ideaText.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                🚀 Create Action Plan
              </Button>
              <Button 
                onClick={() => handleIdeaSubmit("note")} 
                disabled={!ideaText.trim() || isProcessing}
                variant="outline"
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                📝 Create Knowledge Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              🎯 Recent AI-Processed Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recent submissions...
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent submissions. Start dumping your ideas above!
              </div>
            ) : (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={submission.type === "task" ? "default" : "secondary"}>
                        {submission.type}
                      </Badge>
                      {submission.details?.priority && (
                        <Badge variant={
                          submission.details.priority === "urgent" ? "destructive" : 
                          submission.details.priority === "high" ? "destructive" :
                          submission.details.priority === "medium" ? "default" : "outline"
                        }>
                          {submission.details.priority}
                        </Badge>
                      )}
                      {submission.details?.difficulty && (
                        <Badge variant="outline">
                          {submission.details.difficulty}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{submission.timestamp}</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Original:</p>
                    <p className="text-sm text-muted-foreground">{submission.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{submission.result}</span>
                  </div>
                  
                  {submission.details && (
                    <div className="bg-muted/50 rounded p-3 space-y-2">
                      <p className="text-sm font-medium">Processed Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {submission.details.project && (
                          <div><span className="font-medium">Project:</span> {submission.details.project}</div>
                        )}
                        {submission.details.area && (
                          <div><span className="font-medium">Area:</span> {submission.details.area}</div>
                        )}
                        {submission.details.dueDate && (
                          <div><span className="font-medium">Due:</span> {submission.details.dueDate}</div>
                        )}
                        {submission.details.subAreas && submission.details.subAreas.length > 0 && (
                          <div><span className="font-medium">Sub-areas:</span> {submission.details.subAreas.join(', ')}</div>
                        )}
                      </div>
                      {submission.details.checklist && submission.details.checklist.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Checklist created:</p>
                          <ul className="text-xs space-y-1">
                            {submission.details.checklist.map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 border border-muted-foreground rounded-sm"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
