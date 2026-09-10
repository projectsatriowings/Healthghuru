import { BlogPost, ExerciseData, SleepRisk } from "./types";

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Articles', href: '/articles' },
  { label: 'Videos', href: '/videos' },
  { label: 'Magazines', href: '/magazines' },
  { label: 'Stay Healthy', href: '/stay-healthy' },
  { label: 'Blog', href: '/blog' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'sun-salutation-secrets',
    title: 'Sun Salutation Secrets: Elevate Your Wellness with Surya Namaskar',
    category: 'Fitness',
    excerpt: 'Discover the ancient practice of Surya Namaskar and how 12 flowing poses can transform your morning routine and overall health.',
    readTime: '5 min read',
    date: 'December 12, 2024',
  },
  {
    slug: 'nutrient-timing',
    title: 'Mastering Nutrient Timing: Optimizing Your Diet for Peak Performance',
    category: 'Nutrition',
    excerpt: 'Learn when to eat carbs, proteins, and fats to maximize your workouts and recovery.',
    readTime: '6 min read',
    date: 'January 4, 2025',
  },
  {
    slug: 'exercises-for-abs',
    title: 'The Best Exercises for Stronger Abs and a Stronger Core',
    category: 'Fitness',
    excerpt: 'Beyond crunches: building a solid core foundation for better posture and injury prevention.',
    readTime: '4 min read',
    date: 'January 10, 2025',
  },
  {
    slug: 'yoga-mental-health',
    title: 'The Benefits of Yoga for Mental Health: A Holistic Approach to Wellness',
    category: 'Mental Health',
    excerpt: 'How mindful movement and breathwork can significantly reduce anxiety and depressive symptoms.',
    readTime: '7 min read',
    date: 'January 18, 2025',
  },
  {
    slug: 'boost-immune-system',
    title: 'Boost Your Immune System Naturally: Effective Strategies for Optimal Health',
    category: 'Nutrition',
    excerpt: 'Evidence-based dietary changes and supplements to keep your immune defenses strong year-round.',
    readTime: '5 min read',
    date: 'February 2, 2025',
  }
];

export const EXERCISE_DATA: ExerciseData[] = [
  { 
    name: 'Cycling', 
    description: 'Plan to ride your bike for 30 to 60 minutes, 3 to 5 days a week. Start slow and gradually increase intensity.', 
    image: '/images/cycling.png' 
  },
  { 
    name: 'Walking', 
    description: 'Just 30 minutes of daily walking can strengthen bones, reduce excess body fat, and boost muscle power.', 
    image: '/images/walking.png' 
  },
  { 
    name: 'Swimming', 
    description: 'Your body is supported by the buoyancy of the water, making it a great low-impact full-body workout.', 
    image: '/images/swimming.png' 
  },
  { 
    name: 'Yoga', 
    description: 'Yoga focuses on balancing the mind and body through physical postures, breathing techniques, and meditation.', 
    image: '/images/yoga.png' 
  },
];

export const SLEEP_RISKS: SleepRisk[] = [
  { title: 'Hypertension', icon: 'Heart', description: 'Getting less than 5–6 hours is linked to elevated blood pressure.' },
  { title: 'Heart Attack & Stroke', icon: 'Activity', description: 'Sleep deficiency causes greater instance of fatal cardiovascular problems.' },
  { title: 'Weight Gain & Obesity', icon: 'TrendingUp', description: 'Sleep deprivation negatively impacts the body\'s metabolism and eating habits.' },
  { title: 'Diabetes', icon: 'Droplets', description: 'Lack of sleep may affect how the body processes glucose.' },
  { title: 'Immune System Deficiency', icon: 'Shield', description: 'Long-term sleep deprivation can lower your immune system\'s response.' },
];

export const SIX_TIPS = [
  'Be physically active for 30 minutes most days of the week',
  'Eat a well-balanced, low-fat diet with lots of fruits, vegetables and whole grains',
  'Prioritize mental wellness — increased happiness, less depression',
  'Get enough sleep and rest every night',
  'Living a healthy lifestyle can boost your confidence',
  'Healthy habits ensure a longer, more fulfilled lifetime',
];
