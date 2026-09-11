export interface PrescriptionAnalysisResult {
  detectedConditions: string[];
  matchedCategories: string[];
  actionableInsights: string[];
  recommendationSummary: string;
  disclaimer: string;
}

const MEDICAL_DISCLAIMER =
  'Educational Notice: This health analysis is for general informational purposes only. It is not medical advice, diagnosis, or treatment. Always strictly follow the specific dosages and directions provided by your licensed prescribing physician.';

interface ClinicalPattern {
  name: string;
  category: string;
  secondaryCategories: string[];
  keywords: string[];
  insights: string[];
}

const CLINICAL_PATTERNS: ClinicalPattern[] = [
  {
    name: 'Cardiovascular Health & Blood Pressure',
    category: 'Heart Health',
    secondaryCategories: ['Nutrition', 'Fitness'],
    keywords: [
      'amlodipine',
      'telmisartan',
      'atorvastatin',
      'losartan',
      'ramipril',
      'metoprolol',
      'enalapril',
      'clopidogrel',
      'rosuvastatin',
      'hypertension',
      'blood pressure',
      'high bp',
      'bp',
      'cholesterol',
      'cardio',
      'heart',
      'lipid',
      'triglyceride',
      'angina',
    ],
    insights: [
      'Prioritize potassium-rich, low-sodium meals (leafy greens, avocados, berries) to support vascular elasticity.',
      'Engage in 20–30 minutes of low-impact aerobic exercise like brisk walking or cycling to optimize cardiac conditioning.',
      'Maintain adequate hydration and monitor sodium intake from processed foods.',
    ],
  },
  {
    name: 'Glycemic Regulation & Metabolic Health',
    category: 'Nutrition',
    secondaryCategories: ['Preventive Care', 'Fitness'],
    keywords: [
      'metformin',
      'glimepiride',
      'sitagliptin',
      'dapagliflozin',
      'empagliflozin',
      'vildagliptin',
      'insulin',
      'hba1c',
      'diabetes',
      'diabetic',
      'blood sugar',
      'glycemia',
      'fasting glucose',
      'sugar',
      'prediabetes',
    ],
    insights: [
      'Combine carbohydrates with soluble fiber and lean protein at each meal to prevent sudden glucose spikes.',
      'A light 10-minute walk after meals stimulates muscles to absorb circulating glucose independent of insulin.',
      'Focus on whole, unprocessed grains like quinoa, oats, and legumes rather than refined flours.',
    ],
  },
  {
    name: 'Digestive Balance & Acid Management',
    category: 'Gut Health',
    secondaryCategories: ['Nutrition'],
    keywords: [
      'omeprazole',
      'pantoprazole',
      'rabeprazole',
      'esomeprazole',
      'antacid',
      'probiotic',
      'gerd',
      'gastritis',
      'acid reflux',
      'heartburn',
      'bloating',
      'indigestion',
      'ibs',
      'stomach',
      'digestion',
      'ulcer',
    ],
    insights: [
      'Avoid large or heavy meals within 2 to 3 hours of sleep to prevent nighttime gastric acid backflow.',
      'Incorporate polyphenol-rich and fermented foods (kefir, yogurt, fermented veggies) to nourish gut mucosal integrity.',
      'Identify and minimize individual dietary triggers such as excess caffeine, carbonation, or fried foods.',
    ],
  },
  {
    name: 'Thyroid & Endocrine Function',
    category: 'Healthy Aging',
    secondaryCategories: ['Nutrition'],
    keywords: [
      'levothyroxine',
      'thyroxine',
      'eltroxin',
      'thyronorm',
      'tsh',
      't3',
      't4',
      'hypothyroidism',
      'hyperthyroidism',
      'thyroid',
      'goiter',
      'hashimoto',
    ],
    insights: [
      'Support thyroid hormone conversion with adequate dietary selenium and zinc (Brazil nuts, pumpkin seeds, eggs).',
      'Take thyroid medications consistently on an empty stomach with plain water as prescribed by your endocrinologist.',
      'Ensure balanced iodine intake and manage chronic physical stressors.',
    ],
  },
  {
    name: 'Circadian Rhythm & Sleep Quality',
    category: 'Sleep',
    secondaryCategories: ['Mental Health'],
    keywords: [
      'melatonin',
      'zolpidem',
      'eszopiclone',
      'alprazolam',
      'clonazepam',
      'insomnia',
      'sleep apnea',
      'anxiety',
      'stress',
      'sedative',
      'restless',
      'night awakenings',
    ],
    insights: [
      'Maintain a consistent sleep-wake schedule 7 days a week to anchor your circadian rhythm.',
      'Eliminate screen exposure and bright blue light 60 minutes before bed to permit natural melatonin secretion.',
      'Practice diaphragmatic breathwork (4-7-8 method) to activate the calming parasympathetic nervous system.',
    ],
  },
  {
    name: 'Micronutrient & Immune Optimization',
    category: 'Nutrition',
    secondaryCategories: ['Immunity'],
    keywords: [
      'vitamin d',
      'vitamin d3',
      'd3',
      'vitamin b12',
      'b12',
      'cobalamin',
      'folic acid',
      'folate',
      'iron',
      'ferrous',
      'calcium',
      'zinc',
      'magnesium',
      'multivitamin',
      'anemia',
      'deficiency',
      'fatigue',
    ],
    insights: [
      'Pair plant-based iron sources (spinach, lentils) with vitamin C (citrus, tomatoes) to multiply mineral absorption.',
      'Take fat-soluble vitamins (like Vitamin D3) alongside a meal containing healthy fats for peak bioavailability.',
      'Ensure a rainbow of colorful vegetables across the week to cover trace phytonutrient co-factors.',
    ],
  },
  {
    name: 'Joint Mobility & Musculoskeletal Care',
    category: 'Fitness',
    secondaryCategories: ['Healthy Aging'],
    keywords: [
      'ibuprofen',
      'paracetamol',
      'tramadol',
      'naproxen',
      'glucosamine',
      'chondroitin',
      'arthritis',
      'joint pain',
      'back pain',
      'spondylitis',
      'osteo',
      'inflammation',
      'knee pain',
    ],
    insights: [
      'Incorporate low-impact mobility drills and gentle swimming or resistance training to stabilize joints.',
      'Omega-3 fatty acids (flaxseed, chia, walnuts, fish) offer potent nutritional support for joint comfort.',
      'Stay consistently hydrated to keep joint synovial fluid properly cushioned.',
    ],
  },
  {
    name: 'Respiratory & Allergen Defense',
    category: 'Immunity',
    secondaryCategories: ['Preventive Care'],
    keywords: [
      'salbutamol',
      'montelukast',
      'budesonide',
      'asthalin',
      'inhaler',
      'cetirizine',
      'fexofenadine',
      'levocetirizine',
      'asthma',
      'bronchitis',
      'allergy',
      'allergic',
      'sinus',
      'cough',
      'wheezing',
    ],
    insights: [
      'Stay well-hydrated with warm broths and herbal teas to soothe and hydrate mucosal linings.',
      'Practice rhythmic nasal breathing to naturally filter, warm, and humidify inhaled air.',
      'Keep indoor living spaces well-ventilated and minimize exposure to known environmental allergens.',
    ],
  },
];

/**
 * Analyzes prescription notes, text, or doctor diagnosis strings
 * and extracts relevant health categories and tailored wellness insights.
 */
export function analyzePrescriptionText(rawText: string = ''): PrescriptionAnalysisResult {
  const normalized = rawText.toLowerCase();

  const detectedConditions: string[] = [];
  const matchedCategoriesSet = new Set<string>();
  const actionableInsights: string[] = [];

  for (const pattern of CLINICAL_PATTERNS) {
    const isMatch = pattern.keywords.some((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(normalized) || normalized.includes(kw);
    });

    if (isMatch) {
      if (!detectedConditions.includes(pattern.name)) {
        detectedConditions.push(pattern.name);
      }
      matchedCategoriesSet.add(pattern.category);
      pattern.secondaryCategories.forEach((sc) => matchedCategoriesSet.add(sc));

      pattern.insights.forEach((insight) => {
        if (!actionableInsights.includes(insight)) {
          actionableInsights.push(insight);
        }
      });
    }
  }

  // Fallback if no specific medication or condition was matched
  if (detectedConditions.length === 0) {
    detectedConditions.push('General Health Maintenance & Preventive Care');
    matchedCategoriesSet.add('Nutrition');
    matchedCategoriesSet.add('Preventive Care');
    matchedCategoriesSet.add('Fitness');
    actionableInsights.push(
      'Maintain a nutrient-dense diet emphasizing whole foods, fiber, and sufficient hydration.',
      'Target 150 minutes of moderate-intensity physical activity per week as endorsed by global health guidelines.',
      'Prioritize 7–9 hours of restorative sleep each night to support cellular rejuvenation.'
    );
  }

  const matchedCategories = Array.from(matchedCategoriesSet);
  const recommendationSummary = `Identified ${detectedConditions.length} clinical focus area${
    detectedConditions.length === 1 ? '' : 's'
  } (${detectedConditions.slice(0, 2).join(', ')}). HealthGuru has curated targeted guides across ${matchedCategories.join(', ')}.`;

  return {
    detectedConditions,
    matchedCategories,
    actionableInsights: actionableInsights.slice(0, 4),
    recommendationSummary,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}
