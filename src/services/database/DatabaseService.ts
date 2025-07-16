import SQLite from 'react-native-sqlite-storage';
import { Question, Category, Subcategory } from '@models/Question';
import { User, UserProgress, TestSession, TestQuestion } from '@models/User';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export class DatabaseService {
  private static instance: DatabaseService;
  private database?: SQLite.SQLiteDatabase;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initializeDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'NDTExamPrep.db',
        location: 'default',
      });
      
      await this.createTables();
      await this.checkAndUpdateDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const queries = [
      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        total_questions INTEGER DEFAULT 0,
        required_pass_percentage REAL DEFAULT 70.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Subcategories table
      `CREATE TABLE IF NOT EXISTS subcategories (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Questions table
      `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        subcategory_id TEXT,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
        image_url TEXT,
        formula_latex TEXT,
        references TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (subcategory_id) REFERENCES subcategories (id)
      )`,

      // Options table
      `CREATE TABLE IF NOT EXISTS options (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        text TEXT NOT NULL,
        image_url TEXT,
        option_order INTEGER NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        profile_image TEXT,
        target_exam_date DATETIME,
        daily_study_goal INTEGER DEFAULT 30,
        preferred_categories TEXT,
        notifications_enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // User progress table
      `CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        total_questions INTEGER DEFAULT 0,
        questions_answered INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        average_score REAL DEFAULT 0.0,
        last_study_date DATETIME,
        study_streak INTEGER DEFAULT 0,
        total_study_time INTEGER DEFAULT 0,
        weak_areas TEXT,
        strong_areas TEXT,
        PRIMARY KEY (user_id, category_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Test sessions table
      `CREATE TABLE IF NOT EXISTS test_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT CHECK (type IN ('practice', 'mock', 'category', 'weak_areas')),
        category_id TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER DEFAULT 0,
        score REAL DEFAULT 0.0,
        completed INTEGER DEFAULT 0,
        timed_out INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Test questions table
      `CREATE TABLE IF NOT EXISTS test_questions (
        session_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        user_answer TEXT,
        is_correct INTEGER,
        time_spent INTEGER DEFAULT 0,
        is_bookmarked INTEGER DEFAULT 0,
        confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
        PRIMARY KEY (session_id, question_id),
        FOREIGN KEY (session_id) REFERENCES test_sessions (id),
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )`,

      // Bookmarks table
      `CREATE TABLE IF NOT EXISTS bookmarks (
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, question_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )`,

      // Study plans table
      `CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exam_date DATETIME NOT NULL,
        daily_goal INTEGER DEFAULT 30,
        weekly_goal INTEGER DEFAULT 100,
        focus_areas TEXT,
        progress REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Analytics table
      `CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        study_time INTEGER DEFAULT 0,
        questions_attempted INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        categories_studied TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE (user_id, date)
      )`,
    ];

    for (const query of queries) {
      await this.database.executeSql(query);
    }

    // Create indexes for better performance
    await this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    if (!this.database) return;

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id)',
      'CREATE INDEX IF NOT EXISTS idx_test_sessions_user ON test_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_test_questions_session ON test_questions(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, date)',
    ];

    for (const index of indexes) {
      await this.database.executeSql(index);
    }
  }

  // Question operations
  public async getQuestionsByCategory(categoryId: string, limit?: number): Promise<Question[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT q.*, GROUP_CONCAT(
        json_object(
          'id', o.id,
          'text', o.text,
          'imageUrl', o.image_url
        )
      ) as options_json
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.category_id = ?
      GROUP BY q.id
      ${limit ? 'LIMIT ?' : ''}
    `;

    const params = limit ? [categoryId, limit] : [categoryId];
    const [result] = await this.database.executeSql(query, params);

    return this.parseQuestions(result);
  }

  public async getQuestionById(id: string): Promise<Question | null> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT q.*, GROUP_CONCAT(
        json_object(
          'id', o.id,
          'text', o.text,
          'imageUrl', o.image_url
        )
      ) as options_json
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.id = ?
      GROUP BY q.id
    `;

    const [result] = await this.database.executeSql(query, [id]);
    const questions = this.parseQuestions(result);
    return questions.length > 0 ? questions[0] : null;
  }

  private parseQuestions(result: any): Question[] {
    const questions: Question[] = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      const options = row.options_json ? 
        row.options_json.split(',').map((opt: string) => {
          try {
            return JSON.parse(opt);
          } catch {
            return null;
          }
        }).filter(Boolean) : [];

      questions.push({
        id: row.id,
        categoryId: row.category_id,
        subcategoryId: row.subcategory_id,
        question: row.question,
        options,
        correctAnswer: row.correct_answer,
        explanation: row.explanation,
        difficulty: row.difficulty,
        imageUrl: row.image_url,
        formulaLatex: row.formula_latex,
        references: row.references ? JSON.parse(row.references) : [],
        tags: row.tags ? JSON.parse(row.tags) : [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }

    return questions;
  }

  // User operations
  public async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const query = `
      INSERT INTO users (id, name, email, profile_image, target_exam_date, 
                        daily_study_goal, preferred_categories, notifications_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      id,
      user.name,
      user.email,
      user.profileImage || null,
      user.targetExamDate ? user.targetExamDate.toISOString() : null,
      user.dailyStudyGoal,
      JSON.stringify(user.preferredCategories || []),
      user.notificationsEnabled ? 1 : 0,
    ]);

    return id;
  }

  // Test session operations
  public async createTestSession(session: Omit<TestSession, 'id'>): Promise<string> {
    if (!this.database) throw new Error('Database not initialized');

    const id = this.generateId();
    const query = `
      INSERT INTO test_sessions (id, user_id, type, category_id, start_time, 
                                total_questions, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      id,
      session.userId,
      session.type,
      session.categoryId || null,
      session.startTime.toISOString(),
      session.totalQuestions,
      0,
    ]);

    // Insert test questions
    for (const question of session.questions) {
      await this.addTestQuestion(id, question);
    }

    return id;
  }

  private async addTestQuestion(sessionId: string, question: TestQuestion): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT INTO test_questions (session_id, question_id, user_answer, is_correct, 
                                 time_spent, is_bookmarked, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      sessionId,
      question.questionId,
      question.userAnswer || null,
      question.isCorrect ? 1 : 0,
      question.timeSpent,
      question.isBookmarked ? 1 : 0,
      question.confidence || null,
    ]);
  }

  // Analytics operations
  public async recordDailyAnalytics(userId: string, data: {
    studyTime: number;
    questionsAttempted: number;
    questionsCorrect: number;
    categoriesStudied: string[];
  }): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const today = new Date().toISOString().split('T')[0];
    const query = `
      INSERT OR REPLACE INTO analytics (id, user_id, date, study_time, 
                                       questions_attempted, questions_correct, categories_studied)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      this.generateId(),
      userId,
      today,
      data.studyTime,
      data.questionsAttempted,
      data.questionsCorrect,
      JSON.stringify(data.categoriesStudied),
    ]);
  }

  private async checkAndUpdateDatabase(): Promise<void> {
    // Check for database version and apply migrations if needed
    // This is where you'd handle database updates between app versions
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = undefined;
    }
  }
} 