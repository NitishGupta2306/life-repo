'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrophyIcon, CoinsIcon, StarIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardDisplayProps {
  xpReward: number;
  goldReward?: number | null;
  skillTreeRewards?: Record<string, any>;
  isCompleted?: boolean;
  showTitle?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RewardDisplay({ 
  xpReward, 
  goldReward, 
  skillTreeRewards = {}, 
  isCompleted = false,
  showTitle = true,
  className,
  size = 'md'
}: RewardDisplayProps) {
  const hasSkillRewards = skillTreeRewards && Object.keys(skillTreeRewards).length > 0;
  const totalRewards = [xpReward > 0, goldReward, hasSkillRewards].filter(Boolean).length;

  const sizeClasses = {
    sm: {
      card: 'p-3',
      title: 'text-sm',
      icon: 'w-4 h-4',
      text: 'text-xs',
      badge: 'text-xs h-5 px-2',
    },
    md: {
      card: 'p-4',
      title: 'text-base',
      icon: 'w-5 h-5',
      text: 'text-sm',
      badge: 'text-sm h-6 px-3',
    },
    lg: {
      card: 'p-6',
      title: 'text-lg',
      icon: 'w-6 h-6',
      text: 'text-base',
      badge: 'text-base h-7 px-4',
    },
  };

  const styles = sizeClasses[size];

  if (totalRewards === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "border-2 transition-all duration-200",
      isCompleted 
        ? "border-green-200 bg-green-50 shadow-md" 
        : "border-yellow-200 bg-yellow-50",
      className
    )}>
      {showTitle && (
        <CardHeader className={cn("pb-2", styles.card)}>
          <CardTitle className={cn(
            "flex items-center gap-2 font-semibold",
            styles.title,
            isCompleted ? "text-green-800" : "text-yellow-800"
          )}>
            <SparklesIcon className={cn(
              styles.icon,
              isCompleted ? "text-green-600" : "text-yellow-600"
            )} />
            {isCompleted ? "Rewards Earned" : "Quest Rewards"}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={cn(!showTitle && styles.card)}>
        <div className="flex flex-wrap items-center gap-2">
          {/* XP Reward */}
          {xpReward > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1",
                styles.badge,
                isCompleted 
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              )}
            >
              <TrophyIcon className={styles.icon} />
              <span>{xpReward} XP</span>
            </Badge>
          )}

          {/* Gold Reward */}
          {goldReward && goldReward > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1",
                styles.badge,
                isCompleted 
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              )}
            >
              <CoinsIcon className={styles.icon} />
              <span>{goldReward} Gold</span>
            </Badge>
          )}

          {/* Skill Tree Rewards */}
          {hasSkillRewards && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1",
                styles.badge,
                isCompleted 
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
              )}
            >
              <StarIcon className={styles.icon} />
              <span>Skill Bonuses</span>
            </Badge>
          )}
        </div>

        {/* Skill Tree Details */}
        {hasSkillRewards && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className={cn("text-muted-foreground mb-2", styles.text)}>
              Skill Rewards:
            </div>
            <div className="space-y-1">
              {Object.entries(skillTreeRewards).map(([skill, reward]) => (
                <div key={skill} className={cn("flex justify-between", styles.text)}>
                  <span className="capitalize">{skill.replace(/_/g, ' ')}</span>
                  <span className="font-medium">+{reward} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className={cn(
            "mt-3 pt-3 border-t border-green-200 text-green-800 font-medium",
            styles.text
          )}>
            🎉 Congratulations! Rewards have been added to your character.
          </div>
        )}
      </CardContent>
    </Card>
  );
}