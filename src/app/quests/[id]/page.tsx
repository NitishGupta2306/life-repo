'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProgressBar } from '@/components/quests/ProgressBar';
import { ObjectiveItem } from '@/components/quests/ObjectiveItem';
import { RewardDisplay } from '@/components/quests/RewardDisplay';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  EditIcon, 
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { Quest } from '@/database/schema';

type QuestWithDetails = Quest & {
  objectives: Array<{
    id: string;
    objectiveText: string;
    isCompleted: boolean;
    isRequired: boolean;
    xpReward: number;
  }>;
  progress: number;
  totalObjectives: number;
  completedObjectives: number;
};

const difficultyColors = {
  trivial: 'bg-gray-100 text-gray-800',
  easy: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  hard: 'bg-orange-100 text-orange-800',
  legendary: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  available: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  abandoned: 'bg-orange-100 text-orange-800',
};

const questTypeIcons = {
  main: '⚡',
  side: '⭐',
  daily: '🔄',
  weekly: '📅',
  epic: '🏆',
};

export default function QuestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const questId = params.id as string;

  const [quest, setQuest] = useState<QuestWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuest = async () => {
    try {
      const response = await fetch(`/api/quests/${questId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuest(data.data);
      } else {
        console.error('Failed to fetch quest:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch quest:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questId) {
      fetchQuest();
    }
  }, [questId]);

  const handleStartQuest = async () => {
    setActionLoading('start');
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        await fetchQuest();
      }
    } catch (error) {
      console.error('Failed to start quest:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteQuest = async () => {
    setActionLoading('complete');
    try {
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchQuest();
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteObjective = async (objectiveId: string) => {
    try {
      const response = await fetch(`/api/quests/objectives/${objectiveId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchQuest();
      }
    } catch (error) {
      console.error('Failed to complete objective:', error);
    }
  };

  const handleAbandonQuest = async () => {
    if (!confirm('Are you sure you want to abandon this quest? This action cannot be undone.')) {
      return;
    }

    setActionLoading('abandon');
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'abandoned' }),
      });

      if (response.ok) {
        router.push('/quests');
      }
    } catch (error) {
      console.error('Failed to abandon quest:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimeLimit = (timeLimit: string | null) => {
    if (!timeLimit) return null;
    const match = timeLimit.match(/(\d+) days?/);
    if (match) {
      const days = parseInt(match[1]);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return timeLimit;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="text-2xl font-bold mb-2">Quest Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The quest you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/quests')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Quest Board
        </Button>
      </div>
    );
  }

  const canStart = quest.status === 'available';
  const canComplete = quest.status === 'active' && quest.progress === 100;
  const isActive = quest.status === 'active';
  const isCompleted = quest.status === 'completed';
  const canManageObjectives = isActive && !isCompleted;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{questTypeIcons[quest.questType]}</span>
            <Badge className={difficultyColors[quest.difficulty]}>
              {quest.difficulty}
            </Badge>
            <Badge className={statusColors[quest.status]}>
              {quest.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{quest.questName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quest Description */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {quest.questDescription || 'No description provided for this quest.'}
              </p>
            </CardContent>
          </Card>

          {/* Progress */}
          {quest.totalObjectives > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar
                  value={quest.completedObjectives}
                  max={quest.totalObjectives}
                  showLabel={true}
                  label="Objectives Completed"
                  size="lg"
                />
                <div className="text-center mt-4">
                  <span className="text-2xl font-bold">{quest.progress}%</span>
                  <span className="text-muted-foreground ml-2">Complete</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Objectives */}
          {quest.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quest Objectives</span>
                  <span className="text-sm text-muted-foreground">
                    {quest.completedObjectives}/{quest.totalObjectives} completed
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quest.objectives.map((objective) => (
                    <ObjectiveItem
                      key={objective.id}
                      objective={objective}
                      onComplete={canManageObjectives ? handleCompleteObjective : undefined}
                      disabled={!canManageObjectives}
                      showActions={canManageObjectives}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quest Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canStart && (
                <Button 
                  onClick={handleStartQuest}
                  disabled={actionLoading === 'start'}
                  className="w-full"
                >
                  {actionLoading === 'start' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Start Quest
                    </>
                  )}
                </Button>
              )}

              {canComplete && (
                <Button 
                  onClick={handleCompleteQuest}
                  disabled={actionLoading === 'complete'}
                  className="w-full"
                >
                  {actionLoading === 'complete' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Complete Quest
                    </>
                  )}
                </Button>
              )}

              {isActive && (
                <Button 
                  onClick={handleAbandonQuest}
                  disabled={actionLoading === 'abandon'}
                  variant="destructive"
                  className="w-full"
                >
                  {actionLoading === 'abandon' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Abandoning...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Abandon Quest
                    </>
                  )}
                </Button>
              )}

              {isCompleted && (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Quest Completed!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards */}
          <RewardDisplay
            xpReward={quest.xpReward}
            goldReward={quest.goldReward}
            skillTreeRewards={quest.skillTreeRewards as Record<string, any>}
            isCompleted={isCompleted}
          />

          {/* Quest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{quest.questType} Quest</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="capitalize">{quest.difficulty}</span>
              </div>

              {quest.timeLimit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit:</span>
                  <span>{formatTimeLimit(quest.timeLimit)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(quest.createdAt).toLocaleDateString()}</span>
              </div>

              {quest.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span>{new Date(quest.startedAt).toLocaleDateString()}</span>
                </div>
              )}

              {quest.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{new Date(quest.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}