export interface ClassificationResult {
  primaryCategory: string;
  subcategory?: string;
  matchedCategories: string[];
  tags: string[];
  relevanceScore: number;
}

export const TAXONOMY_RULES: Record<
  string,
  { keywords: string[]; weight: number; subcategories?: Record<string, string[]> }
> = {
  'Heart Health': {
    weight: 2.0,
    keywords: [
      'heart', 'heart attack', 'cardiovascular', 'cholesterol', 'blood pressure', 'hypertension',
      'arteries', 'atherosclerosis', 'arrhythmia', 'stroke', 'cardiac', 'ldl', 'hdl',
      'heartdisease', 'heartattack', 'pulse', 'circulation', 'vascular', 'மாரடைப்பு', 'இதயம்', 'ரத்த அழுத்தம்'
    ],
    subcategories: {
      'Hypertension': ['blood pressure', 'hypertension', 'systolic'],
      'Lipids': ['cholesterol', 'ldl', 'hdl', 'triglycerides'],
      'Cardiovascular': ['heart attack', 'cardiac', 'stroke', 'heart disease']
    }
  },
  'Diabetes': {
    weight: 2.0,
    keywords: [
      'diabetes', 'blood sugar', 'sugar intake', 'sugar', 'glucose', 'insulin', 'a1c', 'glycemic',
      'prediabetes', 'type 2 diabetes', 'hypoglycemia', 'sweet', 'controls blood sugar',
      'excess sugar', 'sugar-free', 'sugar control', 'sugarfree', 'சர்க்கரை', 'நீரிழிவு'
    ],
    subcategories: {
      'Type 2 Diabetes': ['type 2 diabetes', 'insulin resistance', 'a1c'],
      'Blood Sugar Management': ['blood sugar', 'sugar intake', 'glucose', 'sugar control']
    }
  },
  'Weight Management': {
    weight: 2.0,
    keywords: [
      'weight gain', 'weight loss', 'healthy weight', 'weightlosstips', 'weightgain',
      'weightgaining', 'calorie deficit', 'body weight', 'obesity', 'bmi', 'visceral fat',
      'body composition', 'satiety', 'weight management', 'gain weight', 'slimming',
      'calorie', 'calories', 'excess calorie', 'எடை', 'உடல் எடை', 'எடை கூடணுமா', 'எடை குறைய'
    ],
    subcategories: {
      'Weight Loss': ['weight loss', 'weightlosstips', 'calorie deficit', 'slimming'],
      'Weight Gain': ['weight gain', 'weightgain', 'gain weight', 'எடை கூடணுமா']
    }
  },
  'Healthy Aging': {
    weight: 1.8,
    keywords: [
      'skin', 'skincare', 'face glow', 'glow', 'wrinkles', 'face wrinkles', 'anti-aging', 'aging',
      'youth', 'longevity', 'cellular aging', 'telomeres', 'lifespan', 'healthspan',
      'complexion', 'facewrinkles', 'faceglow', 'beautiful skin', 'face problems', 'face massage',
      'facial', 'சருமம்', 'அழகு', 'சுருக்கம்', 'முக சுருக்கம்', 'முகப்பொலிவு'
    ],
    subcategories: {
      'Skincare & Aesthetics': ['skin', 'skincare', 'face glow', 'wrinkles', 'complexion', 'சருமம்'],
      'Longevity': ['longevity', 'lifespan', 'healthspan', 'anti-aging']
    }
  },
  'Immunity': {
    weight: 1.7,
    keywords: [
      'immunity', 'immune', 'immune system', 'antibodies', 'vaccine', 'infections', 'white blood cells',
      'seasonal flu', 'flu', 'resilience', 'immunology', 'lymphatic', 'cold', 'seasonal bugs',
      'germs', 'virus', 'fever', 'cough', 'shield', 'cold prevention', 'wash hands', 'bugs',
      'seasonal', 'defense', 'vitamin c', 'cold hacks', 'shield yourself', 'நோய் எதிர்ப்பு', 'நோய் எதிர்ப்பு சக்தி'
    ],
    subcategories: {
      'Infection Defense': ['cold', 'flu', 'seasonal bugs', 'germs', 'virus'],
      'Immune Boosting': ['vitamin c', 'antibodies', 'immune system', 'defense']
    }
  },
  'Sleep': {
    weight: 1.6,
    keywords: [
      'sleep', 'insomnia', 'circadian', 'melatonin', 'rem sleep', 'deep sleep',
      'sleep apnea', 'bedtime', 'sleep hygiene', 'narcolepsy', 'rest', 'snoring',
      'tired', 'slump', 'slumps', 'nap', 'fatigue', 'evening slump', 'sleepy', 'rest & sleep',
      'quality sleep', 'enough sleep', 'power down', 'restful sleep', 'தூக்கம்', 'ஓய்வு'
    ],
    subcategories: {
      'Sleep Quality': ['sleep hygiene', 'bedtime', 'restful', 'deep sleep', 'quality sleep'],
      'Sleep Disorders': ['insomnia', 'sleep apnea', 'snoring', 'fatigue']
    }
  },
  'Mental Health': {
    weight: 1.5,
    keywords: [
      'mental health', 'anxiety', 'depression', 'stress', 'mindfulness', 'meditation',
      'psychology', 'cortisol', 'therapy', 'cognitive', 'burnout', 'emotional',
      'psychiatry', 'neuroscience', 'resilience', 'mood', 'panic', 'wellbeing',
      'headache', 'headaches', 'tension', 'relax', 'relaxation', 'calm', 'breathing',
      'nervous system', 'mind', 'peace', 'happiness', 'zen', 'deep breathing',
      'soothe', 'unwind mentally', 'festive spirit', 'divine energy', 'krishna', 'onam',
      'janmashtami', 'மன அழுத்தம்', 'தியானம்', 'தலைவலி', 'மன அமைதி'
    ],
    subcategories: {
      'Stress Reduction': ['stress', 'cortisol', 'burnout', 'relaxation', 'calm', 'headache'],
      'Mindfulness': ['mindfulness', 'meditation', 'breathwork', 'zen', 'deep breathing'],
      'Emotional Wellness': ['mood', 'resilience', 'therapy', 'depression', 'anxiety', 'happiness']
    }
  },
  'Fitness': {
    weight: 1.5,
    keywords: [
      'exercise', 'workout', 'fitness', 'strength training', 'hypertrophy', 'cardio',
      'aerobic', 'endurance', 'muscles', 'stretching', 'mobility', 'hiit', 'squat',
      'calisthenics', 'running', 'cycling', 'pilates', 'yoga', 'athletic', 'reps',
      'physical activity', 'walking', 'walk', 'active', 'staying active', 'physically active',
      'stamina', 'move', 'movement', 'sports', 'gym', 'run', 'உடற்பயிற்சி', 'நடைபயிற்சி'
    ],
    subcategories: {
      'Strength': ['strength training', 'resistance', 'hypertrophy', 'weights'],
      'Cardio': ['cardio', 'running', 'cycling', 'aerobic', 'hiit', 'walking'],
      'Mobility': ['stretching', 'mobility', 'flexibility', 'yoga']
    }
  },
  'Preventive Care': {
    weight: 1.4,
    keywords: [
      'preventive', 'screening', 'checkup', 'early detection', 'vaccination',
      'longevity', 'routine tests', 'biomarkers', 'public health', 'guidelines',
      'hacks', 'daily hacks', 'tips', 'kidney', 'kidneys', 'stone', 'stones',
      'stone-free', 'dental', 'dental health', 'teeth', 'cavities', 'cavity', 'natural remedy',
      'home remedy', 'cure', 'protection', 'prevention', 'prevent', 'everyday choices',
      'eye health', 'eyepower', 'eyes', 'maintain eye health', 'posture',
      'சிறுநீரகம்', 'பல்', 'பாதுகாப்பு', 'இயற்கை வைத்தியம்', 'மருத்துவ குணங்கள்', 'கண்கள்', 'பார்வை'
    ],
    subcategories: {
      'Kidney & Organ Health': ['kidney', 'kidneys', 'stone-free', 'stone'],
      'Sensory & Dental': ['eye health', 'eyepower', 'eyes', 'dental', 'teeth'],
      'Natural Remedies': ['natural remedy', 'home remedy', 'இயற்கை வைத்தியம்']
    }
  },
  'Gut Health': {
    weight: 1.4,
    keywords: [
      'gut', 'microbiome', 'probiotics', 'prebiotics', 'digestion', 'ibs', 'flora',
      'bloating', 'gut-brain', 'colon', 'fermented', 'digestive enzymes', 'stomach',
      'constipation', 'acid', 'gas', 'bowel', 'fiber', 'digestive', 'smooth digestion',
      'nutrient absorption', 'papaya', 'செரிமானம்', 'வயிறு'
    ],
    subcategories: {
      'Digestion': ['digestion', 'digestive', 'smooth digestion', 'stomach', 'bloating'],
      'Microbiome': ['microbiome', 'probiotics', 'prebiotics', 'gut-brain']
    }
  },
  'Diseases & Conditions': {
    weight: 1.4,
    keywords: [
      'symptoms', 'diagnosis', 'treatment', 'chronic illness', 'autoimmune', 'arthritis',
      'asthma', 'cancer', 'oncology', 'syndrome', 'pain management', 'disorder',
      'nerve pain', 'headache', 'kidney stone', 'disease', 'condition', 'conditions',
      'nerve weakness', 'nerve block', 'நரம்பு', 'வலி', 'நோய்', 'நரம்பு வலி'
    ],
    subcategories: {
      'Neurological': ['nerve pain', 'nerve weakness', 'headache'],
      'Chronic Conditions': ['chronic illness', 'autoimmune', 'syndrome']
    }
  },
  'Nutrition': {
    weight: 1.0,
    keywords: [
      'diet', 'nutrition', 'nutritious', 'protein', 'carbohydrates', 'carbs', 'fat', 'vitamins', 'minerals',
      'superfoods', 'calories', 'antioxidants', 'omega-3', 'mediterranean diet',
      'keto', 'plant-based', 'vegan', 'micronutrients', 'fiber', 'amino acids',
      'fruit', 'fruits', 'apple', 'banana', 'orange', 'watermelon', 'snack', 'snacks',
      'eating', 'food', 'foods', 'meal', 'meals', 'ginger', 'beverage', 'drink', 'water',
      'hydration', 'hydrate', 'nuts', 'seeds', 'corn', 'vegetable', 'vegetables', 'healthy eating',
      'portion control', 'balanced diet', 'healthy snacks', 'உணவு', 'பழங்கள்', 'சாப்பாடு', 'ஊட்டச்சத்து'
    ],
    subcategories: {
      'Plant-Based': ['vegan', 'plant-based', 'vegetarian'],
      'Micronutrients': ['vitamins', 'minerals', 'vitamin d', 'zinc', 'magnesium', 'iron'],
      'Healthy Eating': ['meal prep', 'recipes', 'portion control', 'superfoods', 'snack', 'fruits', 'healthy snacks']
    }
  },
  'Women\'s Health': {
    weight: 1.3,
    keywords: [
      'women', 'pregnancy', 'maternal', 'menopause', 'estrogen', 'pcos',
      'endometriosis', 'ovarian', 'breast health', 'postpartum'
    ]
  },
  'Men\'s Health': {
    weight: 1.3,
    keywords: [
      'men\'s health', 'testosterone', 'prostate', 'male vitality', 'andropause',
      'mens wellness', 'erectile'
    ]
  },
  'Medical Research': {
    weight: 1.2,
    keywords: [
      'study', 'clinical trial', 'researchers', 'breakthrough', 'fda', 'investigators',
      'published in', 'laboratory', 'pathology', 'clinical study', 'scientific'
    ]
  },
  'Wellness': {
    weight: 0.1, // Fallback weight
    keywords: [
      'wellness', 'lifestyle', 'habits', 'balance', 'holistic',
      'self-care', 'vitality', 'energy', 'rejuvenation'
    ]
  }
};

/**
 * Classifies an incoming text payload into health taxonomy
 */
export function classifyContent(
  title: string,
  description?: string,
  existingTags: string[] = [],
  fallbackCategory = 'Wellness'
): ClassificationResult {
  const cleanTitle = title.toLowerCase().replace(/#/g, ' ');
  // First 600 characters of description represent the primary caption/summary
  const cleanDesc = (description || '').substring(0, 600).toLowerCase().replace(/#/g, ' ');
  // Full text for comprehensive tag and category discovery
  const fullText = `${title} ${description || ''} ${existingTags.join(' ')}`.toLowerCase().replace(/#/g, ' ');

  let bestCategory = fallbackCategory;
  let highestScore = 0;
  let identifiedSubcategory: string | undefined;
  const matchedCategoriesSet = new Set<string>();
  const discoveredTags = new Set<string>(existingTags.map(t => t.toLowerCase()));

  for (const [category, rule] of Object.entries(TAXONOMY_RULES)) {
    let titleMatches = 0;
    let descMatches = 0;
    let fullMatches = 0;

    for (const kw of rule.keywords) {
      const kwLower = kw.toLowerCase();
      if (cleanTitle.includes(kwLower)) {
        titleMatches++;
        discoveredTags.add(kwLower);
      }
      if (cleanDesc.includes(kwLower)) {
        descMatches++;
        discoveredTags.add(kwLower);
      }
      if (fullText.includes(kwLower)) {
        fullMatches++;
        discoveredTags.add(kwLower);
      }
    }

    // If keywords match anywhere in the content, include category in matchedCategories
    if (titleMatches > 0 || descMatches > 0 || fullMatches > 0) {
      if (category !== 'Wellness' || fullMatches > 1) {
        matchedCategoriesSet.add(category);
      }
    }

    // Scoring: Title matches are weighted 5x heavier than description matches
    const categoryScore = (titleMatches * 5 + descMatches * 1) * rule.weight;
    if (categoryScore > highestScore) {
      highestScore = categoryScore;
      bestCategory = category;

      // Check subcategories if available
      if (rule.subcategories) {
        for (const [subName, subKeywords] of Object.entries(rule.subcategories)) {
          if (subKeywords.some(skw => fullText.includes(skw.toLowerCase()))) {
            identifiedSubcategory = subName;
            break;
          }
        }
      }
    }
  }

  // Ensure bestCategory is in matchedCategoriesSet
  if (bestCategory) {
    matchedCategoriesSet.add(bestCategory);
  }

  // Calculate relevance score (0 - 100)
  const relevanceScore = Math.min(100, Math.max(30, Math.round(highestScore * 14)));

  return {
    primaryCategory: bestCategory,
    subcategory: identifiedSubcategory,
    matchedCategories: Array.from(matchedCategoriesSet),
    tags: Array.from(discoveredTags).slice(0, 12),
    relevanceScore,
  };
}
