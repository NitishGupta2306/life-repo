'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircleIcon, 
  CircleIcon, 
  FlameIcon,
  TrophyIcon,
  CalendarIcon,
  StreakIcon,
  StarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyQuestCardProps {
  quest: {
    id: string;
    questName: string;
    xpReward: number;
    streakCount: number;
    bestStreak: number;
    lastCompleted?: string | null;
    skillTreeId?: string | null;
    isCompletedToday: boolean;
    currentStreak: number;
    canComplete: boolean;
  };
  onComplete?: (questId: string) => void;
  onEdit?: (questId: string) => void;
  onDelete?: (questId: string) => void;
  className?: string;
  showActions?: boolean;
}

const getStreakLevel = (streak: number): { level: string; color: string; icon: string } => {
  if (streak >= 30) return { level: 'Legendary', color: 'text-purple-600 bg-purple-100', icon: '🔥' };
  if (streak >= 14) return { level: 'Master', color: 'text-orange-600 bg-orange-100', icon: '🌟' };
  if (streak >= 7) return { level: 'Advanced', color: 'text-blue-600 bg-blue-100', icon: '💪' };
  if (streak >= 3) return { level: 'Good', color: 'text-green-600 bg-green-100', icon: '✨' };
  return { level: 'Starting', color: 'text-gray-600 bg-gray-100', icon: '🌱' };
};

const getStreakBonus = (streak: number): number => {
  return Math.min(streak - 1, 10); // Max 10 bonus XP
};

export function DailyQuestCard({ 
  quest, 
  onComplete, 
  onEdit, 
  onDelete, 
  className, 
  showActions = true 
}: DailyQuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const streakInfo = getStreakLevel(quest.currentStreak);
  const streakBonus = getStreakBonus(quest.currentStreak);
  const totalXP = quest.xpReward + streakBonus;

  const handleComplete = async () => {
    if (!onComplete || !quest.canComplete || isCompleting) return;

    setIsCompleting(true);
    try {
      await onComplete(quest.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatLastCompleted = (lastCompleted: string | null): string => {
    if (!lastCompleted) return 'Never';
    const date = new Date(lastCompleted);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      quest.isCompletedToday ? "bg-green-50 border-green-200" : "hover:border-primary/50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {quest.isCompletedToday ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <CircleIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className={cn(
                "text-lg font-semibold",
                quest.isCompletedToday && "text-green-800"
              )}>
                {quest.questName}
              </CardTitle>
              
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrophyIcon className="w-3 h-3" />
                  <span>{quest.xpReward} XP</span>
                  {streakBonus > 0 && (
                    <span className="text-orange-600 font-medium">+{streakBonus}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Last: {formatLastCompleted(quest.lastCompleted)}</span>
                </div>
              </div>
            </div>
          </div>

          {quest.isCompletedToday && (
            <Badge className="bg-green-500 text-white">
              ✓ Done Today
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Streak Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
            <div className="flex items-center gap-2">
              <FlameIcon className="w-4 h-4 text-orange-500" />
              <span className="text-xl font-bold">{quest.currentStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            {quest.currentStreak > 0 && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs mt-1", streakInfo.color)}
              >
                {streakInfo.icon} {streakInfo.level}
              </Badge>
            )}
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Best Streak</div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-xl font-bold">{quest.bestStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>

        {/* Streak Progress (visual representation) */}
        {quest.currentStreak > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Streak Progress</div>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(quest.currentStreak, 14) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-orange-500 rounded-full" />
              ))}
              {quest.currentStreak > 14 && (
                <span className="text-sm text-orange-600 font-medium ml-1">
                  +{quest.currentStreak - 14}
                </span>
              )}
            </div>
          </div>
        )}

        {/* XP Breakdown */}
        {streakBonus > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-1">XP Rewards</div>
            <div className="grid grid-cols-3 gap-2 text-xs text-yellow-700">
              <div>Base: {quest.xpReward} XP</div>
              <div>Streak: +{streakBonus} XP</div>
              <div className="font-bold">Total: {totalXP} XP</div>
            </div>
          </div>
        )}

        {/* Completion Status */}
        {quest.isCompletedToday ? (
          <div className="text-center p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="text-green-800 font-medium">✓ Completed Today!</div>
            <p className="text-green-700 text-sm">
              Great job maintaining your daily habit!
            </p>
          </div>
        ) : (
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 font-medium">Ready for Today</div>
            <p className="text-blue-700 text-sm">
              Complete this quest to maintain your streak
            </p>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            {quest.canComplete && onComplete && (
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex-1"
                size="sm"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Complete Today
                  </>
                )}
              </Button>
            )}

            {quest.isCompletedToday && (
              <div className="flex-1 text-center py-2">
                <Badge className="bg-green-500 text-white px-4 py-1">
                  Done for Today
                </Badge>
              </div>
            )}

            {onEdit && (
              <Button 
                onClick={() => onEdit(quest.id)}
                variant="outline"
                size="sm"
                className="px-3"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}