interface ProcessingStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed';
}

export function ProcessingStatusBadge({ status }: ProcessingStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', text: 'Processing...' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'needs_review':
        return { color: 'bg-orange-100 text-orange-800', text: 'Needs Review' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', text: 'Failed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}