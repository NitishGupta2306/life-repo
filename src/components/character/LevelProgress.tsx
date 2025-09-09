'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LevelProgressProps {
  levelInfo: {
    currentLevel: number;
    totalXp: number;
    xpInCurrentLevel: number;
    xpToNextLevel: number;
    progressPercent: number;
    nextLevelXp: number;
  };
}

export function LevelProgress({ levelInfo }: LevelProgressProps) {
  const [adding, setAdding] = useState(false);
  
  const addTestXp = async () => {
    setAdding(true);
    try {
      await fetch('/api/character/level-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xpAmount: 100,
          source: 'test',
          description: 'Test XP gain',
        }),
      });
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add XP:', error);
    } finally {
      setAdding(false);
    }
  };

  const getLevelTitle = (level: number) => {
    if (level < 16) return 'Young Explorer';
    if (level < 21) return 'Life Apprentice';
    if (level < 26) return 'Experience Seeker';
    if (level < 31) return 'Wisdom Builder';
    if (level < 41) return 'Life Master';
    if (level < 51) return 'Elder Sage';
    return 'Legendary Existence';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-purple-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-slate-500';
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "Almost there! Level up incoming! 🎉";
    if (percentage >= 70) return "Great progress! Keep pushing forward! 💪";
    if (percentage >= 50) return "Halfway there! You're doing amazing! ⭐";
    if (percentage >= 25) return "Making steady progress! 🚀";
    return "Every journey starts with a single step! 🌟";
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="h-5 w-5 text-yellow-400" />
          Level Progress
        </CardTitle>
        <CardDescription className="text-indigo-200">
          Your life experience and growth journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1">
              Level {levelInfo.currentLevel}
            </Badge>
            <Badge variant="outline" className="border-indigo-400/50 text-indigo-300">
              {getLevelTitle(levelInfo.currentLevel)}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {levelInfo.totalXp.toLocaleString()}
          </div>
          <div className="text-sm text-indigo-300">Total Life Experience</div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-white">
            <span>Progress to Level {levelInfo.currentLevel + 1}</span>
            <span>{Math.round(levelInfo.progressPercent)}%</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={levelInfo.progressPercent} 
              className="h-4 bg-slate-700/50" 
            />
            <div 
              className={`absolute inset-0 h-4 bg-gradient-to-r ${getProgressColor(levelInfo.progressPercent)} rounded-full transition-all duration-1000 overflow-hidden`}
              style={{ width: `${levelInfo.progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-indigo-300">
            <span>{levelInfo.xpInCurrentLevel} XP</span>
            <span>{levelInfo.xpToNextLevel} XP to next level</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-indigo-800/30 rounded-lg p-3 border border-indigo-600/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-indigo-200">Motivation Boost</span>
          </div>
          <p className="text-sm text-indigo-100">{getMotivationalMessage(levelInfo.progressPercent)}</p>
        </div>

        {/* Level Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-indigo-800/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{levelInfo.currentLevel}</div>
            <div className="text-xs text-indigo-300">Current Level</div>
          </div>
          <div className="text-center p-3 bg-indigo-800/20 rounded-lg">
            <Gift className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{levelInfo.currentLevel + 1}</div>
            <div className="text-xs text-indigo-300">Next Milestone</div>
          </div>
        </div>

        {/* Quick XP Test Button (for development) */}
        <div className="border-t border-indigo-600/30 pt-4">
          <Button 
            onClick={addTestXp}
            disabled={adding}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {adding ? 'Adding XP...' : '+ Add Test XP (100)'}
          </Button>
          <p className="text-xs text-indigo-400 text-center mt-2">
            Development tool - gain XP from completing real-life quests!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}