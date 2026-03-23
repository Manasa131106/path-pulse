import { motion } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Flame, TrendingUp } from 'lucide-react';
import { DashboardData, Task } from '../types';

interface DashboardProps {
  data: DashboardData;
  onToggleTask: (id: number) => void;
}

export default function Dashboard({ data, onToggleTask }: DashboardProps) {
  return (
    <div className="space-y-8 pb-24">
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
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              animate={{ width: `${data.progress}%` }}
              className="h-full bg-[#5A5A40]"
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">You've completed {data.tasks.filter(t => t.completed).length} out of {data.tasks.length} tasks.</p>
        </section>

        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </h2>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${i < data.achievements ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-30'}`}
              >
                <Trophy className={`w-8 h-8 ${i < data.achievements ? 'text-yellow-500' : 'text-gray-300'}`} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500">Unlock more by completing your daily path.</p>
        </section>
      </div>

      <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold mb-6">Today's Path</h2>
        <div className="space-y-4">
          {data.tasks.map((task: Task) => (
            <motion.div 
              key={task.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onToggleTask(task.id)}
              className={`p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${task.completed ? 'bg-gray-50 opacity-60' : 'bg-[#F5F5F0] hover:bg-[#EBEBE0]'}`}
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
              <span className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-[#1a1a1a]'}`}>
                {task.text}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
