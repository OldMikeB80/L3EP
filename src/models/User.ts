export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  targetExamDate?: Date;
  dailyStudyGoal: number; // minutes
  preferredCategories?: string[];
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  categoryId: string;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  lastStudyDate: Date;
  studyStreak: number;
  totalStudyTime: number; // minutes
  weakAreas: string[];
  strongAreas: string[];
}

export interface TestSession {
  id: string;
  userId: string;
  type: 'practice' | 'mock' | 'category' | 'weak_areas';
  categoryId?: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number; // minutes
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  questions: TestQuestion[];
  completed: boolean;
  timedOut?: boolean;
}

export interface TestQuestion {
  questionId: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent: number; // seconds
  isBookmarked?: boolean;
  confidence?: 'low' | 'medium' | 'high';
}

export interface StudyPlan {
  id: string;
  userId: string;
  examDate: Date;
  dailyGoal: number; // minutes
  weeklyGoal: number; // questions
  focusAreas: string[];
  schedule: StudySchedule[];
  progress: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySchedule {
  date: Date;
  categoryId: string;
  targetQuestions: number;
  targetTime: number; // minutes
  completed: boolean;
  actualQuestions?: number;
  actualTime?: number;
}
