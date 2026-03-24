import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BarChart2, PieChart, Calendar, Activity, Sparkles } from 'lucide-react';
import { InsightData } from '../types';
import { generateWeeklyInsights } from '../services/aiService';

interface InsightsProps {
  userId: string;
}

export default function Insights({ userId }: InsightsProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await fetch(`/api/insights?userId=${userId}`);
        const baseData = await res.json();
        
        // Fetch additional data for AI insights
        const tasksRes = await fetch(`/api/tasks?userId=${userId}`);
        const userTasks = await tasksRes.json();
        const weeklyCompletion = [
          { day: 'Mon', completed: 0, total: 0 },
          { day: 'Tue', completed: 0, total: 0 },
          { day: 'Wed', completed: 0, total: 0 },
          { day: 'Thu', completed: 0, total: 0 },
          { day: 'Fri', completed: 0, total: 0 },
          { day: 'Sat', completed: 0, total: 0 },
          { day: 'Sun', completed: 0, total: 0 }
        ];

        const pulseHistoryRes = await fetch(`/api/pulse/${userId}`);
        const lastPulse = await pulseHistoryRes.json();
        const moodHistory = lastPulse.mood ? [{ mood: lastPulse.mood, stress: lastPulse.stress, date: new Date().toISOString() }] : [];

        const aiInsights = await generateWeeklyInsights(weeklyCompletion, moodHistory, 0);
        
        setData({
          ...baseData,
          ...aiInsights
        });
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Growth Insights</h1>
        <p className="text-[#5A5A40] opacity-80">Data-driven analysis of your academic and emotional journey.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Summary Card */}
        {(data as any).weeklySummary && (
          <section className="bg-[#5A5A40] text-white p-8 rounded-[32px] shadow-lg md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-6 h-6" />
                <h2 className="text-xl font-serif font-bold">Weekly AI Analysis</h2>
              </div>
              <p className="text-xl leading-relaxed opacity-90">{(data as any).weeklySummary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Consistency Score</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">{(data as any).consistencyScore}%</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(data as any).consistencyScore}%` }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Improvement Suggestion</p>
                  <p className="text-lg italic">"{(data as any).improvementSuggestion}"</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Weekly Progress Chart */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#5A5A40]" />
            <h2 className="text-xl font-serif font-bold">Weekly Progress</h2>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {data.weeklyProgress?.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.score}%` }}
                  className="w-full bg-[#5A5A40] rounded-t-lg"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase">{day.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mood Trend */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-serif font-bold">Mood Trend</h2>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {data.moodTrend?.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.level * 20}%` }}
                  className="w-full bg-indigo-400 rounded-t-lg"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase">{day.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skill Distribution */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-serif font-bold">Skill Distribution</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.skillDistribution?.map((skill) => (
              <div key={skill.category} className="p-4 bg-[#F5F5F0] rounded-2xl text-center">
                <p className="text-2xl font-bold text-[#5A5A40]">{skill.value}%</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{skill.category}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
