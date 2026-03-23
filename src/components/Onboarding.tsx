import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, User, GraduationCap, Calendar, Target, Heart, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: any) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    fullName: '',
    educationLevel: 'B.Tech',
    dob: '',
    shortTerm: '',
    longTerm: '',
    reason: '',
    interests: '',
  });

  const steps = [
    {
      title: "Welcome to Path & Pulse",
      description: "Let's start by setting up your profile.",
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: <User className="w-5 h-5" /> },
        { name: 'educationLevel', label: 'Education Level', type: 'select', options: ['10th', 'Inter', 'B.Tech', 'Other'], icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'dob', label: 'Date of Birth', type: 'date', icon: <Calendar className="w-5 h-5" /> },
      ]
    },
    {
      title: "Your Goals",
      description: "What are you aiming for in the short and long term?",
      fields: [
        { name: 'shortTerm', label: 'Short-term Goal', type: 'text', icon: <Target className="w-5 h-5" /> },
        { name: 'longTerm', label: 'Long-term Goal', type: 'text', icon: <ChevronRight className="w-5 h-5" /> },
      ]
    },
    {
      title: "Why Path & Pulse?",
      description: "Tell us why you're here and what interests you.",
      fields: [
        { name: 'reason', label: 'Why are you using the app?', type: 'textarea', icon: <Heart className="w-5 h-5" /> },
        { name: 'interests', label: 'What are your interests?', type: 'text', icon: <Sparkles className="w-5 h-5" /> },
      ]
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
            className="w-full py-4 bg-[#5A5A40] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next Step'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
