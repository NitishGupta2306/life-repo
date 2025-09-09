"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Zap, 
  Brain, 
  Clock, 
  CheckCircle, 
  Coffee, 
  Droplets, 
  Utensils, 
  ShowerHead,
  Pill,
  Timer,
  Sparkles,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

interface BasicNeed {
  id: string;
  needName: string;
  needCategory: string;
  priority: string;
  lastCompleted: string | null;
  streakCount: number;
  isOverdue: boolean;
  xpReward: number;
}

interface SpoonResource {
  id: string;
  resourceType: string;
  currentValue: number;
  maxValue: number;
  regenRate: number;
}

interface ActiveBuff {
  id: string;
  buffName: string;
  buffType: string;
  stackCount: number;
  expiresAt: string;
  xpReward: number;
}

interface GentleReminder {
  id: string;
  reminderText: string;
  reminderType: string;
  priority: number;
}

export default function ADHDDashboard() {
  const [basicNeeds, setBasicNeeds] = useState<BasicNeed[]>([]);
  const [spoons, setSpoons] = useState<SpoonResource | null>(null);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [reminders, setReminders] = useState<GentleReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [needsResponse, spoonsResponse, buffsResponse, remindersResponse] = await Promise.all([
        fetch('/api/adhd/basic-needs'),
        fetch('/api/adhd/spoons'),
        fetch('/api/adhd/buffs'),
        fetch('/api/adhd/reminders')
      ]);

      const [needsData, spoonsData, buffsData, remindersData] = await Promise.all([
        needsResponse.json(),
        spoonsResponse.json(),
        buffsResponse.json(),
        remindersResponse.json()
      ]);

      setBasicNeeds(needsData.needs || []);
      setSpoons(spoonsData.spoons);
      setActiveBuffs(buffsData.activeBuffs || []);
      setReminders(remindersData.activeReminders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeNeed = async (needId: string) => {
    try {
      await fetch('/api/adhd/basic-needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needId })
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error completing need:', error);
    }
  };

  const createEncouragement = async () => {
    try {
      await fetch('/api/adhd/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_encouragement' })
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating encouragement:', error);
    }
  };

  const getNeedIcon = (category: string) => {
    switch (category) {
      case 'hygiene': return <ShowerHead className="h-5 w-5" />;
      case 'nutrition': return <Utensils className="h-5 w-5" />;
      case 'hydration': return <Droplets className="h-5 w-5" />;
      case 'medication': return <Pill className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getSpoonColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your ADHD support dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            ADHD Support Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Gentle tools to support your daily needs and energy management
          </p>
        </div>
        <Button onClick={createEncouragement} variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Need encouragement?
        </Button>
      </div>

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <Alert key={reminder.id} className="bg-blue-50 border-blue-200">
              <MessageCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                {reminder.reminderText}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="needs">Daily Needs</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Spoon Counter */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Energy Spoons</CardTitle>
                <Zap className={`h-4 w-4 ${spoons ? getSpoonColor(spoons.currentValue, spoons.maxValue) : 'text-gray-400'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {spoons ? `${spoons.currentValue}/${spoons.maxValue}` : '0/12'}
                </div>
                <Progress 
                  value={spoons ? (spoons.currentValue / spoons.maxValue) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {spoons ? `${Math.round((spoons.currentValue / spoons.maxValue) * 100)}% energy available` : 'Loading...'}
                </p>
              </CardContent>
            </Card>

            {/* Basic Needs Completion */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Needs</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {basicNeeds.filter(n => !n.isOverdue).length}/{basicNeeds.length}
                </div>
                <Progress 
                  value={basicNeeds.length > 0 ? (basicNeeds.filter(n => !n.isOverdue).length / basicNeeds.length) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Completed today
                </p>
              </CardContent>
            </Card>

            {/* Active Buffs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Buffs</CardTitle>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {activeBuffs.length}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeBuffs.slice(0, 3).map((buff) => (
                    <Badge key={buff.id} variant="secondary" className="text-xs">
                      {buff.buffName}
                    </Badge>
                  ))}
                  {activeBuffs.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{activeBuffs.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Focus Sessions Today */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
                <Timer className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  0m
                </div>
                <p className="text-xs text-muted-foreground">
                  Today&apos;s focus sessions
                </p>
                <Link href="/adhd/focus">
                  <Button size="sm" className="w-full mt-2">
                    Start Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Fast access to your most used ADHD support tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/adhd/focus">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Timer className="h-6 w-6" />
                    <span className="text-sm">Focus Timer</span>
                  </Button>
                </Link>
                <Link href="/adhd/needs">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Heart className="h-6 w-6" />
                    <span className="text-sm">Daily Needs</span>
                  </Button>
                </Link>
                <Link href="/adhd/spoons">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Zap className="h-6 w-6" />
                    <span className="text-sm">Spoon Tracker</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full h-20 flex-col gap-2"
                  onClick={createEncouragement}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-sm">Get Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs" className="space-y-4">
          {/* Basic Needs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicNeeds.map((need) => (
              <Card key={need.id} className={need.isOverdue ? 'border-orange-200 bg-orange-50' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getNeedIcon(need.needCategory)}
                    {need.needName}
                  </CardTitle>
                  <Badge variant={need.isOverdue ? 'destructive' : 'secondary'}>
                    {need.priority}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Streak: {need.streakCount} days
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{need.xpReward} XP when completed
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => completeNeed(need.id)}
                      disabled={!need.isOverdue && need.lastCompleted && 
                        new Date(need.lastCompleted).toDateString() === new Date().toDateString()
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          {/* Spoon Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Spoon Energy Management
              </CardTitle>
              <CardDescription>
                Track and manage your daily energy using the spoon theory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {spoons && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {spoons.currentValue} / {spoons.maxValue} spoons
                    </span>
                    <div className="text-sm text-muted-foreground">
                      Regeneration: {spoons.regenRate}/hour
                    </div>
                  </div>
                  <Progress 
                    value={(spoons.currentValue / spoons.maxValue) * 100} 
                    className="h-4"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetch('/api/adhd/spoons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'spend', amount: 1 })
                      }).then(() => fetchDashboardData())}
                    >
                      -1 Spoon
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetch('/api/adhd/spoons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'recover', amount: 1 })
                      }).then(() => fetchDashboardData())}
                    >
                      +1 Spoon
                    </Button>
                    <Link href="/adhd/spoons">
                      <Button size="sm" className="w-full">
                        Full Tracker
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          {/* Focus Session Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Focus Sessions
              </CardTitle>
              <CardDescription>
                Start a focus session to improve concentration and track productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/adhd/focus?type=pomodoro">
                  <Button className="w-full h-20 flex-col gap-2">
                    <Coffee className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Pomodoro</div>
                      <div className="text-xs opacity-90">25 min focus</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/adhd/focus?type=deep_work">
                  <Button className="w-full h-20 flex-col gap-2" variant="secondary">
                    <Brain className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Deep Work</div>
                      <div className="text-xs opacity-70">90 min focus</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/adhd/focus?type=break">
                  <Button className="w-full h-20 flex-col gap-2" variant="outline">
                    <Clock className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Break Timer</div>
                      <div className="text-xs opacity-70">5-15 min rest</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}