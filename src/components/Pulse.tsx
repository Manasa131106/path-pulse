import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Send, Sparkles, Activity, Zap } from 'lucide-react';
import { PulseState } from '../types';

interface PulseProps {
  userId: string;
}

export default function Pulse({ userId }: PulseProps) {
  const [state, setState] = useState<PulseState>({ mood: 'Good', stress: 'Low', motivation: 'Medium' });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const options = {
    mood: ['Great', 'Good', 'Neutral', 'Low', 'Down'],
    stress: ['None', 'Low', 'Medium', 'High', 'Extreme'],
    motivation: ['High', 'Medium', 'Low', 'None']
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Save to backend
      await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, userId })
      });

      // Get AI analysis (mocking the call to our service which would be done on backend or client)
      // For this demo, we'll call a client-side service that uses Gemini
      const { analyzePulse } = await import('../services/aiService');
      const result = await analyzePulse(state.mood, state.stress, state.motivation);
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
        <p className="text-[#5A5A40] opacity-80">How are you feeling today? Our AI will analyze your state.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
          <div key={key} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] mb-4 flex items-center gap-2">
              {key === 'mood' && <Activity className="w-4 h-4" />}
              {key === 'stress' && <Zap className="w-4 h-4" />}
              {key === 'motivation' && <Brain className="w-4 h-4" />}
              {key}
            </h3>
            <div className="flex flex-wrap gap-2">
              {options[key].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setState({ ...state, [key]: opt })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${state[key] === opt ? 'bg-[#5A5A40] text-white' : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#EBEBE0]'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-[#5A5A40] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze My Pulse'}
        <Send className="w-5 h-5" />
      </button>

      {analysis && (
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
          </div>
        </motion.div>
      )}
    </div>
  );
}
