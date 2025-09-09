'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DailyQuestCard } from '@/components/quests/DailyQuestCard';
import { 
  PlusIcon, 
  SearchIcon, 
  CalendarDaysIcon,
  FlameIcon,
  TrophyIcon,
  StarIcon,
  RefreshCwIcon
} from 'lucide-react';

type DailyQuestWithStatus = {
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

export default function DailyQuestsPage() {
  const router = useRouter();
  const [dailyQuests, setDailyQuests] = useState<DailyQuestWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestName, setNewQuestName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchDailyQuests = async () => {
    try {
      const response = await fetch('/api/quests/daily');
      const data = await response.json();
      
      if (data.success) {
        setDailyQuests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily quests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuests();
  }, []);

  const handleCompleteQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/quests/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          questId,
        }),
      });

      if (response.ok) {
        await fetchDailyQuests(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to complete daily quest:', error);
    }
  };

  const handleCreateQuest = async () => {
    if (!newQuestName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/quests/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          questName: newQuestName,
          xpReward: 10, // Default XP for daily quests
        }),
      });

      if (response.ok) {
        setNewQuestName('');
        setShowCreateForm(false);
        await fetchDailyQuests(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to create daily quest:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter quests by search query
  const filteredQuests = dailyQuests.filter(quest =>
    quest.questName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate completed and incomplete quests
  const incompleteQuests = filteredQuests.filter(q => !q.isCompletedToday);
  const completedQuests = filteredQuests.filter(q => q.isCompletedToday);

  // Calculate stats
  const stats = {
    totalQuests: dailyQuests.length,
    completedToday: completedQuests.length,
    completionRate: dailyQuests.length > 0 ? Math.round((completedQuests.length / dailyQuests.length) * 100) : 0,
    totalStreaks: dailyQuests.reduce((sum, q) => sum + q.currentStreak, 0),
    bestStreak: Math.max(0, ...dailyQuests.map(q => q.bestStreak)),
    activeStreaks: dailyQuests.filter(q => q.currentStreak > 0).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
            Daily Quests
          </h1>
          <p className="text-muted-foreground">
            Build lasting habits through daily quest completion
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Daily Quest
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold">
                {stats.completedToday}/{stats.totalQuests}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.completionRate}% complete
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FlameIcon className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">{stats.activeStreaks}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              habits on track
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.bestStreak}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              days achieved
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCwIcon className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalStreaks}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              combined days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Quest Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Daily Quest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter daily habit name (e.g., 'Morning exercise', 'Read for 20 minutes')..."
                value={newQuestName}
                onChange={(e) => setNewQuestName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateQuest()}
                className="flex-1"
              />
              <Button 
                onClick={handleCreateQuest}
                disabled={!newQuestName.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Quest'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Daily quests help you build consistent habits. They reset each day and reward streak building.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search daily quests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Daily Quests */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">
            {dailyQuests.length === 0 ? "No daily quests yet" : "No quests found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {dailyQuests.length === 0 
              ? "Create your first daily quest to start building lasting habits!"
              : "Try adjusting your search to find specific quests."
            }
          </p>
          {dailyQuests.length === 0 && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Daily Quest
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Incomplete Quests */}
          {incompleteQuests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Today's Quests</h2>
                <Badge variant="secondary">
                  {incompleteQuests.length} remaining
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incompleteQuests.map((quest) => (
                  <DailyQuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Completed Today</h2>
                <Badge className="bg-green-500">
                  {completedQuests.length} done
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedQuests.map((quest) => (
                  <DailyQuestCard
                    key={quest.id}
                    quest={quest}
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}