"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CharacterCreationProps {
  onComplete: (characterData: CharacterCreationData) => void;
}

export interface CharacterCreationData {
  characterName: string;
  characterClass: string;
  age: number;
}

const CHARACTER_CLASSES = [
  {
    name: 'Life Explorer',
    description: 'Balanced approach to life with bonus to productivity and learning',
    bonuses: ['🎯 +5 Productivity', '📚 +10 Learning'],
    icon: '🗺️',
  },
  {
    name: 'Wellness Warrior',
    description: 'Focused on health and self-care with wellness and energy bonuses',
    bonuses: ['❤️ +15 Wellness', '⚡ +10 Energy'],
    icon: '🛡️',
  },
  {
    name: 'Social Butterfly',
    description: 'Thrives on connections with social and motivation bonuses',
    bonuses: ['👥 +15 Social', '🚀 +5 Motivation'],
    icon: '🦋',
  },
  {
    name: 'Creative Genius',
    description: 'Artistic and innovative with creativity and focus bonuses',
    bonuses: ['🎨 +20 Creativity', '🎯 +5 Focus'],
    icon: '🌟',
  },
  {
    name: 'Productivity Master',
    description: 'Efficiency expert with productivity and organization bonuses',
    bonuses: ['📊 +20 Productivity', '📋 +10 Organization'],
    icon: '⚡',
  },
];

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [age, setAge] = useState(25);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (characterName && selectedClass) {
      onComplete({
        characterName,
        characterClass: selectedClass,
        age,
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Welcome to Life RPG!</h2>
        <p className="text-muted-foreground text-lg">
          Transform your daily life into an epic adventure. Let's create your character!
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="characterName" className="block text-sm font-medium mb-2">
            Character Name
          </label>
          <input
            id="characterName"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter your hero name..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            maxLength={50}
          />
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium mb-2">
            Starting Level (Age)
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 25)}
            min="1"
            max="100"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Your age becomes your starting character level
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Class</h2>
        <p className="text-muted-foreground">
          Each class provides unique bonuses to help you excel in different areas of life
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHARACTER_CLASSES.map((charClass) => (
          <Card 
            key={charClass.name}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedClass === charClass.name ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedClass(charClass.name)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{charClass.icon}</span>
                {charClass.name}
              </CardTitle>
              <CardDescription>{charClass.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {charClass.bonuses.map((bonus, index) => (
                  <div key={index} className="text-sm text-green-600 font-medium">
                    {bonus}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Character Summary</h2>
        <p className="text-muted-foreground">
          Review your character before starting your Life RPG adventure
        </p>
      </div>
      
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <span className="text-3xl">
              {CHARACTER_CLASSES.find(c => c.name === selectedClass)?.icon}
            </span>
            {characterName}
          </CardTitle>
          <CardDescription className="text-lg">
            {selectedClass} • Level {age}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Class Bonuses:</h3>
            <div className="space-y-1">
              {CHARACTER_CLASSES.find(c => c.name === selectedClass)?.bonuses.map((bonus, index) => (
                <div key={index} className="text-sm text-green-600 font-medium">
                  {bonus}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Starting Resources:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Energy</div>
                <Progress value={80} className="h-2 mt-1" />
                <div className="text-xs text-right">80/100</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Focus</div>
                <Progress value={70} className="h-2 mt-1" />
                <div className="text-xs text-right">70/100</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Motivation</div>
                <Progress value={85} className="h-2 mt-1" />
                <div className="text-xs text-right">85/100</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Spoons</div>
                <Progress value={67} className="h-2 mt-1" />
                <div className="text-xs text-right">8/12</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step content */}
        <Card className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {step < 3 ? (
                <Button 
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !characterName) ||
                    (step === 2 && !selectedClass)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Adventure
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}