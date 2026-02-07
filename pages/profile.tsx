'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useOnboardingStore, AVATARS } from '../store/onboardingStore';
import { 
  User, 
  Settings, 
  ArrowLeft, 
  Edit2, 
  Save,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { 
    username, 
    selectedAvatar, 
    selectedPath, 
    goals,
    setUsername,
    selectAvatar,
    isOnboardingComplete 
  } = useOnboardingStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const [editedAvatar, setEditedAvatar] = useState(selectedAvatar);

  const avatarData = AVATARS.find(a => a.id === selectedAvatar);

  const pathInfo: Record<string, { name: string; color: string }> = {
    recovery: { name: 'Recovery Focus', color: '#EC4899' },
    skills: { name: 'Skill Building', color: '#7B68EE' },
    hybrid: { name: 'Hybrid Path', color: '#00D4AA' },
  };
  
  const selectedPathInfo = pathInfo[selectedPath || 'hybrid'];

  const handleSave = () => {
    if (editedUsername.trim().length >= 3) {
      setUsername(editedUsername);
      if (editedAvatar) {
        selectAvatar(editedAvatar);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedUsername(username);
    setEditedAvatar(selectedAvatar);
    setIsEditing(false);
  };

  // Redirect to onboarding if not completed
  React.useEffect(() => {
    if (!isOnboardingComplete) {
      router.push('/onboarding');
    }
  }, [isOnboardingComplete, router]);

  if (!isOnboardingComplete) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Profile | HustleCodex</title>
        <meta name="description" content="Manage your HustleCodex profile" />
      </Head>

      <div className="min-h-screen bg-hustlex-darker">
        {/* Header */}
        <header className="glass border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <h1 className="text-lg font-semibold text-white">Profile</h1>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setEditedAvatar(avatar.id)}
                        className={`p-3 rounded-xl transition-all ${
                          editedAvatar === avatar.id 
                            ? 'bg-hustlex-cyan/20 ring-2 ring-hustlex-cyan' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-3xl">{avatar.emoji}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-7xl"
                    style={{ filter: `drop-shadow(0 0 20px ${avatarData?.color || '#00D4AA'})` }}
                  >
                    {avatarData?.emoji || '⭐'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="input-field text-2xl font-bold mb-2"
                    placeholder="Username"
                    maxLength={20}
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-white mb-2">{username}</h2>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span 
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${selectedPathInfo?.color}20`,
                      color: selectedPathInfo?.color 
                    }}
                  >
                    {selectedPathInfo?.name}
                  </span>
                </div>

                {avatarData && !isEditing && (
                  <p className="text-gray-500 italic">"{avatarData.description}"</p>
                )}
              </div>
            </div>

            {/* Edit actions */}
            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={editedUsername.trim().length < 3}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </motion.div>

          {/* Goals section */}
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Your Goals</h3>
              <div className="space-y-4">
                {goals.map((goal: any, index: number) => {
                  const goalInfoMap: Record<string, { label: string; color: string }> = {
                    sobriety: { label: 'Days Sober Goal', color: '#EC4899' },
                    skills: { label: 'Skills to Learn', color: '#7B68EE' },
                    projects: { label: 'Projects to Build', color: '#00D4AA' },
                  };
                  const goalInfo = goalInfoMap[goal.type] || { label: goal.type, color: "#00D4AA" };
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <span className="text-gray-300">{goalInfo.label}</span>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: goalInfo.color }}
                      >
                        {goal.value} {goal.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
