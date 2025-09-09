interface ConfidenceBarProps {
  confidence: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBar({ confidence, showPercentage = true, size = 'md' }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);
  
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHeightClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'lg':
        return 'h-4';
      default:
        return 'h-2';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${getHeightClass(size)}`}>
        <div
          className={`${getHeightClass(size)} rounded-full transition-all duration-300 ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className={`font-medium ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
        } text-gray-600`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}