'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Crown, Star, Calendar } from 'lucide-react';

interface CharacterProfileProps {
  profile: {
    id: string;
    characterName: string;
    characterLevel: number;
    totalXp: number;
    characterClass: string | null;
    avatarUrl: string | null;
    createdAt: string;
    lastLogin: string | null;
  };
}

export function CharacterProfile({ profile }: CharacterProfileProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getClassColor = (characterClass: string | null) => {
    switch (characterClass?.toLowerCase()) {
      case 'life explorer':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'productivity master':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'wellness warrior':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'creative genius':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-purple-500/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-purple-400" />
          Character Profile
        </CardTitle>
        <CardDescription className="text-slate-300">
          Your Life RPG identity and progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-purple-400/50">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.characterName} />
              <AvatarFallback className="bg-purple-500/20 text-purple-200 text-xl font-bold">
                {profile.characterName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
              <Crown className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{profile.characterName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getClassColor(profile.characterClass)} font-medium`}>
                {profile.characterClass || 'Adventurer'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2 text-slate-300">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">{profile.totalXp.toLocaleString()} Total XP</span>
            </div>
          </div>
        </div>

        {/* Level Display */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Current Level</div>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {profile.characterLevel}
                <span className="text-lg text-slate-400">years old</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Life Experience</div>
              <div className="text-lg font-semibold text-purple-300">
                {profile.characterLevel > 20 ? 'Experienced' : 
                 profile.characterLevel > 15 ? 'Developing' : 'Young'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <div className="text-sm text-slate-400">Member Since</div>
            <div className="text-sm font-medium text-white">{formatDate(profile.createdAt)}</div>
          </div>
          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
            <User className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-sm text-slate-400">Last Active</div>
            <div className="text-sm font-medium text-white">{formatDate(profile.lastLogin)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-purple-500/30 hover:bg-purple-500/20 text-purple-300"
          >
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600/50 hover:bg-slate-700/50"
          >
            Change Class
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}