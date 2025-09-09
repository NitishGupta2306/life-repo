"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Timer,
  Coffee,
  Brain,
  Clock,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';

interface FocusTimerProps {
  initialType?: 'pomodoro' | 'deep_work' | 'break' | 'custom';
  initialDuration?: number; // in minutes
  onSessionComplete?: (session: {
    type: string;
    duration: number;
    completed: boolean;
    interrupted: boolean;
  }) => void;
  showStats?: boolean;
  size?: 'compact' | 'full';
}

const SESSION_TYPES = {
  pomodoro: { name: 'Pomodoro', duration: 25, icon: Coffee, color: 'bg-red-500' },
  deep_work: { name: 'Deep Work', duration: 90, icon: Brain, color: 'bg-blue-500' },
  break: { name: 'Break', duration: 5, icon: Clock, color: 'bg-green-500' },
  custom: { name: 'Custom', duration: 30, icon: Timer, color: 'bg-purple-500' }
};

export default function FocusTimer({ 
  initialType = 'pomodoro',
  initialDuration,
  onSessionComplete,
  showStats = true,
  size = 'full'
}: FocusTimerProps) {
  const [sessionType, setSessionType] = useState(initialType);
  const [duration, setDuration] = useState(initialDuration || SESSION_TYPES[initialType].duration);
  const [timeLeft, setTimeLeft] = useState((initialDuration || SESSION_TYPES[initialType].duration) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  const startSession = () => {
    setIsRunning(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const stopSession = () => {
    handleComplete(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    setSessionStartTime(null);
  };

  const handleComplete = (wasCompleted: boolean) => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (soundEnabled && audioRef.current && wasCompleted) {
      audioRef.current.play().catch(console.error);
    }

    if (onSessionComplete && sessionStartTime) {
      const actualDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000);
      onSessionComplete({
        type: sessionType,
        duration: actualDuration,
        completed: wasCompleted,
        interrupted: !wasCompleted
      });
    }

    // Reset for next session
    setTimeLeft(duration * 60);
    setSessionStartTime(null);
  };

  const changeSessionType = (type: keyof typeof SESSION_TYPES) => {
    if (isRunning) return; // Don't allow changes during active session
    
    setSessionType(type);
    const newDuration = SESSION_TYPES[type].duration;
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const SessionIcon = SESSION_TYPES[sessionType].icon;

  if (size === 'compact') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SessionIcon className="h-5 w-5" />
              <span className="font-medium">{SESSION_TYPES[sessionType].name}</span>
              <Badge variant="outline">{duration}m</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-2xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </div>

          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <>
                <Button size="sm" onClick={startSession}>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button size="sm" variant="outline" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            ) : isPaused ? (
              <>
                <Button size="sm" onClick={resumeSession}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button size="sm" variant="outline" onClick={stopSession}>
                  <Square className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={pauseSession}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button size="sm" variant="outline" onClick={stopSession}>
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <SessionIcon className="h-6 w-6" />
          {SESSION_TYPES[sessionType].name} Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Type Selector */}
        {!isRunning && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(SESSION_TYPES).map(([key, type]) => (
              <Button
                key={key}
                variant={sessionType === key ? "default" : "outline"}
                size="sm"
                onClick={() => changeSessionType(key as keyof typeof SESSION_TYPES)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <type.icon className="h-4 w-4" />
                <span className="text-xs">{type.name}</span>
                <span className="text-xs opacity-70">{type.duration}m</span>
              </Button>
            ))}
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center space-y-4">
          {/* Circular Progress */}
          <div className="relative mx-auto w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRunning ? (isPaused ? 'Paused' : 'Focus Time') : 'Ready to Start'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <>
                <Button size="lg" onClick={startSession} className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Session
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </>
            ) : isPaused ? (
              <>
                <Button size="lg" onClick={resumeSession}>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button size="lg" variant="outline" onClick={stopSession}>
                  <Square className="h-5 w-5 mr-2" />
                  Complete
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="outline" onClick={pauseSession}>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button size="lg" variant="outline" onClick={stopSession}>
                  <Square className="h-5 w-5 mr-2" />
                  Complete
                </Button>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="ml-2">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
            </Button>
          </div>
        </div>

        {/* ADHD-Friendly Encouragement */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💙 ADHD-Friendly Reminders</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• It's okay to pause if you need to</li>
            <li>• Partial sessions still count as progress</li>
            <li>• Your brain is working hard - be kind to yourself</li>
            <li>• Interruptions happen - you can always restart</li>
          </ul>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          preload="auto"
          src="data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAE1wZWcgR2VuZXJhdG9yIDEuMC4wLjEwMwAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAFdwCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////"
        />
      </CardContent>
    </Card>
  );
}