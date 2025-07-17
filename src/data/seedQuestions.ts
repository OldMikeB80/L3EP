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
    explanation:
      'SNT-TC-1A clearly states that the employer is responsible for the certification of NDT personnel. This is a fundamental principle of the recommended practice.',
    difficulty: 'easy',
    references: ['SNT-TC-1A Section 1.4'],
    tags: ['SNT-TC-1A', 'Certification', 'Responsibility'],
  },
  {
    categoryId: 'cert_standards',
    question:
      'What is the minimum documented training hours for Level II Ultrasonic Testing per SNT-TC-1A?',
    options: [
      { id: 'a', text: '40 hours' },
      { id: 'b', text: '80 hours' },
      { id: 'c', text: '120 hours' },
      { id: 'd', text: '160 hours' },
    ],
    correctAnswer: 'a',
    explanation:
      'SNT-TC-1A recommends a minimum of 40 hours of documented training for Level II UT certification.',
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
    explanation:
      'CP-189 specifies that ACCP certifications are valid for 5 years from the date of issue.',
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
    explanation:
      'Medium carbon steels contain 0.30% to 0.60% carbon. This range provides a balance between strength and ductility.',
    difficulty: 'medium',
    references: ['Materials Science Handbook'],
    tags: ['Materials', 'Carbon Steel', 'Metallurgy'],
  },
  {
    categoryId: 'materials_processes',
    question:
      'Which welding defect is characterized by incomplete fusion between the weld metal and base metal?',
    options: [
      { id: 'a', text: 'Porosity' },
      { id: 'b', text: 'Lack of fusion' },
      { id: 'c', text: 'Undercut' },
      { id: 'd', text: 'Slag inclusion' },
    ],
    correctAnswer: 'b',
    explanation:
      'Lack of fusion occurs when there is no metallurgical bond between the weld metal and base metal or between successive weld passes.',
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
    explanation:
      'Lower frequencies have longer wavelengths and greater penetration ability, while higher frequencies provide better resolution but less penetration.',
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
    explanation:
      'Developer draws penetrant from discontinuities through capillary action and provides a contrasting background for indication visibility.',
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
    explanation:
      'Lead screens serve dual purposes: they filter out scatter radiation and emit electrons when struck by primary radiation, intensifying the image.',
    difficulty: 'medium',
    references: ['ASNT RT Level III Study Guide', 'ASTM E94'],
    tags: ['RT', 'Lead Screens', 'Image Quality'],
  },

  // Safety & Quality Questions
  {
    categoryId: 'safety_quality',
    question:
      'What is the maximum permissible dose of radiation for NDT personnel per year according to NRC regulations?',
    options: [
      { id: 'a', text: '1 rem' },
      { id: 'b', text: '5 rem' },
      { id: 'c', text: '10 rem' },
      { id: 'd', text: '50 rem' },
    ],
    correctAnswer: 'b',
    explanation:
      'The NRC sets the annual occupational dose limit at 5 rem (50 mSv) for whole body exposure.',
    difficulty: 'medium',
    references: ['10 CFR 20', 'NRC Regulations'],
    tags: ['Safety', 'Radiation', 'Regulations'],
  },
  {
    categoryId: 'safety_quality',
    question:
      'Which quality standard specifically addresses the requirements for NDT personnel qualification and certification?',
    options: [
      { id: 'a', text: 'ISO 9001' },
      { id: 'b', text: 'ISO 9712' },
      { id: 'c', text: 'ISO 14001' },
      { id: 'd', text: 'ISO 45001' },
    ],
    correctAnswer: 'b',
    explanation:
      'ISO 9712 specifies requirements for qualification and certification of NDT personnel.',
    difficulty: 'easy',
    references: ['ISO 9712:2021'],
    tags: ['ISO', 'Certification', 'Standards'],
  },

  // Additional NDT Methods Questions
  {
    categoryId: 'ndt_methods',
    question: 'In ultrasonic testing, what is the dead zone?',
    options: [
      { id: 'a', text: 'The area behind the test piece' },
      {
        id: 'b',
        text: 'The region immediately beneath the probe where defects cannot be detected',
      },
      { id: 'c', text: 'The area outside the sound beam' },
      { id: 'd', text: 'The region of maximum attenuation' },
    ],
    correctAnswer: 'b',
    explanation:
      'The dead zone is the region immediately beneath the probe face where defects cannot be detected due to the transmission pulse and near-field effects.',
    difficulty: 'medium',
    references: ['ASNT UT Level III Study Guide'],
    tags: ['UT', 'Dead Zone', 'Limitations'],
  },
  {
    categoryId: 'ndt_methods',
    question:
      'Which eddy current testing frequency would provide the best penetration in aluminum?',
    options: [
      { id: 'a', text: '100 Hz' },
      { id: 'b', text: '1 kHz' },
      { id: 'c', text: '100 kHz' },
      { id: 'd', text: '1 MHz' },
    ],
    correctAnswer: 'b',
    explanation:
      'Lower frequencies provide better penetration in conductive materials. 1 kHz offers good penetration in aluminum while maintaining reasonable sensitivity.',
    difficulty: 'hard',
    references: ['ASNT ET Level III Study Guide'],
    tags: ['ET', 'Frequency', 'Penetration'],
    formulaLatex: '\\delta = \\sqrt{\\frac{2}{\\omega\\mu\\sigma}}',
  },
  {
    categoryId: 'ndt_methods',
    question:
      'What is the primary advantage of phased array ultrasonic testing over conventional UT?',
    options: [
      { id: 'a', text: 'Lower equipment cost' },
      { id: 'b', text: 'Electronic beam steering and focusing' },
      { id: 'c', text: 'No couplant required' },
      { id: 'd', text: 'Works on all materials' },
    ],
    correctAnswer: 'b',
    explanation:
      'Phased array UT allows electronic beam steering and focusing without moving the probe, enabling rapid inspection of complex geometries.',
    difficulty: 'medium',
    references: ['ASNT PAUT Study Guide', 'ISO 13588'],
    tags: ['PAUT', 'Advanced UT', 'Beam Steering'],
  },

  // Additional Materials & Processes Questions
  {
    categoryId: 'materials_processes',
    question: 'Which welding defect is most likely to occur in the heat-affected zone?',
    options: [
      { id: 'a', text: 'Porosity' },
      { id: 'b', text: 'Hydrogen cracking' },
      { id: 'c', text: 'Slag inclusion' },
      { id: 'd', text: 'Arc strike' },
    ],
    correctAnswer: 'b',
    explanation:
      'Hydrogen cracking (cold cracking) typically occurs in the HAZ due to hydrogen embrittlement, residual stress, and susceptible microstructure.',
    difficulty: 'medium',
    references: ['AWS D1.1', 'Welding Metallurgy'],
    tags: ['Welding', 'HAZ', 'Defects'],
  },
  {
    categoryId: 'materials_processes',
    question: 'What is the carbon equivalent (CE) formula used to assess weldability?',
    options: [
      { id: 'a', text: 'CE = C + Mn/6' },
      { id: 'b', text: 'CE = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15' },
      { id: 'c', text: 'CE = C × Mn' },
      { id: 'd', text: 'CE = C + Si/24' },
    ],
    correctAnswer: 'b',
    explanation:
      'The IIW carbon equivalent formula considers the effect of various alloying elements on hardenability and weldability.',
    difficulty: 'hard',
    references: ['IIW Guidelines', 'AWS D1.1'],
    tags: ['Welding', 'Carbon Equivalent', 'Weldability'],
    formulaLatex: 'CE = C + \\frac{Mn}{6} + \\frac{Cr+Mo+V}{5} + \\frac{Ni+Cu}{15}',
  },
  {
    categoryId: 'materials_processes',
    question:
      'Which heat treatment process is used to relieve residual stresses without significantly affecting hardness?',
    options: [
      { id: 'a', text: 'Normalizing' },
      { id: 'b', text: 'Quenching' },
      { id: 'c', text: 'Stress relieving' },
      { id: 'd', text: 'Solution annealing' },
    ],
    correctAnswer: 'c',
    explanation:
      'Stress relieving involves heating below the transformation temperature to relieve residual stresses without significantly changing mechanical properties.',
    difficulty: 'easy',
    references: ['ASM Handbook Vol. 4', 'Heat Treatment Guide'],
    tags: ['Heat Treatment', 'Stress Relief', 'Post-weld'],
  },

  // Additional Certification Standards Questions
  {
    categoryId: 'cert_standards',
    question:
      'According to ASNT SNT-TC-1A, what is the minimum near vision acuity requirement for NDT personnel?',
    options: [
      { id: 'a', text: 'Jaeger J1 at 12 inches' },
      { id: 'b', text: 'Jaeger J2 at 12 inches' },
      { id: 'c', text: 'Jaeger J1 at 18 inches' },
      { id: 'd', text: '20/20 vision' },
    ],
    correctAnswer: 'b',
    explanation:
      'SNT-TC-1A requires near vision acuity of Jaeger J2 at not less than 12 inches for NDT personnel.',
    difficulty: 'easy',
    references: ['ASNT SNT-TC-1A', 'CP-189'],
    tags: ['Vision', 'Personnel Requirements', 'Certification'],
  },
  {
    categoryId: 'cert_standards',
    question: 'What is the primary difference between ASNT CP-189 and SNT-TC-1A?',
    options: [
      { id: 'a', text: 'CP-189 is a recommended practice, SNT-TC-1A is mandatory' },
      { id: 'b', text: 'CP-189 is a standard, SNT-TC-1A is a recommended practice' },
      { id: 'c', text: 'They cover different NDT methods' },
      { id: 'd', text: 'CP-189 is for aerospace only' },
    ],
    correctAnswer: 'b',
    explanation:
      'CP-189 is an ANSI/ASNT standard with mandatory requirements, while SNT-TC-1A is a recommended practice providing guidelines.',
    difficulty: 'medium',
    references: ['ASNT CP-189', 'ASNT SNT-TC-1A'],
    tags: ['Standards', 'Certification', 'ASNT'],
  },

  // Additional Safety & Quality Questions
  {
    categoryId: 'safety_quality',
    question: 'What is the ALARA principle in radiation safety?',
    options: [
      { id: 'a', text: 'Always Lower Allowable Radiation Amounts' },
      { id: 'b', text: 'As Low As Reasonably Achievable' },
      { id: 'c', text: 'Authorized Limits And Radiation Assessment' },
      { id: 'd', text: 'All Licensed Activities Require Authorization' },
    ],
    correctAnswer: 'b',
    explanation:
      'ALARA (As Low As Reasonably Achievable) is the principle of minimizing radiation exposure by considering economic and social factors.',
    difficulty: 'easy',
    references: ['10 CFR 20', 'Radiation Safety Guide'],
    tags: ['Radiation Safety', 'ALARA', 'Best Practices'],
  },
  {
    categoryId: 'safety_quality',
    question: 'In a quality management system, what does CAPA stand for?',
    options: [
      { id: 'a', text: 'Certified Approval Process Assessment' },
      { id: 'b', text: 'Corrective And Preventive Action' },
      { id: 'c', text: 'Critical Application Performance Analysis' },
      { id: 'd', text: 'Compliance And Process Audit' },
    ],
    correctAnswer: 'b',
    explanation:
      'CAPA (Corrective And Preventive Action) is a systematic approach to eliminate causes of non-conformities and prevent recurrence.',
    difficulty: 'medium',
    references: ['ISO 9001:2015', 'Quality Management Systems'],
    tags: ['Quality', 'CAPA', 'ISO 9001'],
  },
  {
    categoryId: 'safety_quality',
    question: 'What is the primary purpose of a root cause analysis?',
    options: [
      { id: 'a', text: 'To assign blame for failures' },
      { id: 'b', text: 'To identify the fundamental cause of a problem' },
      { id: 'c', text: 'To document inspection results' },
      { id: 'd', text: 'To calculate failure probability' },
    ],
    correctAnswer: 'b',
    explanation:
      'Root cause analysis aims to identify the fundamental cause of a problem to implement effective corrective actions and prevent recurrence.',
    difficulty: 'easy',
    references: ['Quality Tools', 'Problem Solving Methods'],
    tags: ['Quality', 'Root Cause Analysis', 'Problem Solving'],
  },

  // Advanced NDT Methods Questions
  {
    categoryId: 'ndt_methods',
    question: 'In acoustic emission testing, what is the Kaiser effect?',
    options: [
      { id: 'a', text: 'Increased emission at higher frequencies' },
      { id: 'b', text: 'Absence of emissions until previous maximum stress is exceeded' },
      { id: 'c', text: 'Emission saturation at high stress levels' },
      { id: 'd', text: 'Background noise interference' },
    ],
    correctAnswer: 'b',
    explanation:
      'The Kaiser effect is the absence of detectable acoustic emissions until the previous maximum applied stress level is exceeded.',
    difficulty: 'hard',
    references: ['ASNT AE Level III Study Guide', 'ASTM E1316'],
    tags: ['AE', 'Kaiser Effect', 'Stress History'],
  },
  {
    categoryId: 'ndt_methods',
    question: 'Which magnetic particle testing technique provides the highest sensitivity?',
    options: [
      { id: 'a', text: 'Dry powder with AC yoke' },
      { id: 'b', text: 'Wet fluorescent with DC current' },
      { id: 'c', text: 'Dry powder with permanent magnet' },
      { id: 'd', text: 'Wet visible with AC current' },
    ],
    correctAnswer: 'b',
    explanation:
      'Wet fluorescent particles with DC magnetization provide the highest sensitivity due to particle mobility and fluorescent contrast.',
    difficulty: 'medium',
    references: ['ASNT MT Level III Study Guide', 'ASTM E1444'],
    tags: ['MT', 'Sensitivity', 'Techniques'],
  },
  {
    categoryId: 'ndt_methods',
    question: 'What is the lift-off effect in eddy current testing?',
    options: [
      { id: 'a', text: 'Probe heating during inspection' },
      { id: 'b', text: 'Signal change due to probe-to-surface distance variation' },
      { id: 'c', text: 'Coil impedance at zero frequency' },
      { id: 'd', text: 'Magnetic saturation of the test piece' },
    ],
    correctAnswer: 'b',
    explanation:
      'Lift-off effect is the change in coil impedance caused by variations in the distance between the probe and test surface.',
    difficulty: 'medium',
    references: ['ASNT ET Level III Study Guide'],
    tags: ['ET', 'Lift-off', 'Probe Effects'],
  },

  // Complex Materials Questions
  {
    categoryId: 'materials_processes',
    question:
      'What is the primary mechanism of stress corrosion cracking in austenitic stainless steels?',
    options: [
      { id: 'a', text: 'Hydrogen embrittlement' },
      { id: 'b', text: 'Chloride-induced transgranular cracking' },
      { id: 'c', text: 'Galvanic corrosion' },
      { id: 'd', text: 'Erosion corrosion' },
    ],
    correctAnswer: 'b',
    explanation:
      'Austenitic stainless steels are susceptible to chloride-induced stress corrosion cracking, typically occurring as transgranular cracking.',
    difficulty: 'hard',
    references: ['ASM Handbook Vol. 13', 'NACE Standards'],
    tags: ['SCC', 'Stainless Steel', 'Corrosion'],
  },
  {
    categoryId: 'materials_processes',
    question: 'In titanium welding, what is the purpose of trailing shields?',
    options: [
      { id: 'a', text: 'To preheat the material' },
      { id: 'b', text: 'To protect the cooling weld from atmospheric contamination' },
      { id: 'c', text: 'To increase welding speed' },
      { id: 'd', text: 'To reduce distortion' },
    ],
    correctAnswer: 'b',
    explanation:
      'Trailing shields provide inert gas coverage to protect the hot weld and HAZ from atmospheric contamination during cooling.',
    difficulty: 'medium',
    references: ['AWS G2.4', 'Titanium Welding Guide'],
    tags: ['Titanium', 'Welding', 'Shielding'],
  },
  {
    categoryId: 'materials_processes',
    question: 'What is the critical temperature for 304 stainless steel sensitization?',
    options: [
      { id: 'a', text: '200-400°F (93-204°C)' },
      { id: 'b', text: '800-1500°F (427-816°C)' },
      { id: 'c', text: '1500-1800°F (816-982°C)' },
      { id: 'd', text: '2000-2200°F (1093-1204°C)' },
    ],
    correctAnswer: 'b',
    explanation:
      'Sensitization in 304 SS occurs when exposed to 800-1500°F, causing chromium carbide precipitation at grain boundaries.',
    difficulty: 'hard',
    references: ['ASM Handbook', 'Stainless Steel Properties'],
    tags: ['Sensitization', '304 SS', 'Heat Treatment'],
  },

  // Advanced Certification Questions
  {
    categoryId: 'cert_standards',
    question:
      'Under NAS-410, what is the maximum period of significant interruption before requalification is required?',
    options: [
      { id: 'a', text: '6 months' },
      { id: 'b', text: '12 months' },
      { id: 'c', text: '18 months' },
      { id: 'd', text: '24 months' },
    ],
    correctAnswer: 'b',
    explanation:
      'NAS-410 requires requalification if an individual has not performed NDT in the method for 12 continuous months.',
    difficulty: 'medium',
    references: ['NAS-410 Rev. 4', 'Aerospace NDT Standards'],
    tags: ['NAS-410', 'Requalification', 'Aerospace'],
  },
  {
    categoryId: 'cert_standards',
    question: 'Which document defines the requirements for NDT in the nuclear industry?',
    options: [
      { id: 'a', text: 'ASME Section V' },
      { id: 'b', text: 'API 650' },
      { id: 'c', text: 'AWS D1.1' },
      { id: 'd', text: 'AMS 2644' },
    ],
    correctAnswer: 'a',
    explanation:
      'ASME Boiler and Pressure Vessel Code Section V provides NDT methods and requirements for nuclear applications.',
    difficulty: 'easy',
    references: ['ASME BPVC Section V', 'Nuclear Codes'],
    tags: ['ASME', 'Nuclear', 'Code Requirements'],
  },

  // Practical Application Questions
  {
    categoryId: 'safety_quality',
    question: 'When performing RT in a confined space, what is the primary safety concern?',
    options: [
      { id: 'a', text: 'Equipment damage' },
      { id: 'b', text: 'Film fogging' },
      { id: 'c', text: 'Radiation exposure and oxygen deficiency' },
      { id: 'd', text: 'Temperature variations' },
    ],
    correctAnswer: 'c',
    explanation:
      'Confined spaces present dual hazards: radiation exposure with limited escape routes and potential oxygen deficiency.',
    difficulty: 'medium',
    references: ['OSHA Confined Space Standards', 'Radiation Safety Manual'],
    tags: ['Confined Space', 'RT Safety', 'Hazards'],
  },
  {
    categoryId: 'ndt_methods',
    question: 'For TOFD inspection of a 2-inch thick weld, what is the typical probe separation?',
    options: [
      { id: 'a', text: '0.5 - 1 inch' },
      { id: 'b', text: '2 - 3 inches' },
      { id: 'c', text: '4 - 6 inches' },
      { id: 'd', text: '8 - 10 inches' },
    ],
    correctAnswer: 'b',
    explanation:
      'TOFD probe separation is typically 1.5 to 2 times the wall thickness for optimal coverage of the weld volume.',
    difficulty: 'hard',
    references: ['ASME Code Case 2235', 'TOFD Handbook'],
    tags: ['TOFD', 'Probe Setup', 'Weld Inspection'],
    formulaLatex: 'PCS = 2 \\times t \\times \\tan(\\theta)',
  },
];

// Function to seed the database
export async function seedDatabase() {
  const db = DatabaseService.getInstance();

  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database
    await db.initializeDatabase();

    // Insert categories
    console.log('🌱 Inserting categories...');
    for (const category of categories) {
      console.log(`🌱 Inserting category: ${category.name}`);
      await db.insertCategory(category);
    }
    console.log(`✅ Inserted ${categories.length} categories`);

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.insertQuestion(question);
      questionCount++;

      // Verify the question was inserted
      const verify = await db.getQuestionsByCategory(question.categoryId);
      console.log(
        `After inserting question ${questionCount}, category ${question.categoryId} has ${verify.length} questions`,
      );
    }
    console.log(`✅ Inserted ${questionCount} questions total`);

    // Final verification
    const finalCategories = await db.getCategories();
    const finalQuestions = await db.getAllQuestions();
    console.log('🎉 Database seeding complete!');
    console.log(
      `📊 Final counts - Categories: ${finalCategories.length}, Questions: ${finalQuestions.length}`,
    );

    return { categories: finalCategories.length, questions: finalQuestions.length };
  } catch (error) {
    console.error('❌ Seeding error:', error);
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
