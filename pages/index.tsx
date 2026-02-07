'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useOnboardingStore, AVATARS } from '../store/onboardingStore';
import { 
  Sparkles, 
  Calendar, 
  Code, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronRight,
  Flame,
  Target,
  Users,
  Brain
} from 'lucide-react';

// Dashboard component for after onboarding
function Dashboard() {
  const { username, selectedAvatar, selectedPath, goals, resetOnboarding } = useOnboardingStore();
  const router = useRouter();
  
  const avatarData = AVATARS.find(a => a.id === selectedAvatar);
  
  const pathInfo: Record<string, { name: string; color: string; icon: React.ComponentType<any> }> = {
    recovery: { name: 'Recovery Focus', color: '#EC4899', icon: Calendar },
    skills: { name: 'Skill Building', color: '#7B68EE', icon: Code },
    hybrid: { name: 'Hybrid Path', color: '#00D4AA', icon: Sparkles },
  };
  
  const selectedPathInfo = pathInfo[selectedPath || 'hybrid'];

  const handleResetOnboarding = () => {
    resetOnboarding();
    router.push('/onboarding');
  };

  return (
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
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Settings size={20} />
            </button>
            <button 
              onClick={handleResetOnboarding}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              title="Reset onboarding (demo)"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div 
              className="text-4xl"
              style={{ filter: `drop-shadow(0 0 10px ${avatarData?.color || '#00D4AA'})` }}
            >
              {avatarData?.emoji || '⭐'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, <span className="text-gradient">{username}</span>!
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${selectedPathInfo?.color}20`,
                    color: selectedPathInfo?.color 
                  }}
                >
                  {selectedPathInfo?.icon && <selectedPathInfo.icon size={12} />}
                  {selectedPathInfo?.name}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Flame, label: 'Day Streak', value: '1', color: '#FF6B35' },
            { icon: Trophy, label: 'XP Earned', value: '0', color: '#d4af37' },
            { icon: Target, label: 'Goals Set', value: goals.length.toString(), color: '#00D4AA' },
            { icon: Users, label: 'Community Rank', value: 'New', color: '#7B68EE' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card rounded-2xl p-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: 'Decision Loop', 
                description: 'Get AI insights on your choices',
                icon: Brain,
                color: '#00D4AA',
                disabled: false,
                href: '/decision',
              },
              { 
                title: 'Daily Check-in', 
                description: 'Log your progress and mood',
                icon: Calendar,
                color: '#EC4899',
                disabled: selectedPath === 'skills',
              },
              { 
                title: 'Start a Quest', 
                description: 'Begin a new coding challenge',
                icon: Code,
                color: '#7B68EE',
                disabled: selectedPath === 'recovery',
              },
            ].map((action, index) => {
              const Icon = action.icon;
              const ActionElement = action.href ? 'a' : 'button';
              return (
                <ActionElement
                  key={action.title}
                  href={action.href}
                  onClick={action.href ? undefined : undefined}
                  disabled={action.disabled}
                  className={`glass-card rounded-2xl p-6 text-left transition-all group block ${
                    action.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon size={24} style={{ color: action.color }} />
                    </div>
                    {!action.disabled && (
                      <ChevronRight 
                        size={20} 
                        className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" 
                      />
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                  <p className="text-gray-500 text-sm">{action.description}</p>
                  {action.disabled && (
                    <p className="text-gray-600 text-xs mt-2 italic">
                      Not available on your current path
                    </p>
                  )}
                </ActionElement>
              );
            })}
          </div>
        </motion.div>

        {/* Goals section */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>
            <div className="glass-card rounded-2xl p-6">
              <div className="space-y-4">
                {goals.map((goal: any, index: number) => {
                  const goalInfo: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
                    sobriety: { label: 'Days Sober', icon: Calendar, color: '#EC4899' },
                    skills: { label: 'Skills to Learn', icon: Code, color: '#7B68EE' },
                    projects: { label: 'Projects to Build', icon: Trophy, color: '#00D4AA' },
                  };
                  
                  const currentGoalInfo = goalInfo[goal.type] || { label: goal.type, icon: Target, color: '#00D4AA' };
                  const Icon = currentGoalInfo.icon;
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${currentGoalInfo.color}20` }}
                      >
                        <Icon size={20} style={{ color: currentGoalInfo.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-white font-medium">{currentGoalInfo.label}</span>
                          <span className="text-gray-400">0 / {goal.value} {goal.unit}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: '0%',
                              backgroundColor: currentGoalInfo.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Demo notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-hustlex-purple/10 border border-hustlex-purple/30 text-center"
        >
          <p className="text-hustlex-purple text-sm">
            This is a demo dashboard. Click the logout icon to reset and try the onboarding flow again.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isOnboardingComplete } = useOnboardingStore();

  useEffect(() => {
    // Redirect to onboarding if not completed
    if (!isOnboardingComplete) {
      router.push('/onboarding');
    }
  }, [isOnboardingComplete, router]);

  // Show loading state while checking
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-hustlex-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hustlex-cyan to-hustlex-purple flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles size={32} className="text-white" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HustleCodex - Dashboard</title>
        <meta name="description" content="Your HustleCodex dashboard - track progress, complete quests, and build your digital empire" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Dashboard />
    </>
  );
}
