"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap,
  Plus,
  Minus,
  Coffee,
  Utensils,
  Car,
  Users,
  ShoppingCart,
  Briefcase,
  Home,
  Heart,
  Bed,
  Clock,
  TrendingUp,
  BarChart3,
  Info,
  RotateCcw,
  Settings,
  Target
} from 'lucide-react';

interface SpoonResource {
  id: string;
  resourceType: string;
  currentValue: number;
  maxValue: number;
  regenRate: number;
  lastUpdated: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
  spoonCost: number;
  icon: React.ComponentType<any>;
  description: string;
  energyImpact: 'negative' | 'neutral' | 'positive';
}

const ACTIVITY_CATEGORIES = {
  basic: { name: 'Basic Needs', icon: Heart, color: 'bg-red-100 text-red-800' },
  work: { name: 'Work/Study', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  social: { name: 'Social', icon: Users, color: 'bg-green-100 text-green-800' },
  household: { name: 'Household', icon: Home, color: 'bg-purple-100 text-purple-800' },
  errands: { name: 'Errands', icon: Car, color: 'bg-orange-100 text-orange-800' },
  selfcare: { name: 'Self Care', icon: Bed, color: 'bg-pink-100 text-pink-800' }
};

const COMMON_ACTIVITIES: Activity[] = [
  // Basic Needs (usually restorative)
  { id: '1', name: 'Shower', category: 'basic', spoonCost: 1, icon: Heart, description: 'Basic hygiene', energyImpact: 'positive' },
  { id: '2', name: 'Eat Meal', category: 'basic', spoonCost: 1, icon: Utensils, description: 'Nutrition and fuel', energyImpact: 'positive' },
  { id: '3', name: 'Power Nap', category: 'selfcare', spoonCost: -2, icon: Bed, description: '15-20 min rest', energyImpact: 'positive' },
  
  // Work/Study (depleting)
  { id: '4', name: 'Deep Work Session', category: 'work', spoonCost: 3, icon: Briefcase, description: '90min focused work', energyImpact: 'negative' },
  { id: '5', name: 'Meeting', category: 'work', spoonCost: 2, icon: Users, description: 'Team meeting/call', energyImpact: 'negative' },
  { id: '6', name: 'Email/Admin', category: 'work', spoonCost: 1, icon: Briefcase, description: 'Light admin work', energyImpact: 'neutral' },
  
  // Social (can be depleting or energizing)
  { id: '7', name: 'Social Gathering', category: 'social', spoonCost: 3, icon: Users, description: 'Party, dinner out', energyImpact: 'negative' },
  { id: '8', name: 'Coffee with Friend', category: 'social', spoonCost: 2, icon: Coffee, description: 'One-on-one chat', energyImpact: 'neutral' },
  { id: '9', name: 'Family Time', category: 'social', spoonCost: 1, icon: Users, description: 'Quality time at home', energyImpact: 'positive' },
  
  // Household (usually depleting)
  { id: '10', name: 'Grocery Shopping', category: 'errands', spoonCost: 2, icon: ShoppingCart, description: 'Full grocery trip', energyImpact: 'negative' },
  { id: '11', name: 'Cleaning House', category: 'household', spoonCost: 3, icon: Home, description: 'Deep cleaning', energyImpact: 'negative' },
  { id: '12', name: 'Laundry', category: 'household', spoonCost: 1, icon: Home, description: 'Wash, dry, fold', energyImpact: 'neutral' },
  
  // Self Care (restorative)
  { id: '13', name: 'Exercise', category: 'selfcare', spoonCost: -1, icon: Zap, description: 'Light exercise', energyImpact: 'positive' },
  { id: '14', name: 'Meditation', category: 'selfcare', spoonCost: -1, icon: Heart, description: '10-15 min mindfulness', energyImpact: 'positive' },
  { id: '15', name: 'Long Bath', category: 'selfcare', spoonCost: -2, icon: Heart, description: 'Relaxing soak', energyImpact: 'positive' },
];

export default function SpoonManagement() {
  const router = useRouter();
  const [spoons, setSpoons] = useState<SpoonResource | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [customActivity, setCustomActivity] = useState({ name: '', cost: 1, category: 'basic' });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activityLog, setActivityLog] = useState<Array<{
    activity: string;
    spoonCost: number;
    timestamp: Date;
    remainingSpoons: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [energyTrend, setEnergyTrend] = useState<'increasing' | 'stable' | 'decreasing'>('stable');

  useEffect(() => {
    fetchSpoonData();
  }, []);

  const fetchSpoonData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/adhd/spoons');
      const data = await response.json();
      setSpoons(data.spoons);
      
      // Calculate energy trend based on current vs max
      if (data.spoons) {
        const percentage = (data.spoons.currentValue / data.spoons.maxValue) * 100;
        if (percentage > 70) setEnergyTrend('increasing');
        else if (percentage < 40) setEnergyTrend('decreasing');
        else setEnergyTrend('stable');
      }
    } catch (error) {
      console.error('Error fetching spoon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performActivity = async (activity: Activity) => {
    if (!spoons) return;
    
    // Check if user has enough spoons (but allow them to go negative if needed)
    const newSpoonCount = Math.max(0, spoons.currentValue - activity.spoonCost);
    
    try {
      const response = await fetch('/api/adhd/spoons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activity.spoonCost > 0 ? 'spend' : 'recover',
          amount: Math.abs(activity.spoonCost),
          activityName: activity.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSpoons(data.spoons);
        
        // Add to activity log
        setActivityLog(prev => [{
          activity: activity.name,
          spoonCost: activity.spoonCost,
          timestamp: new Date(),
          remainingSpoons: data.spoons.currentValue
        }, ...prev.slice(0, 9)]); // Keep last 10 activities
      }
    } catch (error) {
      console.error('Error performing activity:', error);
    }
  };

  const adjustSpoons = async (action: 'spend' | 'recover', amount: number) => {
    try {
      const response = await fetch('/api/adhd/spoons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount })
      });

      if (response.ok) {
        const data = await response.json();
        setSpoons(data.spoons);
      }
    } catch (error) {
      console.error('Error adjusting spoons:', error);
    }
  };

  const addCustomActivity = () => {
    if (!customActivity.name.trim()) return;
    
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: customActivity.name,
      category: customActivity.category,
      spoonCost: customActivity.cost,
      icon: ACTIVITY_CATEGORIES[customActivity.category as keyof typeof ACTIVITY_CATEGORIES]?.icon || Heart,
      description: 'Custom activity',
      energyImpact: customActivity.cost > 0 ? 'negative' : 'positive'
    };
    
    performActivity(newActivity);
    setShowCustomModal(false);
    setCustomActivity({ name: '', cost: 1, category: 'basic' });
  };

  const getSpoonColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 60) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpoonAdvice = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 80) return "You're energized! Great time for challenging tasks.";
    if (percentage > 60) return "Good energy level. You can handle most activities.";
    if (percentage > 40) return "Moderate energy. Consider easier tasks or take breaks.";
    if (percentage > 20) return "Low energy. Focus on essentials and self-care.";
    return "Very low energy. Rest is not optional—it's necessary.";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your energy tracker...</p>
          </div>
        </div>
      </div>
    );
  }

  const spoonPercentage = spoons ? (spoons.currentValue / spoons.maxValue) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Spoon Energy Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your daily energy using the spoon theory
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/adhd')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Current Energy Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Spoon Counter */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className={spoons ? getSpoonColor(spoons.currentValue, spoons.maxValue) : 'text-gray-400'} />
                Current Energy: {spoons ? `${spoons.currentValue}/${spoons.maxValue}` : '0/12'} Spoons
              </CardTitle>
              <CardDescription>
                {spoons ? getSpoonAdvice(spoons.currentValue, spoons.maxValue) : 'Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visual Spoon Display */}
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-4">
                  {spoons && [...Array(spoons.maxValue)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${i < spoons.currentValue 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : 'bg-gray-200 text-gray-400'
                        }`}
                    >
                      🥄
                    </div>
                  ))}
                </div>
                <Progress value={spoonPercentage} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(spoonPercentage)}% energy remaining
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustSpoons('spend', 1)}
                  disabled={!spoons || spoons.currentValue <= 0}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  -1 Spoon
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustSpoons('recover', 1)}
                  disabled={!spoons || spoons.currentValue >= spoons.maxValue}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  +1 Spoon
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustSpoons('set', spoons?.maxValue || 12)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Full Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCustomModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Energy Trend & Tips */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Energy Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-center p-4 rounded-lg ${
                  energyTrend === 'increasing' ? 'bg-green-50 text-green-800' :
                  energyTrend === 'decreasing' ? 'bg-red-50 text-red-800' :
                  'bg-yellow-50 text-yellow-800'
                }`}>
                  {energyTrend === 'increasing' && '📈 Building Energy'}
                  {energyTrend === 'stable' && '📊 Steady State'}
                  {energyTrend === 'decreasing' && '📉 Energy Declining'}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Regeneration: {spoons?.regenRate || 1} spoon(s)/hour with rest
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Spoon Theory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800">
                  Spoon theory helps you understand and communicate your energy limits. 
                  Each spoon represents a unit of mental/physical energy for daily activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            {/* Activity Categories */}
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, category]) => {
              const categoryActivities = COMMON_ACTIVITIES.filter(a => a.category === key);
              const CategoryIcon = category.icon;
              
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      {categoryActivities.length} common activities in this category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryActivities.map((activity) => {
                        const ActivityIcon = activity.icon;
                        const canAfford = spoons ? spoons.currentValue >= activity.spoonCost : false;
                        
                        return (
                          <div
                            key={activity.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              activity.spoonCost > 0 && !canAfford 
                                ? 'border-red-200 bg-red-50 opacity-60' 
                                : 'border-border hover:border-primary/50'
                            } ${
                              activity.energyImpact === 'positive' ? 'bg-green-50' :
                              activity.energyImpact === 'negative' ? 'bg-orange-50' :
                              'bg-background'
                            }`}
                            onClick={() => performActivity(activity)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                {activity.name}
                              </h4>
                              <Badge 
                                variant={activity.spoonCost > 0 ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {activity.spoonCost > 0 ? `-${activity.spoonCost}` : `+${Math.abs(activity.spoonCost)}`}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.spoonCost > 0 && !canAfford && (
                              <p className="text-xs text-red-600 mt-1">
                                Not enough spoons
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Energy Planning
                </CardTitle>
                <CardDescription>
                  Plan your day based on available spoons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Recommended Activities</h4>
                    <div className="space-y-2">
                      {COMMON_ACTIVITIES
                        .filter(a => spoons ? a.spoonCost <= spoons.currentValue : false)
                        .slice(0, 5)
                        .map((activity) => {
                          const ActivityIcon = activity.icon;
                          return (
                            <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                <span className="text-sm">{activity.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {activity.spoonCost} spoons
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Energy Recovery Activities</h4>
                    <div className="space-y-2">
                      {COMMON_ACTIVITIES
                        .filter(a => a.spoonCost < 0)
                        .map((activity) => {
                          const ActivityIcon = activity.icon;
                          return (
                            <div key={activity.id} className="flex items-center justify-between p-2 border rounded bg-green-50">
                              <div className="flex items-center gap-2">
                                <ActivityIcon className="h-4 w-4" />
                                <span className="text-sm">{activity.name}</span>
                              </div>
                              <Badge variant="default" className="text-xs">
                                +{Math.abs(activity.spoonCost)} spoons
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity History
                </CardTitle>
                <CardDescription>
                  Recent activities and their energy impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLog.length > 0 ? (
                  <div className="space-y-2">
                    {activityLog.map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{log.activity}</span>
                          <p className="text-sm text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={log.spoonCost > 0 ? 'destructive' : 'default'}
                            className="mb-1"
                          >
                            {log.spoonCost > 0 ? `-${log.spoonCost}` : `+${Math.abs(log.spoonCost)}`}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {log.remainingSpoons} spoons left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity history yet. Start tracking your energy usage!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Custom Activity Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Custom Activity</CardTitle>
                <CardDescription>
                  Track a specific activity and its energy cost
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Name</label>
                  <input
                    type="text"
                    value={customActivity.name}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Doctor appointment, Phone call..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={customActivity.category}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {Object.entries(ACTIVITY_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Spoon Cost ({customActivity.cost > 0 ? 'drains' : 'restores'} energy)
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomActivity(prev => ({ ...prev, cost: Math.max(-5, prev.cost - 1) }))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold w-12 text-center">
                      {customActivity.cost > 0 ? `-${customActivity.cost}` : `+${Math.abs(customActivity.cost)}`}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomActivity(prev => ({ ...prev, cost: Math.min(5, prev.cost + 1) }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addCustomActivity} className="flex-1">
                    Add Activity
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomActivity({ name: '', cost: 1, category: 'basic' });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}