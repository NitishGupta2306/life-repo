"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Plus, Minus, RotateCcw } from 'lucide-react';

interface SpoonResource {
  id: string;
  resourceType: string;
  currentValue: number;
  maxValue: number;
  regenRate: number;
  lastUpdated: string;
}

interface SpoonCounterProps {
  spoons: SpoonResource | null;
  onAdjust: (action: 'spend' | 'recover' | 'set', amount: number) => void;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function SpoonCounter({ 
  spoons, 
  onAdjust, 
  showControls = true, 
  size = 'medium' 
}: SpoonCounterProps) {
  const getSpoonColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpoonAdvice = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return "High energy! Great time for challenging tasks.";
    if (percentage > 60) return "Good energy level. Most activities are manageable.";
    if (percentage > 40) return "Moderate energy. Consider easier tasks.";
    if (percentage > 20) return "Low energy. Focus on essentials only.";
    return "Very low energy. Rest is necessary right now.";
  };

  const spoonPercentage = spoons ? (spoons.currentValue / spoons.maxValue) * 100 : 0;
  const colorClass = spoons ? getSpoonColor(spoons.currentValue, spoons.maxValue) : 'text-gray-400';

  if (size === 'small') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className={`h-5 w-5 ${colorClass}`} />
          <span className="font-bold">
            {spoons ? `${spoons.currentValue}/${spoons.maxValue}` : '0/12'}
          </span>
        </div>
        <Progress value={spoonPercentage} className="flex-1 h-2" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
          <Zap className={`${size === 'large' ? 'h-8 w-8' : 'h-6 w-6'} ${colorClass}`} />
          Energy Spoons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Count */}
        <div className="text-center">
          <div className={`font-bold ${
            size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-3xl' : 'text-2xl'
          } ${colorClass}`}>
            {spoons ? `${spoons.currentValue}/${spoons.maxValue}` : '0/12'}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {spoons ? getSpoonAdvice(spoons.currentValue, spoons.maxValue) : 'Loading...'}
          </p>
        </div>

        {/* Visual Spoon Representation */}
        <div className="space-y-3">
          {spoons && size !== 'small' && (
            <div className="flex flex-wrap gap-2 justify-center">
              {[...Array(Math.min(spoons.maxValue, 12))].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                    ${i < spoons.currentValue 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-gray-200 text-gray-400'
                    }`}
                  title={`Spoon ${i + 1}${i < spoons.currentValue ? ' (available)' : ' (used)'}`}
                >
                  🥄
                </div>
              ))}
            </div>
          )}
          
          <Progress value={spoonPercentage} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(spoonPercentage)}% energy remaining
          </p>
        </div>

        {/* Regeneration Info */}
        {spoons && (
          <div className="text-center text-xs text-muted-foreground">
            Regenerates {spoons.regenRate} spoon{spoons.regenRate !== 1 ? 's' : ''} per hour with rest
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAdjust('spend', 1)}
              disabled={!spoons || spoons.currentValue <= 0}
            >
              <Minus className="h-4 w-4 mr-1" />
              -1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAdjust('recover', 1)}
              disabled={!spoons || spoons.currentValue >= spoons.maxValue}
            >
              <Plus className="h-4 w-4 mr-1" />
              +1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAdjust('spend', 3)}
              disabled={!spoons || spoons.currentValue < 3}
            >
              <Minus className="h-4 w-4 mr-1" />
              -3
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAdjust('set', spoons?.maxValue || 12)}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        )}

        {/* Energy Status Messages */}
        {spoons && (
          <div className={`p-3 rounded-lg text-sm ${
            spoons.currentValue <= 2 ? 'bg-red-50 text-red-800 border border-red-200' :
            spoons.currentValue <= 5 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {spoons.currentValue <= 2 && (
              <div>
                <strong>Low Energy Warning:</strong> Consider resting or doing only essential tasks. 
                Your wellbeing comes first. 💙
              </div>
            )}
            {spoons.currentValue > 2 && spoons.currentValue <= 5 && (
              <div>
                <strong>Moderate Energy:</strong> Good time for routine tasks. 
                Save energy for what matters most.
              </div>
            )}
            {spoons.currentValue > 5 && (
              <div>
                <strong>Good Energy:</strong> You're feeling energized! 
                This might be a good time for challenging tasks.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}