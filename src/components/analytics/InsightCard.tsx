'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Lightbulb,
  Heart,
  Brain,
  Target
} from 'lucide-react';

interface Insight {
  type: string;
  priority: number;
  title: string;
  description: string;
  actionable: boolean;
  category: string;
  data?: any;
}

interface InsightCardProps {
  insight: Insight;
  onAction?: (insight: Insight) => void;
}

export function InsightCard({ insight, onAction }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern_warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'pattern_success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mood_concern':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'mood_celebration':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'progress_celebration':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'progress_concern':
        return <Target className="h-4 w-4 text-amber-600" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadgeVariant = (priority: number) => {
    if (priority >= 8) return "destructive";
    if (priority >= 6) return "default";
    return "secondary";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return "High";
    if (priority >= 6) return "Medium";
    return "Low";
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getInsightIcon(insight.type)}
            <CardTitle className="text-base">{insight.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {insight.category}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(insight.priority)} className="text-xs">
              {getPriorityLabel(insight.priority)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {insight.description}
        </p>
        
        {insight.actionable && onAction && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAction(insight)}
            className="w-full"
          >
            Take Action
          </Button>
        )}
        
        {!insight.actionable && (
          <div className="text-xs text-muted-foreground italic">
            Keep up the great work! 🎉
          </div>
        )}
      </CardContent>
    </Card>
  );
}