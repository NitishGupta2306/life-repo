'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressSummaryProps {
  data?: {
    character: {
      level: number;
      totalXp: number;
      name: string;
    };
    quests: {
      totalQuests: number;
      completedQuests: number;
      recentCompletions: number;
      completionRate: string;
    };
    reflections: {
      currentStreak: number;
      consistencyRate: string;
    };
  };
  isLoading?: boolean;
}

export function ProgressSummary({ data, isLoading }: ProgressSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Character: {data.character.name}</h3>
            <Badge variant="secondary">Level {data.character.level}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Total XP: {data.character.totalXp.toLocaleString()}
          </div>
        </div>

        {/* Quest Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Quest Progress</h3>
            <span className="text-sm text-muted-foreground">
              {data.quests.completedQuests}/{data.quests.totalQuests} completed
            </span>
          </div>
          <Progress value={parseFloat(data.quests.completionRate)} />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Recent completions: {data.quests.recentCompletions}
            </span>
            <span className="font-medium">{data.quests.completionRate}%</span>
          </div>
        </div>

        {/* Reflection Streak */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Reflection Streak</h3>
            <Badge variant={data.reflections.currentStreak >= 7 ? "default" : "outline"}>
              {data.reflections.currentStreak} days
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Consistency: {data.reflections.consistencyRate}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}