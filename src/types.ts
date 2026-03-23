export interface UserProfile {
  id: string;
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
}

export interface PulseState {
  mood: string;
  stress: string;
  motivation: string;
}

export interface DashboardData {
  user: UserProfile;
  tasks: Task[];
  progress: number;
  streak: number;
  achievements: number;
}
