"use client";

import React, { ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: Math.random().toString(36).substring(7),
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substring(7),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In a real app, this would send to an error monitoring service like Sentry
    console.log('Error ID:', this.state.errorId);
    console.log('Error:', error);
    console.log('Component Stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorId: Math.random().toString(36).substring(7),
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎭</div>
              <CardTitle className="text-red-600">Oops! Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error in your Life RPG adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Error ID:</strong> {this.state.errorId}</p>
                {this.state.error && (
                  <p className="mt-2 font-mono text-xs bg-secondary p-2 rounded">
                    {this.state.error.message}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="w-full">
                  Reload Page
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support with the error ID above
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different parts of the app
export function CharacterErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => console.error('Character system error:', error)}
      fallback={
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-amber-600">Character System Error</CardTitle>
            <CardDescription>
              There was an issue loading your character data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Character
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function QuestErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => console.error('Quest system error:', error)}
      fallback={
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-red-600">Quest System Error</CardTitle>
            <CardDescription>
              Unable to load quests at this time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Quests
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function BrainDumpErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => console.error('Brain dump system error:', error)}
      fallback={
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-purple-600">Brain Dump System Error</CardTitle>
            <CardDescription>
              There was an issue with the brain dump system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Brain Dump
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}