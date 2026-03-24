export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  educationLevel: string;
  dob: string;
  visionBoard?: string;
  is_new_user: boolean;
  currentSkillLevel?: 'Beginner' | 'Intermediate';
  skillGaps?: string[];
  roadmap?: {
    title: string;
    steps: {
      title: string;
      description: string;
      status: 'locked' | 'current' | 'completed';
    }[];
  };
  goals?: {
    shortTerm: string;
    longTerm: string;
    reason: string;
    interests: string;
  };
  burnoutStatus?: {
    level: 'Low' | 'Moderate' | 'High';
    warning: string;
    recommendation: string;
  };
  strictMode?: boolean;
}

export interface Task {
  id: number;
  userId: string;
  text: string;
  completed: boolean;
  type: 'daily' | 'weekly';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: number;
  isLocked?: boolean;
  aiReasoning?: string;
}

export interface PulseResponse {
  userId: string;
  timestamp: string;
  answers: number[]; 
  mood: string;
  stress: string;
  motivation: string;
  aiFeedback?: {
    analysis: string;
    suggestion: string;
    motivation: string;
    burnoutRisk: number; // 0-100
    status: 'Normal' | 'Warning' | 'Burnout';
    recommendation: 'reduce tasks' | 'maintain' | 'push harder';
  };
}

export interface Decision {
  status: "Burnout" | "Normal" | "Growth";
  action: "Reduce workload" | "Maintain" | "Increase difficulty";
  reason: string;
}

export interface DashboardData {
  user: UserProfile;
  tasks: Task[];
  progress: number;
  streak: number;
  burnoutStatus: {
    level: 'Low' | 'Moderate' | 'High';
    warning: string;
    recommendation: string;
  };
  recommendedAction: 'reduce tasks' | 'maintain' | 'increase difficulty';
  priorityTask?: Task;
  achievements: number;
  avatarParts: string[];
  aiInsights: {
    summary: string;
    nextBigMove: string;
    burnoutAlert?: string;
    recommendedAction: 'reduce tasks' | 'maintain' | 'increase difficulty';
  };
  decision?: Decision;
}

export interface InsightData {
  weeklyProgress: { day: string; score: number }[];
  moodTrend: { day: string; level: number }[];
  skillDistribution: { category: string; value: number }[];
}
