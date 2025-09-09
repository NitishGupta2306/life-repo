interface MoodIndicatorProps {
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MoodIndicator({ mood, size = 'md', showLabel = true }: MoodIndicatorProps) {
  const getMoodConfig = (mood: string) => {
    switch (mood) {
      case 'terrible':
        return { emoji: '😰', color: 'bg-red-100 text-red-800', label: 'Terrible' };
      case 'bad':
        return { emoji: '😞', color: 'bg-orange-100 text-orange-800', label: 'Bad' };
      case 'okay':
        return { emoji: '😐', color: 'bg-yellow-100 text-yellow-800', label: 'Okay' };
      case 'good':
        return { emoji: '😊', color: 'bg-green-100 text-green-800', label: 'Good' };
      case 'amazing':
        return { emoji: '🤩', color: 'bg-purple-100 text-purple-800', label: 'Amazing' };
      default:
        return { emoji: '😐', color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-lg';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getMoodConfig(mood);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses}`}>
      <span className="mr-1">{config.emoji}</span>
      {showLabel && config.label}
    </span>
  );
}