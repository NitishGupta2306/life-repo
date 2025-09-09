'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircleIcon, CircleIcon, TrophyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObjectiveItemProps {
  objective: {
    id: string;
    objectiveText: string;
    isCompleted: boolean;
    isRequired: boolean;
    xpReward: number;
  };
  onComplete?: (objectiveId: string) => void;
  disabled?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ObjectiveItem({ 
  objective, 
  onComplete, 
  disabled = false, 
  showActions = true,
  className 
}: ObjectiveItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (!onComplete || objective.isCompleted || disabled || isCompleting) return;

    setIsCompleting(true);
    try {
      await onComplete(objective.id);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      objective.isCompleted && "bg-green-50 border-green-200",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Completion Status */}
          <div className="flex items-center mt-0.5">
            {objective.isCompleted ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <CircleIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Objective Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className={cn(
                "text-sm font-medium leading-relaxed",
                objective.isCompleted && "line-through text-muted-foreground"
              )}>
                {objective.objectiveText}
              </p>
              
              {/* XP Reward */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <TrophyIcon className="w-3 h-3" />
                <span>{objective.xpReward} XP</span>
              </div>
            </div>

            {/* Badges and Actions Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {objective.isRequired && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    Required
                  </Badge>
                )}
                
                {objective.isCompleted && (
                  <Badge variant="default" className="text-xs h-5 px-2 bg-green-500">
                    ✓ Completed
                  </Badge>
                )}
              </div>

              {/* Actions */}
              {showActions && !objective.isCompleted && onComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleComplete}
                  disabled={disabled || isCompleting}
                  className="text-xs h-6 px-2"
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                      Completing...
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}