'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  showLabel = false,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md'
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getVariantClass = () => {
    if (clampedPercentage === 100) return variantStyles.success;
    if (clampedPercentage >= 75) return variantStyles.default;
    if (clampedPercentage >= 50) return variantStyles.warning;
    if (clampedPercentage < 25) return variantStyles.danger;
    return variantStyles[variant];
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {showLabel && (
            <span className="font-medium text-muted-foreground">
              {label || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className="text-muted-foreground">
              {value}/{max} ({clampedPercentage}%)
            </span>
          )}
        </div>
      )}
      <div className={cn("relative w-full bg-gray-200 rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", getVariantClass())}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}