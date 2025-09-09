'use client';

import { useState } from 'react';

interface QuestGeneratorProps {
  brainDumpId: string;
  processingResult?: {
    suggestedAction?: string;
    detectedUrgency?: string;
    extractedTasks?: Array<{ text: string; urgency: string; category: string; }>;
  };
  onQuestGenerated?: (quest: GeneratedQuest) => void;
}

interface GeneratedQuest {
  quest: {
    id: string;
    questName: string;
    questDescription: string;
    questType: string;
    difficulty: string;
    xpReward: number;
  };
  objectives: Array<{
    id: string;
    objectiveText: string;
    objectiveOrder: number;
    xpReward: number;
  }>;
  confidenceScore: number;
}

export function QuestGenerator({ brainDumpId, processingResult, onQuestGenerated }: QuestGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState<GeneratedQuest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customQuestName, setCustomQuestName] = useState('');
  const [questType, setQuestType] = useState<'main' | 'side' | 'daily' | 'weekly' | 'epic'>('side');
  const [difficulty, setDifficulty] = useState<'trivial' | 'easy' | 'normal' | 'hard' | 'legendary'>('normal');

  const handleGenerateQuest = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/brain-dump/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brainDumpId,
          questName: customQuestName || undefined,
          questType,
          difficulty,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quest');
      }

      const result = await response.json();
      setGeneratedQuest(result.data);
      onQuestGenerated?.(result.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quest');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial': return 'text-gray-600';
      case 'easy': return 'text-green-600';
      case 'normal': return 'text-blue-600';
      case 'hard': return 'text-orange-600';
      case 'legendary': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return '⭐';
      case 'side': return '📋';
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'epic': return '🏆';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Quest</h3>
      
      {!generatedQuest ? (
        <div className="space-y-4">
          {/* Quest Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quest Name (optional)
              </label>
              <input
                type="text"
                value={customQuestName}
                onChange={(e) => setCustomQuestName(e.target.value)}
                placeholder="Let AI generate a name"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quest Type
              </label>
              <select
                value={questType}
                onChange={(e) => setQuestType(e.target.value as 'main' | 'side' | 'daily' | 'weekly' | 'epic')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="side">📋 Side Quest</option>
                <option value="main">⭐ Main Quest</option>
                <option value="daily">📅 Daily Quest</option>
                <option value="weekly">📆 Weekly Quest</option>
                <option value="epic">🏆 Epic Quest</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'trivial' | 'easy' | 'normal' | 'hard' | 'legendary')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="trivial">Trivial</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          {/* AI Suggestions */}
          {processingResult && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">AI Suggestions:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {processingResult.suggestedAction && (
                  <p>• Suggested action: {processingResult.suggestedAction.replace(/_/g, ' ')}</p>
                )}
                {processingResult.detectedUrgency !== 'unknown' && (
                  <p>• Urgency: {processingResult.detectedUrgency}</p>
                )}
                {(processingResult.extractedTasks?.length || 0) > 0 && (
                  <p>• Found {processingResult.extractedTasks?.length} potential task(s)</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateQuest}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isGenerating ? 'Generating Quest...' : '🎯 Generate Quest'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        /* Generated Quest Display */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                {getQuestTypeIcon(generatedQuest.quest.questType)}
                <span className="ml-2">{generatedQuest.quest.questName}</span>
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${getDifficultyColor(generatedQuest.quest.difficulty)}`}>
                  {generatedQuest.quest.difficulty.toUpperCase()}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                  {generatedQuest.quest.xpReward} XP
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{generatedQuest.quest.questDescription}</p>
            
            <div className="bg-white p-4 rounded-md">
              <h5 className="font-medium text-gray-900 mb-2">Objectives:</h5>
              <ul className="space-y-2">
                {generatedQuest.objectives.map((objective, index) => (
                  <li key={objective.id} className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-700">{objective.objectiveText}</span>
                      <span className="text-gray-500 text-sm ml-2">({objective.xpReward} XP)</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>AI Confidence: </span>
                <div className="w-16 bg-gray-200 rounded-full h-2 ml-2 mr-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${generatedQuest.confidenceScore * 100}%` }}
                  />
                </div>
                <span>{Math.round(generatedQuest.confidenceScore * 100)}%</span>
              </div>
              <button
                onClick={() => {
                  setGeneratedQuest(null);
                  setCustomQuestName('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Generate Another
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-green-600 text-xl mr-2">✅</span>
              <div>
                <p className="text-green-800 font-medium">Quest Generated Successfully!</p>
                <p className="text-green-700 text-sm">
                  Your quest has been added to your quest log. You can start working on it right away!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}