import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Question, Category, QuestionBank } from '@models/Question';
import { DatabaseService } from '@services/database/DatabaseService';

interface QuestionState {
  questions: Question[];
  categories: Category[];
  currentCategory: Category | null;
  bookmarkedQuestions: string[];
  searchResults: Question[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | string | null;
}

const initialState: QuestionState = {
  questions: [],
  categories: [],
  currentCategory: null,
  bookmarkedQuestions: [],
  searchResults: [],
  isLoading: false,
  error: null,
  lastSync: null,
};

// Async thunks
export const loadCategories = createAsyncThunk(
  'questions/loadCategories',
  async () => {
    const db = DatabaseService.getInstance();
    return await db.getCategories();
  }
);

export const loadQuestionsByCategory = createAsyncThunk(
  'questions/loadByCategory',
  async (categoryId: string) => {
    const db = DatabaseService.getInstance();
    return await db.getQuestionsByCategory(categoryId);
  }
);

export const loadAllQuestions = createAsyncThunk(
  'questions/loadAll',
  async () => {
    const db = DatabaseService.getInstance();
    return await db.getAllQuestions();
  }
);

export const searchQuestions = createAsyncThunk(
  'questions/search',
  async (query: string) => {
    const db = DatabaseService.getInstance();
    return await db.searchQuestions(query);
  }
);

export const toggleBookmark = createAsyncThunk(
  'questions/toggleBookmark',
  async ({ userId, questionId }: { userId: string; questionId: string }) => {
    const db = DatabaseService.getInstance();
    await db.toggleBookmark(userId, questionId);
    return questionId;
  }
);

export const syncQuestionBank = createAsyncThunk(
  'questions/sync',
  async () => {
    // In a real app, this would sync with a remote server
    // For now, we'll just update the last sync time
    return new Date().toISOString();
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<Category>) => {
      state.currentCategory = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateQuestionStats: (state, action: PayloadAction<{
      questionId: string;
      answered: boolean;
      correct: boolean;
      timeSpent: number;
    }>) => {
      const question = state.questions.find(q => q.id === action.payload.questionId);
      if (question) {
        question.timesAnswered = (question.timesAnswered || 0) + 1;
        if (action.payload.correct) {
          question.timesCorrect = (question.timesCorrect || 0) + 1;
        }
        question.averageTime = ((question.averageTime || 0) * (question.timesAnswered - 1) + action.payload.timeSpent) / question.timesAnswered;
        question.lastSeen = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load categories
      .addCase(loadCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load categories';
      })
      // Load questions by category
      .addCase(loadQuestionsByCategory.fulfilled, (state, action) => {
        state.questions = action.payload;
      })
      // Load all questions
      .addCase(loadAllQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAllQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(loadAllQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load questions';
      })
      // Search questions
      .addCase(searchQuestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      // Toggle bookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const questionId = action.payload;
        const index = state.bookmarkedQuestions.indexOf(questionId);
        if (index > -1) {
          state.bookmarkedQuestions.splice(index, 1);
        } else {
          state.bookmarkedQuestions.push(questionId);
        }
        
        // Update the question's bookmark status
        const question = state.questions.find(q => q.id === questionId);
        if (question) {
          question.isBookmarked = !question.isBookmarked;
        }
      })
      // Sync question bank
      .addCase(syncQuestionBank.fulfilled, (state, action) => {
        state.lastSync = action.payload;
      });
  },
});

export const { setCurrentCategory, clearSearchResults, updateQuestionStats } = questionSlice.actions;
export default questionSlice.reducer; 