'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReflectionForm } from '@/components/analytics/ReflectionForm';
import { StreakCounter } from '@/components/analytics/StreakCounter';
import { Calendar, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface DailyReflection {
  id: string;
  reflectionDate: string;
  morningIntention: string;
  eveningReflection: string;
  energyLevel: number;
  focusLevel: number;
  moodTags: string[];
  gratitudeList: string[];
  reflectionPrompt: string;
  isComplete: boolean;
  completedAt: string | null;
}

export default function DailyReflectionPage() {
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  const [recentReflections, setRecentReflections] = useState<DailyReflection[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch today's reflection and recent reflections
      const [todayResponse, recentResponse, statsResponse] = await Promise.all([
        fetch(`/api/analytics/daily-reflections?date=${today}`),
        fetch(`/api/analytics/daily-reflections?limit=7`),
        fetch('/api/analytics/progress-stats')
      ]);

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        if (todayData.success && todayData.data.length > 0) {
          setTodayReflection(todayData.data[0]);
        }
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        if (recentData.success) {
          setRecentReflections(recentData.data);
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setCurrentStreak(statsData.data.reflections.currentStreak);
        }
      }

    } catch (error) {
      console.error('Error fetching reflection data:', error);
      setError('Failed to load reflection data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReflection = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/analytics/daily-reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save reflection');
      }

      setTodayReflection(result.data);
      
      // Refresh the data to update streak and recent reflections
      await fetchData();

      // Show success message (you could add a toast notification here)
      console.log('Reflection saved successfully');

    } catch (error) {
      console.error('Error saving reflection:', error);
      setError('Failed to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const isCompletedToday = todayReflection?.isComplete;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Daily Reflection
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        {isCompletedToday && (
          <Badge variant="default" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed Today
          </Badge>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Reflection Form */}
        <div className="lg:col-span-3 space-y-6">
          {isCompletedToday ? (
            /* Show completed reflection */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Today's Reflection Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Morning Intention</h3>
                  <p className="text-muted-foreground">
                    {todayReflection?.morningIntention || 'No intention recorded'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Evening Reflection</h3>
                  <p className="text-muted-foreground">
                    {todayReflection?.eveningReflection || 'No reflection recorded'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Energy Level</h3>
                    <Badge variant="outline">
                      {todayReflection?.energyLevel}/10
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Focus Level</h3>
                    <Badge variant="outline">
                      {todayReflection?.focusLevel}/10
                    </Badge>
                  </div>
                </div>

                {todayReflection?.moodTags && todayReflection.moodTags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Mood Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {todayReflection.moodTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {todayReflection?.gratitudeList && todayReflection.gratitudeList.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Gratitude List</h3>
                    <ul className="space-y-1">
                      {todayReflection.gratitudeList.map((item, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setTodayReflection(prev => prev ? {...prev, isComplete: false} : null)}
                    className="w-full"
                  >
                    Edit Reflection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Show reflection form */
            <ReflectionForm
              initialData={todayReflection}
              onSubmit={handleSubmitReflection}
              isLoading={isSubmitting}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Counter */}
          <StreakCounter
            title="Reflection Streak"
            currentStreak={currentStreak}
            description="Daily reflections completed consecutively"
            celebrateAt={7}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reflections</span>
                <Badge variant="outline">
                  {recentReflections.filter(r => 
                    new Date(r.reflectionDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}/7
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Energy</span>
                <Badge variant="outline">
                  {recentReflections.length > 0 
                    ? (recentReflections.reduce((sum, r) => sum + (r.energyLevel || 0), 0) / recentReflections.length).toFixed(1)
                    : '0'
                  }/10
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Focus</span>
                <Badge variant="outline">
                  {recentReflections.length > 0 
                    ? (recentReflections.reduce((sum, r) => sum + (r.focusLevel || 0), 0) / recentReflections.length).toFixed(1)
                    : '0'
                  }/10
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reflections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentReflections.slice(0, 5).map((reflection) => (
                  <div key={reflection.id} className="flex justify-between items-center p-2 rounded">
                    <div className="text-sm">
                      {new Date(reflection.reflectionDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      {reflection.isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {reflection.energyLevel || 0}E/{reflection.focusLevel || 0}F
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}