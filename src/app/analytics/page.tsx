'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressSummary } from '@/components/analytics/ProgressSummary';
import { InsightCard } from '@/components/analytics/InsightCard';
import { StreakCounter } from '@/components/analytics/StreakCounter';
import { MoodTracker } from '@/components/analytics/MoodTracker';
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  TrendingUp, 
  Award,
  BookOpen,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface ProgressStats {
  character: {
    level: number;
    totalXp: number;
    name: string;
    stats: any[];
  };
  quests: {
    totalQuests: number;
    completedQuests: number;
    recentCompletions: number;
    completionRate: string;
  };
  dailyQuests: {
    totalDailyQuests: number;
    averageStreak: number;
    bestCombinedStreak: number;
  };
  reflections: {
    dailyReflectionsCount: number;
    weeklyReflectionsCount: number;
    currentStreak: number;
    consistencyRate: string;
  };
  mood: {
    trends: any[];
    averageEnergy: string;
    averageFocus: string;
  };
  period: string;
}

interface Insight {
  type: string;
  priority: number;
  title: string;
  description: string;
  actionable: boolean;
  category: string;
  data?: any;
}

export default function AnalyticsPage() {
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [insights, setInsights] = useState<{ insights: Insight[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch progress stats and insights in parallel
        const [progressResponse, insightsResponse] = await Promise.all([
          fetch('/api/analytics/progress-stats'),
          fetch('/api/analytics/insights')
        ]);

        if (!progressResponse.ok || !insightsResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const progressData = await progressResponse.json();
        const insightsData = await insightsResponse.json();

        if (progressData.success) {
          setProgressStats(progressData.data);
        }

        if (insightsData.success) {
          setInsights(insightsData.data);
        }

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInsightAction = (insight: Insight) => {
    // Handle insight actions - could navigate to specific pages or show modals
    console.log('Taking action on insight:', insight);
    
    // Example actions based on insight type
    if (insight.data?.recommendation === 'daily_reflection_reminder') {
      // Navigate to daily reflection page
      window.location.href = '/analytics/daily';
    } else if (insight.data?.recommendation === 'weekly_reflection') {
      // Navigate to weekly reflection page
      window.location.href = '/analytics/weekly';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Brain className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Analytics</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress, reflect on patterns, and gain insights
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/analytics/daily">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Reflection
            </Button>
          </Link>
          <Link href="/analytics/weekly">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Weekly Review
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {progressStats?.character?.level || 0}
                </div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {progressStats?.quests?.completionRate || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Quest Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {progressStats?.reflections?.currentStreak || 0}
                </div>
                <div className="text-sm text-muted-foreground">Reflection Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {progressStats?.dailyQuests?.averageStreak || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Daily Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressSummary data={progressStats} isLoading={isLoading} />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">Quests Completed</div>
                    <div className="text-muted-foreground">
                      {progressStats?.quests?.recentCompletions || 0} in the last 30 days
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Daily Reflections</div>
                    <div className="text-muted-foreground">
                      {progressStats?.reflections?.dailyReflectionsCount || 0} entries recently
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Weekly Reviews</div>
                    <div className="text-muted-foreground">
                      {progressStats?.reflections?.weeklyReflectionsCount || 0} completed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights?.insights && insights.insights.length > 0 ? (
              insights.insights.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight}
                  onAction={handleInsightAction}
                />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground text-sm">
                    Complete some reflections and quests to generate personalized insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StreakCounter
              title="Daily Reflection"
              currentStreak={progressStats?.reflections?.currentStreak || 0}
              description="Keep reflecting daily to build self-awareness"
              celebrateAt={7}
            />
            <StreakCounter
              title="Daily Quests"
              currentStreak={progressStats?.dailyQuests?.averageStreak || 0}
              bestStreak={progressStats?.dailyQuests?.bestCombinedStreak}
              icon="award"
              description="Complete daily quests to build momentum"
              celebrateAt={5}
            />
            <StreakCounter
              title="Consistency"
              currentStreak={Math.round(parseFloat(progressStats?.reflections?.consistencyRate || '0'))}
              icon="calendar"
              description="Overall consistency percentage"
              celebrateAt={80}
            />
          </div>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <MoodTracker
            trends={progressStats?.mood?.trends}
            averageEnergy={progressStats?.mood?.averageEnergy}
            averageFocus={progressStats?.mood?.averageFocus}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}