import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, User, GraduationCap, Calendar, Target, Heart, Sparkles, Loader2 } from 'lucide-react';
import { generateAdaptiveTasks, generateInitialRoadmap } from '../services/aiService';

interface OnboardingProps {
  userId: string;
  onComplete: (profile: any) => void;
}

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    educationLevel: 'B.Tech',
    dob: '',
    visionBoard: '',
    shortTerm: '',
    longTerm: '',
    reason: '',
    interests: '',
    currentSkillLevel: 'Beginner',
    strictMode: false,
  });

  const steps = [
    {
      title: "Profile Setup",
      description: "Let's start with the basics.",
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: <User className="w-5 h-5" /> },
        { name: 'educationLevel', label: 'Education Level', type: 'select', options: ['10th', 'Inter', 'B.Tech', 'Other'], icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'dob', label: 'Date of Birth', type: 'date', icon: <Calendar className="w-5 h-5" /> },
        { name: 'strictMode', label: 'Strict Mode (One task at a time)', type: 'checkbox', icon: <Target className="w-5 h-5" /> },
      ]
    },
    {
      title: "Skill Level",
      description: "Where are you currently in your journey?",
      fields: [
        { name: 'currentSkillLevel', label: 'Current Skill Level', type: 'select', options: ['Beginner', 'Intermediate'], icon: <Sparkles className="w-5 h-5" /> },
      ]
    },
    {
      title: "Goals",
      description: "What are you aiming for?",
      fields: [
        { name: 'shortTerm', label: 'Short-term Goal (3-6 months)', type: 'text', icon: <Target className="w-5 h-5" /> },
        { name: 'longTerm', label: 'Long-term Goal (5 years)', type: 'text', icon: <ChevronRight className="w-5 h-5" /> },
      ]
    },
    {
      title: "Interests & Vision",
      description: "What drives you?",
      fields: [
        { name: 'interests', label: 'Interests (comma separated)', type: 'text', icon: <Sparkles className="w-5 h-5" /> },
        { name: 'visionBoard', label: 'Vision Board Image URL', type: 'text', icon: <Sparkles className="w-5 h-5" /> },
      ]
    },
    {
      title: "Why Path & Pulse?",
      description: "What brings you to our ecosystem?",
      fields: [{ name: 'reason', label: 'Your Reason', type: 'textarea', icon: <Heart className="w-5 h-5" /> }]
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const [aiTasks, aiRoadmap] = await Promise.all([
          generateAdaptiveTasks(
            profile.educationLevel,
            profile.interests,
            0,
            []
          ),
          generateInitialRoadmap(profile)
        ]);
        onComplete({ ...profile, userId, aiTasks, aiRoadmap });
      } catch (error) {
        console.error("AI Generation failed, using fallbacks:", error);
        onComplete({ ...profile, userId });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setProfile({ ...profile, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-xl p-8 w-full max-w-md"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-medium uppercase tracking-widest text-[#5A5A40]">Step {step + 1} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 w-8 rounded-full ${i <= step ? 'bg-[#5A5A40]' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">{currentStep.title}</h1>
          <p className="text-[#5A5A40] opacity-80">{currentStep.description}</p>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {currentStep.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                    {field.icon}
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={(profile as any)[field.name]}
                      onChange={handleChange}
                      className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                    >
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={(profile as any)[field.name]}
                      onChange={handleChange}
                      className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all min-h-[100px]"
                    />
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-3 p-4 bg-[#F5F5F0] rounded-2xl">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={(profile as any)[field.name]}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#5A5A40]"
                      />
                      <span className="text-sm text-gray-600">Enable Strict Mode for focused growth</span>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={(profile as any)[field.name]}
                      onChange={handleChange}
                      className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-4 bg-[#5A5A40] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === steps.length - 1 ? 'Get Started' : 'Next Step'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
