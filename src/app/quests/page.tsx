'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { QuestBoard } from '@/components/quests/QuestBoard';

export default function QuestsPage() {
  const router = useRouter();

  const handleCreateQuest = () => {
    router.push('/quests/create');
  };

  const handleViewQuest = (questId: string) => {
    router.push(`/quests/${questId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <QuestBoard 
        onCreateQuest={handleCreateQuest}
        onViewQuest={handleViewQuest}
      />
    </div>
  );
}