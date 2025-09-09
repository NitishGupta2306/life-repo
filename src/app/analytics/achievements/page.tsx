'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementCard } from '@/components/analytics/AchievementCard';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Heart,
  Brain,
  Zap,
  Crown,
  TrendingUp,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface Achievement {
  id: string;
  achievementName: string;
  description: string;
  category: string;
  rarity: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent?: number;
  progressRequired?: number;
  xpBonus?: number;
  xpReward?: number;
}

interface AchievementData {
  achievements: {
    character: Achievement[];
    quest: Achievement[];
    social: Achievement[];
    exploration: Achievement[];
    legendary: Achievement[];
    adhd: {
      self_care: Achievement[];
      reflection: Achievement[];
      streak: Achievement[];
      combo: Achievement[];
      boss_defeat: Achievement[];
    };
  };
  stats: {
    totalAchievements: number;
    unlockedAchievements: number;
    totalXpEarned: number;
    completionPercentage: number;
    recentUnlocks: Achievement[];
  };
}

export default function AchievementsPage() {
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/achievements?includeProgress=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      
      if (data.success) {
        setAchievementData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load achievements');
      }

    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Award className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Achievements</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Achievements
            </h1>
            <p className="text-muted-foreground">
              Track your progress and celebrate milestones
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Stats */}
      {achievementData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {achievementData.stats.unlockedAchievements}
                  </div>
                  <div className="text-sm text-muted-foreground">Unlocked</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {achievementData.stats.totalAchievements}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {achievementData.stats.completionPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {achievementData.stats.totalXpEarned}
                  </div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      {achievementData && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Achievement Completion</span>
                <span className="font-medium">
                  {achievementData.stats.unlockedAchievements}/{achievementData.stats.totalAchievements}
                </span>
              </div>
              <Progress value={achievementData.stats.completionPercentage} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      {achievementData && (
        <Tabs defaultValue="character" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="character" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Character
            </TabsTrigger>
            <TabsTrigger value="quest" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Quest
            </TabsTrigger>
            <TabsTrigger value="adhd" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              ADHD
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="legendary" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Legendary
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementData.achievements.character.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quest" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementData.achievements.quest.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="adhd" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Self Care
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievementData.achievements.adhd.self_care.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Reflection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievementData.achievements.adhd.reflection.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Streaks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievementData.achievements.adhd.streak.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementData.achievements.social.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="legendary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementData.achievements.legendary.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementData.stats.recentUnlocks.length > 0 ? (
                achievementData.stats.recentUnlocks.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Recent Unlocks</h3>
                    <p className="text-muted-foreground text-sm">
                      Complete more quests and reflections to unlock achievements!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}