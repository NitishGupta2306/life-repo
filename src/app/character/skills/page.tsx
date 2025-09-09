'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SkillTree } from '@/components/character/SkillTree';
import { ArrowLeft, TreePine, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface SkillTreeData {
  id: string;
  treeName: string;
  treeLevel: number;
  totalTreeXp: number;
  skillPointsAvailable: number;
  masteryPercentage: string;
  isUnlocked: boolean;
  icon: string;
  colorHex: string;
}

interface SkillData {
  id: string;
  treeId: string;
  skillName: string;
  skillLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  skillRank: string;
  unlocked: boolean;
  prerequisites: string[];
}

export default function SkillsPage() {
  const [skillTrees, setSkillTrees] = useState<SkillTreeData[]>([]);
  const [selectedTree, setSelectedTree] = useState<SkillTreeData | null>(null);
  const [treeSkills, setTreeSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkillTrees();
  }, []);

  const loadSkillTrees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/character/skills');
      if (!response.ok) throw new Error('Failed to fetch skill trees');
      
      const trees = await response.json();
      setSkillTrees(trees);
      if (trees.length > 0) {
        setSelectedTree(trees[0]);
        loadTreeSkills(trees[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadTreeSkills = async (treeId: string) => {
    try {
      const response = await fetch('/api/character/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ treeId }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch tree skills');
      
      const skills = await response.json();
      setTreeSkills(skills);
    } catch (err) {
      console.error('Failed to load tree skills:', err);
    }
  };

  const selectTree = (tree: SkillTreeData) => {
    setSelectedTree(tree);
    loadTreeSkills(tree.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Skills</CardTitle>
              <CardDescription className="text-red-300">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadSkillTrees} variant="outline" className="border-red-500/50 hover:bg-red-500/20">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/character">
              <Button variant="outline" size="sm" className="border-green-500/30 hover:bg-green-500/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Character
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <TreePine className="h-8 w-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Skill Trees</h1>
                <p className="text-slate-400">Master the domains of life</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Skill Tree Selector */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/30 border-slate-700/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Life Domains</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose a skill tree to explore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skillTrees.map((tree) => (
                    <button
                      key={tree.id}
                      onClick={() => selectTree(tree)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTree?.id === tree.id
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tree.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{tree.treeName}</div>
                          <div className="text-xs text-slate-400">
                            Level {tree.treeLevel} • {tree.skillPointsAvailable} points
                          </div>
                        </div>
                        {tree.isUnlocked ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={parseFloat(tree.masteryPercentage)} 
                          className="h-1.5 bg-slate-600/50" 
                        />
                        <div className="text-xs text-slate-400 mt-1">
                          {tree.masteryPercentage}% Mastery
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Tree Details */}
          <div className="lg:col-span-3">
            {selectedTree ? (
              <div className="space-y-6">
                {/* Tree Overview */}
                <Card 
                  className="bg-slate-800/30 border-slate-700/50"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTree.colorHex}20, transparent)`,
                    borderColor: `${selectedTree.colorHex}40`
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedTree.icon}</span>
                        <div>
                          <CardTitle className="text-white">{selectedTree.treeName}</CardTitle>
                          <CardDescription className="text-slate-300">
                            Level {selectedTree.treeLevel} • {selectedTree.totalTreeXp} Total XP
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className="bg-green-500/20 text-green-300 border-green-500/30 mb-2"
                        >
                          {selectedTree.skillPointsAvailable} Skill Points
                        </Badge>
                        <div className="text-sm text-slate-400">
                          {selectedTree.masteryPercentage}% Mastery
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress 
                        value={parseFloat(selectedTree.masteryPercentage)} 
                        className="h-3 bg-slate-700/50" 
                      />
                      <p className="text-slate-300 text-sm">
                        This skill tree represents your growth and mastery in the {selectedTree.treeName.toLowerCase()} domain of life. 
                        Unlock and level up skills to increase your overall mastery and unlock new opportunities.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Grid */}
                <SkillTree 
                  tree={selectedTree} 
                  skills={treeSkills} 
                  onSkillUpdate={() => loadTreeSkills(selectedTree.id)}
                />
              </div>
            ) : (
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <TreePine className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Skill Tree Selected</h3>
                  <p className="text-slate-400">
                    Choose a skill tree from the left panel to view your skills and progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}