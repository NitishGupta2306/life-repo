'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Lock, 
  Crown, 
  Star, 
  Target,
  Heart,
  Brain,
  Zap
} from 'lucide-react';

interface Achievement {
  id: string;
  achievementName: string;
  description: string;
  category: string;
  rarity: string;
  icon?: string;
  xpBonus?: number;
  xpReward?: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent?: number;
  progressRequired?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
}

export function AchievementCard({ achievement, showProgress = true }: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'character': return <Star className="h-5 w-5" />;
      case 'quest': return <Target className="h-5 w-5" />;
      case 'social': return <Heart className="h-5 w-5" />;
      case 'self_care': return <Heart className="h-5 w-5" />;
      case 'reflection': return <Brain className="h-5 w-5" />;
      case 'streak': return <Zap className="h-5 w-5" />;
      case 'legendary': return <Crown className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const progressPercentage = achievement.progressRequired && achievement.progressCurrent !== undefined
    ? Math.min(100, (achievement.progressCurrent / achievement.progressRequired) * 100)
    : achievement.unlocked ? 100 : 0;

  return (
    <Card className={`relative ${achievement.unlocked ? 'ring-2 ring-green-200' : 'opacity-75'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {achievement.unlocked ? getCategoryIcon(achievement.category) : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base">
                {achievement.achievementName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRarityColor(achievement.rarity)}`}
                >
                  {achievement.rarity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              </div>
            </div>
          </div>
          
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="text-xs text-muted-foreground">
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          {achievement.description}
        </p>

        {/* Progress Bar */}
        {showProgress && achievement.progressRequired && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {achievement.progressCurrent || 0}/{achievement.progressRequired}
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        )}

        {/* XP Reward */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Reward: {achievement.xpBonus || achievement.xpReward || 0} XP
          </div>
          {achievement.unlocked && (
            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
              ✓ Unlocked
            </Badge>
          )}
        </div>

        {/* Achievement Status */}
        {!achievement.unlocked && achievement.progressRequired && achievement.progressCurrent !== undefined && (
          <div className="text-xs text-center text-muted-foreground p-2 bg-gray-50 rounded">
            {achievement.progressRequired - achievement.progressCurrent} more to unlock
          </div>
        )}

        {achievement.unlocked && (
          <div className="text-xs text-center text-green-600 p-2 bg-green-50 rounded">
            🎉 Achievement Unlocked!
          </div>
        )}
      </CardContent>
    </Card>
  );
}