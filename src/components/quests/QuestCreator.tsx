'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  PlusIcon, 
  MinusIcon, 
  ArrowLeftIcon, 
  SaveIcon,
  TrophyIcon,
  CoinsIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-react';
import { RewardDisplay } from './RewardDisplay';

interface Objective {
  text: string;
  isRequired: boolean;
  xpReward: number;
}

interface QuestData {
  questName: string;
  questDescription: string;
  questType: 'main' | 'side' | 'daily' | 'weekly' | 'epic';
  difficulty: 'trivial' | 'easy' | 'normal' | 'hard' | 'legendary';
  xpReward: number;
  goldReward: number;
  timeLimit: string;
  objectives: Objective[];
}

const questTypeDescriptions = {
  main: 'Major life goals and important milestones',
  side: 'Personal interests and skill development',
  daily: 'Recurring habits and daily routines',
  weekly: 'Regular goals completed over a week',
  epic: 'Long-term transformational challenges',
};

const difficultyDescriptions = {
  trivial: '5-15 minutes, very easy tasks',
  easy: '15-60 minutes, simple tasks',
  normal: '1-4 hours, moderate effort required',
  hard: '4+ hours, significant challenge',
  legendary: 'Multi-day, life-changing endeavor',
};

const questTemplates = {
  'Morning Routine': {
    questType: 'daily' as const,
    difficulty: 'easy' as const,
    objectives: [
      { text: 'Wake up at planned time', isRequired: true, xpReward: 10 },
      { text: 'Make bed', isRequired: true, xpReward: 5 },
      { text: '10 minutes of stretching or exercise', isRequired: true, xpReward: 15 },
      { text: 'Healthy breakfast', isRequired: true, xpReward: 10 },
    ],
  },
  'Learn New Skill': {
    questType: 'side' as const,
    difficulty: 'normal' as const,
    objectives: [
      { text: 'Research and choose learning resources', isRequired: true, xpReward: 20 },
      { text: 'Complete first lesson or tutorial', isRequired: true, xpReward: 30 },
      { text: 'Practice for 30 minutes', isRequired: true, xpReward: 25 },
      { text: 'Share progress with someone', isRequired: false, xpReward: 15 },
    ],
  },
  'Weekly Goal': {
    questType: 'weekly' as const,
    difficulty: 'normal' as const,
    objectives: [
      { text: 'Define specific weekly target', isRequired: true, xpReward: 15 },
      { text: 'Create daily action plan', isRequired: true, xpReward: 20 },
      { text: 'Complete at least 5 planned actions', isRequired: true, xpReward: 50 },
      { text: 'Reflect on progress and lessons learned', isRequired: true, xpReward: 25 },
    ],
  },
};

export function QuestCreator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [questData, setQuestData] = useState<QuestData>({
    questName: '',
    questDescription: '',
    questType: 'side',
    difficulty: 'normal',
    xpReward: 50,
    goldReward: 0,
    timeLimit: '',
    objectives: [{ text: '', isRequired: true, xpReward: 10 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!questData.questName.trim()) {
        newErrors.questName = 'Quest name is required';
      }
      if (!questData.questDescription.trim()) {
        newErrors.questDescription = 'Quest description is required';
      }
    }

    if (step === 2) {
      if (questData.objectives.some(obj => !obj.text.trim())) {
        newErrors.objectives = 'All objectives must have text';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleTemplateSelect = (templateName: keyof typeof questTemplates) => {
    const template = questTemplates[templateName];
    setQuestData({
      ...questData,
      questName: templateName,
      questType: template.questType,
      difficulty: template.difficulty,
      objectives: template.objectives,
    });
  };

  const addObjective = () => {
    setQuestData({
      ...questData,
      objectives: [...questData.objectives, { text: '', isRequired: true, xpReward: 10 }],
    });
  };

  const removeObjective = (index: number) => {
    if (questData.objectives.length > 1) {
      setQuestData({
        ...questData,
        objectives: questData.objectives.filter((_, i) => i !== index),
      });
    }
  };

  const updateObjective = (index: number, field: keyof Objective, value: any) => {
    const newObjectives = [...questData.objectives];
    newObjectives[index] = { ...newObjectives[index], [field]: value };
    setQuestData({ ...questData, objectives: newObjectives });
  };

  const calculateTotalXP = () => {
    const objectiveXP = questData.objectives.reduce((total, obj) => total + obj.xpReward, 0);
    return questData.xpReward + objectiveXP;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questData,
          objectives: questData.objectives.map((obj, index) => ({
            ...obj,
            objectiveText: obj.text,
            order: index + 1,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/quests/${data.data.id}`);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to create quest' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Quest</h1>
          <p className="text-muted-foreground">Design your next adventure in personal growth</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${
                  step < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Quest Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Templates */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Quick Start Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.keys(questTemplates).map((templateName) => (
                      <Button
                        key={templateName}
                        variant="outline"
                        onClick={() => handleTemplateSelect(templateName as keyof typeof questTemplates)}
                        className="h-auto p-3 text-left justify-start"
                      >
                        <div>
                          <div className="font-medium">{templateName}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {questTemplates[templateName as keyof typeof questTemplates].questType} Quest
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quest Name */}
                <div>
                  <Label htmlFor="questName" className="text-base font-medium">
                    Quest Name *
                  </Label>
                  <Input
                    id="questName"
                    placeholder="Enter your quest name..."
                    value={questData.questName}
                    onChange={(e) => setQuestData({ ...questData, questName: e.target.value })}
                    className={errors.questName ? 'border-red-500' : ''}
                  />
                  {errors.questName && (
                    <p className="text-red-500 text-sm mt-1">{errors.questName}</p>
                  )}
                </div>

                {/* Quest Description */}
                <div>
                  <Label htmlFor="questDescription" className="text-base font-medium">
                    Quest Description *
                  </Label>
                  <Textarea
                    id="questDescription"
                    placeholder="Describe what you want to achieve..."
                    value={questData.questDescription}
                    onChange={(e) => setQuestData({ ...questData, questDescription: e.target.value })}
                    rows={4}
                    className={errors.questDescription ? 'border-red-500' : ''}
                  />
                  {errors.questDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.questDescription}</p>
                  )}
                </div>

                {/* Quest Type */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Quest Type</Label>
                  <Select
                    value={questData.questType}
                    onValueChange={(value: any) => setQuestData({ ...questData, questType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(questTypeDescriptions).map(([type, description]) => (
                        <SelectItem key={type} value={type}>
                          <div>
                            <div className="font-medium capitalize">{type} Quest</div>
                            <div className="text-xs text-muted-foreground">{description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
                  <Select
                    value={questData.difficulty}
                    onValueChange={(value: any) => setQuestData({ ...questData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(difficultyDescriptions).map(([difficulty, description]) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          <div>
                            <div className="font-medium capitalize">{difficulty}</div>
                            <div className="text-xs text-muted-foreground">{description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Objectives */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Quest Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Objectives ({questData.objectives.length})
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Break down your quest into specific, actionable objectives. Mark required objectives 
                    that must be completed to finish the quest.
                  </p>

                  <div className="space-y-4">
                    {questData.objectives.map((objective, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground mt-2">
                              {index + 1}.
                            </span>
                            <div className="flex-1">
                              <Textarea
                                placeholder="Describe this objective..."
                                value={objective.text}
                                onChange={(e) => updateObjective(index, 'text', e.target.value)}
                                rows={2}
                              />
                            </div>
                            {questData.objectives.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeObjective(index)}
                              >
                                <MinusIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-4 ml-6">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`required-${index}`}
                                checked={objective.isRequired}
                                onChange={(e) => updateObjective(index, 'isRequired', e.target.checked)}
                                className="rounded"
                              />
                              <Label htmlFor={`required-${index}`} className="text-sm">
                                Required
                              </Label>
                            </div>

                            <div className="flex items-center gap-2">
                              <TrophyIcon className="w-4 h-4 text-muted-foreground" />
                              <Input
                                type="number"
                                value={objective.xpReward}
                                onChange={(e) => updateObjective(index, 'xpReward', parseInt(e.target.value) || 0)}
                                className="w-20 h-8"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-muted-foreground">XP</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {errors.objectives && (
                    <p className="text-red-500 text-sm">{errors.objectives}</p>
                  )}

                  <Button
                    variant="outline"
                    onClick={addObjective}
                    className="w-full"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Another Objective
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Rewards & Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Rewards & Final Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* XP Reward */}
                <div>
                  <Label htmlFor="xpReward" className="text-base font-medium">
                    Quest Completion XP Reward
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <TrophyIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="xpReward"
                      type="number"
                      value={questData.xpReward}
                      onChange={(e) => setQuestData({ ...questData, xpReward: parseInt(e.target.value) || 0 })}
                      className="w-32"
                      min="0"
                      max="1000"
                    />
                    <span className="text-sm text-muted-foreground">XP</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Additional XP awarded when the entire quest is completed
                  </p>
                </div>

                {/* Gold Reward */}
                <div>
                  <Label htmlFor="goldReward" className="text-base font-medium">
                    Gold Reward (Optional)
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <CoinsIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="goldReward"
                      type="number"
                      value={questData.goldReward}
                      onChange={(e) => setQuestData({ ...questData, goldReward: parseInt(e.target.value) || 0 })}
                      className="w-32"
                      min="0"
                      max="1000"
                    />
                    <span className="text-sm text-muted-foreground">Gold</span>
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <Label htmlFor="timeLimit" className="text-base font-medium">
                    Time Limit (Optional)
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="timeLimit"
                      placeholder="e.g., 7 days, 1 week, 30 days"
                      value={questData.timeLimit}
                      onChange={(e) => setQuestData({ ...questData, timeLimit: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set a deadline to add urgency (format: "X days" or "X weeks")
                  </p>
                </div>

                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircleIcon className="w-4 h-4 text-red-600" />
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Quest Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">
                  {questData.questName || 'Untitled Quest'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Type & Difficulty</div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {questData.questType}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {questData.difficulty}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Objectives</div>
                <div className="text-2xl font-bold">
                  {questData.objectives.length}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Total XP</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {calculateTotalXP()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Preview */}
          {currentStep === 3 && (
            <RewardDisplay
              xpReward={questData.xpReward}
              goldReward={questData.goldReward}
              showTitle={true}
              size="sm"
            />
          )}

          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Create Quest
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}