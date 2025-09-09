"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Heart,
  Shower,
  Utensils,
  Droplets,
  Pill,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  Clock,
  Star,
  Target,
  RotateCcw,
  Plus
} from 'lucide-react';

interface BasicNeed {
  id: string;
  needName: string;
  needCategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  idealFrequency: string;
  lastCompleted: string | null;
  streakCount: number;
  isOverdue: boolean;
  reminderEnabled: boolean;
  xpReward: number;
}

interface NeedCompletion {
  id: string;
  needId: string;
  completedAt: string;
  difficultyRating: number | null;
  energyBefore: number | null;
  energyAfter: number | null;
  notes: string | null;
}

const CATEGORY_ICONS = {
  hygiene: Shower,
  nutrition: Utensils,
  hydration: Droplets,
  medication: Pill,
  movement: Zap,
  default: Heart
};

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const DEFAULT_NEEDS = [
  { name: 'Shower', category: 'hygiene', priority: 'medium', frequency: '1 day' },
  { name: 'Brush Teeth', category: 'hygiene', priority: 'high', frequency: '12 hours' },
  { name: 'Eat Breakfast', category: 'nutrition', priority: 'high', frequency: '1 day' },
  { name: 'Eat Lunch', category: 'nutrition', priority: 'high', frequency: '1 day' },
  { name: 'Eat Dinner', category: 'nutrition', priority: 'high', frequency: '1 day' },
  { name: 'Drink Water', category: 'hydration', priority: 'critical', frequency: '2 hours' },
  { name: 'Take Medication', category: 'medication', priority: 'critical', frequency: '1 day' },
];

export default function BasicNeedsTracker() {
  const router = useRouter();
  const [needs, setNeeds] = useState<BasicNeed[]>([]);
  const [completions, setCompletions] = useState<NeedCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<BasicNeed | null>(null);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [energyBefore, setEnergyBefore] = useState(5);
  const [energyAfter, setEnergyAfter] = useState(5);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    fetchNeedsData();
  }, []);

  const fetchNeedsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/adhd/basic-needs');
      const data = await response.json();
      
      if (data.needs && data.needs.length > 0) {
        setNeeds(data.needs);
      } else {
        // Initialize with default needs if none exist
        await initializeDefaultNeeds();
      }
    } catch (error) {
      console.error('Error fetching needs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultNeeds = async () => {
    // This would typically be done on the backend, but for demo purposes:
    const mockNeeds: BasicNeed[] = DEFAULT_NEEDS.map((need, index) => ({
      id: `need-${index}`,
      needName: need.name,
      needCategory: need.category,
      priority: need.priority as BasicNeed['priority'],
      idealFrequency: need.frequency,
      lastCompleted: null,
      streakCount: 0,
      isOverdue: true,
      reminderEnabled: true,
      xpReward: need.priority === 'critical' ? 10 : need.priority === 'high' ? 7 : 5
    }));
    
    setNeeds(mockNeeds);
  };

  const startNeedCompletion = (need: BasicNeed) => {
    setSelectedNeed(need);
    setShowCompletionModal(true);
    setDifficultyRating(3);
    setEnergyBefore(5);
    setEnergyAfter(5);
    setCompletionNotes('');
  };

  const completeNeed = async () => {
    if (!selectedNeed) return;

    try {
      const response = await fetch('/api/adhd/basic-needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needId: selectedNeed.id,
          difficultyRating,
          energyBefore,
          energyAfter,
          notes: completionNotes || null
        })
      });

      if (response.ok) {
        // Update the need in state
        setNeeds(prev => prev.map(need => 
          need.id === selectedNeed.id 
            ? {
                ...need,
                lastCompleted: new Date().toISOString(),
                streakCount: need.streakCount + 1,
                isOverdue: false
              }
            : need
        ));

        setShowCompletionModal(false);
        setSelectedNeed(null);
      }
    } catch (error) {
      console.error('Error completing need:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
    return <IconComponent className="h-5 w-5" />;
  };

  const getCompletionStatus = (need: BasicNeed) => {
    if (!need.lastCompleted) return { status: 'overdue', color: 'text-red-500' };
    
    const lastCompleted = new Date(need.lastCompleted);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);

    // Simple frequency parsing (this would be more sophisticated in production)
    const frequency = need.idealFrequency;
    let overdueHours = 24; // default

    if (frequency.includes('hour')) {
      overdueHours = parseInt(frequency) || 24;
    } else if (frequency.includes('day')) {
      overdueHours = (parseInt(frequency) || 1) * 24;
    }

    if (hoursSinceCompletion < overdueHours * 0.5) {
      return { status: 'completed', color: 'text-green-500' };
    } else if (hoursSinceCompletion < overdueHours) {
      return { status: 'due_soon', color: 'text-yellow-500' };
    } else {
      return { status: 'overdue', color: 'text-red-500' };
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🌟';
    return '';
  };

  const totalNeeds = needs.length;
  const completedToday = needs.filter(need => {
    if (!need.lastCompleted) return false;
    const lastCompleted = new Date(need.lastCompleted);
    const today = new Date();
    return lastCompleted.toDateString() === today.toDateString();
  }).length;

  const currentStreak = Math.min(...needs.map(need => need.streakCount));
  const totalXPAvailable = needs.reduce((sum, need) => sum + need.xpReward, 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your daily needs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              Daily Needs Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Gentle reminders for your basic self-care needs
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/adhd')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{completedToday}/{totalNeeds}</div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <Progress value={(completedToday / totalNeeds) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold flex items-center gap-1">
                {currentStreak}
                {getStreakEmoji(currentStreak)}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalXPAvailable}</div>
              <p className="text-sm text-muted-foreground">XP Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {needs.filter(n => n.isOverdue).length}
              </div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Encouraging Message */}
        {completedToday === totalNeeds ? (
          <Alert className="bg-green-50 border-green-200">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              🎉 Amazing! You&apos;ve completed all your basic needs today. Your body and mind thank you!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 border-blue-200">
            <Heart className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              You&apos;re doing great! Remember, taking care of your basic needs isn&apos;t selfish—it&apos;s necessary. 
              Each completed need gives you energy for other activities.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today&apos;s Needs</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {needs.map((need) => {
                const status = getCompletionStatus(need);
                const isCompletedToday = need.lastCompleted && 
                  new Date(need.lastCompleted).toDateString() === new Date().toDateString();

                return (
                  <Card 
                    key={need.id} 
                    className={`transition-all hover:shadow-md ${
                      need.isOverdue ? 'border-orange-200 bg-orange-50' : 
                      isCompletedToday ? 'border-green-200 bg-green-50' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getCategoryIcon(need.needCategory)}
                          {need.needName}
                        </CardTitle>
                        <Badge 
                          variant="outline"
                          className={PRIORITY_COLORS[need.priority]}
                        >
                          {need.priority}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Every {need.idealFrequency}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Status and streak */}
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-medium ${status.color}`}>
                            {status.status === 'completed' && '✅ Completed'}
                            {status.status === 'due_soon' && '⏰ Due soon'}
                            {status.status === 'overdue' && '🔴 Overdue'}
                          </div>
                          {need.streakCount > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-4 w-4" />
                              {need.streakCount} {getStreakEmoji(need.streakCount)}
                            </div>
                          )}
                        </div>

                        {/* Last completed */}
                        {need.lastCompleted && (
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(need.lastCompleted).toLocaleString()}
                          </p>
                        )}

                        {/* Action button */}
                        <Button 
                          onClick={() => startNeedCompletion(need)}
                          disabled={isCompletedToday && !need.isOverdue}
                          className="w-full"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isCompletedToday ? 'Completed Today' : `Mark Done (+${need.xpReward} XP)`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {Object.entries(
              needs.reduce((acc, need) => {
                if (!acc[need.needCategory]) acc[need.needCategory] = [];
                acc[need.needCategory].push(need);
                return acc;
              }, {} as Record<string, BasicNeed[]>)
            ).map(([category, categoryNeeds]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getCategoryIcon(category)}
                    {category}
                  </CardTitle>
                  <CardDescription>
                    {categoryNeeds.length} needs • {categoryNeeds.filter(n => !n.isOverdue).length} completed today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryNeeds.map((need) => {
                      const isCompletedToday = need.lastCompleted && 
                        new Date(need.lastCompleted).toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={need.id}
                          className={`p-3 border rounded-lg ${
                            isCompletedToday ? 'bg-green-50 border-green-200' : 
                            need.isOverdue ? 'bg-orange-50 border-orange-200' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{need.needName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {need.streakCount} day{need.streakCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              +{need.xpReward} XP
                            </p>
                            <Button 
                              size="sm" 
                              variant={isCompletedToday ? "secondary" : "default"}
                              onClick={() => startNeedCompletion(need)}
                              disabled={isCompletedToday && !need.isOverdue}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isCompletedToday ? 'Done' : 'Mark'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Streak Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {needs.map((need) => (
                      <div key={need.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(need.needCategory)}
                          <span className="text-sm">{need.needName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{need.streakCount}</span>
                          {getStreakEmoji(need.streakCount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`p-3 border rounded-lg ${
                      completedToday === totalNeeds ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Perfect Day</span>
                        {completedToday === totalNeeds && <span className="text-xs">🎉 Achieved!</span>}
                      </div>
                    </div>
                    
                    <div className={`p-3 border rounded-lg ${
                      currentStreak >= 7 ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Week Warrior</span>
                        {currentStreak >= 7 && <span className="text-xs">✨ Achieved!</span>}
                      </div>
                    </div>

                    <div className={`p-3 border rounded-lg ${
                      currentStreak >= 30 ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span className="text-sm">Month Master</span>
                        {currentStreak >= 30 && <span className="text-xs">🔥 Achieved!</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Completion Modal */}
        {showCompletionModal && selectedNeed && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedNeed.needCategory)}
                  Completing: {selectedNeed.needName}
                </CardTitle>
                <CardDescription>
                  Track how this need completion affects your energy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How difficult was this? (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setDifficultyRating(rating)}
                        className={`w-10 h-10 rounded-full text-sm ${
                          difficultyRating >= rating
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted-foreground/20'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Energy Before (1-10)
                    </label>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i + 1}
                          className={`w-6 h-6 rounded-full text-xs ${
                            energyBefore >= i + 1
                              ? 'bg-blue-500 text-white'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                          onClick={() => setEnergyBefore(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Energy After (1-10)
                    </label>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i + 1}
                          className={`w-6 h-6 rounded-full text-xs ${
                            energyAfter >= i + 1
                              ? 'bg-green-500 text-white'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                          onClick={() => setEnergyAfter(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md resize-none"
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="How did it go? Any insights?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={completeNeed} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete (+{selectedNeed.xpReward} XP)
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowCompletionModal(false);
                      setSelectedNeed(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}