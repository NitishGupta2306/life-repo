"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shower,
  Utensils,
  Droplets,
  Pill,
  Heart,
  Zap
} from 'lucide-react';

interface BasicNeed {
  id: string;
  needName: string;
  needCategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastCompleted: string | null;
  streakCount: number;
  isOverdue: boolean;
  xpReward: number;
  idealFrequency: string;
}

interface BasicNeedsCardProps {
  need: BasicNeed;
  onComplete: (needId: string) => void;
  isCompletedToday?: boolean;
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

export default function BasicNeedsCard({ need, onComplete, isCompletedToday = false }: BasicNeedsCardProps) {
  const IconComponent = CATEGORY_ICONS[need.needCategory as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '🌟';
    return '';
  };

  const getTimeSinceCompletion = () => {
    if (!need.lastCompleted) return 'Never completed';
    
    const lastCompleted = new Date(need.lastCompleted);
    const now = new Date();
    const hours = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Less than an hour ago';
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      need.isOverdue ? 'border-orange-200 bg-orange-50' : 
      isCompletedToday ? 'border-green-200 bg-green-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
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
      
      <CardContent className="pt-0 space-y-3">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium ${
            isCompletedToday ? 'text-green-600' :
            need.isOverdue ? 'text-orange-600' : 'text-muted-foreground'
          }`}>
            {isCompletedToday && '✅ Completed today'}
            {!isCompletedToday && need.isOverdue && '🔴 Overdue'}
            {!isCompletedToday && !need.isOverdue && '⏰ On track'}
          </div>
          {need.streakCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>{need.streakCount} {getStreakEmoji(need.streakCount)}</span>
            </div>
          )}
        </div>

        {/* Streak Progress */}
        {need.streakCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Streak Progress</span>
              <span>{need.streakCount} days</span>
            </div>
            <Progress 
              value={Math.min(100, (need.streakCount / 30) * 100)} 
              className="h-2"
            />
          </div>
        )}

        {/* Last Completion Info */}
        <div className="text-xs text-muted-foreground">
          Last completed: {getTimeSinceCompletion()}
        </div>

        {/* XP Reward Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reward:</span>
          <span className="font-medium text-blue-600">+{need.xpReward} XP</span>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onComplete(need.id)}
          disabled={isCompletedToday && !need.isOverdue}
          className="w-full"
          size="sm"
          variant={isCompletedToday ? "secondary" : "default"}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isCompletedToday ? 'Completed Today!' : `Complete (+${need.xpReward} XP)`}
        </Button>

        {/* Gentle Encouragement */}
        {need.isOverdue && (
          <p className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
            💙 It's okay! Every small step counts. You've got this.
          </p>
        )}
        
        {isCompletedToday && need.streakCount > 0 && (
          <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
            🎉 Amazing work maintaining your {need.streakCount}-day streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
}