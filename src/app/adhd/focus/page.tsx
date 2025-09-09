"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward,
  Timer,
  Coffee,
  Brain,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings
} from 'lucide-react';

interface FocusSession {
  id: string;
  sessionType: string;
  plannedDuration: number;
  startTime: string;
  taskWorkedOn?: string;
  energyBefore?: number;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  totalFocusTime: number;
  averageSessionLength: number;
}

const SESSION_TYPES = {
  pomodoro: { name: 'Pomodoro', duration: 25, description: 'Classic 25-min focus session', icon: Coffee },
  deep_work: { name: 'Deep Work', duration: 90, description: 'Extended focus for complex tasks', icon: Brain },
  break: { name: 'Break', duration: 5, description: 'Short rest and recovery', icon: Clock },
  custom: { name: 'Custom', duration: 30, description: 'Set your own duration', icon: Timer }
};

export default function FocusSession() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionType, setSessionType] = useState(searchParams.get('type') || 'pomodoro');
  const [duration, setDuration] = useState(SESSION_TYPES[sessionType as keyof typeof SESSION_TYPES]?.duration || 25);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [taskWorkedOn, setTaskWorkedOn] = useState('');
  const [energyBefore, setEnergyBefore] = useState(5);
  const [productivityRating, setProductivityRating] = useState(3);
  const [sessionNotes, setSessionNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    fetchSessionStats();
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
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

  const fetchSessionStats = async () => {
    try {
      const response = await fetch('/api/adhd/focus-sessions');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching session stats:', error);
    }
  };

  const startSession = async () => {
    if (!currentSession) {
      try {
        const response = await fetch('/api/adhd/focus-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            sessionType,
            plannedDuration: duration,
            taskWorkedOn: taskWorkedOn || null,
            energyBefore: energyBefore || null
          })
        });

        const data = await response.json();
        setCurrentSession(data.session);
      } catch (error) {
        console.error('Error starting session:', error);
        return;
      }
    }

    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setShowCompleteModal(true);
  };

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    setShowCompleteModal(true);
  }, [soundEnabled]);

  const completeSession = async (wasInterrupted = false) => {
    if (!currentSession) return;

    try {
      await fetch('/api/adhd/focus-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          sessionId: currentSession.id,
          wasInterrupted,
          productivityRating,
          energyAfter: energyBefore, // This would be updated by user input
          notes: sessionNotes
        })
      });

      // Reset session
      setCurrentSession(null);
      setTimeLeft(duration * 60);
      setShowCompleteModal(false);
      setTaskWorkedOn('');
      setSessionNotes('');
      setProductivityRating(3);
      
      // Refresh stats
      fetchSessionStats();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
    setCurrentSession(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const SessionIcon = SESSION_TYPES[sessionType as keyof typeof SESSION_TYPES]?.icon || Timer;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Timer className="h-8 w-8 text-blue-500" />
              Focus Sessions
            </h1>
            <p className="text-muted-foreground mt-2">
              ADHD-friendly focus timer with gentle interruption handling
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/adhd')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Session Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.round(stats.totalFocusTime)}m</div>
                <p className="text-sm text-muted-foreground">Total Focus Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{Math.round(stats.averageSessionLength)}m</div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="timer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timer Display */}
              <Card className="relative overflow-hidden">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <SessionIcon className="h-6 w-6" />
                    {SESSION_TYPES[sessionType as keyof typeof SESSION_TYPES]?.name || 'Focus Session'}
                  </CardTitle>
                  <CardDescription>
                    {SESSION_TYPES[sessionType as keyof typeof SESSION_TYPES]?.description || 'Focus session in progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  {/* Circular Timer */}
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

                  {/* Timer Controls */}
                  <div className="flex justify-center gap-3">
                    {!isRunning && !currentSession ? (
                      <Button size="lg" onClick={startSession} className="px-8">
                        <Play className="h-5 w-5 mr-2" />
                        Start Session
                      </Button>
                    ) : !isRunning ? (
                      <div className="flex gap-2">
                        <Button size="lg" onClick={startSession}>
                          <Play className="h-5 w-5 mr-2" />
                          Resume
                        </Button>
                        <Button size="lg" variant="outline" onClick={resetTimer}>
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Reset
                        </Button>
                      </div>
                    ) : isPaused ? (
                      <div className="flex gap-2">
                        <Button size="lg" onClick={resumeSession}>
                          <Play className="h-5 w-5 mr-2" />
                          Resume
                        </Button>
                        <Button size="lg" variant="outline" onClick={stopSession}>
                          <Square className="h-5 w-5 mr-2" />
                          Complete
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="lg" variant="outline" onClick={pauseSession}>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </Button>
                        <Button size="lg" variant="outline" onClick={stopSession}>
                          <Square className="h-5 w-5 mr-2" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Quick Settings */}
                  <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                    <Badge variant={isRunning ? "default" : "secondary"}>
                      {duration}m {sessionType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Session Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        What are you working on? (Optional)
                      </label>
                      <textarea
                        className="w-full p-2 border rounded-md resize-none"
                        rows={2}
                        value={taskWorkedOn}
                        onChange={(e) => setTaskWorkedOn(e.target.value)}
                        placeholder="e.g., Writing report, coding feature, reading..."
                        disabled={isRunning}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Energy Level (1-10)
                      </label>
                      <div className="flex gap-2">
                        {[...Array(10)].map((_, i) => (
                          <button
                            key={i + 1}
                            className={`w-8 h-8 rounded-full text-sm ${
                              energyBefore >= i + 1
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                            }`}
                            onClick={() => setEnergyBefore(i + 1)}
                            disabled={isRunning}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentSession && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription>
                          Session started at {new Date(currentSession.startTime).toLocaleTimeString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* ADHD-Friendly Tips */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      ADHD-Friendly Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-blue-800">
                      <li>• It&apos;s okay to pause if you need to</li>
                      <li>• Fidget toys can help maintain focus</li>
                      <li>• Some days will be better than others</li>
                      <li>• Even partial sessions count as wins!</li>
                      <li>• Take breaks when your brain needs them</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Configuration</CardTitle>
                <CardDescription>
                  Customize your focus sessions for optimal ADHD support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Session Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(SESSION_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          sessionType === key
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => {
                          setSessionType(key);
                          setDuration(type.duration);
                          setTimeLeft(type.duration * 60);
                        }}
                        disabled={isRunning}
                      >
                        <type.icon className="h-6 w-6 mb-2" />
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">{type.duration}min</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Duration */}
                {sessionType === 'custom' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Custom Duration (minutes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={duration}
                        onChange={(e) => {
                          const newDuration = parseInt(e.target.value) || 30;
                          setDuration(newDuration);
                          setTimeLeft(newDuration * 60);
                        }}
                        className="w-20 p-2 border rounded-md text-center"
                        disabled={isRunning}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">
                        minutes
                      </span>
                    </div>
                  </div>
                )}

                {/* Sound Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Completion Sound</div>
                    <div className="text-sm text-muted-foreground">
                      Play a gentle sound when sessions complete
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    {soundEnabled ? 'On' : 'Off'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  Track your progress and identify patterns in your focus sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Session history will appear here after you complete some sessions.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Complete Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Session Complete!
                </CardTitle>
                <CardDescription>
                  How did your focus session go?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Productivity Rating (1-5)
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setProductivityRating(rating)}
                        className={`p-2 ${
                          productivityRating >= rating
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md resize-none"
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="How did it go? Any insights or challenges?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => completeSession(false)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Session
                  </Button>
                  <Button 
                    onClick={() => completeSession(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Was Interrupted
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hidden audio element for completion sound */}
        <audio
          ref={audioRef}
          preload="auto"
          src="data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAE1wZWcgR2VuZXJhdG9yIDEuMC4wLjEwMwAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAFdwCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////"
        />
      </div>
    </div>
  );
}