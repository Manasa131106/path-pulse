import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Flame, TrendingUp, User, X, Sparkles, AlertCircle, Activity, Target, Star, Zap } from 'lucide-react';
import { DashboardData, Task } from '../types';
import { generateDashboardInsights } from '../services/aiService';

interface DashboardProps {
  data: DashboardData;
  onToggleTask: (id: number) => void;
}

export default function Dashboard({ data, onToggleTask }: DashboardProps) {
  const [showReward, setShowReward] = useState(false);
  const [aiInsights, setAiInsights] = useState(data.aiInsights);

  useEffect(() => {
    const loadAI = async () => {
      try {
        const pulseRes = await fetch(`/api/pulse/${data.user.id}`);
        const latestPulse = await pulseRes.json();
        const insights = await generateDashboardInsights(data.user, data.tasks, latestPulse);
        setAiInsights(insights);
      } catch (err) {
        console.error("Dashboard AI Insights failed:", err);
      }
    };
    if (data.user) loadAI();
  }, [data.user, data.tasks]);

  useEffect(() => {
    const weeklyTasks = data.tasks?.filter(t => t.type === 'weekly') || [];
    if (weeklyTasks.length > 0 && weeklyTasks.every(t => t.completed)) {
      // Check if we've already shown the reward for this set of tasks in this session
      const lastRewardShown = sessionStorage.getItem('weekly_reward_shown');
      const currentTaskIds = weeklyTasks.map(t => t.id).join(',');
      
      if (lastRewardShown !== currentTaskIds) {
        setShowReward(true);
        sessionStorage.setItem('weekly_reward_shown', currentTaskIds);
      }
    }
  }, [data.tasks]);

  return (
    <div className="space-y-8 pb-24">
      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#5A5A40]" />
              <button 
                onClick={() => setShowReward(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Sparkles className="w-32 h-32 text-[#5A5A40] animate-pulse" />
                </div>
                <img 
                  src="https://picsum.photos/seed/success/400/400" 
                  alt="Success" 
                  className="w-48 h-48 mx-auto rounded-[32px] object-cover shadow-lg relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">Weekly Goal Achieved!</h2>
              <p className="text-[#5A5A40] opacity-80 mb-6">
                You've completed all your weekly tasks. Your dedication is paving the way to your goals!
              </p>

              <button 
                onClick={() => setShowReward(false)}
                className="w-full py-4 bg-[#5A5A40] text-white rounded-full font-medium hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20"
              >
                Keep it up!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Hello, {data.user.fullName} 👋</h1>
          <p className="text-[#5A5A40] opacity-80">Here's your growth summary for today.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Streak</p>
              <p className="text-xl font-bold">{data.streak} Days</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#5A5A40]" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Action</p>
              <p className={`text-sm font-bold capitalize ${
                aiInsights?.recommendedAction === 'reduce tasks' ? 'text-red-500' : 
                aiInsights?.recommendedAction === 'increase difficulty' ? 'text-green-600' : 'text-[#5A5A40]'
              }`}>{aiInsights?.recommendedAction || 'Stay Consistent'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Task Section */}
        {data.priorityTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#5A5A40] text-white p-6 rounded-[32px] shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Star className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                <h2 className="text-xl font-serif font-bold">Today's Priority</h2>
              </div>
              <p className="text-2xl font-bold mb-4">{data.priorityTask.text}</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  {data.priorityTask.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  {data.priorityTask.difficulty}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Insights Section */}
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#5A5A40]" />
              <h2 className="text-xl font-serif font-bold text-[#1a1a1a]">AI Insights</h2>
            </div>
            
            {data.user.burnoutStatus && data.user.burnoutStatus.level !== 'Low' && (
              <div className={`mb-4 p-4 rounded-2xl border ${
                data.user.burnoutStatus.level === 'High' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4" />
                  {data.user.burnoutStatus.warning}
                </div>
                <p className="text-xs opacity-90">{data.user.burnoutStatus.recommendation}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{aiInsights.summary}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Next Big Move</p>
                <p className="text-sm text-[#5A5A40] font-bold">{aiInsights.nextBigMove}</p>
              </div>
            </div>
          </motion.div>
        )}

        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5A5A40]" />
              Progress
            </h2>
            <span className="text-2xl font-bold text-[#5A5A40]">{Math.round(data.progress)}%</span>
          </div>
          <div className="h-4 bg-[#F5F5F0] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${data.progress || 0}%` }}
              className="h-full bg-[#5A5A40]"
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">You've completed {data.tasks?.filter(t => t.completed).length || 0} out of {data.tasks?.length || 0} tasks.</p>
        </section>

        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Avatar Builder
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 bg-[#F5F5F0] rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
              <User className="w-20 h-20 text-gray-300" />
              {data.avatarParts?.map((part, i) => (
                <motion.div
                  key={part}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-full h-full bg-[#5A5A40]/10 border-2 border-[#5A5A40]/20 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase text-[#5A5A40]">{part}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              {["Base", "Hair", "Eyes", "Outfit", "Accessory"].map((part, i) => (
                <div 
                  key={part} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${data.avatarParts.includes(part) ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                >
                  <span className="text-[8px] font-bold">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">Complete tasks to unlock more parts!</p>
        </section>
      </div>

      <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold">Today's Path</h2>
          {data.user.strictMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">
              <Zap className="w-3 h-3" />
              Strict Mode Active
            </div>
          )}
        </div>
        
        {data.user.strictMode && data.tasks.length > 0 && !data.tasks[0].completed && (
          <p className="mb-4 text-xs text-[#5A5A40] opacity-70 italic">
            Complete your current task to unlock the next step in your journey.
          </p>
        )}

        <div className="space-y-4">
          {data.tasks?.map((task: Task) => (
            <motion.div 
              key={task.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onToggleTask(task.id)}
              className={`p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${task.completed ? 'bg-gray-50 opacity-60' : 'bg-[#F5F5F0] hover:bg-[#EBEBE0]'}`}
            >
              <div className="flex items-center gap-4 flex-1">
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
                <div className="flex flex-col">
                  <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-[#1a1a1a]'}`}>
                    {task.text}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      {task.category}
                    </span>
                    {task.difficulty && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        task.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        task.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {task.aiReasoning && !task.completed && (
                <div className="hidden md:block max-w-[200px]">
                  <p className="text-[10px] text-gray-400 italic leading-tight">
                    AI: {task.aiReasoning}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
