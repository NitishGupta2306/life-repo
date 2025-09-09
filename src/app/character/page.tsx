'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterProfile } from '@/components/character/CharacterProfile';
import { ResourceBar } from '@/components/character/ResourceBar';
import { StatCard } from '@/components/character/StatCard';
import { LevelProgress } from '@/components/character/LevelProgress';
import { User, TrendingUp, Zap, Brain, Heart, Target } from 'lucide-react';

interface CharacterProfileData {
  id: string;
  characterName: string;
  characterLevel: number;
  totalXp: number;
  characterClass: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastLogin: string | null;
}

interface CharacterStatData {
  id: string;
  statName: string;
  baseValue: number;
  currentValue: number;
  maxValue: number;
  statCategory: 'primary' | 'secondary' | 'special';
  updatedAt: string;
}

interface CharacterResourceData {
  id: string;
  resourceType: 'energy' | 'focus' | 'motivation' | 'spoons';
  currentValue: number;
  maxValue: number;
  regenRate: number;
  lastUpdated: string;
}

interface LevelInfoData {
  currentLevel: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  nextLevelXp: number;
}

interface CharacterData {
  profile: CharacterProfileData;
  stats: CharacterStatData[];
  resources: CharacterResourceData[];
  levelInfo: LevelInfoData;
}

export default function CharacterDashboard() {
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacterData();
  }, []);

  const loadCharacterData = async () => {
    try {
      setLoading(true);
      
      // Fetch all character data concurrently
      const [profileRes, statsRes, resourcesRes, levelRes] = await Promise.all([
        fetch('/api/character/profile'),
        fetch('/api/character/stats'),
        fetch('/api/character/resources'),
        fetch('/api/character/level-up')
      ]);

      if (!profileRes.ok || !statsRes.ok || !resourcesRes.ok || !levelRes.ok) {
        throw new Error('Failed to fetch character data');
      }

      const profile = await profileRes.json();
      const stats = await statsRes.json();
      const resources = await resourcesRes.json();
      const levelInfo = await levelRes.json();

      setCharacterData({
        profile,
        stats,
        resources,
        levelInfo
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-slate-700 rounded-xl"></div>
              <div className="h-96 bg-slate-700 rounded-xl"></div>
              <div className="h-96 bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Character</CardTitle>
              <CardDescription className="text-red-300">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadCharacterData} variant="outline" className="border-red-500/50 hover:bg-red-500/20">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!characterData) return null;

  const { profile, stats, resources, levelInfo } = characterData;

  // Organize stats by category
  const primaryStats = stats.filter((s) => s.statCategory === 'primary');
  const secondaryStats = stats.filter((s) => s.statCategory === 'secondary');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Character Dashboard</h1>
                <p className="text-slate-400">Level {profile.characterLevel} {profile.characterClass}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {profile.characterName}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/30">
              Overview
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600/30">
              Stats & Progression
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600/30">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top Row - Character Profile and Level Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CharacterProfile profile={profile} />
              <LevelProgress levelInfo={levelInfo} />
            </div>

            {/* Resources Row */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Current Resources
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your vital life energies and capacities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {resources.map((resource) => (
                    <ResourceBar key={resource.id} resource={resource} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Preview */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Core Stats Overview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your primary character attributes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {primaryStats.slice(0, 6).map((stat) => (
                    <div key={stat.id} className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{stat.currentValue}</div>
                      <div className="text-sm text-slate-400">{stat.statName}</div>
                      <div className="w-full bg-slate-600/50 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(stat.currentValue / stat.maxValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Primary Stats */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  Primary Stats
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Core character attributes that define your capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {primaryStats.map((stat) => (
                    <StatCard key={stat.id} stat={stat} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Stats */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-400" />
                  Secondary Stats
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Specialized skills and abilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {secondaryStats.map((stat) => (
                    <StatCard key={stat.id} stat={stat} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      {resource.resourceType === 'energy' && <Zap className="h-5 w-5 text-yellow-400" />}
                      {resource.resourceType === 'focus' && <Brain className="h-5 w-5 text-blue-400" />}
                      {resource.resourceType === 'motivation' && <Heart className="h-5 w-5 text-red-400" />}
                      {resource.resourceType === 'spoons' && <Target className="h-5 w-5 text-green-400" />}
                      {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Current: {resource.currentValue} / {resource.maxValue} 
                      (Regen: +{resource.regenRate}/hour)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResourceBar resource={resource} showDetails />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}