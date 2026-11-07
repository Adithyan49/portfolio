export type SkillStatus = 'Practising' | 'Learning' | 'Exploring';

export interface SkillItem {
  id: string;
  name: string;
  category: 'Programming Languages' | 'Web Technologies' | 'AI & Machine Learning' | 'Tools & Platforms';
  status: SkillStatus;
  description: string;
  keyTopics: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export const initialSkills: SkillItem[] = [
  // Programming Languages
  {
    id: 'cpp',
    name: 'C++',
    category: 'Programming Languages',
    status: 'Practising',
    description: 'Core problem-solving language focused on object-oriented programming, data structures, pointer mechanics, and algorithmic efficiency.',
    keyTopics: ['Data Structures', 'OOP Concepts', 'STL Algorithms', 'Competitive Programming']
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Programming Languages',
    status: 'Practising',
    description: 'Versatile language for AI experimentation, scripting, data manipulation, and building algorithmic prototypes.',
    keyTopics: ['Core Python Syntax', 'NumPy & Pandas', 'File I/O & Automation', 'Object-Oriented Design']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Programming Languages',
    status: 'Practising',
    description: 'Frontend scripting, dynamic DOM interaction, event-driven programming, and modern ES6+ asynchronous features.',
    keyTopics: ['ES6+ Syntax', 'Async/Await & Promises', 'DOM Manipulation', 'Event Architecture']
  },
  {
    id: 'html-css',
    name: 'HTML5 & CSS3',
    category: 'Programming Languages',
    status: 'Practising',
    description: 'Semantic markup, accessible page structure, responsive layouts with Flexbox and Grid, and CSS transitions.',
    keyTopics: ['Semantic HTML5', 'Responsive CSS Grid & Flexbox', 'CSS Transitions', 'Accessibility Standards']
  },

  // Web Technologies
  {
    id: 'web-dev',
    name: 'Modern Web Development',
    category: 'Web Technologies',
    status: 'Learning',
    description: 'Building responsive, component-driven web interfaces, state handling, and integrating backend APIs.',
    keyTopics: ['React.js Foundations', 'Component Lifecycle', 'State & Hooks', 'Vite Bundler']
  },
  {
    id: 'tailwind-css',
    name: 'Tailwind CSS',
    category: 'Web Technologies',
    status: 'Practising',
    description: 'Utility-first styling system for rapid interface engineering and consistent design systems.',
    keyTopics: ['Utility Classes', 'Responsive Breakpoints', 'Dark Mode Styling', 'Custom Animations']
  },

  // AI & Machine Learning
  {
    id: 'ai-foundations',
    name: 'Artificial Intelligence Foundations',
    category: 'AI & Machine Learning',
    status: 'Learning',
    description: 'Studying search algorithms, heuristic evaluation, state space representations, and intelligent agent architectures.',
    keyTopics: ['Agent Paradigms', 'Search Algorithms', 'Problem Formulation', 'Logic & Inference']
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning Concepts',
    category: 'AI & Machine Learning',
    status: 'Learning',
    description: 'Exploring supervised learning principles, regression, classification methods, feature scaling, and model evaluation metrics.',
    keyTopics: ['Supervised Learning', 'Linear & Logistic Regression', 'Decision Trees', 'Model Evaluation (Precision/Recall)']
  },
  {
    id: 'deep-learning-exploring',
    name: 'Neural Networks & Deep Learning',
    category: 'AI & Machine Learning',
    status: 'Exploring',
    description: 'Early explorations into multilayer perceptrons, activation functions, gradient descent, and tensor operations.',
    keyTopics: ['Perceptron Mechanics', 'Backpropagation Concepts', 'Activation Functions', 'Computer Vision Basics']
  },

  // Tools & Platforms
  {
    id: 'git-github',
    name: 'Git & GitHub',
    category: 'Tools & Platforms',
    status: 'Practising',
    description: 'Version control workflows, commit etiquette, branching models, and collaborative repository management.',
    keyTopics: ['Repository Initialization', 'Branching & Merging', 'Pull Requests', 'Remote Synchronization']
  },
  {
    id: 'arduino-embedded',
    name: 'Arduino & Microcontrollers',
    category: 'Tools & Platforms',
    status: 'Practising',
    description: 'Hardware prototyping with sensors, actuators, serial communication, and embedded C++ logic.',
    keyTopics: ['Ultrasonic Distance Sensors', 'Actuator Control', 'Serial Telemetry', 'Circuit Breadboarding']
  },
  {
    id: 'supabase-db',
    name: 'Supabase & PostgreSQL',
    category: 'Tools & Platforms',
    status: 'Learning',
    description: 'Relational database schemas, Row Level Security, instant REST APIs, and authentication flows.',
    keyTopics: ['Relational Schema Design', 'SQL Queries', 'Row Level Security (RLS)', 'Client SDK Integration']
  }
];
