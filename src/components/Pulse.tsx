import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Send, Sparkles, Activity, Zap } from 'lucide-react';
import { PulseResponse } from '../types';

interface PulseProps {
  userId: string;
}

export default function Pulse({ userId }: PulseProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([3, 3, 3, 3, 3]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    "How focused did you feel on your goals this week?",
    "How would you rate your overall stress level?",
    "How motivated are you to learn something new today?",
    "How satisfied are you with your progress this week?",
    "How well are you balancing study and rest?"
  ];

  const handleAnswer = (val: number) => {
    const newAnswers = [...answers];
    newAnswers[step] = val;
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const moodScore = answers[0] + answers[3];
      const stressScore = answers[1] + answers[4];
      const motivationScore = answers[2];

      const mood = moodScore > 7 ? 'Great' : moodScore > 4 ? 'Good' : 'Low';
      const stress = stressScore > 7 ? 'High' : stressScore > 4 ? 'Medium' : 'Low';
      const motivation = motivationScore > 4 ? 'High' : motivationScore > 2 ? 'Medium' : 'Low';

      await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers, mood, stress, motivation })
      });

      const { analyzePulse } = await import('../services/aiService');
      const result = await analyzePulse(mood, stress, motivation);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Pulse Check</h1>
        <p className="text-[#5A5A40] opacity-80">Weekly psychology-based emotional monitoring.</p>
      </header>

      {!analysis ? (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Question {step + 1} of 5</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1 w-8 rounded-full ${i <= step ? 'bg-[#5A5A40]' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{questions[step]}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-400 uppercase font-bold tracking-widest px-2">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className={`flex-1 py-4 rounded-2xl text-xl font-bold transition-all ${answers[step] === val ? 'bg-[#5A5A40] text-white scale-105' : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#EBEBE0]'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {step === questions.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-8 py-4 bg-[#5A5A40] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Submit Pulse'}
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#5A5A40] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold">AI Pulse Analysis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Analysis</p>
                <p className="text-xl leading-relaxed">{analysis.analysis}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Suggestion</p>
                  <p className="text-lg italic">"{analysis.suggestion}"</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Motivation</p>
                  <p className="text-lg font-medium">{analysis.motivation}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAnalysis(null);
                setStep(0);
                setAnswers([3, 3, 3, 3, 3]);
              }}
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all"
            >
              Retake Pulse
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
