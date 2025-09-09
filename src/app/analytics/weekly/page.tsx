'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface WeeklyReflection {
  id: string;
  weekStart: string;
  weekEnd: string;
  keyWins: string[];
  keyStruggles: string[];
  patternsNoticed: string[];
  energyPattern: any;
  focusPattern: any;
  basicNeedsCompletion: number;
  questCompletionRate: number;
  selfInsight: string;
  nextWeekIntention: string;
  createdAt: string;
}

export default function WeeklyReflectionPage() {
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekStart = startOfWeek.toISOString().split('T')[0];
  const weekEnd = endOfWeek.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    weekStart,
    weekEnd,
    keyWins: [''],
    keyStruggles: [''],
    patternsNoticed: [''],
    basicNeedsCompletion: 50,
    questCompletionRate: 50,
    selfInsight: '',
    nextWeekIntention: ''
  });

  useEffect(() => {
    fetchWeeklyReflection();
  }, []);

  const fetchWeeklyReflection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/weekly-reflections?weekStart=${weekStart}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.reflections.length > 0) {
          const reflection = data.data.reflections[0];
          setWeeklyReflection(reflection);
          setFormData({
            weekStart: reflection.weekStart,
            weekEnd: reflection.weekEnd,
            keyWins: reflection.keyWins?.length > 0 ? reflection.keyWins : [''],
            keyStruggles: reflection.keyStruggles?.length > 0 ? reflection.keyStruggles : [''],
            patternsNoticed: reflection.patternsNoticed?.length > 0 ? reflection.patternsNoticed : [''],
            basicNeedsCompletion: reflection.basicNeedsCompletion || 50,
            questCompletionRate: reflection.questCompletionRate || 50,
            selfInsight: reflection.selfInsight || '',
            nextWeekIntention: reflection.nextWeekIntention || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching weekly reflection:', error);
      setError('Failed to load weekly reflection data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);

      const submitData = {
        ...formData,
        keyWins: formData.keyWins.filter(item => item.trim() !== ''),
        keyStruggles: formData.keyStruggles.filter(item => item.trim() !== ''),
        patternsNoticed: formData.patternsNoticed.filter(item => item.trim() !== ''),
      };

      const response = await fetch('/api/analytics/weekly-reflections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save weekly reflection');
      }

      setWeeklyReflection(result.data);
      console.log('Weekly reflection saved successfully');

    } catch (error) {
      console.error('Error saving weekly reflection:', error);
      setError('Failed to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateArrayField = (field: keyof typeof formData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
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
              Weekly Reflection
            </h1>
            <p className="text-muted-foreground">
              Week of {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
            </p>
          </div>
        </div>

        {weeklyReflection && (
          <Badge variant="default" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Key Wins */}
        <Card>
          <CardHeader>
            <CardTitle>Key Wins This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.keyWins.map((win, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`What went well this week? #${index + 1}`}
                  value={win}
                  onChange={(e) => updateArrayField('keyWins', index, e.target.value)}
                />
                {formData.keyWins.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeArrayItem('keyWins', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => addArrayItem('keyWins')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Win
            </Button>
          </CardContent>
        </Card>

        {/* Key Struggles */}
        <Card>
          <CardHeader>
            <CardTitle>Key Struggles This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.keyStruggles.map((struggle, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`What challenged you this week? #${index + 1}`}
                  value={struggle}
                  onChange={(e) => updateArrayField('keyStruggles', index, e.target.value)}
                />
                {formData.keyStruggles.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeArrayItem('keyStruggles', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => addArrayItem('keyStruggles')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Challenge
            </Button>
          </CardContent>
        </Card>

        {/* Patterns Noticed */}
        <Card>
          <CardHeader>
            <CardTitle>Patterns You Noticed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.patternsNoticed.map((pattern, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`What patterns did you observe? #${index + 1}`}
                  value={pattern}
                  onChange={(e) => updateArrayField('patternsNoticed', index, e.target.value)}
                />
                {formData.patternsNoticed.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeArrayItem('patternsNoticed', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => addArrayItem('patternsNoticed')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Pattern
            </Button>
          </CardContent>
        </Card>

        {/* Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Basic Needs Completion</Label>
                <Badge variant="outline">
                  {formData.basicNeedsCompletion}%
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.basicNeedsCompletion}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  basicNeedsCompletion: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-muted-foreground">
                How well did you take care of your basic needs this week? (sleep, food, hydration, etc.)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Quest Completion Rate</Label>
                <Badge variant="outline">
                  {formData.questCompletionRate}%
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.questCompletionRate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  questCompletionRate: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-muted-foreground">
                How many of your planned quests and goals did you complete this week?
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Self Insight */}
        <Card>
          <CardHeader>
            <CardTitle>Self Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What did you learn about yourself this week? What insights emerged from your experiences?"
              value={formData.selfInsight}
              onChange={(e) => setFormData(prev => ({ ...prev, selfInsight: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Next Week Intention */}
        <Card>
          <CardHeader>
            <CardTitle>Next Week Intention</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What do you want to focus on next week? What intentions are you setting?"
              value={formData.nextWeekIntention}
              onChange={(e) => setFormData(prev => ({ ...prev, nextWeekIntention: e.target.value }))}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Weekly Reflection'}
          </Button>
        </div>
      </form>
    </div>
  );
}