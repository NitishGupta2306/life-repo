"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, 
  BatteryLow, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface EnergyData {
  energy: number; // 1-10
  focus: number; // 1-10
  motivation: number; // 1-10
  spoons: { current: number; max: number };
  timestamp: Date;
}

interface EnergyMeterProps {
  energyData: EnergyData;
  showDetails?: boolean;
  size?: 'compact' | 'full';
  onUpdate?: (newData: Partial<EnergyData>) => void;
}

export default function EnergyMeter({ 
  energyData, 
  showDetails = true, 
  size = 'full',
  onUpdate 
}: EnergyMeterProps) {
  const { energy, focus, motivation, spoons } = energyData;
  
  // Calculate overall energy score (weighted average)
  const overallScore = Math.round((energy * 0.4 + focus * 0.3 + motivation * 0.3));
  const spoonPercentage = (spoons.current / spoons.max) * 100;

  const getEnergyStatus = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 6) return { label: 'Good', color: 'text-green-500', icon: TrendingUp };
    if (score >= 4) return { label: 'Moderate', color: 'text-yellow-500', icon: Zap };
    if (score >= 2) return { label: 'Low', color: 'text-orange-500', icon: TrendingDown };
    return { label: 'Very Low', color: 'text-red-500', icon: AlertTriangle };
  };

  const getSpoonStatus = (percentage: number) => {
    if (percentage >= 70) return { label: 'High Energy', color: 'text-green-600', icon: Battery };
    if (percentage >= 40) return { label: 'Moderate Energy', color: 'text-yellow-500', icon: Battery };
    return { label: 'Low Energy', color: 'text-red-500', icon: BatteryLow };
  };

  const getRecommendation = () => {
    if (overallScore >= 7 && spoonPercentage >= 60) {
      return {
        text: "Great energy! Perfect time for challenging tasks or important projects.",
        type: "positive"
      };
    } else if (overallScore >= 5 && spoonPercentage >= 40) {
      return {
        text: "Decent energy levels. Good for routine tasks and moderate activities.",
        type: "moderate"
      };
    } else if (overallScore >= 3 || spoonPercentage >= 20) {
      return {
        text: "Lower energy. Consider easier tasks, breaks, or self-care activities.",
        type: "caution"
      };
    } else {
      return {
        text: "Very low energy. Rest and recovery should be your priority right now.",
        type: "warning"
      };
    }
  };

  const status = getEnergyStatus(overallScore);
  const spoonStatus = getSpoonStatus(spoonPercentage);
  const recommendation = getRecommendation();
  const StatusIcon = status.icon;
  const SpoonIcon = spoonStatus.icon;

  if (size === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          <div>
            <div className="font-medium text-sm">Energy: {overallScore}/10</div>
            <div className="text-xs text-muted-foreground">{status.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SpoonIcon className={`h-5 w-5 ${spoonStatus.color}`} />
          <div className="text-right">
            <div className="font-medium text-sm">{spoons.current}/{spoons.max}</div>
            <div className="text-xs text-muted-foreground">spoons</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-6 w-6 ${status.color}`} />
          Current Energy Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${status.color}`}>
            {overallScore}/10
          </div>
          <Badge variant="outline" className={`${status.color.replace('text-', 'border-').replace('600', '200')} ${status.color.replace('text-', 'bg-').replace('600', '50')}`}>
            {status.label} Energy
          </Badge>
        </div>

        {/* Individual Metrics */}
        {showDetails && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Physical Energy</span>
                <span className="font-medium">{energy}/10</span>
              </div>
              <Progress value={energy * 10} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus</span>
                <span className="font-medium">{focus}/10</span>
              </div>
              <Progress value={focus * 10} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Motivation</span>
                <span className="font-medium">{motivation}/10</span>
              </div>
              <Progress value={motivation * 10} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <SpoonIcon className={`h-4 w-4 ${spoonStatus.color}`} />
                  Spoons Available
                </span>
                <span className="font-medium">{spoons.current}/{spoons.max}</span>
              </div>
              <Progress value={spoonPercentage} className="h-2" />
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className={`p-3 rounded-lg border ${
          recommendation.type === 'positive' ? 'bg-green-50 border-green-200' :
          recommendation.type === 'moderate' ? 'bg-blue-50 border-blue-200' :
          recommendation.type === 'caution' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${
            recommendation.type === 'positive' ? 'text-green-800' :
            recommendation.type === 'moderate' ? 'text-blue-800' :
            recommendation.type === 'caution' ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            💡 {recommendation.text}
          </p>
        </div>

        {/* Quick Update Buttons */}
        {onUpdate && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Quick Energy Update:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdate({ energy: Math.max(1, energy - 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Energy -1
              </button>
              <button
                onClick={() => onUpdate({ focus: Math.max(1, focus - 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Focus -1
              </button>
              <button
                onClick={() => onUpdate({ motivation: Math.max(1, motivation - 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Motivation -1
              </button>
              <button
                onClick={() => onUpdate({ energy: Math.min(10, energy + 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Energy +1
              </button>
              <button
                onClick={() => onUpdate({ focus: Math.min(10, focus + 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Focus +1
              </button>
              <button
                onClick={() => onUpdate({ motivation: Math.min(10, motivation + 1) })}
                className="p-2 text-xs border rounded hover:bg-muted"
              >
                Motivation +1
              </button>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {energyData.timestamp.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

// Sample energy tracking hook (would be moved to a separate hooks file)
export function useEnergyTracking() {
  const [energyData, setEnergyData] = React.useState<EnergyData>({
    energy: 5,
    focus: 5,
    motivation: 5,
    spoons: { current: 8, max: 12 },
    timestamp: new Date()
  });

  const updateEnergy = (updates: Partial<EnergyData>) => {
    setEnergyData(prev => ({
      ...prev,
      ...updates,
      timestamp: new Date()
    }));
  };

  // Could add persistence logic here (localStorage, API calls, etc.)
  
  return { energyData, updateEnergy };
}