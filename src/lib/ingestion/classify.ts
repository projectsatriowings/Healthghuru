export interface ClassificationResult {
  primaryCategory: string;
  subcategory?: string;
  tags: string[];
  relevanceScore: number;
}

// Comprehensive health taxonomy keyword rules
const TAXONOMY_RULES: Record<string, { keywords: string[]; weight: number; subcategories?: Record<string, string[]> }> = {
  'Nutrition': {
    weight: 1.0,
    keywords: [
      'diet', 'nutrition', 'protein', 'carbohydrates', 'fat', 'vitamins', 'minerals',
      'superfoods', 'calories', 'antioxidants', 'omega-3', 'mediterranean diet',
      'keto', 'plant-based', 'vegan', 'micronutrients', 'fiber', 'sugar', 'amino acids'
    ],
    subcategories: {
      'Plant-Based': ['vegan', 'plant-based', 'vegetarian'],
      'Micronutrients': ['vitamins', 'minerals', 'vitamin d', 'zinc', 'magnesium', 'iron'],
      'Healthy Eating': ['meal prep', 'recipes', 'portion control', 'superfoods']
    }
  },
  'Fitness': {
    weight: 1.0,
    keywords: [
      'exercise', 'workout', 'fitness', 'strength training', 'hypertrophy', 'cardio',
      'aerobic', 'endurance', 'muscles', 'stretching', 'mobility', 'hiit', 'squat',
      'calisthenics', 'running', 'cycling', 'pilates', 'yoga', 'athletic', 'reps'
    ],
    subcategories: {
      'Strength': ['strength training', 'resistance', 'hypertrophy', 'weights'],
      'Cardio': ['cardio', 'running', 'cycling', 'aerobic', 'hiit'],
      'Mobility': ['stretching', 'mobility', 'flexibility', 'yoga']
    }
  },
  'Mental Health': {
    weight: 1.0,
    keywords: [
      'mental health', 'anxiety', 'depression', 'stress', 'mindfulness', 'meditation',
      'psychology', 'cortisol', 'therapy', 'cognitive', 'burnout', 'emotional',
      'psychiatry', 'neuroscience', 'resilience', 'mood', 'panic', 'wellbeing'
    ],
    subcategories: {
      'Stress Reduction': ['stress', 'cortisol', 'burnout', 'relaxation'],
      'Mindfulness': ['mindfulness', 'meditation', 'breathwork', 'zen'],
      'Emotional Wellness': ['mood', 'resilience', 'therapy', 'depression', 'anxiety']
    }
  },
  'Sleep': {
    weight: 1.0,
    keywords: [
      'sleep', 'insomnia', 'circadian', 'melatonin', 'rem sleep', 'deep sleep',
      'sleep apnea', 'bedtime', 'sleep hygiene', 'narcolepsy', 'rest', 'snoring'
    ],
    subcategories: {
      'Sleep Quality': ['sleep hygiene', 'bedtime', 'restful', 'deep sleep'],
      'Sleep Disorders': ['insomnia', 'sleep apnea', 'snoring']
    }
  },
  'Heart Health': {
    weight: 1.0,
    keywords: [
      'heart', 'cardiovascular', 'cholesterol', 'blood pressure', 'hypertension',
      'arteries', 'atherosclerosis', 'arrhythmia', 'stroke', 'cardiac', 'ldl', 'hdl'
    ],
    subcategories: {
      'Hypertension': ['blood pressure', 'hypertension', 'systolic'],
      'Lipids': ['cholesterol', 'ldl', 'hdl', 'triglycerides']
    }
  },
  'Gut Health': {
    weight: 1.0,
    keywords: [
      'gut', 'microbiome', 'probiotics', 'prebiotics', 'digestion', 'ibs', 'flora',
      'bloating', 'gut-brain', 'colon', 'fermented', 'digestive enzymes'
    ]
  },
  'Immunity': {
    weight: 1.0,
    keywords: [
      'immunity', 'immune system', 'antibodies', 'vaccine', 'infections', 'white blood cells',
      'seasonal flu', 'resilience', 'immunology', 'lymphatic'
    ]
  },
  'Preventive Care': {
    weight: 1.0,
    keywords: [
      'preventive', 'screening', 'checkup', 'early detection', 'vaccination',
      'longevity', 'routine tests', 'biomarkers', 'public health', 'guidelines'
    ]
  },
  'Medical Research': {
    weight: 1.0,
    keywords: [
      'study', 'clinical trial', 'researchers', 'breakthrough', 'fda', 'investigators',
      'published in', 'laboratory', 'pathology', 'clinical study', 'scientific'
    ]
  },
  'Healthy Aging': {
    weight: 1.0,
    keywords: [
      'aging', 'longevity', 'cellular aging', 'telomeres', 'lifespan', 'healthspan',
      'cognitive decline', 'dementia', 'alzheimer', 'bone density', 'osteoporosis'
    ]
  },
  'Diabetes': {
    weight: 1.0,
    keywords: [
      'diabetes', 'blood sugar', 'glucose', 'insulin', 'a1c', 'glycemic', 'metabolic',
      'prediabetes', 'type 2 diabetes', 'hypoglycemia'
    ]
  },
  'Weight Management': {
    weight: 1.0,
    keywords: [
      'weight loss', 'metabolism', 'obesity', 'bmi', 'visceral fat', 'calorie deficit',
      'body composition', 'satiety', 'weight management'
    ]
  },
  'Women\'s Health': {
    weight: 1.0,
    keywords: [
      'women', 'pregnancy', 'maternal', 'menopause', 'estrogen', 'pcos',
      'endometriosis', 'ovarian', 'breast health', 'postpartum'
    ]
  },
  'Men\'s Health': {
    weight: 1.0,
    keywords: [
      'men\'s health', 'testosterone', 'prostate', 'male vitality', 'andropause',
      'mens wellness', 'erectile'
    ]
  },
  'Diseases & Conditions': {
    weight: 1.0,
    keywords: [
      'symptoms', 'diagnosis', 'treatment', 'chronic illness', 'autoimmune', 'arthritis',
      'asthma', 'cancer', 'oncology', 'syndrome', 'pain management', 'disorder'
    ]
  },
  'Wellness': {
    weight: 0.8,
    keywords: [
      'wellness', 'lifestyle', 'habits', 'hydration', 'balance', 'holistic',
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
  const combinedText = `${title} ${description || ''} ${existingTags.join(' ')}`.toLowerCase();
  
  let bestCategory = fallbackCategory;
  let highestScore = 0;
  let identifiedSubcategory: string | undefined;
  const discoveredTags = new Set<string>(existingTags.map(t => t.toLowerCase()));

  for (const [category, rule] of Object.entries(TAXONOMY_RULES)) {
    let matches = 0;

    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) {
        matches++;
        discoveredTags.add(kw);
      }
    }

    const categoryScore = matches * rule.weight;
    if (categoryScore > highestScore) {
      highestScore = categoryScore;
      bestCategory = category;

      // Check subcategories if available
      if (rule.subcategories) {
        for (const [subName, subKeywords] of Object.entries(rule.subcategories)) {
          if (subKeywords.some(skw => combinedText.includes(skw))) {
            identifiedSubcategory = subName;
            break;
          }
        }
      }
    }
  }

  // Calculate relevance score (0 - 100)
  const relevanceScore = Math.min(100, Math.max(30, Math.round(highestScore * 18)));

  return {
    primaryCategory: bestCategory,
    subcategory: identifiedSubcategory,
    tags: Array.from(discoveredTags).slice(0, 10),
    relevanceScore,
  };
}
