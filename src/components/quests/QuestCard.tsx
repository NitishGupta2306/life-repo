'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, ClockIcon, TrophyIcon, CoinsIcon } from 'lucide-react';
import { Quest } from '@/database/schema';

interface QuestCardProps {
  quest: Quest & {
    objectives: Array<{
      id: string;
      objectiveText: string;
      isCompleted: boolean;
      isRequired: boolean;
    }>;
    progress: number;
    totalObjectives: number;
    completedObjectives: number;
  };
  onStart?: (questId: string) => void;
  onComplete?: (questId: string) => void;
  onView?: (questId: string) => void;
  onAbandon?: (questId: string) => void;
}

const difficultyColors = {
  trivial: 'bg-gray-100 text-gray-800',
  easy: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  hard: 'bg-orange-100 text-orange-800',
  legendary: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  available: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  abandoned: 'bg-orange-100 text-orange-800',
};

const questTypeIcons = {
  main: '⚡',
  side: '⭐',
  daily: '🔄',
  weekly: '📅',
  epic: '🏆',
};

export function QuestCard({ quest, onStart, onComplete, onView, onAbandon }: QuestCardProps) {
  const canComplete = quest.status === 'active' && quest.progress === 100;
  const canStart = quest.status === 'available';
  const isActive = quest.status === 'active';
  const isCompleted = quest.status === 'completed';

  const formatTimeLimit = (timeLimit: string | null) => {
    if (!timeLimit) return null;
    // Parse PostgreSQL interval format
    const match = timeLimit.match(/(\d+) days?/);
    if (match) {
      const days = parseInt(match[1]);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return timeLimit;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{questTypeIcons[quest.questType]}</span>
            <Badge variant="secondary" className={difficultyColors[quest.difficulty]}>
              {quest.difficulty}
            </Badge>
            <Badge variant="secondary" className={statusColors[quest.status]}>
              {quest.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrophyIcon className="w-4 h-4" />
            <span>{quest.xpReward} XP</span>
            {quest.goldReward && (
              <>
                <CoinsIcon className="w-4 h-4 ml-2" />
                <span>{quest.goldReward}</span>
              </>
            )}
          </div>
        </div>
        <CardTitle className="text-xl font-bold">{quest.questName}</CardTitle>
        <CardDescription className="text-sm">
          {quest.questDescription || 'No description provided.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Progress Section */}
        {quest.totalObjectives > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{quest.completedObjectives}/{quest.totalObjectives} objectives</span>
            </div>
            <Progress value={quest.progress} className="h-2" />
          </div>
        )}

        {/* Objectives Preview */}
        {quest.objectives.length > 0 && (
          <div className="space-y-1 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">Objectives:</h4>
            <ul className="space-y-1">
              {quest.objectives.slice(0, 3).map((objective) => (
                <li key={objective.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                    objective.isCompleted 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {objective.isCompleted && '✓'}
                  </span>
                  <span className={objective.isCompleted ? 'line-through text-muted-foreground' : ''}>
                    {objective.objectiveText}
                  </span>
                  {objective.isRequired && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      Required
                    </Badge>
                  )}
                </li>
              ))}
              {quest.objectives.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{quest.objectives.length - 3} more objectives...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Time Information */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {quest.timeLimit && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>Time limit: {formatTimeLimit(quest.timeLimit)}</span>
            </div>
          )}
          {quest.createdAt && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>Created: {new Date(quest.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {quest.startedAt && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>Started: {new Date(quest.startedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        {canStart && onStart && (
          <Button onClick={() => onStart(quest.id)} className="flex-1">
            Start Quest
          </Button>
        )}
        
        {canComplete && onComplete && (
          <Button onClick={() => onComplete(quest.id)} className="flex-1" variant="default">
            Complete Quest
          </Button>
        )}

        {onView && (
          <Button 
            onClick={() => onView(quest.id)} 
            variant="outline" 
            className={canStart || canComplete ? "flex-1" : "flex-1"}
          >
            View Details
          </Button>
        )}

        {isActive && onAbandon && (
          <Button onClick={() => onAbandon(quest.id)} variant="destructive" size="sm">
            Abandon
          </Button>
        )}

        {isCompleted && (
          <Badge variant="default" className="flex-1 justify-center py-2 bg-green-500">
            ✓ Completed
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}