'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Award } from 'lucide-react';

interface StreakCounterProps {
  title: string;
  currentStreak: number;
  bestStreak?: number;
  icon?: 'flame' | 'calendar' | 'award';
  description?: string;
  celebrateAt?: number; // Celebrate when streak reaches this number
}

export function StreakCounter({ 
  title, 
  currentStreak, 
  bestStreak, 
  icon = 'flame',
  description,
  celebrateAt = 7 
}: StreakCounterProps) {
  const getIcon = () => {
    switch (icon) {
      case 'flame':
        return <Flame className={`h-5 w-5 ${currentStreak >= celebrateAt ? 'text-orange-500' : 'text-gray-400'}`} />;
      case 'calendar':
        return <Calendar className={`h-5 w-5 ${currentStreak >= celebrateAt ? 'text-blue-500' : 'text-gray-400'}`} />;
      case 'award':
        return <Award className={`h-5 w-5 ${currentStreak >= celebrateAt ? 'text-yellow-500' : 'text-gray-400'}`} />;
    }
  };

  const getStreakStatus = () => {
    if (currentStreak === 0) return { variant: 'outline' as const, text: 'Start your streak!' };
    if (currentStreak >= celebrateAt) return { variant: 'default' as const, text: 'On fire!' };
    return { variant: 'secondary' as const, text: 'Building momentum' };
  };

  const status = getStreakStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {getIcon()}
            {title}
          </CardTitle>
          <Badge variant={status.variant}>
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'} current streak
            </div>
          </div>
          
          {bestStreak !== undefined && bestStreak > currentStreak && (
            <div className="text-center text-sm text-muted-foreground">
              Personal best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground text-center">
              {description}
            </p>
          )}
          
          {/* Progress toward celebration */}
          {currentStreak > 0 && currentStreak < celebrateAt && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStreak / celebrateAt) * 100}%` }}
                />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {celebrateAt - currentStreak} more {celebrateAt - currentStreak === 1 ? 'day' : 'days'} to {celebrateAt}-day milestone
              </div>
            </div>
          )}
          
          {/* Celebration for reaching milestone */}
          {currentStreak >= celebrateAt && (
            <div className="text-center text-xs bg-gradient-to-r from-orange-100 to-yellow-100 p-2 rounded">
              🎉 Congratulations on your {currentStreak}-day streak!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}