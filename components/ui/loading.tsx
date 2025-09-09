"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            'bg-muted rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            lines > 1 ? 'h-4 mb-2' : 'h-4'
          )}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('p-6 border rounded-lg', className)}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  title = 'Loading...', 
  description,
  size = 'md',
  className 
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <LoadingSpinner size={size} className="mb-4 text-primary" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
      )}
    </div>
  );
}

// Specialized loading components for different sections
export function CharacterLoadingState() {
  return (
    <LoadingState
      title="Loading your character..."
      description="Preparing your Life RPG adventure data"
      size="lg"
    />
  );
}

export function QuestLoadingState() {
  return (
    <div className="space-y-4 p-4">
      <LoadingSkeleton lines={1} className="h-8 w-48" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function BrainDumpLoadingState() {
  return (
    <LoadingState
      title="Processing thoughts..."
      description="Analyzing your brain dump with AI assistance"
    />
  );
}

export function ReflectionLoadingState() {
  return (
    <LoadingState
      title="Loading reflections..."
      description="Gathering your personal insights and patterns"
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingComponent 
}: LoadingOverlayProps) {
  if (isLoading) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {loadingComponent || <LoadingSpinner size="lg" />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
}