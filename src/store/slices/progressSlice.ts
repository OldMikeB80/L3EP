import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserProgress } from '@models/User';
import { StorageService } from '@services/storage/StorageService';

interface ProgressState {
  categoryProgress: Record<string, UserProgress>;
  dailyStats: {
    questionsAttempted: number;
    questionsCorrect: number;
    studyTime: number; // minutes
    date: string;
  };
  weeklyStats: {
    totalQuestions: number;
    correctAnswers: number;
    totalStudyTime: number;
    averageScore: number;
    daysStudied: number;
  };
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date | string;
  progress: number;
  target: number;
}

const initialState: ProgressState = {
  categoryProgress: {},
  dailyStats: {
    questionsAttempted: 0,
    questionsCorrect: 0,
    studyTime: 0,
    date: new Date().toISOString().split('T')[0],
  },
  weeklyStats: {
    totalQuestions: 0,
    correctAnswers: 0,
    totalStudyTime: 0,
    averageScore: 0,
    daysStudied: 0,
  },
  achievements: [
    {
      id: 'first_test',
      title: 'First Steps',
      description: 'Complete your first test',
      icon: 'flag-checkered',
      progress: 0,
      target: 1,
    },
    {
      id: 'quiz_master_100',
      title: 'Quiz Master',
      description: 'Answer 100 questions',
      icon: 'trophy',
      progress: 0,
      target: 100,
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: 'fire',
      progress: 0,
      target: 7,
    },
    {
      id: 'perfect_score',
      title: 'Perfectionist',
      description: 'Score 100% on a test',
      icon: 'star',
      progress: 0,
      target: 1,
    },
    {
      id: 'study_hour',
      title: 'Dedicated Student',
      description: 'Study for 60 minutes in a day',
      icon: 'clock',
      progress: 0,
      target: 60,
    },
  ],
  isLoading: false,
  error: null,
};

// Async thunks
export const loadUserProgress = createAsyncThunk(
  'progress/loadUserProgress',
  async (userId: string) => {
    const storage = StorageService.getInstance();
    const progressArray = await storage.getUserProgress(userId);
    
    // Convert array to Record<string, UserProgress>
    const progressRecord: Record<string, UserProgress> = {};
    progressArray.forEach(progress => {
      progressRecord[progress.categoryId] = progress;
    });
    
    return progressRecord;
  },
);

export const updateDailyProgress = createAsyncThunk(
  'progress/updateDaily',
  async ({ userId, stats }: { userId: string; stats: Partial<ProgressState['dailyStats']> }) => {
    const storage = StorageService.getInstance();
    await storage.recordDailyAnalytics(userId, {
      studyTime: stats.studyTime || 0,
      questionsAttempted: stats.questionsAttempted || 0,
      questionsCorrect: stats.questionsCorrect || 0,
      categoriesStudied: [],
    });
    return stats;
  },
);

export const loadWeeklyStats = createAsyncThunk('progress/loadWeekly', async (userId: string) => {
  const storage = StorageService.getInstance();
  return await storage.getWeeklyStats(userId);
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    incrementDailyStat: (
      state,
      action: PayloadAction<{
        stat: 'questionsAttempted' | 'questionsCorrect' | 'studyTime';
        value: number;
      }>,
    ) => {
      const today = new Date().toISOString().split('T')[0];
      if (state.dailyStats.date !== today) {
        // Reset daily stats for new day
        state.dailyStats = {
          questionsAttempted: 0,
          questionsCorrect: 0,
          studyTime: 0,
          date: today,
        };
      }
      state.dailyStats[action.payload.stat] += action.payload.value;
    },
    updateCategoryProgress: (
      state,
      action: PayloadAction<{
        categoryId: string;
        progress: Partial<UserProgress>;
      }>,
    ) => {
      const { categoryId, progress } = action.payload;
      state.categoryProgress[categoryId] = {
        ...state.categoryProgress[categoryId],
        ...progress,
      } as UserProgress;
    },
    checkAchievements: (state) => {
      // Check and update achievement progress
      state.achievements.forEach((achievement) => {
        switch (achievement.id) {
          case 'quiz_master_100':
            achievement.progress = state.weeklyStats.totalQuestions;
            break;
          case 'study_hour':
            achievement.progress = state.dailyStats.studyTime;
            break;
          // Add more achievement checks
        }

        // Mark as unlocked if target reached
        if (achievement.progress >= achievement.target && !achievement.unlockedAt) {
          achievement.unlockedAt = new Date().toISOString();
        }
      });
    },
    resetDailyStats: (state) => {
      state.dailyStats = {
        questionsAttempted: 0,
        questionsCorrect: 0,
        studyTime: 0,
        date: new Date().toISOString().split('T')[0],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user progress
      .addCase(loadUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryProgress = action.payload;
      })
      .addCase(loadUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load progress';
      })
      // Update daily progress
      .addCase(updateDailyProgress.fulfilled, (state, action) => {
        Object.assign(state.dailyStats, action.payload);
      })
      // Load weekly stats
      .addCase(loadWeeklyStats.fulfilled, (state, action) => {
        state.weeklyStats = action.payload;
      });
  },
});

export const { incrementDailyStat, updateCategoryProgress, checkAchievements, resetDailyStats } =
  progressSlice.actions;

export default progressSlice.reducer;
