import { Question, Category } from '@models/Question';
import { DatabaseService } from '@services/database/DatabaseService';

// NDT Categories
export const categories: Category[] = [
  {
    id: 'cert_standards',
    name: 'Certification Standards',
    description: 'SNT-TC-1A, CP-189, ACCP, ISO 9712, and related standards',
    icon: 'certificate',
    color: '#4CAF50',
    totalQuestions: 300,
    requiredPassPercentage: 70,
  },
  {
    id: 'materials_processes',
    name: 'Materials & Processes',
    description: 'Metallurgy, welding processes, casting, forging, and material defects',
    icon: 'factory',
    color: '#2196F3',
    totalQuestions: 250,
    requiredPassPercentage: 70,
  },
  {
    id: 'ndt_methods',
    name: 'NDT Methods',
    description: 'PT, MT, RT, UT, ET, VT, LT, AE, and other testing methods',
    icon: 'magnify-scan',
    color: '#FF9800',
    totalQuestions: 400,
    requiredPassPercentage: 70,
  },
  {
    id: 'safety_quality',
    name: 'Safety & Quality',
    description: 'Safety procedures, quality control, and regulatory requirements',
    icon: 'shield-check',
    color: '#9C27B0',
    totalQuestions: 150,
    requiredPassPercentage: 70,
  },
];

// Sample questions - In production, this would be much larger (1000+ questions)
export const sampleQuestions: Partial<Question>[] = [
  // Certification Standards Questions
  {
    categoryId: 'cert_standards',
    question: 'According to SNT-TC-1A, who is responsible for the certification of NDT personnel?',
    options: [
      { id: 'a', text: 'The employer' },
      { id: 'b', text: 'ASNT' },
      { id: 'c', text: 'An outside agency' },
      { id: 'd', text: 'The NDT Level III' },
    ],
    correctAnswer: 'a',
    explanation: 'SNT-TC-1A clearly states that the employer is responsible for the certification of NDT personnel. This is a fundamental principle of the recommended practice.',
    difficulty: 'easy',
    references: ['SNT-TC-1A Section 1.4'],
    tags: ['SNT-TC-1A', 'Certification', 'Responsibility'],
  },
  {
    categoryId: 'cert_standards',
    question: 'What is the minimum documented training hours for Level II Ultrasonic Testing per SNT-TC-1A?',
    options: [
      { id: 'a', text: '40 hours' },
      { id: 'b', text: '80 hours' },
      { id: 'c', text: '120 hours' },
      { id: 'd', text: '160 hours' },
    ],
    correctAnswer: 'a',
    explanation: 'SNT-TC-1A recommends a minimum of 40 hours of documented training for Level II UT certification.',
    difficulty: 'medium',
    references: ['SNT-TC-1A Table 6.3.1A'],
    tags: ['SNT-TC-1A', 'Training Hours', 'UT'],
  },
  {
    categoryId: 'cert_standards',
    question: 'Under CP-189, what is the validity period for ACCP Level II certification?',
    options: [
      { id: 'a', text: '3 years' },
      { id: 'b', text: '5 years' },
      { id: 'c', text: '10 years' },
      { id: 'd', text: 'Lifetime' },
    ],
    correctAnswer: 'b',
    explanation: 'CP-189 specifies that ACCP certifications are valid for 5 years from the date of issue.',
    difficulty: 'easy',
    references: ['ANSI/ASNT CP-189 Section 10'],
    tags: ['CP-189', 'ACCP', 'Validity Period'],
  },

  // Materials & Processes Questions
  {
    categoryId: 'materials_processes',
    question: 'What is the carbon content range for medium carbon steel?',
    options: [
      { id: 'a', text: '0.05% - 0.30%' },
      { id: 'b', text: '0.30% - 0.60%' },
      { id: 'c', text: '0.60% - 1.00%' },
      { id: 'd', text: '1.00% - 1.70%' },
    ],
    correctAnswer: 'b',
    explanation: 'Medium carbon steels contain 0.30% to 0.60% carbon. This range provides a balance between strength and ductility.',
    difficulty: 'medium',
    references: ['Materials Science Handbook'],
    tags: ['Materials', 'Carbon Steel', 'Metallurgy'],
  },
  {
    categoryId: 'materials_processes',
    question: 'Which welding defect is characterized by incomplete fusion between the weld metal and base metal?',
    options: [
      { id: 'a', text: 'Porosity' },
      { id: 'b', text: 'Lack of fusion' },
      { id: 'c', text: 'Undercut' },
      { id: 'd', text: 'Slag inclusion' },
    ],
    correctAnswer: 'b',
    explanation: 'Lack of fusion occurs when there is no metallurgical bond between the weld metal and base metal or between successive weld passes.',
    difficulty: 'easy',
    references: ['AWS D1.1', 'Welding Inspection Handbook'],
    tags: ['Welding', 'Defects', 'Lack of Fusion'],
  },

  // NDT Methods Questions
  {
    categoryId: 'ndt_methods',
    question: 'In ultrasonic testing, what is the relationship between frequency and penetration?',
    options: [
      { id: 'a', text: 'Higher frequency = greater penetration' },
      { id: 'b', text: 'Lower frequency = greater penetration' },
      { id: 'c', text: 'Frequency does not affect penetration' },
      { id: 'd', text: 'Penetration is only affected by power' },
    ],
    correctAnswer: 'b',
    explanation: 'Lower frequencies have longer wavelengths and greater penetration ability, while higher frequencies provide better resolution but less penetration.',
    difficulty: 'medium',
    references: ['UT Level III Study Guide', 'ASNT Handbook'],
    tags: ['UT', 'Frequency', 'Penetration'],
  },
  {
    categoryId: 'ndt_methods',
    question: 'What is the primary purpose of a penetrant developer?',
    options: [
      { id: 'a', text: 'To clean the surface' },
      { id: 'b', text: 'To draw penetrant out of discontinuities' },
      { id: 'c', text: 'To protect the penetrant from UV light' },
      { id: 'd', text: 'To increase penetrant viscosity' },
    ],
    correctAnswer: 'b',
    explanation: 'Developer draws penetrant from discontinuities through capillary action and provides a contrasting background for indication visibility.',
    difficulty: 'easy',
    references: ['ASTM E165', 'PT Level III Study Guide'],
    tags: ['PT', 'Developer', 'Capillary Action'],
    formulaLatex: 'h = \\frac{2\\gamma \\cos\\theta}{\\rho g r}',
  },
  {
    categoryId: 'ndt_methods',
    question: 'In radiographic testing, what is the purpose of using lead screens?',
    options: [
      { id: 'a', text: 'To reduce scatter radiation' },
      { id: 'b', text: 'To intensify the image' },
      { id: 'c', text: 'Both A and B' },
      { id: 'd', text: 'To protect the film from light' },
    ],
    correctAnswer: 'c',
    explanation: 'Lead screens serve dual purposes: they filter out scatter radiation and emit electrons when struck by primary radiation, intensifying the image.',
    difficulty: 'medium',
    references: ['ASNT RT Level III Study Guide', 'ASTM E94'],
    tags: ['RT', 'Lead Screens', 'Image Quality'],
  },

  // Safety & Quality Questions
  {
    categoryId: 'safety_quality',
    question: 'What is the maximum permissible dose of radiation for NDT personnel per year according to NRC regulations?',
    options: [
      { id: 'a', text: '1 rem' },
      { id: 'b', text: '5 rem' },
      { id: 'c', text: '10 rem' },
      { id: 'd', text: '50 rem' },
    ],
    correctAnswer: 'b',
    explanation: 'The NRC sets the annual occupational dose limit at 5 rem (50 mSv) for whole body exposure.',
    difficulty: 'medium',
    references: ['10 CFR 20', 'NRC Regulations'],
    tags: ['Safety', 'Radiation', 'Regulations'],
  },
  {
    categoryId: 'safety_quality',
    question: 'Which quality standard specifically addresses the requirements for NDT personnel qualification and certification?',
    options: [
      { id: 'a', text: 'ISO 9001' },
      { id: 'b', text: 'ISO 9712' },
      { id: 'c', text: 'ISO 14001' },
      { id: 'd', text: 'ISO 45001' },
    ],
    correctAnswer: 'b',
    explanation: 'ISO 9712 specifies requirements for qualification and certification of NDT personnel.',
    difficulty: 'easy',
    references: ['ISO 9712:2021'],
    tags: ['ISO', 'Certification', 'Standards'],
  },
];

// Function to seed the database
export async function seedDatabase() {
  const db = DatabaseService.getInstance();
  
  try {
    console.log('Starting database seeding...');
    
    // Initialize database
    await db.initializeDatabase();
    
    // Insert categories
    for (const category of categories) {
      await db.insertCategory(category);
    }
    console.log(`Inserted ${categories.length} categories`);
    
    // Generate IDs for questions and insert
    let questionCount = 0;
    for (const questionData of sampleQuestions) {
      const question: Question = {
        id: `q_${Date.now()}_${questionCount}`,
        categoryId: questionData.categoryId!,
        question: questionData.question!,
        options: questionData.options!.map((opt, idx) => ({
          ...opt,
          id: `opt_${Date.now()}_${questionCount}_${idx}`,
        })),
        correctAnswer: questionData.correctAnswer!,
        explanation: questionData.explanation!,
        difficulty: questionData.difficulty as 'easy' | 'medium' | 'hard',
        references: questionData.references,
        tags: questionData.tags,
        formulaLatex: questionData.formulaLatex,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.insertQuestion(question);
      questionCount++;
    }
    console.log(`Inserted ${questionCount} questions`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 