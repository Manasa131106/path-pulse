import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Target, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { generateWeeklyMentorReport } from '../services/aiService';

interface WeeklyReportProps {
  userId: string;
}

export default function WeeklyReport({ userId }: WeeklyReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataRes = await fetch(`/api/weekly-report-data?userId=${userId}`);
      const data = await dataRes.json();
      
      const aiReport = await generateWeeklyMentorReport(
        data.tasksCompleted,
        data.totalTasks,
        data.streak,
        data.moodHistory
      );
      
      setReport(aiReport);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. The mentor is busy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#5A5A40] animate-spin" />
        <p className="text-[#5A5A40] font-serif italic text-lg">The mentor is reviewing your performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-700 font-medium">{error}</p>
        <button 
          onClick={fetchReport}
          className="px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold flex items-center gap-2 mx-auto hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Weekly AI Report</h1>
          <p className="text-[#5A5A40] opacity-80 italic">A blunt assessment of your progress.</p>
        </div>
        <button 
          onClick={fetchReport}
          className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-[#5A5A40] hover:bg-gray-50 transition-colors"
          title="Refresh Report"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Performance Summary */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-[#5A5A40]" />
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-[#5A5A40]" />
            <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-[#5A5A40]">Performance Summary</h2>
          </div>
          <p className="text-lg text-gray-800 leading-relaxed font-medium italic">
            "{report.performanceSummary}"
          </p>
        </motion.section>

        {/* Biggest Mistake */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 p-8 rounded-[32px] shadow-sm border border-red-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-red-500">Biggest Mistake</h2>
          </div>
          <p className="text-lg text-red-900 leading-relaxed font-bold">
            {report.biggestMistake}
          </p>
        </motion.section>

        {/* Improvement Advice */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#5A5A40] p-8 rounded-[32px] shadow-lg text-white relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Lightbulb className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-yellow-400">Improvement Advice</h2>
          </div>
          <p className="text-xl leading-relaxed font-bold">
            {report.improvementAdvice}
          </p>
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-60">Next Week's Objective</p>
          </div>
        </motion.section>
      </div>

      <footer className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Generated by Path & Pulse Mentor AI</p>
      </footer>
    </div>
  );
}
