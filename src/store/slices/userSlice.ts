import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserProgress } from '@models/User';
import { StorageService } from '@services/storage/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '../store';

interface UserState {
  currentUser: User | null;
  userProgress: Record<string, UserProgress>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  studyStreak: number;
  totalStudyTime: number;
}

const initialState: UserState = {
  currentUser: null,
  userProgress: {},
  isLoading: false,
  error: null,
  isAuthenticated: false,
  studyStreak: 0,
  totalStudyTime: 0,
};

// Async thunks
export const loadUser = createAsyncThunk('user/loadUser', async () => {
  const storage = StorageService.getInstance();
  return await storage.getUser();
});

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const storage = StorageService.getInstance();
    const user: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await storage.saveUser(user);
    await AsyncStorage.setItem('currentUserId', user.id);
    return user;
  },
);

export const updateUserProgress = createAsyncThunk(
  'user/updateProgress',
  async ({ userId, categoryId, progress }: { userId: string; categoryId: string; progress: Partial<UserProgress> }, { getState }) => {
    const storage = StorageService.getInstance();
    const state = getState() as RootState;
    const effectiveUserId = userId || state.user.currentUser?.id || 'default-user';
    
    // Create full UserProgress object with defaults
    const fullProgress: UserProgress = {
      userId: effectiveUserId,
      categoryId,
      totalQuestions: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      averageScore: 0,
      lastStudyDate: new Date(),
      studyStreak: 0,
      totalStudyTime: 0,
      weakAreas: [],
      strongAreas: [],
      ...progress,
    };
    
    await storage.saveUserProgress(effectiveUserId, fullProgress);
    return { categoryId, progress: fullProgress };
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.currentUser = null;
      state.userProgress = {};
      state.isAuthenticated = false;
      state.studyStreak = 0;
      state.totalStudyTime = 0;
      AsyncStorage.removeItem('currentUserId');
    },
    updateStudyTime: (state, action: PayloadAction<number>) => {
      state.totalStudyTime += action.payload;
    },
    updateStudyStreak: (state, action: PayloadAction<number>) => {
      state.studyStreak = action.payload;
    },
    setUserProgress: (state, action: PayloadAction<Record<string, UserProgress>>) => {
      state.userProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentUser = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load user';
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.currentUser = action.payload as User;
        state.isAuthenticated = true;
      })
      // Update progress
      .addCase(updateUserProgress.fulfilled, (state, action) => {
        const { categoryId, progress } = action.payload;
        state.userProgress[categoryId] = {
          ...state.userProgress[categoryId],
          ...progress,
        } as UserProgress;
      });
  },
});

export const { setUser, logout, updateStudyTime, updateStudyStreak, setUserProgress } =
  userSlice.actions;
export default userSlice.reducer;
