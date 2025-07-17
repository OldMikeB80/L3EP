export interface Question {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  formulaLatex?: string;
  reference_texts?: string[];
  tags?: string[];
  isBookmarked?: boolean;
  timesAnswered?: number;
  timesCorrect?: number;
  averageTime?: number;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Option {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories?: Subcategory[];
  totalQuestions: number;
  requiredPassPercentage: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

export interface QuestionBank {
  version: string;
  lastUpdated: Date;
  categories: Category[];
  questions: Question[];
}
