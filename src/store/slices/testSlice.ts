import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Question } from '@models/Question';
import { TestSession, TestQuestion } from '@models/User';
import { DatabaseService } from '@services/database/DatabaseService';

interface TestState {
  currentSession: TestSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, TestQuestion>;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
  isPaused: boolean;
  // Additional properties for compatibility
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  testSession: TestSession | null;
}

const initialState: TestState = {
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  isLoading: false,
  error: null,
  timeRemaining: 0,
  isPaused: false,
  // Additional properties for compatibility
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  testSession: null,
};

// Async thunks
export const startTestSession = createAsyncThunk(
  'test/startSession',
  async (params: {
    type: 'practice' | 'mock' | 'category' | 'weak_areas';
    categoryId?: string;
    numberOfQuestions: number;
    timeLimit?: number;
    userId: string;
  }) => {
    const db = DatabaseService.getInstance();
    
    // Fetch questions based on test type
    let questions: Question[] = [];
    if (params.type === 'category' && params.categoryId) {
      questions = await db.getQuestionsByCategory(params.categoryId, params.numberOfQuestions);
    } else if (params.type === 'weak_areas') {
      // Get weak area questions
      questions = await db.getWeakAreaQuestions(params.userId, params.numberOfQuestions);
    } else {
      // Get random mix for practice or mock
      questions = await db.getRandomQuestions(params.numberOfQuestions);
    }
    
    // Create test session
    const session: Omit<TestSession, 'id'> = {
      userId: params.userId,
      type: params.type,
      categoryId: params.categoryId,
      startTime: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers: 0,
      score: 0,
      questions: questions.map(q => ({
        questionId: q.id,
        timeSpent: 0,
      })),
      completed: false,
    };
    
    const sessionId = await db.createTestSession(session);
    
    return {
      session: { ...session, id: sessionId } as TestSession,
      questions,
      timeLimit: params.timeLimit,
    };
  }
);

export const submitAnswer = createAsyncThunk(
  'test/submitAnswer',
  async (answer: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    confidence?: 'low' | 'medium' | 'high';
  }, { getState }) => {
    const state = getState() as { test: TestState };
    const db = DatabaseService.getInstance();
    
    if (state.test.currentSession) {
      await db.updateTestAnswer(
        state.test.currentSession.id,
        answer.questionId,
        answer
      );
    }
    
    return answer;
  }
);

export const endTestSession = createAsyncThunk(
  'test/endSession',
  async (_, { getState }) => {
    const state = getState() as { test: TestState };
    const db = DatabaseService.getInstance();
    
    if (state.test.currentSession) {
      const correctAnswers = Object.values(state.test.answers)
        .filter(a => a.isCorrect).length;
      const score = (correctAnswers / state.test.questions.length) * 100;
      
      await db.updateTestSession(state.test.currentSession.id, {
        endTime: new Date().toISOString(),
        correctAnswers,
        score,
        completed: true,
      });
      
      return { correctAnswers, score };
    }
    
    return null;
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
        state.questionIndex = state.currentQuestionIndex;
        state.currentQuestion = state.questions[state.currentQuestionIndex];
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
        state.questionIndex = state.currentQuestionIndex;
        state.currentQuestion = state.questions[state.currentQuestionIndex];
      }
    },
    jumpToQuestion: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.questions.length) {
        state.currentQuestionIndex = action.payload;
      }
    },
    pauseTest: (state) => {
      state.isPaused = true;
    },
    resumeTest: (state) => {
      state.isPaused = false;
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    bookmarkQuestion: (state, action: PayloadAction<string>) => {
      const questionId = action.payload;
      if (state.answers[questionId]) {
        state.answers[questionId].isBookmarked = !state.answers[questionId].isBookmarked;
      }
    },
    resetTest: (state) => {
      state.currentSession = null;
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.timeRemaining = 0;
      state.isPaused = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start test session
      .addCase(startTestSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTestSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = {
          id: action.payload.session.id,
          userId: action.payload.session.userId,
          type: action.payload.session.type,
          categoryId: action.payload.session.categoryId,
          startTime: action.payload.session.startTime,
          endTime: undefined,
          totalQuestions: action.payload.session.totalQuestions,
          correctAnswers: action.payload.session.correctAnswers,
          score: action.payload.session.score,
          questions: action.payload.session.questions,
          completed: action.payload.session.completed,
        };
        state.questions = action.payload.questions;
        state.currentQuestionIndex = 0;
        state.timeRemaining = action.payload.timeLimit ? action.payload.timeLimit * 60 : 0;
        state.answers = {};
        state.isPaused = false;
        
        // Set additional properties for compatibility
        state.currentQuestion = action.payload.questions[0] || null;
        state.questionIndex = 0;
        state.totalQuestions = action.payload.questions.length;
        state.testSession = state.currentSession;
      })
      .addCase(startTestSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to start test session';
      })
      // Submit answer
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const { questionId } = action.payload;
        state.answers[questionId] = action.payload as TestQuestion;
        
        // Update session stats
        if (state.currentSession) {
          state.currentSession.correctAnswers = Object.values(state.answers)
            .filter(a => a.isCorrect).length;
        }
      })
      // End test session
      .addCase(endTestSession.fulfilled, (state, action) => {
        if (action.payload && state.currentSession) {
          state.currentSession.correctAnswers = action.payload.correctAnswers;
          state.currentSession.score = action.payload.score;
          state.currentSession.completed = true;
        }
      });
  },
});

// Selectors
export const selectCurrentQuestion = (state: { test: TestState }) => {
  const { questions, currentQuestionIndex } = state.test;
  return questions[currentQuestionIndex] || null;
};

export const selectTestProgress = (state: { test: TestState }) => {
  const { questions, answers } = state.test;
  return {
    totalQuestions: questions.length,
    answeredQuestions: Object.keys(answers).length,
    correctAnswers: Object.values(answers).filter(a => a.isCorrect).length,
    remainingQuestions: questions.length - Object.keys(answers).length,
  };
};

export const {
  nextQuestion,
  previousQuestion,
  jumpToQuestion,
  pauseTest,
  resumeTest,
  updateTimeRemaining,
  bookmarkQuestion,
  resetTest,
} = testSlice.actions;

export default testSlice.reducer; 