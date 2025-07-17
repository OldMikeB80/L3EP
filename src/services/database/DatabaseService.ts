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
        reference_texts TEXT,
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

    try {
      const questionsQuery = `
        SELECT * FROM questions 
        WHERE category_id = ?
        ORDER BY difficulty
        ${limit ? 'LIMIT ?' : ''}
      `;

      const params = limit ? [categoryId, limit] : [categoryId];
      const results = await this.database.executeSql(questionsQuery, params);

      const questions: Question[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const row = results[0].rows.item(i);

        // Get options for this question
        const optionsQuery = `SELECT * FROM options WHERE question_id = ? ORDER BY option_order`;
        const optionsResults = await this.database.executeSql(optionsQuery, [row.id]);

        const options = [];
        for (let j = 0; j < optionsResults[0].rows.length; j++) {
          const optionRow = optionsResults[0].rows.item(j);
          options.push({
            id: optionRow.id,
            text: optionRow.text,
            imageUrl: optionRow.image_url,
          });
        }

        questions.push({
          id: row.id,
          categoryId: row.category_id,
          subcategoryId: row.subcategory_id,
          question: row.question,
          correctAnswer: row.correct_answer,
          explanation: row.explanation,
          difficulty: row.difficulty,
          imageUrl: row.image_url,
          formulaLatex: row.formula_latex,
          references: JSON.parse(row.reference_texts || '[]'),
          tags: JSON.parse(row.tags || '[]'),
          options: options,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }

      return questions;
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
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
      const options = row.options_json
        ? row.options_json
            .split(',')
            .map((opt: string) => {
              try {
                return JSON.parse(opt);
              } catch {
                return null;
              }
            })
            .filter(Boolean)
        : [];

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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
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
      user.targetExamDate ? user.targetExamDate : null,
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
      session.startTime,
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
  public async recordDailyAnalytics(
    userId: string,
    data: {
      studyTime: number;
      questionsAttempted: number;
      questionsCorrect: number;
      categoriesStudied: string[];
    },
  ): Promise<void> {
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
    const CURRENT_SCHEMA_VERSION = 1;
    
    if (!this.database) throw new Error('Database not initialized');
    
    // Get current database version
    const [res] = await this.database.executeSql('PRAGMA user_version;');
    const current = res.rows.item(0).user_version as number;
    
    if (current < CURRENT_SCHEMA_VERSION) {
      await this.runMigrations(current);
      await this.database.executeSql(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
    }
  }
  
  private async runMigrations(fromVersion: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    // Add migration logic here as the database evolves
    // Example:
    // if (fromVersion < 1) {
    //   await this.database.executeSql('ALTER TABLE questions ADD COLUMN new_field TEXT;');
    // }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generatePlaceholders(count: number): string {
    return new Array(count).fill('?').join(', ');
  }

  public async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = undefined;
    }
  }

  // Stub methods to fix TypeScript errors - implement these later
  public async getUser(userId: string): Promise<User | null> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const results = await this.database.executeSql('SELECT * FROM users WHERE id = ?', [userId]);

      if (results[0].rows.length === 0) {
        return null;
      }

      const userData = results[0].rows.item(0);
      return {
        ...userData,
        preferences: JSON.parse(userData.preferences || '{}'),
        achievements: JSON.parse(userData.achievements || '[]'),
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  public async getUserProgress(userId: string): Promise<UserProgress[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const results = await this.database.executeSql(
        `SELECT * FROM user_progress WHERE user_id = ?`,
        [userId],
      );

      const progress: UserProgress[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const row = results[0].rows.item(i);
        progress.push({
          userId: row.user_id,
          categoryId: row.category_id,
          totalQuestions: row.total_questions,
          questionsAnswered: row.questions_attempted,
          correctAnswers: row.questions_correct,
          averageScore: row.average_score,
          lastStudyDate: row.last_attempt_date,
          studyStreak: row.study_streak || 0,
          totalStudyTime: row.average_time_per_question || 0,
          weakAreas: JSON.parse(row.weak_areas || '[]'),
          strongAreas: JSON.parse(row.strong_areas || '[]'),
        });
      }

      return progress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  public async updateUserProgress(userId: string, categoryId: string, progress: UserProgress): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.executeSql(
        `INSERT OR REPLACE INTO user_progress (
          id, user_id, category_id, questions_attempted, questions_correct,
          average_score, average_time_per_question, last_attempt_date,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.generateId(),
          userId,
          categoryId,
          progress.questionsAnswered,
          progress.correctAnswers,
          progress.averageScore,
          progress.totalStudyTime,
          progress.lastStudyDate,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  public async getCategories(): Promise<Category[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const results = await this.database.executeSql('SELECT * FROM categories ORDER BY name');

      const categories: Category[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        categories.push(results[0].rows.item(i));
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  public async getAllQuestions(): Promise<Question[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      console.log('DatabaseService: Getting all questions...');

      // First get all questions
      const questionsQuery = `SELECT * FROM questions ORDER BY category_id, difficulty`;
      const results = await this.database.executeSql(questionsQuery);
      console.log('DatabaseService: Questions query executed, rows found:', results[0].rows.length);

      const questions: Question[] = [];

      for (let i = 0; i < results[0].rows.length; i++) {
        const row = results[0].rows.item(i);

        // Get options for this question
        const optionsQuery = `SELECT * FROM options WHERE question_id = ? ORDER BY option_order`;
        const optionsResults = await this.database.executeSql(optionsQuery, [row.id]);

        const options = [];
        for (let j = 0; j < optionsResults[0].rows.length; j++) {
          const optionRow = optionsResults[0].rows.item(j);
          options.push({
            id: optionRow.id,
            text: optionRow.text,
            imageUrl: optionRow.image_url,
          });
        }

        questions.push({
          id: row.id,
          categoryId: row.category_id,
          subcategoryId: row.subcategory_id,
          question: row.question,
          correctAnswer: row.correct_answer,
          explanation: row.explanation,
          difficulty: row.difficulty,
          imageUrl: row.image_url,
          formulaLatex: row.formula_latex,
          references: JSON.parse(row.reference_texts || '[]'),
          tags: JSON.parse(row.tags || '[]'),
          options: options,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }

      console.log('DatabaseService: Returning questions:', questions.length);
      return questions;
    } catch (error) {
      console.error('Error fetching all questions:', error);
      return [];
    }
  }

  public async searchQuestions(query: string): Promise<Question[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const searchPattern = `%${query}%`;
      const results = await this.database.executeSql(
        `SELECT q.*, GROUP_CONCAT(
          json_object(
            'id', o.id,
            'text', o.text,
            'imageUrl', o.image_url
          )
        ) as options_json
        FROM questions q
        LEFT JOIN options o ON q.id = o.question_id
        WHERE q.question LIKE ? OR q.explanation LIKE ? OR q.tags LIKE ?
        GROUP BY q.id
        ORDER BY q.created_at DESC`,
        [searchPattern, searchPattern, searchPattern],
      );

      const questions: Question[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const row = results[0].rows.item(i);
        questions.push({
          ...row,
          categoryId: row.category_id,
          subcategoryId: row.subcategory_id,
          correctAnswer: row.correct_answer,
          imageUrl: row.image_url,
          formulaLatex: row.formula_latex,
          references: JSON.parse(row.reference_texts || '[]'),
          tags: JSON.parse(row.tags || '[]'),
          options: row.options_json ? JSON.parse(`[${row.options_json}]`) : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }

      return questions;
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  public async toggleBookmark(userId: string, questionId: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Check if bookmark exists
      const checkResult = await this.database.executeSql(
        'SELECT id FROM bookmarks WHERE user_id = ? AND question_id = ?',
        [userId, questionId],
      );

      if (checkResult[0].rows.length > 0) {
        // Remove bookmark
        await this.database.executeSql(
          'DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?',
          [userId, questionId],
        );
      } else {
        // Add bookmark
        await this.database.executeSql(
          'INSERT INTO bookmarks (id, user_id, question_id, created_at) VALUES (?, ?, ?, ?)',
          [this.generateId(), userId, questionId, new Date().toISOString()],
        );
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  public async getWeakAreaQuestions(userId: string, limit: number): Promise<Question[]> {
    return [];
  }

  public async getRandomQuestions(limit: number): Promise<Question[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
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
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT ?
      `;

      const results = await this.database.executeSql(query, [limit]);

      const questions: Question[] = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const row = results[0].rows.item(i);
        questions.push({
          ...row,
          categoryId: row.category_id,
          subcategoryId: row.subcategory_id,
          correctAnswer: row.correct_answer,
          imageUrl: row.image_url,
          formulaLatex: row.formula_latex,
          references: JSON.parse(row.reference_texts || '[]'),
          tags: JSON.parse(row.tags || '[]'),
          options: row.options_json ? JSON.parse(`[${row.options_json}]`) : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }

      return questions;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      return [];
    }
  }

  public async updateTestAnswer(sessionId: string, questionId: string, answer: TestQuestion): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.executeSql(
        `INSERT OR REPLACE INTO test_questions (
          id, session_id, question_id, user_answer, is_correct,
          time_spent, is_bookmarked, confidence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.generateId(),
          sessionId,
          questionId,
          answer.userAnswer || null,
          answer.isCorrect ? 1 : 0,
          answer.timeSpent,
          answer.isBookmarked ? 1 : 0,
          answer.confidence || null,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );
    } catch (error) {
      console.error('Error updating test answer:', error);
      throw error;
    }
  }

  public async updateTestSession(sessionId: string, updates: Partial<TestSession>): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.endTime !== undefined) {
        fields.push('end_time = ?');
        values.push(updates.endTime);
      }
      if (updates.duration !== undefined) {
        fields.push('duration = ?');
        values.push(updates.duration);
      }
      if (updates.correctAnswers !== undefined) {
        fields.push('correct_answers = ?');
        values.push(updates.correctAnswers);
      }
      if (updates.score !== undefined) {
        fields.push('score = ?');
        values.push(updates.score);
      }
      if (updates.completed !== undefined) {
        fields.push('completed = ?');
        values.push(updates.completed ? 1 : 0);
      }
      if (updates.timedOut !== undefined) {
        fields.push('timed_out = ?');
        values.push(updates.timedOut ? 1 : 0);
      }

      if (fields.length === 0) return;

      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(sessionId);

      const query = `UPDATE test_sessions SET ${fields.join(', ')} WHERE id = ?`;
      await this.database.executeSql(query, values);
    } catch (error) {
      console.error('Error updating test session:', error);
      throw error;
    }
  }

  public async getWeeklyStats(userId: string): Promise<any> {
    return {};
  }

  public async insertCategory(category: Category): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      console.log('Executing insertCategory SQL for:', category.name);
      const result = await this.database.executeSql(
        `INSERT OR REPLACE INTO categories (
          id, name, description, icon, color, total_questions, required_pass_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          category.id,
          category.name,
          category.description,
          category.icon,
          category.color,
          category.totalQuestions,
          category.requiredPassPercentage,
        ],
      );
      console.log('Insert category result:', result);
    } catch (error) {
      console.error('❌ Error inserting category:', error);
      console.error('Category data:', category);
      throw error;
    }
  }

  public async insertQuestionsBulk(questions: Question[]): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.transaction(async (tx) => {
        for (const question of questions) {
          await tx.executeSql(
            `INSERT OR REPLACE INTO questions (
              id, category_id, subcategory_id, question, correct_answer,
              explanation, difficulty, image_url, formula_latex, 
              reference_texts, tags, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              question.id,
              question.categoryId,
              question.subcategoryId || null,
              question.question,
              question.correctAnswer,
              question.explanation,
              question.difficulty,
              question.imageUrl || null,
              question.formulaLatex || null,
              JSON.stringify(question.references || []),
              JSON.stringify(question.tags || []),
              question.createdAt,
              question.updatedAt,
            ],
          );

          // Insert options
          for (const option of question.options) {
            await tx.executeSql(
              `INSERT OR REPLACE INTO options (
                id, question_id, text, image_url, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                option.id,
                question.id,
                option.text,
                option.imageUrl || null,
                new Date().toISOString(),
                new Date().toISOString(),
              ],
            );
          }
        }
      });
    } catch (error) {
      console.error('Error inserting questions in bulk:', error);
      throw error;
    }
  }

  public async insertQuestion(question: Question): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Insert question
      await this.database.executeSql(
        `INSERT OR REPLACE INTO questions (
          id, category_id, subcategory_id, question, correct_answer,
          explanation, difficulty, image_url, formula_latex, 
          reference_texts, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question.id,
          question.categoryId,
          question.subcategoryId || null,
          question.question,
          question.correctAnswer,
          question.explanation,
          question.difficulty,
          question.imageUrl || null,
          question.formulaLatex || null,
          JSON.stringify(question.references || []),
          JSON.stringify(question.tags || []),
          question.createdAt,
          question.updatedAt,
        ],
      );

      // Insert options
      for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i];
        await this.database.executeSql(
          `INSERT OR REPLACE INTO options (
            id, question_id, text, image_url, option_order
          ) VALUES (?, ?, ?, ?, ?)`,
          [option.id, question.id, option.text, option.imageUrl || null, i],
        );
      }
    } catch (error) {
      console.error('Error inserting question:', error);
      throw error;
    }
  }
}
