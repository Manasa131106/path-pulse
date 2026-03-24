import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Heart, User, LogOut, BarChart2 } from 'lucide-react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Pulse from './components/Pulse';
import Path from './components/Path';
import Insights from './components/Insights';
import { UserProfile, DashboardData } from './types';

export default function App() {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('path_pulse_userId');
    if (savedUserId) {
      setAuthUserId(savedUserId);
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

  const handleAuthSuccess = (userId: string, isNewUser: boolean) => {
    setAuthUserId(userId);
    localStorage.setItem('path_pulse_userId', userId);
    if (!isNewUser) {
      fetchUser(userId);
    } else {
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

  if (!authUserId) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (!user) {
    return <Onboarding userId={authUserId} onComplete={handleOnboardingComplete} />;
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
          {activeTab === 'path' && (
            <motion.div key="path" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Path user={user} />
            </motion.div>
          )}
          {activeTab === 'pulse' && (
            <motion.div key="pulse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Pulse userId={user.id} />
            </motion.div>
          )}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Insights userId={user.id} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white p-8 rounded-[32px] shadow-sm space-y-8">
                <header>
                  <h2 className="text-3xl font-serif font-bold">Profile Settings</h2>
                  <p className="text-[#5A5A40] opacity-80">Manage your personal growth profile.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] border-b pb-2">Personal Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Full Name</span>
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Education</span>
                        <span className="font-medium">{user.educationLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">DOB</span>
                        <span className="font-medium">{user.dob}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] border-b pb-2">Your Goals</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Short-term</p>
                        <p className="font-medium">{user.goals?.shortTerm}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Long-term</p>
                        <p className="font-medium">{user.goals?.longTerm}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Interests</p>
                        <p className="font-medium">{user.goals?.interests}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] border-b pb-2">Vision Board</h3>
                  {user.visionBoard ? (
                    <div className="relative group">
                      <img 
                        src={user.visionBoard} 
                        alt="Vision Board" 
                        className="w-full rounded-[24px] shadow-lg object-cover max-h-[400px]" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center">
                        <span className="text-white font-medium">Your Future Self</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-50 rounded-[24px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm">No vision board URL provided.</p>
                      <p className="text-gray-400 text-xs mt-1">Add one in onboarding to visualize your goals.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    localStorage.removeItem('path_pulse_userId');
                    window.location.reload();
                  }}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-full shadow-2xl flex gap-8 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('path')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'path' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Path</span>
        </button>
        <button 
          onClick={() => setActiveTab('pulse')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'pulse' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Pulse</span>
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'insights' ? 'text-[#5A5A40]' : 'text-gray-400'}`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Insights</span>
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
