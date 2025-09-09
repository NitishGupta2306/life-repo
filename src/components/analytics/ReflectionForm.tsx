'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface ReflectionFormProps {
  type?: 'daily' | 'weekly';
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const MOOD_TAGS = [
  'peaceful', 'energetic', 'focused', 'creative', 'motivated',
  'anxious', 'tired', 'overwhelmed', 'frustrated', 'stressed',
  'grateful', 'accomplished', 'hopeful', 'content', 'excited',
  'confused', 'sad', 'angry', 'lonely', 'restless'
];

const DAILY_REFLECTION_PROMPTS = [
  "What am I most grateful for today?",
  "What challenged me today and how did I handle it?",
  "What did I learn about myself today?",
  "What would I do differently if I could repeat today?",
  "What small win can I celebrate from today?",
  "How did I show up for myself or others today?",
  "What pattern am I noticing in my thoughts or behaviors?",
  "What do I need more of tomorrow?",
  "What brought me joy today?",
  "How did I honor my values today?"
];

export function ReflectionForm({ type = 'daily', initialData, onSubmit, isLoading }: ReflectionFormProps) {
  const [formData, setFormData] = useState({
    reflectionDate: initialData?.reflectionDate || new Date().toISOString().split('T')[0],
    morningIntention: initialData?.morningIntention || '',
    eveningReflection: initialData?.eveningReflection || '',
    energyLevel: initialData?.energyLevel || 5,
    focusLevel: initialData?.focusLevel || 5,
    moodTags: initialData?.moodTags || [],
    gratitudeList: initialData?.gratitudeList || [''],
    reflectionPrompt: initialData?.reflectionPrompt || DAILY_REFLECTION_PROMPTS[Math.floor(Math.random() * DAILY_REFLECTION_PROMPTS.length)],
    isComplete: initialData?.isComplete || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      gratitudeList: formData.gratitudeList.filter(item => item.trim() !== ''),
      isComplete: true
    };

    await onSubmit(submitData);
  };

  const addMoodTag = (tag: string) => {
    if (!formData.moodTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        moodTags: [...prev.moodTags, tag]
      }));
    }
  };

  const removeMoodTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      moodTags: prev.moodTags.filter(t => t !== tag)
    }));
  };

  const addGratitudeItem = () => {
    setFormData(prev => ({
      ...prev,
      gratitudeList: [...prev.gratitudeList, '']
    }));
  };

  const updateGratitudeItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      gratitudeList: prev.gratitudeList.map((item, i) => i === index ? value : item)
    }));
  };

  const removeGratitudeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gratitudeList: prev.gratitudeList.filter((_, i) => i !== index)
    }));
  };

  const getEnergyLabel = (level: number) => {
    if (level >= 9) return 'Exceptional';
    if (level >= 7) return 'High';
    if (level >= 5) return 'Moderate';
    if (level >= 3) return 'Low';
    return 'Very Low';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <Card>
        <CardHeader>
          <CardTitle>Reflection Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={formData.reflectionDate}
            onChange={(e) => setFormData(prev => ({ ...prev, reflectionDate: e.target.value }))}
            required
          />
        </CardContent>
      </Card>

      {/* Morning Intention */}
      <Card>
        <CardHeader>
          <CardTitle>Morning Intention</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What is your intention for today? What do you want to focus on?"
            value={formData.morningIntention}
            onChange={(e) => setFormData(prev => ({ ...prev, morningIntention: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Energy & Focus Levels */}
      <Card>
        <CardHeader>
          <CardTitle>How Are You Feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Energy Level</Label>
              <Badge variant="outline">
                {formData.energyLevel}/10 - {getEnergyLabel(formData.energyLevel)}
              </Badge>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energyLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Focus Level</Label>
              <Badge variant="outline">
                {formData.focusLevel}/10 - {getEnergyLabel(formData.focusLevel)}
              </Badge>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.focusLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, focusLevel: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mood Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.moodTags.map((tag) => (
              <Badge key={tag} variant="default" className="cursor-pointer">
                {tag}
                <X 
                  className="ml-1 h-3 w-3" 
                  onClick={() => removeMoodTag(tag)}
                />
              </Badge>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Select moods that describe how you're feeling:</Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.filter(tag => !formData.moodTags.includes(tag)).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => addMoodTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gratitude List */}
      <Card>
        <CardHeader>
          <CardTitle>Gratitude List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.gratitudeList.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`What are you grateful for? #${index + 1}`}
                value={item}
                onChange={(e) => updateGratitudeItem(index, e.target.value)}
              />
              {formData.gratitudeList.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeGratitudeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={addGratitudeItem}
            className="w-full"
          >
            Add Another
          </Button>
        </CardContent>
      </Card>

      {/* Reflection Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Today's reflection prompt:
            </p>
            <p className="text-sm text-blue-600 italic mt-1">
              {formData.reflectionPrompt}
            </p>
          </div>
          <Textarea
            placeholder="Take a moment to reflect on this prompt..."
            value={formData.eveningReflection}
            onChange={(e) => setFormData(prev => ({ ...prev, eveningReflection: e.target.value }))}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 'Saving...' : 'Save Reflection'}
        </Button>
      </div>
    </form>
  );
}