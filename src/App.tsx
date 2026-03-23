import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Heart, User, LogOut } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Pulse from './components/Pulse';
import { UserProfile, DashboardData } from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('path_pulse_userId');
    if (savedUserId) {
      fetchUser(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/dashboard-data?userId=${userId}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (profile: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const newUser = await res.json();
      setUser(newUser);
      localStorage.setItem('path_pulse_userId', newUser.id);
      await fetchUser(newUser.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    if (!user) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'PUT' });
      await fetchUser(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1a1a1a] font-sans">
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && dashboardData && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Dashboard data={dashboardData} onToggleTask={handleToggleTask} />
            </motion.div>
          )}
          {activeTab === 'pulse' && (
            <motion.div key="pulse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Pulse userId={user.id} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white p-8 rounded-[32px] shadow-sm">
                <h2 className="text-2xl font-serif font-bold mb-6">Profile Settings</h2>
                <div className="space-y-4">
                  <div className="flex justify-between py-4 border-b">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b">
                    <span className="text-gray-500">Education</span>
                    <span className="font-medium">{user.educationLevel}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b">
                    <span className="text-gray-500">Goal</span>
                    <span className="font-medium">{user.goals?.shortTerm}</span>
                  </div>
                  <div className="pt-6">
                    <p className="text-gray-500 text-sm mb-4">Vision Board</p>
                    <div className="w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm">Your vision board will appear here</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('path_pulse_userId');
                    window.location.reload();
                  }}
                  className="mt-8 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full shadow-2xl flex gap-12 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('pulse')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'pulse' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Pulse</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}
