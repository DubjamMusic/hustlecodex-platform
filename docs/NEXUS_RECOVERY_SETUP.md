# Nexus Recovery Setup Guide

> **AI-Powered Recovery Platform** — Comprehensive setup guide for implementing Nexus Recovery features in HustleCodeX

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [AI Integration (OpenAI)](#ai-integration-openai)
6. [Environment Configuration](#environment-configuration)
7. [Component Implementation](#component-implementation)
8. [API Routes](#api-routes)
9. [Feature Flags](#feature-flags)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Next Steps](#next-steps)

---

## Overview

**Nexus Recovery** is an AI-powered recovery support system integrated into HustleCodeX. It combines:

- **AI Twin Chat**: Personal AI guide powered by OpenAI GPT-3.5-turbo
- **Decision Simulator**: Visualize consequences before making choices
- **Quest System**: Gamified daily tasks with XP and progression
- **User Profiles**: Track recovery status, streaks, and achievements
- **Community Features**: Resource mapping and peer support (roadmap)

### Why Nexus Recovery?

Traditional recovery apps focus on tracking, but Nexus provides **proactive decision support**. By simulating outcomes and providing AI coaching, users can make better choices in real-time, transforming their recovery journey into an engaging, skill-building experience.

---

## Prerequisites

### Required Accounts & Services

1. **Supabase Account** (Free tier available)
   - URL: https://supabase.com
   - Used for: Database, authentication, real-time features
   - Cost: Free for up to 500MB database, 50K monthly active users

2. **OpenAI API Account** (Paid)
   - URL: https://platform.openai.com
   - Used for: AI Twin chat, decision simulation
   - Cost: ~$0.002 per 1K tokens (GPT-3.5-turbo)
   - Estimated: $10-50/month for small-medium usage

### Local Development Requirements

- **Node.js**: 18.0.0 or higher
- **Package Manager**: npm or pnpm (pnpm recommended)
- **TypeScript**: 5.7+ (included in dependencies)
- **Git**: For version control

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TwinChat    │  │  Decision    │  │  QuestList   │  │
│  │  Component   │  │  Simulator   │  │  Component   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│               Next.js API Routes (/pages/api)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ /api/twin/   │  │ /api/twin/   │  │ /api/quests/ │  │
│  │ chat.ts      │  │ simulate.ts  │  │ [id].ts      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────┐    ┌──────────────────────────┐
│   OpenAI API        │    │   Supabase Backend       │
│   (GPT-3.5-turbo)   │    │  ┌────────────────────┐  │
│   - Chat completion │    │  │  PostgreSQL DB     │  │
│   - Context mgmt    │    │  │  - Users           │  │
│   - Streaming       │    │  │  - Profiles        │  │
└─────────────────────┘    │  │  - Quests          │  │
                           │  │  - Chat history    │  │
                           │  └────────────────────┘  │
                           │  ┌────────────────────┐  │
                           │  │  Supabase Auth     │  │
                           │  │  - JWT tokens      │  │
                           │  │  - Session mgmt    │  │
                           │  └────────────────────┘  │
                           └──────────────────────────┘
```

### Technology Decisions

| Component | Technology | Why? |
|-----------|-----------|------|
| **Database** | Supabase (PostgreSQL) | Free tier, real-time subscriptions, built-in auth, TypeScript SDK |
| **AI Model** | OpenAI GPT-3.5-turbo | Cost-effective ($0.002/1K tokens), fast responses, reliable API |
| **State Management** | Zustand + React Query | Lightweight, minimal boilerplate, great TypeScript support |
| **Authentication** | Supabase Auth | Integrated with database, supports social logins, JWT-based |
| **API Pattern** | Next.js API Routes | Serverless, automatic API endpoints, easy deployment |

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `hustlecodex-dev` (or your preference)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project creation

### Step 2: Database Schema

Create the following tables using Supabase SQL Editor:

#### Users Table (extends Supabase auth.users)

```sql
-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  recovery_start_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policies: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Quests Table

```sql
-- Quests table
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'daily', 'weekly', 'milestone', 'coding'
  xp_reward INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  prerequisites JSONB, -- Array of quest IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Policies: All authenticated users can read quests
CREATE POLICY "Authenticated users can view quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (is_active = true);
```

#### User Quest Completions

```sql
-- Track quest completions
CREATE TABLE public.user_quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER NOT NULL,
  notes TEXT,
  UNIQUE(user_id, quest_id)
);

-- Enable RLS
ALTER TABLE public.user_quest_completions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own completions"
  ON public.user_quest_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.user_quest_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Chat History (Optional)

```sql
-- Store chat conversations for context
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Seed Data (Optional)

```sql
-- Insert sample quests
INSERT INTO public.quests (title, description, category, xp_reward, difficulty) VALUES
  ('First Code Commit', 'Make your first git commit to a repository', 'milestone', 50, 'easy'),
  ('Daily Check-in', 'Complete your daily recovery check-in', 'daily', 10, 'easy'),
  ('Learn TypeScript Basics', 'Complete the TypeScript fundamentals tutorial', 'coding', 30, 'medium'),
  ('Help a Peer', 'Respond to someone in the community forum', 'daily', 15, 'easy'),
  ('Build a Component', 'Create a React component from scratch', 'coding', 40, 'medium'),
  ('7-Day Streak', 'Maintain a 7-day check-in streak', 'milestone', 100, 'hard');
```

---

## AI Integration (OpenAI)

### Step 1: Get API Key

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to **API keys** section
3. Click **"Create new secret key"**
4. Name it: `hustlecodex-nexus`
5. **Copy the key immediately** (you won't see it again)
6. Set usage limits (recommended: $50/month cap)

### Step 2: Test API Connection

```bash
# Test your OpenAI API key
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

Expected response:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?"
      }
    }
  ]
}
```

---

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env.local
```

### Step 2: Configure Variables

Edit `.env.local`:

```bash
# ============================================
# Core Application
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="HustleCodeX - Reality Recovery Platform"

# ============================================
# Supabase Configuration
# ============================================
# Get these from: https://app.supabase.com/project/<your-project>/settings/api

# Public (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-only (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# OpenAI Configuration
# ============================================
# Server-only (NEVER expose to browser)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Customize AI behavior
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# ============================================
# Feature Flags
# ============================================
NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_COMMUNITY_MAPPING=false

# ============================================
# Optional Analytics
# ============================================
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

### Step 3: Verify Configuration

Create a test script at `scripts/verify-env.js`:

```javascript
// scripts/verify-env.js
require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

console.log('🔍 Verifying environment variables...\n');

let allPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 20)}...` : 'MISSING';
  console.log(`${status} ${varName}: ${display}`);
  if (!value) allPresent = false;
});

console.log('\n' + (allPresent ? '✅ All required variables present!' : '❌ Missing required variables'));
process.exit(allPresent ? 0 : 1);
```

Run verification:
```bash
node scripts/verify-env.js
```

---

## Component Implementation

### 1. Supabase Client Setup

Create `lib/supabase.ts`:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (uses service role key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// TypeScript types for database tables
export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  recovery_start_date: string | null;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone' | 'coding';
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserQuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
  xp_earned: number;
  notes: string | null;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
```

Install Supabase dependency:
```bash
npm install @supabase/supabase-js
```

### 2. OpenAI Utilities

Create `lib/openai.ts`:

```typescript
// lib/openai.ts
import OpenAI from 'openai';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatCompletionParams {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Generate AI Twin chat response
 */
export async function generateChatResponse(
  params: ChatCompletionParams
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: params.messages,
    temperature: params.temperature || 0.7,
    max_tokens: params.max_tokens || 500,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Generate decision simulation
 */
export async function simulateDecision(decision: string): Promise<{
  goodPath: string;
  badPath: string;
}> {
  const systemPrompt = `You are an AI recovery coach. Given a decision, provide:
1. A "Good Path" outcome (positive, recovery-focused)
2. A "Bad Path" outcome (realistic consequences)
Keep each path to 2-3 sentences. Be empathetic but honest.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Decision: ${decision}` },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content || '';
  
  // Parse response (expecting format: "Good Path: ...\n\nBad Path: ...")
  const parts = content.split(/Bad Path:/i);
  const goodPath = parts[0]?.replace(/Good Path:/i, '').trim() || 'Unable to generate outcome';
  const badPath = parts[1]?.trim() || 'Unable to generate outcome';

  return { goodPath, badPath };
}

export { openai };
```

Install OpenAI dependency:
```bash
npm install openai
```

### 3. TwinChat Component

Create `components/TwinChat.tsx`:

```typescript
// components/TwinChat.tsx
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TwinChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there! I'm your AI Twin. I'm here to help you navigate tough decisions and build your coding skills. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-deep-black/80 backdrop-blur-md rounded-lg border border-gold/20">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gold/20">
        <h2 className="text-xl font-cinzel text-gold">AI Twin Chat</h2>
        <p className="text-sm text-gray-400 mt-1">Your personal recovery guide</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gold/20 text-white'
                  : 'bg-prestige-blue/20 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-prestige-blue/20 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-400">AI Twin is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gold/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-deep-black border border-gold/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gold hover:bg-gold/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-deep-black rounded-lg px-4 py-2 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. DecisionSimulator Component

Create `components/DecisionSimulator.tsx`:

```typescript
// components/DecisionSimulator.tsx
import { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface SimulationResult {
  goodPath: string;
  badPath: string;
}

export default function DecisionSimulator() {
  const [decision, setDecision] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    if (!decision.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) throw new Error('Simulation failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Failed to simulate decision. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-deep-black/80 backdrop-blur-md rounded-lg border border-gold/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-cinzel text-gold">Decision Simulator</h2>
        <p className="text-sm text-gray-400 mt-1">
          Visualize the paths ahead before you choose
        </p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-300 mb-2">
          What decision are you facing?
        </label>
        <textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="e.g., Should I go to the party tonight or stay home and code?"
          className="w-full bg-deep-black border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Simulate Button */}
      <button
        onClick={handleSimulate}
        disabled={!decision.trim() || isLoading}
        className="w-full bg-gold hover:bg-gold/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-deep-black font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>Simulating...</>
        ) : (
          <>
            Simulate Decision <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {/* Good Path */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-green-400">Good Path</h3>
            </div>
            <p className="text-sm text-gray-200">{result.goodPath}</p>
          </div>

          {/* Bad Path */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Bad Path</h3>
            </div>
            <p className="text-sm text-gray-200">{result.badPath}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5. QuestList Component

Create `components/QuestList.tsx`:

```typescript
// components/QuestList.tsx
import { useState, useEffect } from 'react';
import { Trophy, Star, Clock, CheckCircle } from 'lucide-react';
import { supabase, Quest } from '@/lib/supabase';

export default function QuestList() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      // Fetch active quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('xp_reward', { ascending: false });

      if (questsError) throw questsError;
      setQuests(questsData || []);

      // Fetch user's completed quests
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: completions } = await supabase
          .from('user_quest_completions')
          .select('quest_id')
          .eq('user_id', user.id);

        setCompletedQuestIds(new Set(completions?.map(c => c.quest_id) || []));
      }
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: string, xpReward: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to complete quests');
        return;
      }

      // Record completion
      const { error } = await supabase
        .from('user_quest_completions')
        .insert({
          user_id: user.id,
          quest_id: questId,
          xp_earned: xpReward,
        });

      if (error) throw error;

      setCompletedQuestIds(prev => new Set([...prev, questId]));
      alert(`Quest completed! +${xpReward} XP`);
    } catch (error) {
      console.error('Error completing quest:', error);
      alert('Failed to complete quest');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return <Clock className="w-4 h-4" />;
      case 'milestone': return <Trophy className="w-4 h-4" />;
      case 'coding': return <Star className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-deep-black/80 backdrop-blur-md rounded-lg border border-gold/20 p-6">
        <p className="text-gray-400">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="bg-deep-black/80 backdrop-blur-md rounded-lg border border-gold/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-cinzel text-gold">Available Quests</h2>
        <p className="text-sm text-gray-400 mt-1">
          Complete quests to earn XP and level up
        </p>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {quests.map((quest) => {
          const isCompleted = completedQuestIds.has(quest.id);

          return (
            <div
              key={quest.id}
              className={`border rounded-lg p-4 transition-all ${
                isCompleted
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-gold/30 bg-deep-black/50 hover:border-gold/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(quest.category)}
                    <h3 className="font-semibold text-white">{quest.title}</h3>
                    <span className={`text-xs uppercase ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{quest.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {quest.xp_reward} XP
                    </span>
                    <span className="uppercase">{quest.category}</span>
                  </div>
                </div>

                {/* Complete Button */}
                {!isCompleted && (
                  <button
                    onClick={() => handleCompleteQuest(quest.id, quest.xp_reward)}
                    className="ml-4 bg-gold hover:bg-gold/80 text-deep-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Complete
                  </button>
                )}
                {isCompleted && (
                  <div className="ml-4 flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No quests available yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## API Routes

### 1. Chat API

Create `pages/api/twin/chat.ts`:

```typescript
// pages/api/twin/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateChatResponse } from '@/lib/openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Add system context for AI Twin
    const systemMessage = {
      role: 'system' as const,
      content: `You are an AI Twin recovery coach for HustleCodeX. Your role is to:
- Provide empathetic support for individuals in recovery
- Help users make better decisions using the Decision Simulator framework
- Encourage coding skill development as a positive outlet
- Be honest but supportive about challenges
- Celebrate progress and milestones
- Keep responses concise (2-4 sentences usually)
- Use encouraging language that focuses on growth and transformation

User context: This person is working on recovery and building coding skills simultaneously.`,
    };

    const response = await generateChatResponse({
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.status(200).json({ message: response });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
```

### 2. Decision Simulation API

Create `pages/api/twin/simulate.ts`:

```typescript
// pages/api/twin/simulate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { simulateDecision } from '@/lib/openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { decision } = req.body;

    if (!decision || typeof decision !== 'string') {
      return res.status(400).json({ error: 'Decision string required' });
    }

    if (decision.length < 10) {
      return res.status(400).json({ error: 'Please provide more details about your decision' });
    }

    const result = await simulateDecision(decision);

    res.status(200).json(result);
  } catch (error) {
    console.error('Simulation API error:', error);
    res.status(500).json({ error: 'Failed to simulate decision' });
  }
}
```

### 3. Nexus Dashboard Page

Create `pages/nexus.tsx`:

```typescript
// pages/nexus.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import TwinChat from '@/components/TwinChat';
import DecisionSimulator from '@/components/DecisionSimulator';
import QuestList from '@/components/QuestList';
import { supabase } from '@/lib/supabase';

export default function NexusDashboard() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if Nexus features are enabled
    const enabled = process.env.NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY === 'true';
    setIsEnabled(enabled);

    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-cinzel text-gold mb-4">Nexus Recovery</h1>
          <p className="text-gray-400 mb-6">
            Nexus Recovery features are not enabled. Please configure your environment variables.
          </p>
          <a
            href="/docs/NEXUS_RECOVERY_SETUP.md"
            className="text-gold hover:text-gold/80 underline"
          >
            View Setup Guide
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Nexus Recovery Dashboard - HustleCodeX</title>
        <meta name="description" content="AI-powered recovery support dashboard" />
      </Head>

      <div className="min-h-screen bg-deep-black text-white">
        {/* Header */}
        <header className="border-b border-gold/20 bg-deep-black/95 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-cinzel text-gold">Nexus Recovery</h1>
                <p className="text-sm text-gray-400 mt-1">Your AI-powered recovery companion</p>
              </div>
              <a
                href="/"
                className="text-gold hover:text-gold/80 text-sm transition-colors"
              >
                ← Back to Console
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {!user && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                ⚠️ Sign in to access all Nexus features and save your progress.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* AI Twin Chat */}
            <div>
              <TwinChat />
            </div>

            {/* Decision Simulator & Stats */}
            <div className="space-y-6">
              <DecisionSimulator />
              
              {/* User Stats (if logged in) */}
              {user && (
                <div className="bg-deep-black/80 backdrop-blur-md rounded-lg border border-gold/20 p-6">
                  <h3 className="text-lg font-cinzel text-gold mb-4">Your Progress</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gold">0</div>
                      <div className="text-xs text-gray-400">Total XP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gold">1</div>
                      <div className="text-xs text-gray-400">Level</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gold">0</div>
                      <div className="text-xs text-gray-400">Day Streak</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quest List */}
          <div className="mb-6">
            <QuestList />
          </div>
        </main>
      </div>
    </>
  );
}
```

---

## Feature Flags

The Nexus Recovery features are controlled by environment variables for gradual rollout.

### Configuration

In `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY=true  # Enable/disable entire feature set
NEXT_PUBLIC_ENABLE_PAYMENTS=false       # Payment gateway integration
NEXT_PUBLIC_ENABLE_COMMUNITY_MAPPING=false  # Community resource mapping
```

### Implementation Pattern

```typescript
// Check if feature is enabled before rendering
const isNexusEnabled = process.env.NEXT_PUBLIC_ENABLE_NEXUS_RECOVERY === 'true';

if (!isNexusEnabled) {
  return <FeatureDisabledMessage />;
}

// Render Nexus features
return <NexusDashboard />;
```

---

## Testing

### Unit Tests (Recommended)

Create test files for components:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

Example test for `TwinChat.tsx`:

```typescript
// components/__tests__/TwinChat.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TwinChat from '../TwinChat';

describe('TwinChat', () => {
  it('renders initial AI message', () => {
    render(<TwinChat />);
    expect(screen.getByText(/I'm your AI Twin/i)).toBeInTheDocument();
  });

  it('allows user to type and send messages', () => {
    render(<TwinChat />);
    const input = screen.getByPlaceholderText(/Type your message/i);
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input).toHaveValue('Hello');
  });
});
```

### Manual Testing Checklist

- [ ] AI Twin Chat responds to messages
- [ ] Decision Simulator generates both paths
- [ ] Quest List loads and displays quests
- [ ] Quest completion updates user XP
- [ ] Authentication flow works correctly
- [ ] Feature flags properly enable/disable features
- [ ] Mobile responsive design works
- [ ] Error states display appropriately

---

## Deployment

### Vercel Deployment

1. **Add Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - **Important**: Set separately for Production, Preview, and Development

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Verify**:
   - Visit `https://your-domain.vercel.app/nexus`
   - Test AI Twin chat functionality
   - Check decision simulator

### Environment Security Checklist

- [ ] `OPENAI_API_KEY` is NOT in `NEXT_PUBLIC_*` variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT in `NEXT_PUBLIC_*` variables
- [ ] `.env.local` is in `.gitignore`
- [ ] API routes validate authentication where required
- [ ] Rate limiting implemented for AI endpoints (recommended)

---

## Troubleshooting

### Common Issues

#### 1. "Supabase client error"

**Symptom**: Console errors about Supabase configuration

**Solution**:
```bash
# Verify environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Restart dev server
npm run dev
```

#### 2. "OpenAI API key invalid"

**Symptom**: 401 errors from OpenAI API

**Solution**:
- Verify key format starts with `sk-proj-` or `sk-`
- Check key hasn't expired or been revoked
- Verify billing is enabled on OpenAI account

#### 3. "Chat responses are slow"

**Symptom**: >5 second response times

**Solutions**:
- Use `gpt-3.5-turbo` instead of GPT-4 (10x faster)
- Reduce `max_tokens` parameter (default: 500)
- Implement response streaming (advanced)

#### 4. "Quests not loading"

**Symptom**: Empty quest list or loading spinner stuck

**Solution**:
```sql
-- Check if quests table has data
SELECT COUNT(*) FROM public.quests WHERE is_active = true;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'quests';
```

#### 5. "Feature flag not working"

**Symptom**: Nexus features don't appear after enabling

**Solution**:
```bash
# Environment variables must be prefixed with NEXT_PUBLIC_ for browser access
# Restart dev server after changing .env.local
pkill -f "next dev"
npm run dev
```

---

## Next Steps

### Phase 1: Core Implementation (Week 1-2)

- [ ] Set up Supabase project and run database migrations
- [ ] Implement authentication flow with Supabase Auth
- [ ] Create `lib/supabase.ts` and `lib/openai.ts` utility files
- [ ] Build TwinChat component with basic chat functionality
- [ ] Build DecisionSimulator component
- [ ] Build QuestList component
- [ ] Create `/api/twin/chat` and `/api/twin/simulate` endpoints
- [ ] Create `/pages/nexus.tsx` dashboard page
- [ ] Test all components in isolation

### Phase 2: Enhancement (Week 3-4)

- [ ] Add chat message persistence to database
- [ ] Implement user profile page with stats
- [ ] Add quest completion tracking with XP calculation
- [ ] Implement level progression system
- [ ] Add daily streak tracking
- [ ] Create onboarding flow for new users
- [ ] Add loading states and error handling
- [ ] Mobile optimization for all components

### Phase 3: Advanced Features (Month 2)

- [ ] AI Twin context memory (remember previous conversations)
- [ ] Multi-path decision simulation (not just good/bad)
- [ ] User-generated quest submissions
- [ ] Badge and achievement system
- [ ] Leaderboard (opt-in, privacy-focused)
- [ ] Community resource mapping with Leaflet
- [ ] Real-time notifications for quest completions

### Phase 4: Production Readiness (Month 3)

- [ ] Comprehensive error logging (Sentry integration)
- [ ] Rate limiting for AI endpoints
- [ ] Cost monitoring for OpenAI usage
- [ ] Performance optimization (caching, code splitting)
- [ ] Security audit (API routes, database policies)
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Analytics integration (privacy-focused)
- [ ] Load testing and optimization

### Development Best Practices

1. **TypeScript Strict Mode**: All new code must pass `npm run type-check`
2. **Component Testing**: Write tests for new components using Testing Library
3. **API Security**: Always validate inputs and check authentication
4. **Error Handling**: Graceful degradation when services are unavailable
5. **Mobile First**: Design for mobile, enhance for desktop
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Performance**: Code split large components, lazy load when possible

### Monitoring & Maintenance

- **Weekly**: Review OpenAI API costs and optimize prompts
- **Monthly**: Analyze user engagement with Nexus features
- **Quarterly**: Update AI prompts based on user feedback
- **As Needed**: Scale Supabase plan based on user growth

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **OpenAI API Reference**: https://platform.openai.com/docs/api-reference
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **React Query Guide**: https://tanstack.com/query/latest/docs/react/overview
- **Zustand State Management**: https://github.com/pmndrs/zustand

---

## Support

If you encounter issues during setup:

1. **Check the troubleshooting section** above
2. **Review environment variables** - most issues stem from configuration
3. **Check Supabase logs** at https://app.supabase.com/project/<your-project>/logs
4. **Open a GitHub issue** with error details and steps to reproduce

---

**Remember**: Nexus Recovery is designed to help real people in recovery. Code with empathy, test thoroughly, and prioritize user privacy and security in all implementations.

---

*Last updated: January 15, 2026*
*Version: 1.0.0*

