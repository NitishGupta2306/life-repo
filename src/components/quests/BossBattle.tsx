'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldIcon, 
  SwordIcon, 
  HeartIcon, 
  TrophyIcon,
  ZapIcon,
  TargetIcon,
  ClockIcon,
  StarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BossBattleProps {
  boss: {
    id: string;
    bossName: string;
    hpTotal: number;
    hpCurrent: number;
    weakness: string[];
    appearsWhen: Record<string, any>;
    defeatReward: Record<string, any>;
    strategiesTried: string[];
    defeated: boolean;
    defeatedAt?: string | null;
  } & {
    progress: number;
    healthPercentage: number;
  };
  onAttack?: (bossId: string) => void;
  onViewDetails?: (bossId: string) => void;
  className?: string;
  showActions?: boolean;
}

const getBossRank = (hpTotal: number): { rank: string; color: string; icon: string } => {
  if (hpTotal >= 500) return { rank: 'Legendary', color: 'text-purple-600', icon: '👑' };
  if (hpTotal >= 200) return { rank: 'Epic', color: 'text-orange-600', icon: '⚔️' };
  if (hpTotal >= 100) return { rank: 'Elite', color: 'text-blue-600', icon: '🛡️' };
  return { rank: 'Regular', color: 'text-green-600', icon: '⚡' };
};

const getHealthColor = (percentage: number): string => {
  if (percentage > 75) return 'bg-red-500';
  if (percentage > 50) return 'bg-orange-500';
  if (percentage > 25) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getDamageColor = (percentage: number): string => {
  if (percentage > 75) return 'bg-green-500';
  if (percentage > 50) return 'bg-yellow-500';
  if (percentage > 25) return 'bg-orange-500';
  return 'bg-red-500';
};

export function BossBattle({ 
  boss, 
  onAttack, 
  onViewDetails, 
  className, 
  showActions = true 
}: BossBattleProps) {
  const [isAttacking, setIsAttacking] = useState(false);
  const bossRank = getBossRank(boss.hpTotal);

  const handleAttack = async () => {
    if (!onAttack || boss.defeated || isAttacking) return;

    setIsAttacking(true);
    try {
      await onAttack(boss.id);
    } finally {
      setIsAttacking(false);
    }
  };

  const formatReward = (reward: Record<string, any>): string => {
    const parts: string[] = [];
    if (reward.xp) parts.push(`${reward.xp} XP`);
    if (reward.gold) parts.push(`${reward.gold} Gold`);
    if (reward.items) parts.push(`${reward.items.length} Items`);
    return parts.join(', ') || 'Unknown Rewards';
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      boss.defeated ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{bossRank.icon}</span>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {boss.bossName}
                {boss.defeated && <Badge className="bg-green-500">Defeated</Badge>}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={bossRank.color}>
                  {bossRank.rank} Boss
                </Badge>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <HeartIcon className="w-3 h-3" />
                  <span>{boss.hpCurrent}/{boss.hpTotal} HP</span>
                </div>
              </div>
            </div>
          </div>
          
          {boss.defeated && boss.defeatedAt && (
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                <span>Defeated</span>
              </div>
              <div>{new Date(boss.defeatedAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Boss Health</span>
            <span className={boss.defeated ? "text-green-600 font-bold" : ""}>
              {boss.defeated ? "DEFEATED!" : `${boss.healthPercentage}%`}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={boss.defeated ? 0 : boss.healthPercentage} 
              className="h-3" 
            />
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                boss.defeated ? "bg-gray-300" : getHealthColor(boss.healthPercentage)
              )}
              style={{ width: `${boss.defeated ? 100 : boss.healthPercentage}%` }}
            />
          </div>
        </div>

        {/* Damage Progress */}
        {!boss.defeated && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Damage Dealt</span>
              <span>{boss.progress}%</span>
            </div>
            <div className="relative">
              <Progress value={boss.progress} className="h-2" />
              <div 
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-500",
                  getDamageColor(boss.progress)
                )}
                style={{ width: `${boss.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Boss Weaknesses */}
        {boss.weakness.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <TargetIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Weaknesses:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {boss.weakness.map((weakness, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Strategies Tried */}
        {boss.strategiesTried.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <SwordIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Strategies Attempted:</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {boss.strategiesTried.length} different approaches tried
            </div>
          </div>
        )}

        {/* Defeat Rewards */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <TrophyIcon className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {boss.defeated ? "Rewards Earned:" : "Victory Rewards:"}
            </span>
          </div>
          <div className="text-sm text-yellow-700">
            {formatReward(boss.defeatReward)}
          </div>
        </div>

        {/* Battle Status Message */}
        {boss.defeated ? (
          <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="text-green-800 font-bold flex items-center justify-center gap-2">
              <StarIcon className="w-5 h-5" />
              VICTORY ACHIEVED!
              <StarIcon className="w-5 h-5" />
            </div>
            <p className="text-green-700 text-sm mt-1">
              You have conquered this challenge and grown stronger!
            </p>
          </div>
        ) : (
          <div className="text-center p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="text-red-800 font-medium flex items-center justify-center gap-2">
              <ShieldIcon className="w-4 h-4" />
              BOSS BATTLE ACTIVE
            </div>
            <p className="text-red-700 text-sm mt-1">
              This challenge requires your continued effort to overcome
            </p>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            {!boss.defeated && onAttack && (
              <Button 
                onClick={handleAttack}
                disabled={isAttacking}
                className="flex-1"
                variant="default"
              >
                {isAttacking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Attacking...
                  </>
                ) : (
                  <>
                    <SwordIcon className="w-4 h-4 mr-2" />
                    Attack Boss
                  </>
                )}
              </Button>
            )}

            {onViewDetails && (
              <Button 
                onClick={() => onViewDetails(boss.id)}
                variant="outline"
                className={!boss.defeated && onAttack ? "flex-1" : "w-full"}
              >
                View Details
              </Button>
            )}

            {boss.defeated && (
              <div className="flex-1 text-center py-2">
                <Badge className="bg-green-500 text-white px-4 py-2">
                  ✓ Challenge Completed
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}