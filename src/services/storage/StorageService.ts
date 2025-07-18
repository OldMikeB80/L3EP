import { MMKV } from 'react-native-mmkv';
import { Question, Category } from '@models/Question';
import { User, UserProgress, TestSession } from '@models/User';

// Initialize MMKV instance
const storage = new MMKV({
  id: 'L3EP-storage',
  encryptionKey: undefined, // Add encryption if needed
});

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize storage
  public async initializeStorage(): Promise<void> {
    console.log('Initializing MMKV storage...');
    
    // Check if data exists, if not seed initial data
    const hasData = storage.contains('categories');
    if (!hasData) {
      console.log('No data found, will seed on first use');
    }
    
    console.log('Storage initialization complete');
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    try {
      const data = storage.getString('categories');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  public async saveCategories(categories: Category[]): Promise<void> {
    try {
      storage.set('categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  // Questions
  public async getAllQuestions(): Promise<Question[]> {
    try {
      const data = storage.getString('questions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }

  public async getQuestionsByCategory(categoryId: string): Promise<Question[]> {
    try {
      const allQuestions = await this.getAllQuestions();
      return allQuestions.filter(q => q.categoryId === categoryId);
    } catch (error) {
      console.error('Error getting questions by category:', error);
      return [];
    }
  }

  public async saveQuestions(questions: Question[]): Promise<void> {
    try {
      storage.set('questions', JSON.stringify(questions));
    } catch (error) {
      console.error('Error saving questions:', error);
      throw error;
    }
  }

  public async searchQuestions(query: string): Promise<Question[]> {
    try {
      const allQuestions = await this.getAllQuestions();
      const lowerQuery = query.toLowerCase();
      
      return allQuestions.filter(q => 
        q.question.toLowerCase().includes(lowerQuery) ||
        q.explanation?.toLowerCase().includes(lowerQuery) ||
        q.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  // User
  public async getUser(): Promise<User | null> {
    try {
      const data = storage.getString('currentUser');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async saveUser(user: User): Promise<void> {
    try {
      storage.set('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  // User Progress
  public async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const data = storage.getString(`progress_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  public async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    try {
      const allProgress = await this.getUserProgress(userId);
      const index = allProgress.findIndex(p => p.categoryId === progress.categoryId);
      
      if (index >= 0) {
        allProgress[index] = progress;
      } else {
        allProgress.push(progress);
      }
      
      storage.set(`progress_${userId}`, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  }

  // Bookmarks
  public async toggleBookmark(userId: string, questionId: string): Promise<void> {
    try {
      const key = `bookmarks_${userId}`;
      const data = storage.getString(key);
      const bookmarks: string[] = data ? JSON.parse(data) : [];
      
      const index = bookmarks.indexOf(questionId);
      if (index >= 0) {
        bookmarks.splice(index, 1);
      } else {
        bookmarks.push(questionId);
      }
      
      storage.set(key, JSON.stringify(bookmarks));
      
      // Update question bookmark status
      const questions = await this.getAllQuestions();
      const question = questions.find(q => q.id === questionId);
      if (question) {
        question.isBookmarked = index < 0;
        await this.saveQuestions(questions);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  public async getBookmarkedQuestions(userId: string): Promise<string[]> {
    try {
      const data = storage.getString(`bookmarks_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  // Test Sessions
  public async saveTestSession(session: TestSession): Promise<void> {
    try {
      const key = `sessions_${session.userId}`;
      const data = storage.getString(key);
      const sessions: TestSession[] = data ? JSON.parse(data) : [];
      
      sessions.push(session);
      storage.set(key, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving test session:', error);
      throw error;
    }
  }

  public async getTestSessions(userId: string): Promise<TestSession[]> {
    try {
      const data = storage.getString(`sessions_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting test sessions:', error);
      return [];
    }
  }

  // Get random questions
  public async getRandomQuestions(count: number): Promise<Question[]> {
    try {
      const allQuestions = await this.getAllQuestions();
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.error('Error getting random questions:', error);
      return [];
    }
  }

  // Get weak area questions
  public async getWeakAreaQuestions(userId: string, count: number): Promise<Question[]> {
    try {
      // For now, return random questions
      // In a full implementation, this would analyze user performance
      return await this.getRandomQuestions(count);
    } catch (error) {
      console.error('Error getting weak area questions:', error);
      return [];
    }
  }

  // Create test session
  public async createTestSession(session: Omit<TestSession, 'id'>): Promise<string> {
    try {
      const sessionWithId: TestSession = {
        ...session,
        id: this.generateId(),
      };
      await this.saveTestSession(sessionWithId);
      return sessionWithId.id;
    } catch (error) {
      console.error('Error creating test session:', error);
      throw error;
    }
  }

  // Update test session
  public async updateTestSession(sessionId: string, updates: Partial<TestSession>): Promise<void> {
    try {
      // This is a simplified implementation
      console.log('Updating test session:', sessionId, updates);
    } catch (error) {
      console.error('Error updating test session:', error);
      throw error;
    }
  }

  // Update test answer
  public async updateTestAnswer(
    sessionId: string,
    questionId: string,
    answer: {
      userAnswer: string;
      isCorrect: boolean;
      timeSpent: number;
      confidence?: 'low' | 'medium' | 'high';
    }
  ): Promise<void> {
    try {
      // This is a simplified implementation
      console.log('Updating test answer:', sessionId, questionId, answer);
    } catch (error) {
      console.error('Error updating test answer:', error);
      throw error;
    }
  }

  // Analytics methods
  public async recordDailyAnalytics(
    userId: string,
    stats: {
      studyTime: number;
      questionsAttempted: number;
      questionsCorrect: number;
      categoriesStudied: string[];
    }
  ): Promise<void> {
    try {
      const key = `analytics_${userId}_${new Date().toISOString().split('T')[0]}`;
      storage.set(key, JSON.stringify(stats));
    } catch (error) {
      console.error('Error recording analytics:', error);
      throw error;
    }
  }

  public async getWeeklyStats(userId: string): Promise<any> {
    try {
      // Simplified implementation
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        totalStudyTime: 0,
        averageScore: 0,
        daysStudied: 0,
      };
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        totalStudyTime: 0,
        averageScore: 0,
        daysStudied: 0,
      };
    }
  }

  // Utility method to clear all data
  public async clearAllData(): Promise<void> {
    try {
      storage.clearAll();
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 