/**
 * Decision Loop Component
 * 
 * React UI for the decision loop feature. Allows users to submit decisions,
 * see agent responses (affirm + challenge), and view relevant memories.
 * 
 * Usage:
 *   import DecisionLoop from '@/components/DecisionLoop';
 *   <DecisionLoop userId="user_123" />
 */

'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, Brain, Clock, TrendingUp } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DecisionResponse {
  decision: {
    id: string;
    text: string;
    context: string;
    category: string | null;
    createdAt: string;
  };
  agents: {
    affirm: {
      response: string;
      confidence: number;
      reasoning: string;
      actions: string[];
      latency: number;
      model: string;
    };
    challenge?: {
      response: string;
      confidence: number;
      reasoning: string;
      actions: string[];
      latency: number;
      model: string;
    };
  };
  memories: Array<{
    id: string;
    content: string;
    relevanceScore: number;
    category: string | null;
    createdAt: string;
  }>;
  meta: {
    processingTime: number;
    multiAgentEnabled: boolean;
    memoriesUsed: number;
    disagreement: boolean;
  };
}

interface DecisionLoopProps {
  userId: string;
  onDecisionComplete?: (response: DecisionResponse) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DecisionLoop({ userId, onDecisionComplete }: DecisionLoopProps) {
  // Form state
  const [decisionText, setDecisionText] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<DecisionResponse | null>(null);
  
  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (decisionText.length < 10) {
      setError('Decision text must be at least 10 characters');
      return;
    }
    
    if (context.length < 10) {
      setError('Context must be at least 10 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          decisionText,
          context,
          category: category || undefined,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process decision');
      }
      
      setResponse(data);
      
      // Callback for parent component
      if (onDecisionComplete) {
        onDecisionComplete(data);
      }
      
      // Clear form
      setDecisionText('');
      setContext('');
      setCategory('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Decision submission error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-hustlex-cyan" />
          <h1 className="text-3xl font-bold text-white">Decision Loop</h1>
        </div>
        <p className="text-gray-400">
          Get AI-powered insights on your decisions from multiple perspectives
        </p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        {/* Decision Text */}
        <div>
          <label htmlFor="decision" className="block text-white font-medium mb-2">
            Your Decision
          </label>
          <textarea
            id="decision"
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder="What decision are you considering? (e.g., 'I want to attend a coding bootcamp')"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-hustlex-cyan focus:ring-1 focus:ring-hustlex-cyan"
            rows={3}
            disabled={loading}
            required
          />
          <p className="text-gray-500 text-sm mt-1">
            {decisionText.length}/2000 characters
          </p>
        </div>
        
        {/* Context */}
        <div>
          <label htmlFor="context" className="block text-white font-medium mb-2">
            Context & Background
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide context about your situation, goals, and any concerns..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-hustlex-cyan focus:ring-1 focus:ring-hustlex-cyan"
            rows={4}
            disabled={loading}
            required
          />
          <p className="text-gray-500 text-sm mt-1">
            {context.length}/5000 characters
          </p>
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-white font-medium mb-2">
            Category (Optional)
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-hustlex-cyan focus:ring-1 focus:ring-hustlex-cyan"
            disabled={loading}
          >
            <option value="">Select a category...</option>
            <option value="recovery">Recovery</option>
            <option value="career">Career</option>
            <option value="education">Education</option>
            <option value="relationships">Relationships</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="personal">Personal Growth</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-hustlex-cyan to-hustlex-purple text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get Agent Insights
            </>
          )}
        </button>
      </form>
      
      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          {/* Meta Info */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{response.meta.processingTime}ms</span>
              </div>
              {response.meta.memoriesUsed > 0 && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">{response.meta.memoriesUsed} memories used</span>
                </div>
              )}
              {response.meta.disagreement && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Agents disagree</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Affirm Agent Response */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">Affirm Agent</h3>
              <span className="text-sm text-gray-400">
                ({Math.round(response.agents.affirm.confidence * 100)}% confident)
              </span>
            </div>
            
            <p className="text-gray-300 mb-4">{response.agents.affirm.response}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Reasoning:</h4>
              <p className="text-gray-400 text-sm">{response.agents.affirm.reasoning}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Actions:</h4>
              <ul className="space-y-1">
                {response.agents.affirm.actions.map((action, idx) => (
                  <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Challenge Agent Response */}
          {response.agents.challenge && (
            <div className="glass-card rounded-2xl p-6 border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold text-white">Challenge Agent</h3>
                <span className="text-sm text-gray-400">
                  ({Math.round(response.agents.challenge.confidence * 100)}% confident)
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{response.agents.challenge.response}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Reasoning:</h4>
                <p className="text-gray-400 text-sm">{response.agents.challenge.reasoning}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Actions:</h4>
                <ul className="space-y-1">
                  {response.agents.challenge.actions.map((action, idx) => (
                    <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Memories Used */}
          {response.memories.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-hustlex-purple" />
                <h3 className="text-lg font-semibold text-white">Relevant Memories</h3>
              </div>
              
              <div className="space-y-3">
                {response.memories.map((memory) => (
                  <div key={memory.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-gray-300 text-sm mb-2">{memory.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Relevance: {Math.round(memory.relevanceScore * 100)}%</span>
                      {memory.category && <span className="capitalize">{memory.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
