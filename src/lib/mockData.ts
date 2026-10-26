import { WeeklyDataPoint } from './types';

interface MockArticle {
  id: string;
  slug: string;
  image: string;
  title: string;
  category: string;
  readTime: number;
  date: string;
  saved: boolean;
  readProgress: number;
  excerpt: string;
}

export const MOCK_ARTICLES: MockArticle[] = [
  {
    id: '1',
    slug: 'sun-salutation-secrets',
    image: '/images/yoga.webp',
    title: 'Sun Salutation Secrets: Elevate Your Wellness with Surya Namaskar',
    category: 'Fitness',
    readTime: 5,
    date: '2026-06-05',
    saved: true,
    readProgress: 100,
    excerpt: 'Discover how 12 flowing poses can transform your morning routine and overall health.',
  },
  {
    id: '2',
    slug: 'nutrient-timing',
    image: '/images/nutrition_pillar.webp',
    title: 'Mastering Nutrient Timing: Optimizing Your Diet for Peak Performance',
    category: 'Nutrition',
    readTime: 7,
    date: '2026-06-03',
    saved: true,
    readProgress: 60,
    excerpt: 'When you eat matters as much as what you eat. Learn how to time your nutrition for maximum effect.',
  },
  {
    id: '3',
    slug: 'exercises-for-abs',
    image: '/images/exercise_plank.webp',
    title: 'The Best Exercises for Stronger Abs and a Stronger Core',
    category: 'Fitness',
    readTime: 4,
    date: '2026-06-01',
    saved: false,
    readProgress: 0,
    excerpt: 'Core strength is the foundation of all athletic movement. Here are the 7 most effective core exercises.',
  },
  {
    id: '4',
    slug: 'yoga-mental-health',
    image: '/images/mental_health_pillar.webp',
    title: 'The Benefits of Yoga for Mental Health: A Holistic Approach to Wellness',
    category: 'Mental Health',
    readTime: 6,
    date: '2026-05-28',
    saved: true,
    readProgress: 35,
    excerpt: 'Yoga is not just exercise. The mind-body connection it creates can dramatically reduce anxiety and depression.',
  },
  {
    id: '5',
    slug: 'boost-immune-system',
    image: '/images/nutrition_pillar.webp',
    title: 'Boost Your Immune System Naturally: Effective Strategies for Optimal Health',
    category: 'Nutrition',
    readTime: 5,
    date: '2026-05-25',
    saved: false,
    readProgress: 0,
    excerpt: 'Your immune system is your body\'s defense network. These 8 natural strategies will make it stronger.',
  },
  {
    id: '6',
    slug: 'sleep-quality-guide',
    image: '/images/sleep_pillar.webp',
    title: 'Why Sleep Quality Matters More Than Sleep Quantity',
    category: 'Sleep',
    readTime: 6,
    date: '2026-05-22',
    saved: true,
    readProgress: 100,
    excerpt: 'Eight hours of bad sleep is worse than six hours of deep, restorative sleep. Here\'s what the science says.',
  },
  {
    id: '7',
    slug: 'stress-management',
    image: '/images/mental_health_pillar.webp',
    title: 'The Science of Stress: How Chronic Stress Destroys Your Health',
    category: 'Mental Health',
    readTime: 8,
    date: '2026-05-20',
    saved: false,
    readProgress: 0,
    excerpt: 'Cortisol, the stress hormone, affects everything from your weight to your immune system. Learn to manage it.',
  },
  {
    id: '8',
    slug: 'hydration-myths',
    image: '/images/walking.webp',
    title: 'Hydration Myths Debunked: How Much Water Do You Really Need?',
    category: 'Nutrition',
    readTime: 4,
    date: '2026-05-18',
    saved: true,
    readProgress: 100,
    excerpt: 'The 8-glasses-a-day rule is not based on science. Here\'s what nutritionists actually recommend.',
  },
  {
    id: '9',
    slug: 'morning-routine',
    image: '/images/exercise_squats.webp',
    title: '7 Morning Habits That Set You Up for a Healthier Day',
    category: 'Fitness',
    readTime: 5,
    date: '2026-05-15',
    saved: false,
    readProgress: 20,
    excerpt: 'How you start your morning determines the quality of your entire day. These 7 habits are backed by science.',
  },
  {
    id: '10',
    slug: 'gut-health',
    image: '/images/swimming.webp',
    title: 'Your Gut is Your Second Brain: The Microbiome Guide',
    category: 'Nutrition',
    readTime: 9,
    date: '2026-05-12',
    saved: false,
    readProgress: 0,
    excerpt: '70% of your immune system lives in your gut. Here\'s how to feed your microbiome for optimal health.',
  },
];

export const MOCK_MEALS_TODAY = {
  breakfast: [
    { name: 'Oats with banana', calories: 280, protein: 8, carbs: 52, fat: 4 },
    { name: 'Green tea', calories: 2, protein: 0, carbs: 0, fat: 0 },
  ],
  lunch: [
    { name: 'Brown rice + dal', calories: 420, protein: 18, carbs: 72, fat: 6 },
    { name: 'Cucumber raita', calories: 65, protein: 3, carbs: 8, fat: 2 },
  ],
  dinner: [
    { name: 'Grilled chicken breast', calories: 220, protein: 42, carbs: 0, fat: 5 },
    { name: 'Stir-fried vegetables', calories: 95, protein: 3, carbs: 18, fat: 2 },
  ],
  snacks: [
    { name: 'Mixed nuts (30g)', calories: 185, protein: 5, carbs: 6, fat: 16 },
  ],
};

export const MOCK_WORKOUT_HISTORY = [
  { id: '1', type: 'Cycling', duration: 45, calories: 360, date: '2026-06-08' },
  { id: '2', type: 'Yoga', duration: 30, calories: 120, date: '2026-06-09' },
  { id: '3', type: 'Swimming', duration: 40, calories: 360, date: '2026-06-10' },
];

export const SLEEP_WEEK_DATA = [
  { day: 'Mon', hours: 5.5, quality: 2 },
  { day: 'Tue', hours: 7.0, quality: 4 },
  { day: 'Wed', hours: 6.5, quality: 3 },
  { day: 'Thu', hours: 8.0, quality: 5 },
  { day: 'Fri', hours: 7.5, quality: 4 },
  { day: 'Sat', hours: 9.0, quality: 5 },
  { day: 'Sun', hours: 6.0, quality: 3 },
];

export const MOOD_HISTORY = [
  { date: 'May 28', mood: 3 }, { date: 'May 29', mood: 4 },
  { date: 'May 30', mood: 2 }, { date: 'May 31', mood: 3 },
  { date: 'Jun 1',  mood: 4 }, { date: 'Jun 2',  mood: 5 },
  { date: 'Jun 3',  mood: 4 }, { date: 'Jun 4',  mood: 3 },
  { date: 'Jun 5',  mood: 4 }, { date: 'Jun 6',  mood: 4 },
  { date: 'Jun 7',  mood: 5 }, { date: 'Jun 8',  mood: 3 },
  { date: 'Jun 9',  mood: 4 }, { date: 'Jun 10', mood: 4 },
];

export const CALORIES_PER_MINUTE: Record<string, number> = {
  Cycling: 8, Walking: 5, Swimming: 9, Yoga: 4,
  'Push-ups': 7, Running: 10, Plank: 5, Other: 6,
};

export const WEEKLY_OVERVIEW_DATA: WeeklyDataPoint[] = [
  { day: 'Mon', nutritionScore: 80, sleepHours: 5.5, activeMinutes: 45, moodScore: 3 },
  { day: 'Tue', nutritionScore: 85, sleepHours: 7.0, activeMinutes: 30, moodScore: 4 },
  { day: 'Wed', nutritionScore: 70, sleepHours: 6.5, activeMinutes: 40, moodScore: 4 },
  { day: 'Thu', nutritionScore: 90, sleepHours: 8.0, activeMinutes: 60, moodScore: 5 },
  { day: 'Fri', nutritionScore: 85, sleepHours: 7.5, activeMinutes: 0, moodScore: 4 },
  { day: 'Sat', nutritionScore: 75, sleepHours: 9.0, activeMinutes: 90, moodScore: 5 },
  { day: 'Sun', nutritionScore: 80, sleepHours: 6.0, activeMinutes: 20, moodScore: 3 },
];

import { VaultRecord, Goal, FamilyMember, LibraryArticle, VaultActivityEvent, UserPlan } from './types';

// Vault Mock Data
export const MOCK_USER_PLAN: UserPlan = {
  tier: 'free',
  recordsUsed: 6,
  recordsLimit: 10,
  activeGoalsLimit: 1,
  familyMembersLimit: 1,
  adsEnabled: true,
  ocrEnabled: false,
  dataExportEnabled: false,
  accountCreatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
};

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'self', name: 'Mohammed Thalha', relationship: 'self', avatarInitials: 'MT', dob: '1990-01-01' },
  // { id: 'member_2', name: 'Ayesha Khan', relationship: 'spouse', avatarInitials: 'AK', dob: '1992-05-15' },
  // { id: 'member_3', name: 'Zaid Khan', relationship: 'child', avatarInitials: 'ZK', dob: '2015-10-20' },
];

export const MOCK_VAULT_RECORDS: VaultRecord[] = [
  { id: 'r1', memberId: 'self', type: 'lab_report', title: 'Complete Blood Count', date: '2026-06-12', doctorOrFacility: 'City Lab', tags: ['Annual Checkup'], fileName: 'CBC_Report_2026.pdf', createdAt: '2026-06-13T10:00:00Z' },
  { id: 'r2', memberId: 'self', type: 'prescription', title: 'Dermatology Prescription', date: '2026-05-20', doctorOrFacility: 'Dr. Sharma', tags: ['Skin'], fileName: 'Rx_DrSharma.jpg', createdAt: '2026-05-21T14:30:00Z' },
  { id: 'r3', memberId: 'self', type: 'visit_note', title: 'Dental Checkup', date: '2026-04-10', doctorOrFacility: 'Smile Clinic', tags: ['Dental'], fileName: 'Dental_Notes.pdf', createdAt: '2026-04-11T09:15:00Z' },
  { id: 'r4', memberId: 'self', type: 'vaccination', title: 'Flu Shot', date: '2025-11-05', doctorOrFacility: 'Health Center', tags: ['Vaccine'], fileName: 'Flu_Shot_Record.pdf', createdAt: '2025-11-06T11:00:00Z' },
  { id: 'r5', memberId: 'self', type: 'insurance', title: 'Health Policy 2026', date: '2026-01-01', doctorOrFacility: 'Care Insurance', tags: ['Policy'], fileName: 'Health_Policy_2026.pdf', createdAt: '2026-01-02T08:00:00Z' },
  { id: 'r6', memberId: 'self', type: 'lab_report', title: 'Lipid Profile', date: '2025-10-15', doctorOrFacility: 'City Lab', tags: ['Heart'], fileName: 'Lipid_Profile.pdf', createdAt: '2025-10-16T12:00:00Z' },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1', memberId: 'self', title: 'Lower my A1C by 1 point', category: 'blood_sugar',
    startValue: 7.2, targetValue: 6.2, unit: '%', targetDate: '2026-12-31', status: 'active',
    history: [
      { date: '2026-01-10', value: 7.2 },
      { date: '2026-03-15', value: 6.9 },
      { date: '2026-06-01', value: 6.7 },
    ]
  },
  {
    id: 'g2', memberId: 'self', title: 'Reach healthy BMI', category: 'weight',
    startValue: 85, targetValue: 75, unit: 'kg', targetDate: '2026-10-01', status: 'active',
    history: [
      { date: '2026-02-01', value: 85 },
      { date: '2026-04-01', value: 82 },
      { date: '2026-06-01', value: 80.5 },
    ]
  }
];

export const MOCK_LIBRARY_ARTICLES: LibraryArticle[] = [
  { id: 'a1', slug: 'managing-blood-sugar', title: '10 Foods That Naturally Lower Blood Sugar', category: 'Nutrition', readTime: 5, date: '2026-06-15', excerpt: 'Discover the best foods to include in your diet for optimal blood sugar control.', saved: false, matchedGoalCategory: 'blood_sugar' },
  { id: 'a2', slug: 'weight-loss-plateau', title: 'Breaking Through a Weight Loss Plateau', category: 'Fitness', readTime: 7, date: '2026-06-10', excerpt: 'Stuck at the same weight? Here are scientifically proven ways to kickstart your metabolism.', saved: true, matchedGoalCategory: 'weight' },
  { id: 'a3', slug: 'better-sleep-habits', title: 'The Ultimate Guide to Deep Sleep', category: 'Sleep', readTime: 8, date: '2026-06-05', excerpt: 'Improve your sleep architecture with these simple nightly habits.', saved: false },
  { id: 'a4', slug: 'stress-reduction-techniques', title: '5-Minute Stress Reduction Techniques', category: 'Mental Health', readTime: 4, date: '2026-05-28', excerpt: 'Quick and effective ways to calm your nervous system anywhere.', saved: true },
  { id: 'a5', slug: 'heart-healthy-cardio', title: 'Cardio Workouts for a Healthy Heart', category: 'Fitness', readTime: 6, date: '2026-05-20', excerpt: 'The best cardiovascular exercises for long-term heart health.', saved: false },
  { id: 'a6', slug: 'mediterranean-diet-guide', title: 'Beginner\'s Guide to the Mediterranean Diet', category: 'Nutrition', readTime: 10, date: '2026-05-15', excerpt: 'Everything you need to know about the world\'s healthiest diet.', saved: true },
  { id: 'a7', slug: 'understanding-macros', title: 'Macros Explained: Protein, Carbs, and Fats', category: 'Nutrition', readTime: 6, date: '2026-05-10', excerpt: 'A simple breakdown of macronutrients and how to balance them.', saved: false, matchedGoalCategory: 'weight' },
  { id: 'a8', slug: 'yoga-for-flexibility', title: 'Daily Yoga Routine for Better Flexibility', category: 'Fitness', readTime: 5, date: '2026-05-05', excerpt: 'Improve your range of motion with this 15-minute daily practice.', saved: false },
  { id: 'a9', slug: 'cognitive-behavioral-therapy', title: 'How CBT Can Change Your Thinking', category: 'Mental Health', readTime: 8, date: '2026-04-28', excerpt: 'Learn the basic principles of Cognitive Behavioral Therapy.', saved: false },
  { id: 'a10', slug: 'circadian-rhythm-optimization', title: 'Optimize Your Circadian Rhythm', category: 'Sleep', readTime: 7, date: '2026-04-20', excerpt: 'Align your lifestyle with your body\'s natural internal clock.', saved: false },
];

export const MOCK_VAULT_ACTIVITY: VaultActivityEvent[] = [
  { id: 'act1', memberId: 'self', type: 'record_added', label: 'Added Complete Blood Count report', timestamp: '2026-06-13T10:05:00Z', linkHref: '/records/r1' },
  { id: 'act2', memberId: 'self', type: 'goal_updated', label: 'Logged progress on weight goal (80.5 kg)', timestamp: '2026-06-01T08:30:00Z', linkHref: '/goals' },
  { id: 'act3', memberId: 'self', type: 'goal_updated', label: 'Logged progress on A1C goal (6.7%)', timestamp: '2026-06-01T08:35:00Z', linkHref: '/goals' },
  { id: 'act4', memberId: 'self', type: 'article_saved', label: 'Saved "Breaking Through a Weight Loss Plateau"', timestamp: '2026-06-10T14:20:00Z', linkHref: '/library' },
  { id: 'act5', memberId: 'self', type: 'record_added', label: 'Added Dermatology Prescription', timestamp: '2026-05-21T14:35:00Z', linkHref: '/records/r2' },
];
