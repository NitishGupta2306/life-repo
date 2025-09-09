'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Star, TrendingUp, CheckCircle2, Circle } from 'lucide-react';

interface SkillTreeProps {
  tree: {
    id: string;
    treeName: string;
    treeLevel: number;
    skillPointsAvailable: number;
    colorHex: string;
  };
  skills: Array<{
    id: string;
    skillName: string;
    skillLevel: number;
    currentXp: number;
    xpToNextLevel: number;
    skillRank: string;
    unlocked: boolean;
    prerequisites: string[];
  }>;
  onSkillUpdate: () => void;
}

export function SkillTree({ tree, skills, onSkillUpdate }: SkillTreeProps) {
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'novice':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'apprentice':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'journeyman':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'expert':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'master':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'grandmaster':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSkillIcon = (skillName: string, unlocked: boolean, level: number) => {
    if (!unlocked) return <Lock className="h-5 w-5 text-gray-500" />;
    if (level === 0) return <Circle className="h-5 w-5 text-gray-400" />;
    if (level >= 5) return <Star className="h-5 w-5 text-yellow-400" />;
    return <CheckCircle2 className="h-5 w-5 text-green-400" />;
  };

  const getSkillDescription = (skillName: string) => {
    const descriptions: Record<string, string> = {
      'Morning Routine': 'Consistent daily start routine that sets the tone for productive days',
      'Exercise Consistency': 'Regular physical activity and fitness maintenance',
      'Nutrition Planning': 'Meal planning and healthy eating habits',
      'Sleep Optimization': 'Quality sleep patterns and sleep hygiene',
      'Time Management': 'Effective planning and scheduling of tasks and activities',
      'Budget Planning': 'Financial planning and expense management',
      'Skill Development': 'Learning new abilities and advancing expertise',
      'Networking': 'Building and maintaining professional relationships',
      'Focus Techniques': 'Methods to improve concentration and attention span',
      'Executive Function': 'Planning, organization, and task management skills',
      'Emotional Regulation': 'Managing emotions and stress responses',
      'Sensory Management': 'Handling sensory input and environmental factors',
      'Foundation Skills': 'Basic abilities required for this life domain',
      'Intermediate Skills': 'More advanced capabilities in this area',
    };
    return descriptions[skillName] || 'Skill in the ' + tree.treeName.toLowerCase() + ' domain';
  };

  const unlockSkill = async (skillId: string) => {
    // This would typically make an API call to unlock the skill
    console.log('Unlocking skill:', skillId);
    // For now, just refresh the skills
    onSkillUpdate();
  };

  const levelUpSkill = async (skillId: string) => {
    // This would typically make an API call to level up the skill
    console.log('Leveling up skill:', skillId);
    // For now, just refresh the skills
    onSkillUpdate();
  };

  // Separate skills by unlock status
  const unlockedSkills = skills.filter(skill => skill.unlocked);
  const lockedSkills = skills.filter(skill => !skill.unlocked);

  return (
    <div className="space-y-6">
      {/* Unlocked Skills */}
      {unlockedSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Unlock className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Active Skills</h3>
            <Badge variant="outline" className="border-green-500/30 text-green-300">
              {unlockedSkills.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedSkills.map((skill) => {
              const progressPercent = skill.xpToNextLevel > 0 
                ? Math.round((skill.currentXp / (skill.currentXp + skill.xpToNextLevel)) * 100)
                : 100;
              
              return (
                <Card 
                  key={skill.id} 
                  className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all"
                  style={{
                    boxShadow: `0 0 10px ${tree.colorHex}20`
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSkillIcon(skill.skillName, skill.unlocked, skill.skillLevel)}
                        <CardTitle className="text-white text-base">{skill.skillName}</CardTitle>
                      </div>
                      <Badge className={getRankColor(skill.skillRank)}>
                        {skill.skillRank}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400 text-sm">
                      {getSkillDescription(skill.skillName)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Level Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">Level {skill.skillLevel}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">
                          {skill.currentXp} / {skill.currentXp + skill.xpToNextLevel} XP
                        </div>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="space-y-2">
                      <Progress 
                        value={progressPercent} 
                        className="h-2 bg-slate-600/50" 
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{progressPercent}% to next level</span>
                        <span>{skill.xpToNextLevel} XP needed</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {skill.skillLevel < 10 && (
                      <Button
                        size="sm"
                        onClick={() => levelUpSkill(skill.id)}
                        className="w-full"
                        style={{
                          backgroundColor: `${tree.colorHex}30`,
                          borderColor: `${tree.colorHex}50`,
                          color: tree.colorHex
                        }}
                        variant="outline"
                      >
                        Practice Skill (+XP)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Skills */}
      {lockedSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Locked Skills</h3>
            <Badge variant="outline" className="border-red-500/30 text-red-300">
              {lockedSkills.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedSkills.map((skill) => (
              <Card 
                key={skill.id} 
                className="bg-slate-800/20 border-slate-700/30 opacity-75"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-gray-500" />
                      <CardTitle className="text-gray-300 text-base">{skill.skillName}</CardTitle>
                    </div>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      Locked
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-500 text-sm">
                    {getSkillDescription(skill.skillName)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      Prerequisites: Complete foundation skills first
                    </div>
                    
                    {tree.skillPointsAvailable > 0 && (
                      <Button
                        size="sm"
                        onClick={() => unlockSkill(skill.id)}
                        className="w-full bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                        variant="outline"
                      >
                        Unlock (1 Skill Point)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {skills.length === 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Skills Available</h3>
            <p className="text-slate-400">
              Skills for this tree haven&apos;t been created yet. Check back later for updates!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}