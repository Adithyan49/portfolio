export interface Course {
  id: string;
  title: string;
  platform: string;
  status: 'Completed' | 'In Progress';
  completionDate?: string;
  focusArea: string;
  description: string;
  topicsCovered: string[];
}

export interface LearningMilestone {
  id: string;
  period: string;
  title: string;
  category: 'Academics' | 'Algorithms' | 'Machine Learning' | 'Hardware Prototyping';
  description: string;
  skillsAcquired: string[];
  status: 'Achieved' | 'Ongoing Focus';
}

export const initialCourses: Course[] = [
  {
    id: 'course-cpp-dsa',
    title: 'Object-Oriented Programming & Data Structures with C++',
    platform: 'Academic Curriculum & Online Problem Solving',
    status: 'In Progress',
    focusArea: 'Data Structures & Algorithms',
    description: 'Systematic study of linear and non-linear data structures, memory layout, time complexity analysis, and object-oriented abstractions in modern C++.',
    topicsCovered: ['Arrays & Pointers', 'Linked Lists & Stacks', 'Trees & Graphs', 'Algorithm Complexity (Big O)']
  },
  {
    id: 'course-python-ai',
    title: 'Python for Artificial Intelligence & Data Science',
    platform: 'Self-Paced Specialization & Guided Labs',
    status: 'In Progress',
    focusArea: 'AI & Data Analysis',
    description: 'Hands-on exploration of scientific computing packages, structured data analysis, and mathematical modeling for predictive machine learning.',
    topicsCovered: ['NumPy Vectorization', 'Pandas DataFrame Wrangling', 'Matplotlib Visualization', 'Basic Scikit-Learn Pipelines']
  },
  {
    id: 'course-web-foundations',
    title: 'Modern Responsive Web Development Fundamentals',
    platform: 'Self-Directed Projects',
    status: 'Completed',
    completionDate: '2026',
    focusArea: 'Frontend Engineering',
    description: 'Building modern user interfaces adhering to semantic HTML5, clean CSS layouts, asynchronous JavaScript, and component design patterns.',
    topicsCovered: ['Modern JavaScript (ES6+)', 'Tailwind CSS Utility Design', 'React Component Architecture', 'Vite Bundler']
  }
];

export const initialMilestones: LearningMilestone[] = [
  {
    id: 'milestone-1',
    period: '2026 - First Year',
    title: 'Commenced B.Tech in AI & Data Science',
    category: 'Academics',
    description: 'Began specialized undergraduate studies at Sri Eshwar College of Engineering, immersing into computer science theory, discrete mathematics, and computational thinking.',
    skillsAcquired: ['Computer Architecture', 'Discrete Mathematics', 'C++ Foundations'],
    status: 'Achieved'
  },
  {
    id: 'milestone-2',
    period: '2026 - Hackathons & Prototypes',
    title: 'Built AgriSaarthi AI & Assistive IoT Prototypes',
    category: 'Machine Learning',
    description: 'Synthesized domain curiosity into actionable code by designing the Smart Blind Stick embedded device and drafting the AgriSaarthi agricultural intelligence platform.',
    skillsAcquired: ['Arduino Microcontrollers', 'Ultrasonic Sensing', 'Domain Research', 'Hackathon Sprints'],
    status: 'Achieved'
  },
  {
    id: 'milestone-3',
    period: '2026 - Ongoing',
    title: 'Competitive Algorithmic Problem Solving',
    category: 'Algorithms',
    description: 'Daily practice across LeetCode, CodeChef, HackerRank, and GeeksforGeeks to develop intuitive algorithmic reasoning and speed.',
    skillsAcquired: ['Recursion & Dynamic Programming Concepts', 'Pointer Manipulation', 'Time & Space Optimization'],
    status: 'Ongoing Focus'
  },
  {
    id: 'milestone-4',
    period: '2026 - Target',
    title: 'End-to-End Deep Learning Model Training',
    category: 'Machine Learning',
    description: 'Targeting deep understanding of neural network weights optimization, loss surfaces, convolutional vision models, and natural language transformer mechanisms.',
    skillsAcquired: ['PyTorch / TensorFlow Basics', 'Convolutional Layers', 'Model Hyperparameter Tuning'],
    status: 'Ongoing Focus'
  }
];
