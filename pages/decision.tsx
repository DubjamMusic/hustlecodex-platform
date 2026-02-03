/**
 * Decision Loop Page
 * 
 * Dedicated page for the AI-powered decision loop feature.
 * Users can submit decisions and get multi-agent feedback.
 */

'use client';

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import DecisionLoop from '../components/DecisionLoop';
import { useOnboardingStore } from '../store/onboardingStore';

export default function DecisionPage() {
  const { username } = useOnboardingStore();
  
  // For demo purposes, use a test user ID
  // In production, this would come from authentication
  const [userId] = useState('demo-user-id');
  
  return (
    <>
      <Head>
        <title>Decision Loop - HustleCodex</title>
        <meta name="description" content="Get AI-powered insights on your decisions from multiple perspectives" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      
      <div className="min-h-screen bg-hustlex-darker">
        {/* Header */}
        <header className="glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hustlex-cyan to-hustlex-purple flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">HustleCodex</span>
            </div>
            
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DecisionLoop 
              userId={userId}
              onDecisionComplete={(response) => {
                console.log('Decision completed:', response);
                // You could show a success toast, update stats, etc.
              }}
            />
          </motion.div>
          
          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 p-6 rounded-xl bg-hustlex-purple/10 border border-hustlex-purple/30"
          >
            <h2 className="text-lg font-semibold text-white mb-2">How It Works</h2>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-hustlex-cyan mt-1">1.</span>
                <span>Describe your decision and provide context about your situation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hustlex-cyan mt-1">2.</span>
                <span>Our AI agents analyze your decision from multiple perspectives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hustlex-cyan mt-1">3.</span>
                <span>Get balanced feedback: affirmation and constructive challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hustlex-cyan mt-1">4.</span>
                <span>Receive actionable next steps based on your unique situation</span>
              </li>
            </ul>
            
            <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">
                <strong className="text-hustlex-cyan">Note:</strong> Your decisions and memories are stored securely to provide personalized context in future sessions. The more you use this tool, the more relevant the insights become.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
