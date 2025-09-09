'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BossBattle } from '@/components/quests/BossBattle';
import { 
  PlusIcon, 
  SearchIcon, 
  SwordIcon,
  ShieldIcon,
  TrophyIcon,
  SkullIcon
} from 'lucide-react';

type BossWithProgress = {
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
  progress: number;
  healthPercentage: number;
};

export default function BossBattlesPage() {
  const router = useRouter();
  const [bosses, setBosses] = useState<BossWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('active');

  const fetchBosses = async (defeated?: boolean) => {
    try {
      const params = new URLSearchParams();
      if (defeated !== undefined) params.append('defeated', defeated.toString());

      const response = await fetch(`/api/quests/boss-battles?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setBosses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch boss battles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defeated = selectedTab === 'defeated' ? true : selectedTab === 'active' ? false : undefined;
    fetchBosses(defeated);
  }, [selectedTab]);

  const handleAttackBoss = async (bossId: string) => {
    try {
      // This would typically damage the boss
      // For now, we'll simulate reducing HP by 10-20 points
      const boss = bosses.find(b => b.id === bossId);
      if (!boss) return;

      const damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
      const newHp = Math.max(0, boss.hpCurrent - damage);
      const defeated = newHp <= 0;

      // In a real implementation, this would be an API call
      // For now, we'll update locally and refetch
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const defeated_param = selectedTab === 'defeated' ? true : selectedTab === 'active' ? false : undefined;
      fetchBosses(defeated_param);

    } catch (error) {
      console.error('Failed to attack boss:', error);
    }
  };

  const handleViewBossDetails = (bossId: string) => {
    // In a full implementation, this would navigate to a detailed boss view
    console.log('View boss details:', bossId);
  };

  const handleCreateBoss = () => {
    // In a full implementation, this would open a boss creation modal/page
    console.log('Create new boss battle');
  };

  // Filter bosses by search query
  const filteredBosses = bosses.filter(boss =>
    boss.bossName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group bosses by status
  const groupedBosses = {
    active: filteredBosses.filter(b => !b.defeated),
    defeated: filteredBosses.filter(b => b.defeated),
    all: filteredBosses,
  };

  const getBossCounts = () => ({
    active: bosses.filter(b => !b.defeated).length,
    defeated: bosses.filter(b => b.defeated).length,
    total: bosses.length,
  });

  const counts = getBossCounts();

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
            <SkullIcon className="w-8 h-8 text-red-600" />
            Boss Battles
          </h1>
          <p className="text-muted-foreground">
            Conquer major life challenges and epic obstacles
          </p>
        </div>
        <Button onClick={handleCreateBoss} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Boss Battle
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search boss battles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Boss Battle Tabs */}
      <Tabs defaultValue="active" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <SwordIcon className="w-4 h-4" />
            Active Battles
            {counts.active > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="defeated" className="flex items-center gap-2">
            <TrophyIcon className="w-4 h-4" />
            Defeated
            {counts.defeated > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.defeated}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ShieldIcon className="w-4 h-4" />
            All Battles
            {counts.total > 0 && (
              <Badge variant="secondary" className="text-xs">
                {counts.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedBosses).map(([status, bossList]) => (
          <TabsContent key={status} value={status} className="mt-6">
            {bossList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {status === 'active' && '⚔️'}
                  {status === 'defeated' && '🏆'}
                  {status === 'all' && '🛡️'}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No {status} boss battles found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {status === 'active' && "No active boss battles. Create epic challenges to overcome!"}
                  {status === 'defeated' && "No victories yet. Defeat your first boss to see them here!"}
                  {status === 'all' && "No boss battles found. Create your first epic challenge!"}
                </p>
                <Button onClick={handleCreateBoss}>
                  Create Your First Boss Battle
                </Button>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Battles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <SwordIcon className="w-5 h-5 text-red-600" />
                        <span className="text-2xl font-bold">{counts.active}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Victories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-600" />
                        <span className="text-2xl font-bold">{counts.defeated}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Win Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <ShieldIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold">
                          {counts.total > 0 ? Math.round((counts.defeated / counts.total) * 100) : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Boss Battles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {bossList.map((boss) => (
                    <BossBattle
                      key={boss.id}
                      boss={boss}
                      onAttack={!boss.defeated ? handleAttackBoss : undefined}
                      onViewDetails={handleViewBossDetails}
                      showActions={true}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}