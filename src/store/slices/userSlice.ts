import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserProgress } from '@models/User';
import { DatabaseService } from '@services/database/DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
export const loadUser = createAsyncThunk(
  'user/loadUser',
  async () => {
    const userId = await AsyncStorage.getItem('currentUserId');
    if (!userId) return null;
    
    const db = DatabaseService.getInstance();
    // Implement getUser method in DatabaseService
    return await db.getUser(userId);
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = DatabaseService.getInstance();
    const userId = await db.createUser(userData);
    await AsyncStorage.setItem('currentUserId', userId);
    return { ...userData, id: userId };
  }
);

export const updateUserProgress = createAsyncThunk(
  'user/updateProgress',
  async ({ categoryId, progress }: { categoryId: string; progress: Partial<UserProgress> }) => {
    const db = DatabaseService.getInstance();
    // Implement updateUserProgress method in DatabaseService
    await db.updateUserProgress(categoryId, progress);
    return { categoryId, progress };
  }
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

export const { setUser, logout, updateStudyTime, updateStudyStreak, setUserProgress } = userSlice.actions;
export default userSlice.reducer; 