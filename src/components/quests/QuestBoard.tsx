'use client';

import React, { useState, useEffect } from 'react';
import { QuestCard } from './QuestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Quest } from '@/database/schema';

interface QuestBoardProps {
  onCreateQuest?: () => void;
  onViewQuest?: (questId: string) => void;
  className?: string;
}

type QuestWithDetails = Quest & {
  objectives: Array<{
    id: string;
    objectiveText: string;
    isCompleted: boolean;
    isRequired: boolean;
  }>;
  progress: number;
  totalObjectives: number;
  completedObjectives: number;
};

export function QuestBoard({ onCreateQuest, onViewQuest, className }: QuestBoardProps) {
  const [quests, setQuests] = useState<QuestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchQuests = async (filters: {
    status?: string;
    type?: string;
    difficulty?: string;
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);

      const response = await fetch(`/api/quests?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setQuests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests({
      status: selectedStatus,
      type: selectedType,
      difficulty: selectedDifficulty,
    });
  }, [selectedStatus, selectedType, selectedDifficulty]);

  const handleStartQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        fetchQuests({
          status: selectedStatus,
          type: selectedType,
          difficulty: selectedDifficulty,
        });
      }
    } catch (error) {
      console.error('Failed to start quest:', error);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchQuests({
          status: selectedStatus,
          type: selectedType,
          difficulty: selectedDifficulty,
        });
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handleAbandonQuest = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'abandoned' }),
      });

      if (response.ok) {
        fetchQuests({
          status: selectedStatus,
          type: selectedType,
          difficulty: selectedDifficulty,
        });
      }
    } catch (error) {
      console.error('Failed to abandon quest:', error);
    }
  };

  // Filter quests by search query
  const filteredQuests = quests.filter(quest =>
    quest.questName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quest.questDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group quests by status for the tabs
  const groupedQuests = {
    active: filteredQuests.filter(q => q.status === 'active'),
    available: filteredQuests.filter(q => q.status === 'available'),
    completed: filteredQuests.filter(q => q.status === 'completed'),
    all: filteredQuests,
  };

  const getQuestCounts = () => ({
    active: quests.filter(q => q.status === 'active').length,
    available: quests.filter(q => q.status === 'available').length,
    completed: quests.filter(q => q.status === 'completed').length,
    total: quests.length,
  });

  const counts = getQuestCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quest Board</h1>
          <p className="text-muted-foreground">
            Manage your life quests and track your progress
          </p>
        </div>
        {onCreateQuest && (
          <Button onClick={onCreateQuest} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            New Quest
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search quests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Quest Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="main">Main Quests</SelectItem>
            <SelectItem value="side">Side Quests</SelectItem>
            <SelectItem value="daily">Daily Quests</SelectItem>
            <SelectItem value="weekly">Weekly Quests</SelectItem>
            <SelectItem value="epic">Epic Quests</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            <SelectItem value="trivial">Trivial</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quest Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active
            {counts.active > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            Available
            {counts.available > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.available}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            Completed
            {counts.completed > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.completed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            {counts.total > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedQuests).map(([status, questList]) => (
          <TabsContent key={status} value={status} className="mt-6">
            {questList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {status === 'active' && '⚡'}
                  {status === 'available' && '📋'}
                  {status === 'completed' && '🏆'}
                  {status === 'all' && '📝'}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No {status} quests found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {status === 'active' && "You don't have any active quests. Start a new adventure!"}
                  {status === 'available' && "No quests available right now. Create your first quest!"}
                  {status === 'completed' && "No completed quests yet. Complete some quests to see them here!"}
                  {status === 'all' && "No quests found. Create your first quest to get started!"}
                </p>
                {onCreateQuest && (
                  <Button onClick={onCreateQuest}>
                    Create Your First Quest
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questList.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onStart={handleStartQuest}
                    onComplete={handleCompleteQuest}
                    onView={onViewQuest}
                    onAbandon={handleAbandonQuest}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}