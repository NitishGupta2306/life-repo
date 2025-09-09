'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, Brain, Heart, Target, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface ResourceBarProps {
  resource: {
    id: string;
    resourceType: 'energy' | 'focus' | 'motivation' | 'spoons';
    currentValue: number;
    maxValue: number;
    regenRate: number;
    lastUpdated: string;
  };
  showDetails?: boolean;
}

export function ResourceBar({ resource, showDetails = false }: ResourceBarProps) {
  const [currentValue, setCurrentValue] = useState(resource.currentValue);
  const [updating, setUpdating] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'energy':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'focus':
        return <Brain className="h-4 w-4 text-blue-400" />;
      case 'motivation':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'spoons':
        return <Target className="h-4 w-4 text-green-400" />;
      default:
        return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'energy':
        return 'from-yellow-500 to-orange-500';
      case 'focus':
        return 'from-blue-500 to-purple-500';
      case 'motivation':
        return 'from-red-500 to-pink-500';
      case 'spoons':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getResourceDescription = (type: string) => {
    switch (type) {
      case 'energy':
        return 'Physical and mental stamina for daily activities';
      case 'focus':
        return 'Ability to concentrate and maintain attention';
      case 'motivation':
        return 'Drive and enthusiasm for pursuing goals';
      case 'spoons':
        return 'ADHD/disability resource management units';
      default:
        return 'Life resource';
    }
  };

  const percentage = Math.round((currentValue / resource.maxValue) * 100);
  
  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const updateResource = async (newValue: number) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/character/resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: resource.resourceType,
          currentValue: newValue,
          maxValue: resource.maxValue,
        }),
      });

      if (response.ok) {
        setCurrentValue(newValue);
      }
    } catch (error) {
      console.error('Failed to update resource:', error);
    } finally {
      setUpdating(false);
    }
  };

  const adjustResource = (amount: number) => {
    const newValue = Math.max(0, Math.min(resource.maxValue, currentValue + amount));
    updateResource(newValue);
  };

  if (!showDetails) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.resourceType)}
            <span className="font-medium text-white capitalize">
              {resource.resourceType}
            </span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(percentage)}`}>
            {currentValue}/{resource.maxValue}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={percentage} 
            className="h-3 bg-slate-600/50" 
          />
          <div 
            className={`absolute inset-0 h-3 bg-gradient-to-r ${getResourceColor(resource.resourceType)} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>{percentage}%</span>
          <span>+{resource.regenRate}/hr</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getResourceIcon(resource.resourceType)}
          <span className="text-lg font-semibold text-white">
            {currentValue} / {resource.maxValue}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {getResourceDescription(resource.resourceType)}
        </p>
      </div>

      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-6 bg-slate-600/50" 
        />
        <div 
          className={`absolute inset-0 h-6 bg-gradient-to-r ${getResourceColor(resource.resourceType)} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {percentage}%
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => adjustResource(-10)}
          disabled={updating || currentValue <= 0}
          className="border-red-500/30 hover:bg-red-500/20 text-red-300"
        >
          <Minus className="h-3 w-3" />
          10
        </Button>
        
        <div className="text-center">
          <div className="text-xs text-slate-400">Regeneration</div>
          <div className="text-sm font-medium text-green-400">+{resource.regenRate}/hour</div>
        </div>

        <Button 
          size="sm" 
          variant="outline"
          onClick={() => adjustResource(10)}
          disabled={updating || currentValue >= resource.maxValue}
          className="border-green-500/30 hover:bg-green-500/20 text-green-300"
        >
          <Plus className="h-3 w-3" />
          10
        </Button>
      </div>

      <div className="text-center text-xs text-slate-400">
        Last updated: {new Date(resource.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}