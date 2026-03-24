import { motion } from 'motion/react';
import { Compass, GraduationCap, Briefcase, Star, MapPin } from 'lucide-react';

interface PathProps {
  educationLevel: string;
}

export default function Path({ educationLevel }: PathProps) {
  const roadmap = {
    '10th': [
      { id: 1, title: 'Foundation', desc: 'Master core subjects', icon: <GraduationCap /> },
      { id: 2, title: 'Exploration', desc: 'Identify interests', icon: <Compass /> },
      { id: 3, title: 'Intermediate', desc: 'Choose your stream', icon: <MapPin /> }
    ],
    'Inter': [
      { id: 1, title: 'Specialization', desc: 'Focus on chosen stream', icon: <Star /> },
      { id: 2, title: 'Entrance Prep', desc: 'Prepare for competitive exams', icon: <Zap className="w-5 h-5" /> },
      { id: 3, title: 'Higher Ed', desc: 'Select degree path', icon: <GraduationCap /> }
    ],
    'B.Tech': [
      { id: 1, title: 'Core Skills', desc: 'Master engineering basics', icon: <Briefcase /> },
      { id: 2, title: 'Specialization', desc: 'Niche down (AI, Web, etc)', icon: <Star /> },
      { id: 3, title: 'Placement', desc: 'Career readiness', icon: <Target className="w-5 h-5" /> }
    ],
    'Other': [
      { id: 1, title: 'Skill Up', desc: 'Learn modern tools', icon: <Zap className="w-5 h-5" /> },
      { id: 2, title: 'Portfolio', desc: 'Build your showcase', icon: <Star /> },
      { id: 3, title: 'Career', desc: 'Professional growth', icon: <Briefcase /> }
    ]
  };

  const currentRoadmap = roadmap[educationLevel as keyof typeof roadmap] || roadmap['Other'];

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Your Path</h1>
        <p className="text-[#5A5A40] opacity-80">Adaptive roadmap for {educationLevel} students.</p>
      </header>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-[#5A5A40]/10 rounded-full" />
        
        <div className="space-y-12">
          {currentRoadmap.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="relative pl-20"
            >
              <div className="absolute left-4 top-0 w-9 h-9 bg-[#5A5A40] text-white rounded-full flex items-center justify-center shadow-lg z-10">
                {item.icon}
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif font-bold mb-1">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-[#F5F5F0] text-[#5A5A40] text-xs font-bold rounded-full uppercase tracking-wider">
                    {i === 0 ? 'In Progress' : 'Locked'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Target, Zap } from 'lucide-react';
