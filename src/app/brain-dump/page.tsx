'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuestGenerator } from '@/components/QuestGenerator';

interface BrainDump {
  id: string;
  rawText: string;
  processed: boolean;
  processingStatus: string;
  createdAt: string;
}

interface ProcessingResult {
  interpretation: string;
  suggestedAction: string;
  detectedUrgency: string;
  detectedEmotions: string[];
  categories: string[];
  priority: string;
  extractedTasks: Array<{
    text: string;
    urgency: string;
    category: string;
  }>;
  tags: string[];
  detectedMood?: string;
  confidenceScore: number;
}

export default function BrainDumpPage() {
  const [rawText, setRawText] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentDump, setCurrentDump] = useState<BrainDump | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [mood, setMood] = useState<'terrible' | 'bad' | 'okay' | 'good' | 'amazing'>('okay');
  const [recentDumps, setRecentDumps] = useState<BrainDump[]>([]);

  // Auto-save functionality
  const autoSave = useCallback(async (text: string) => {
    if (text.trim().length === 0) return;
    
    setIsAutoSaving(true);
    try {
      const response = await fetch('/api/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text, inputMethod: 'text' })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCurrentDump(result.data);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawText.trim() !== '' && (!lastSaved || Date.now() - lastSaved.getTime() > 30000)) {
        autoSave(rawText);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [rawText, lastSaved, autoSave]);

  // Load recent brain dumps
  useEffect(() => {
    const loadRecentDumps = async () => {
      try {
        const response = await fetch('/api/brain-dump?limit=5');
        if (response.ok) {
          const result = await response.json();
          setRecentDumps(result.data);
        }
      } catch (error) {
        console.error('Failed to load recent dumps:', error);
      }
    };

    loadRecentDumps();
  }, []);

  const handleProcessWithAI = async () => {
    if (!currentDump && rawText.trim()) {
      // Save first if not already saved
      await autoSave(rawText);
    }

    if (!currentDump) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/brain-dump/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDumpId: currentDump.id })
      });

      if (response.ok) {
        const result = await response.json();
        setProcessingResult(result.data.aiResult);
        setCurrentDump(prev => prev ? { ...prev, processed: true, processingStatus: 'completed' } : null);
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewDump = () => {
    setRawText('');
    setCurrentDump(null);
    setProcessingResult(null);
    setLastSaved(null);
  };

  const wordCount = rawText.split(' ').filter(word => word.length > 0).length;
  const charCount = rawText.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Brain Dump</h1>
            <button
              onClick={handleNewDump}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              New Dump
            </button>
          </div>

          {/* Mood Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling right now?
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as 'terrible' | 'bad' | 'okay' | 'good' | 'amazing')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="terrible">😰 Terrible</option>
              <option value="bad">😞 Bad</option>
              <option value="okay">😐 Okay</option>
              <option value="good">😊 Good</option>
              <option value="amazing">🤩 Amazing</option>
            </select>
          </div>

          {/* Main Input Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dump your thoughts here (no filter needed!)
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Just start typing... Whatever's in your head, dump it here. The AI will help make sense of it later."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
            />
          </div>

          {/* Stats and Actions */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {isAutoSaving && <span className="text-blue-500">Saving...</span>}
              {lastSaved && !isAutoSaving && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
            <button
              onClick={handleProcessWithAI}
              disabled={isProcessing || !rawText.trim() || (!currentDump && rawText.trim().length === 0)}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Process with AI'}
            </button>
          </div>
        </div>

        {/* Processing Results */}
        {processingResult && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interpretation */}
              <div className="col-span-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Interpretation</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{processingResult.interpretation}</p>
              </div>

              {/* Detected Mood */}
              {processingResult.detectedMood && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detected Mood</h3>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {processingResult.detectedMood}
                  </span>
                </div>
              )}

              {/* Priority & Urgency */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Priority & Urgency</h3>
                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    processingResult.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    processingResult.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    processingResult.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {processingResult.priority} priority
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm ml-2">
                    {processingResult.detectedUrgency}
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-1">
                  {processingResult.categories.map((category, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emotions */}
              {processingResult.detectedEmotions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detected Emotions</h3>
                  <div className="flex flex-wrap gap-1">
                    {processingResult.detectedEmotions.map((emotion, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-pink-100 text-pink-700 rounded-md text-sm">
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggested Action</h3>
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {processingResult.suggestedAction.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Confidence Score */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confidence Score</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${processingResult.confidenceScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(processingResult.confidenceScore * 100)}%</span>
                </div>
              </div>

              {/* Extracted Tasks */}
              {processingResult.extractedTasks.length > 0 && (
                <div className="col-span-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Extracted Tasks</h3>
                  <div className="space-y-2">
                    {processingResult.extractedTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <span>{task.text}</span>
                        <div className="flex space-x-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {task.urgency}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {processingResult.tags.length > 0 && (
                <div className="col-span-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {processingResult.tags.map((tag, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Quest Generation */}
            {currentDump && (
              <QuestGenerator 
                brainDumpId={currentDump.id} 
                processingResult={processingResult}
                onQuestGenerated={(quest) => {
                  console.log('Quest generated:', quest);
                  // Could add success toast or navigation here
                }}
              />
            )}
          </>
        )}

        {/* Recent Dumps */}
        {recentDumps.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Brain Dumps</h2>
            <div className="space-y-3">
              {recentDumps.map((dump) => (
                <div key={dump.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm line-clamp-2">{dump.rawText}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(dump.createdAt).toLocaleString()} • 
                        <span className={`ml-1 ${
                          dump.processed ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {dump.processed ? 'Processed' : 'Pending'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setRawText(dump.rawText);
                        setCurrentDump(dump);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm ml-2"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}