'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  stat: {
    id: string;
    statName: string;
    baseValue: number;
    currentValue: number;
    maxValue: number;
    statCategory: 'primary' | 'secondary' | 'special';
    updatedAt: string;
  };
}

export function StatCard({ stat }: StatCardProps) {
  const percentage = Math.round((stat.currentValue / stat.maxValue) * 100);
  const isBuffed = stat.currentValue > stat.baseValue;
  const isDebuffed = stat.currentValue < stat.baseValue;
  
  const getStatIcon = (statName: string) => {
    const name = statName.toLowerCase();
    if (name.includes('strength') || name.includes('constitution')) return '💪';
    if (name.includes('intelligence') || name.includes('focus')) return '🧠';
    if (name.includes('wisdom')) return '🦉';
    if (name.includes('charisma') || name.includes('social')) return '👑';
    if (name.includes('dexterity') || name.includes('organization')) return '⚡';
    if (name.includes('creativity')) return '🎨';
    return '⭐';
  };

  const getStatColor = (category: string, percentage: number) => {
    const baseColors = {
      primary: percentage >= 70 ? 'from-blue-500 to-purple-500' : 
               percentage >= 40 ? 'from-blue-400 to-blue-600' : 'from-gray-500 to-blue-500',
      secondary: percentage >= 70 ? 'from-green-500 to-teal-500' : 
                 percentage >= 40 ? 'from-green-400 to-green-600' : 'from-gray-500 to-green-500',
      special: percentage >= 70 ? 'from-purple-500 to-pink-500' : 
               percentage >= 40 ? 'from-purple-400 to-purple-600' : 'from-gray-500 to-purple-500',
    };
    return baseColors[category as keyof typeof baseColors] || baseColors.primary;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'primary':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'secondary':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'special':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatDescription = (statName: string) => {
    const descriptions: Record<string, string> = {
      'Strength': 'Physical power and endurance',
      'Intelligence': 'Problem-solving and learning ability',
      'Wisdom': 'Judgment and life experience',
      'Charisma': 'Social influence and communication',
      'Constitution': 'Health and resilience',
      'Dexterity': 'Agility and fine motor skills',
      'Focus': 'Attention and concentration ability',
      'Creativity': 'Innovation and artistic expression',
      'Organization': 'Planning and systematic thinking',
      'Social Skills': 'Interpersonal relationships',
    };
    return descriptions[statName] || 'Character attribute';
  };

  return (
    <Card className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatIcon(stat.statName)}</span>
              <h3 className="font-semibold text-white">{stat.statName}</h3>
            </div>
            <Badge className={`${getCategoryBadgeColor(stat.statCategory)} text-xs`}>
              {stat.statCategory}
            </Badge>
          </div>

          {/* Current Value Display */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              {stat.currentValue}
              {isBuffed && <TrendingUp className="h-4 w-4 text-green-400" />}
              {isDebuffed && <TrendingDown className="h-4 w-4 text-red-400" />}
              {!isBuffed && !isDebuffed && <Minus className="h-4 w-4 text-gray-400" />}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">
                Base: {stat.baseValue} / Max: {stat.maxValue}
              </div>
              {stat.currentValue !== stat.baseValue && (
                <div className={`text-xs ${
                  isBuffed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isBuffed ? '+' : ''}{stat.currentValue - stat.baseValue}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-2 bg-slate-600/50" 
            />
            <div 
              className={`absolute inset-0 h-2 bg-gradient-to-r ${getStatColor(stat.statCategory, percentage)} rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Progress Info */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{percentage}%</span>
            <span className={
              percentage >= 80 ? 'text-green-400 font-medium' :
              percentage >= 60 ? 'text-yellow-400' :
              percentage >= 40 ? 'text-orange-400' : 'text-red-400'
            }>
              {percentage >= 80 ? 'Excellent' :
               percentage >= 60 ? 'Good' :
               percentage >= 40 ? 'Average' : 'Needs Work'}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">
            {getStatDescription(stat.statName)}
          </p>

          {/* Last Updated */}
          <div className="text-xs text-slate-500">
            Updated: {new Date(stat.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}