'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MoodTrend {
  date: string;
  energy: number;
  focus: number;
  tags: string[];
}

interface MoodTrackerProps {
  trends?: MoodTrend[];
  averageEnergy?: string;
  averageFocus?: string;
  isLoading?: boolean;
}

export function MoodTracker({ trends, averageEnergy, averageFocus, isLoading }: MoodTrackerProps) {
  const getMoodColor = (value: number) => {
    if (value >= 8) return 'bg-green-500';
    if (value >= 6) return 'bg-green-400';
    if (value >= 4) return 'bg-yellow-400';
    if (value >= 2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getAverageLabel = (value: string) => {
    const num = parseFloat(value);
    if (num >= 8) return { label: 'Excellent', color: 'text-green-600' };
    if (num >= 6) return { label: 'Good', color: 'text-green-500' };
    if (num >= 4) return { label: 'Fair', color: 'text-yellow-600' };
    if (num >= 2) return { label: 'Poor', color: 'text-orange-600' };
    return { label: 'Very Low', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const energyLabel = getAverageLabel(averageEnergy || '0');
  const focusLabel = getAverageLabel(averageFocus || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Mood Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">{averageEnergy || '0'}</div>
            <div className="text-sm text-muted-foreground">Avg Energy</div>
            <Badge variant="outline" className={energyLabel.color}>
              {energyLabel.label}
            </Badge>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">{averageFocus || '0'}</div>
            <div className="text-sm text-muted-foreground">Avg Focus</div>
            <Badge variant="outline" className={focusLabel.color}>
              {focusLabel.label}
            </Badge>
          </div>
        </div>

        {/* Mood Timeline */}
        {trends && trends.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Recent Mood History</h3>
            <div className="space-y-2">
              {trends.slice(0, 7).map((trend, index) => (
                <div key={trend.date} className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground w-16">
                    {new Date(trend.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  {/* Energy bar */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Energy</span>
                      <span>{trend.energy}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getMoodColor(trend.energy)}`}
                        style={{ width: `${(trend.energy / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Focus bar */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Focus</span>
                      <span>{trend.focus}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getMoodColor(trend.focus)}`}
                        style={{ width: `${(trend.focus / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Mood Tags */}
        {trends && trends.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Recent Moods</h3>
            <div className="flex flex-wrap gap-2">
              {trends
                .slice(0, 5)
                .flatMap(trend => trend.tags)
                .filter((tag, index, arr) => arr.indexOf(tag) === index)
                .slice(0, 8)
                .map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}