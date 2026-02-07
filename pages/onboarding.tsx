'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingStore } from '../store/onboardingStore';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import PathSelectionScreen from '../components/onboarding/PathSelectionScreen';
import ProfileCreationScreen from '../components/onboarding/ProfileCreationScreen';

// Completion celebration component
function CompletionCelebration({ onContinue }: { onContinue: () => void }) {
  const { username, selectedAvatar, selectedPath } = useOnboardingStore();
  const avatarEmoji: Record<string, string> = {
    phoenix: '🔥',
    cipher: '🔐',
    sage: '🧙',
    nova: '⭐',
    titan: '💪',
    echo: '🌊',
  };
  
  const pathName: Record<string, string> = {
    recovery: 'Recovery Focus',
    skills: 'Skill Building',
    hybrid: 'Hybrid Path',
  };
  
  const currentEmoji = avatarEmoji[selectedAvatar || 'nova'] || '⭐';
  const currentPathName = pathName[selectedPath || 'hybrid'] || 'Your Journey';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="onboarding-container bg-hustlex-darker flex items-center justify-center"
    >
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: '100vh', 
              x: `${Math.random() * 100}vw`,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ 
              y: '-20vh',
              rotate: 360,
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
            className="absolute text-2xl"
          >
            {['✨', '🎉', '🚀', '💫', '⭐'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-8xl mb-8"
        >
          {currentEmoji}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Welcome, <span className="text-gradient">{username}</span>!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-lg md:text-xl mb-8"
        >
          Your <span className="text-hustlex-cyan">{currentPathName}</span> journey begins now.
          <br />
          Let's build your digital empire together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <button
            onClick={onContinue}
            className="btn-primary text-lg px-12 py-4 rounded-2xl inline-flex items-center gap-3"
          >
            <span>Enter HustleCodex</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </button>

          <p className="text-gray-500 text-sm">
            Your progress has been saved
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    currentStep,
    setCurrentStep,
    selectedPath,
    selectPath,
    selectedAvatar,
    selectAvatar,
    username,
    setUsername,
    goals,
    addGoal,
    updateGoal,
    removeGoal,
    socialConnections,
    connectSocial,
    isOnboardingComplete,
    completeOnboarding,
  } = useOnboardingStore();

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (isOnboardingComplete && !showCelebration) {
      router.push('/');
    }
  }, [isOnboardingComplete, showCelebration, router]);

  const handleWelcomeContinue = () => {
    setCurrentStep(2);
  };

  const handlePathBack = () => {
    setCurrentStep(1);
  };

  const handlePathContinue = () => {
    if (selectedPath) {
      setCurrentStep(3);
    }
  };

  const handleProfileBack = () => {
    setCurrentStep(2);
  };

  const handleProfileComplete = () => {
    if (selectedAvatar && username.trim().length >= 3) {
      completeOnboarding();
      setShowCelebration(true);
    }
  };

  const handleCelebrationContinue = () => {
    router.push('/');
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <>
      <Head>
        <title>Welcome to HustleCodex | Onboarding</title>
        <meta name="description" content="Start your journey from struggle to digital empire with HustleCodex" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      <main className="min-h-screen bg-hustlex-darker">
        <AnimatePresence mode="wait">
          {showCelebration ? (
            <motion.div
              key="celebration"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <CompletionCelebration onContinue={handleCelebrationContinue} />
            </motion.div>
          ) : currentStep === 1 ? (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <WelcomeScreen onContinue={handleWelcomeContinue} />
            </motion.div>
          ) : currentStep === 2 ? (
            <motion.div
              key="path"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <PathSelectionScreen
                selectedPath={selectedPath}
                onSelectPath={selectPath}
                onBack={handlePathBack}
                onContinue={handlePathContinue}
              />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <ProfileCreationScreen
                selectedPath={selectedPath}
                selectedAvatar={selectedAvatar}
                username={username}
                goals={goals}
                socialConnections={socialConnections}
                onSelectAvatar={selectAvatar}
                onSetUsername={setUsername}
                onAddGoal={addGoal}
                onUpdateGoal={updateGoal}
                onRemoveGoal={removeGoal}
                onConnectSocial={connectSocial}
                onBack={handleProfileBack}
                onComplete={handleProfileComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
