"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  X, 
  Clock,
  Heart,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Bell
} from 'lucide-react';

interface Reminder {
  id: string;
  reminderText: string;
  reminderType: 'gentle_nudge' | 'celebration' | 'encouragement' | 'self_care';
  priority: number; // 1-5 scale
  contextTags: string[];
  createdAt: string;
}

interface GentleReminderProps {
  reminder: Reminder;
  onDismiss: (id: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
  showActions?: boolean;
}

const REMINDER_STYLES = {
  gentle_nudge: {
    icon: Bell,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  celebration: {
    icon: Sparkles,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    badgeColor: 'bg-green-100 text-green-800'
  },
  encouragement: {
    icon: Heart,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  self_care: {
    icon: Heart,
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-800',
    badgeColor: 'bg-pink-100 text-pink-800'
  }
};

const SNOOZE_OPTIONS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: 'Later today', minutes: 240 }
];

export default function GentleReminder({ 
  reminder, 
  onDismiss, 
  onSnooze,
  showActions = true 
}: GentleReminderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const style = REMINDER_STYLES[reminder.reminderType];
  const IconComponent = style.icon;

  const handleSnooze = (minutes: number) => {
    if (onSnooze) {
      onSnooze(reminder.id, minutes);
    }
    setShowSnoozeOptions(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  };

  return (
    <Alert 
      className={`${style.bgColor} ${style.borderColor} transition-all duration-200 hover:shadow-sm`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3 flex-1">
          <IconComponent className={`h-4 w-4 mt-0.5 ${style.textColor}`} />
          
          <div className="flex-1 space-y-2">
            <AlertDescription className={`${style.textColor} text-sm leading-relaxed`}>
              {reminder.reminderText}
            </AlertDescription>
            
            {/* Tags and metadata */}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={style.badgeColor}>
                {reminder.reminderType.replace('_', ' ')}
              </Badge>
              
              {reminder.priority >= 3 && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {getPriorityLabel(reminder.priority)} Priority
                </Badge>
              )}
              
              <span className="text-muted-foreground">
                {formatTimeAgo(reminder.createdAt)}
              </span>
            </div>

            {/* Context tags */}
            {reminder.contextTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reminder.contextTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDismiss(reminder.id)}
                  className={`h-7 ${style.textColor} hover:bg-white/50`}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Got it
                </Button>

                {onSnooze && (
                  <div className="relative">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                      className={`h-7 ${style.textColor} hover:bg-white/50`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Snooze
                    </Button>

                    {/* Snooze dropdown */}
                    {showSnoozeOptions && (
                      <Card className="absolute top-full left-0 mt-1 z-10 shadow-lg">
                        <CardContent className="p-2">
                          <div className="space-y-1">
                            {SNOOZE_OPTIONS.map((option) => (
                              <Button
                                key={option.minutes}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSnooze(option.minutes)}
                                className="w-full justify-start h-7"
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDismiss(reminder.id)}
                  className={`h-7 ${style.textColor} hover:bg-white/50 ml-auto`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Component for displaying multiple reminders
interface GentleReminderListProps {
  reminders: Reminder[];
  onDismiss: (id: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
  maxVisible?: number;
}

export function GentleReminderList({ 
  reminders, 
  onDismiss, 
  onSnooze,
  maxVisible = 3 
}: GentleReminderListProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleReminders = showAll 
    ? reminders 
    : reminders.slice(0, maxVisible);

  const hiddenCount = reminders.length - maxVisible;

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleReminders.map((reminder) => (
        <GentleReminder
          key={reminder.id}
          reminder={reminder}
          onDismiss={onDismiss}
          onSnooze={onSnooze}
        />
      ))}
      
      {hiddenCount > 0 && !showAll && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAll(true)}
            >
              Show {hiddenCount} more reminder{hiddenCount !== 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Preset gentle reminders for common ADHD needs
export const PRESET_REMINDERS: Omit<Reminder, 'id' | 'createdAt'>[] = [
  {
    reminderText: "💙 You've been working hard. It's okay to take a break when you need it.",
    reminderType: 'self_care',
    priority: 2,
    contextTags: ['break', 'self-compassion']
  },
  {
    reminderText: "🌟 Remember: progress isn't always linear. Small steps are still progress!",
    reminderType: 'encouragement',
    priority: 2,
    contextTags: ['motivation', 'progress']
  },
  {
    reminderText: "💧 Don't forget to drink some water. Your brain needs hydration to function well!",
    reminderType: 'gentle_nudge',
    priority: 3,
    contextTags: ['hydration', 'health']
  },
  {
    reminderText: "🎉 You completed a task! That's worth celebrating, no matter how small it seems.",
    reminderType: 'celebration',
    priority: 2,
    contextTags: ['celebration', 'accomplishment']
  },
  {
    reminderText: "🧠 Your ADHD brain is creative and unique. Don't let anyone (including yourself) tell you otherwise.",
    reminderType: 'encouragement',
    priority: 2,
    contextTags: ['self-acceptance', 'neurodivergent']
  },
  {
    reminderText: "⏰ It might be a good time to check in with your energy levels. How are your spoons doing?",
    reminderType: 'gentle_nudge',
    priority: 2,
    contextTags: ['energy', 'spoons', 'check-in']
  }
];