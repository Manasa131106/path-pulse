export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  educationLevel: string;
  dob: string;
  visionBoard?: string;
  is_new_user: boolean;
  goals?: {
    shortTerm: string;
    longTerm: string;
    reason: string;
    interests: string;
  };
}

export interface Task {
  id: number;
  userId: string;
  text: string;
  completed: boolean;
  type: 'daily' | 'weekly';
  category: string;
}

export interface PulseResponse {
  userId: string;
  timestamp: string;
  answers: number[]; // 1-5 scale for 5 questions
  mood: string;
  stress: string;
  motivation: string;
  aiFeedback?: {
    analysis: string;
    suggestion: string;
    motivation: string;
  };
}

export interface DashboardData {
  user: UserProfile;
  tasks: Task[];
  progress: number;
  streak: number;
  achievements: number;
  avatarParts: string[]; // List of unlocked parts
}
