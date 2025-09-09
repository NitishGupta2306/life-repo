"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import { CharacterCreation } from "@/components/character/CharacterCreation";
import { formatLevel, formatXP, calculateXPProgress, formatResourceValue, getResourceColor } from "@/lib/utils";

const mockQuests = [
  { id: 1, title: "Complete morning routine", status: "in_progress", type: "daily", xp: 50 },
  { id: 2, title: "Finish project documentation", status: "pending", type: "main", xp: 200 },
  { id: 3, title: "Take a mindful break", status: "pending", type: "self_care", xp: 25 },
];

const mockAchievements = [
  "Consistent Morning Routine - 7 Days",
  "Focus Session Master - 25 Sessions",
  "Quest Completionist - 100 Quests",
];

const mockReflectionStreak = 14;

export default function Home() {
  const { session, isLoading, needsCharacterCreation, createCharacter } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-4">Loading your Life RPG...</div>
          <div className="animate-pulse w-16 h-16 bg-primary/20 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session || needsCharacterCreation) {
    return <CharacterCreation onComplete={createCharacter} />;
  }

  const xpProgress = calculateXPProgress(session.character.totalXp, session.character.characterLevel);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Welcome to Your Life RPG
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your daily life into an epic adventure. Level up through real-world achievements, 
          manage your energy like a true RPG hero, and complete quests that matter.
        </p>
      </section>

      {/* Character Overview */}
      <section>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{session.character.characterName}</CardTitle>
                <CardDescription>{session.character.characterClass} • {formatLevel(session.character.characterLevel)}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-yellow-600">{formatXP(session.character.totalXp)}</div>
                <div className="text-sm text-muted-foreground">Total Experience</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level Progress</span>
                <span>{xpProgress.current} / {xpProgress.current + xpProgress.needed} XP</span>
              </div>
              <Progress value={xpProgress.percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Resource Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getResourceColor(session.resources.currentValue, session.resources.maxValue)}`}>
                  {formatResourceValue(session.resources.currentValue, session.resources.maxValue)}
                </div>
                <div className="text-sm text-muted-foreground capitalize">{session.resources.resourceType}</div>
                <Progress value={(session.resources.currentValue / session.resources.maxValue) * 100} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getResourceColor(60)}`}>
                  {formatResourceValue(60)}
                </div>
                <div className="text-sm text-muted-foreground">Focus</div>
                <Progress value={60} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getResourceColor(85)}`}>
                  {formatResourceValue(85)}
                </div>
                <div className="text-sm text-muted-foreground">Motivation</div>
                <Progress value={85} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getResourceColor(4, 8)}`}>
                  {formatResourceValue(4, 8)}
                </div>
                <div className="text-sm text-muted-foreground">Spoons</div>
                <Progress 
                  value={(4 / 8) * 100} 
                  className="mt-2 h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System Navigation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Life RPG Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/character">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Character
                </CardTitle>
                <CardDescription>
                  View your stats, level progression, and character development
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/quests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  Quest Board
                </CardTitle>
                <CardDescription>
                  Manage your daily quests, main objectives, and boss battles
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/adhd-support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  ADHD Support
                </CardTitle>
                <CardDescription>
                  Spoon theory, focus sessions, and gentle life management
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/brain-dump">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🧩</span>
                  Brain Dump
                </CardTitle>
                <CardDescription>
                  AI-powered thought processing and quest generation
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/reflections">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Analytics
                </CardTitle>
                <CardDescription>
                  Track progress, patterns, and personal insights
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/achievements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Achievements
                </CardTitle>
                <CardDescription>
                  Unlock rewards and celebrate your victories
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/skills">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🌟</span>
                  Skill Trees
                </CardTitle>
                <CardDescription>
                  Develop your abilities and unlock new potential
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  Settings
                </CardTitle>
                <CardDescription>
                  Customize your Life RPG experience
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Daily Dashboard */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priorities */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Priorities</CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockQuests.map((quest) => (
              <div key={quest.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{quest.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {quest.type} • {quest.xp} XP
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  quest.status === 'completed' ? 'bg-green-100 text-green-800' :
                  quest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quest.status.replace('_', ' ')}
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              <Link href="/quests">View All Quests</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest victories and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-medium">{achievement}</div>
                  <div className="text-sm text-muted-foreground">Unlocked recently</div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Reflection Streak</span>
                <span className="text-2xl font-bold text-green-600">{mockReflectionStreak} days</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <Link href="/achievements">View All Achievements</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your most important activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="h-16">
                <Link href="/quests/new">
                  <div className="text-center">
                    <div className="text-2xl">➕</div>
                    <div className="text-xs">New Quest</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild className="h-16" variant="outline">
                <Link href="/brain-dump">
                  <div className="text-center">
                    <div className="text-2xl">🧠</div>
                    <div className="text-xs">Brain Dump</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild className="h-16" variant="outline">
                <Link href="/adhd-support/focus">
                  <div className="text-center">
                    <div className="text-2xl">⏰</div>
                    <div className="text-xs">Focus Session</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild className="h-16" variant="outline">
                <Link href="/reflections/daily">
                  <div className="text-center">
                    <div className="text-2xl">📝</div>
                    <div className="text-xs">Daily Reflection</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
