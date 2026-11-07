export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  category: 'AI / Machine Learning' | 'Cybersecurity' | 'Hardware / IoT' | 'Web Development';
  technologies: string[];
  status: 'In Development' | 'Completed Prototype' | 'Live Production' | 'Concept / Research';
  completionDate?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  videoUrl?: string;
  image?: string;
  screenshots?: string[];
  features: string[];
  architectureOverview: string;
}

export const initialProjects: Project[] = [
  {
    id: 'agrisaarthi-ai',
    name: 'AgriSaarthi AI',
    shortDescription: 'AI-powered agricultural assistant designed to help farmers make better farming decisions regarding crops, soil, and weather.',
    detailedDescription: 'AgriSaarthi AI is an intelligent agricultural assistant conceptualized to empower regional farmers with data-driven agronomic insights. The system provides guidance on optimal crop selection based on seasonal patterns, evaluates soil and meteorological parameters, recommends tailored irrigation schedules, and warns about imminent farming risks such as pest outbreaks or unseasonal precipitation.',
    category: 'AI / Machine Learning',
    technologies: ['Python', 'Machine Learning Concepts', 'Data Analytics', 'Agronomic Models', 'REST APIs'],
    status: 'In Development',
    completionDate: '2026',
    features: [
      'Crop suitability recommendations based on local climate and soil factors',
      'Seasonal irrigation planning and moisture optimization',
      'Weather alert synthesis and risk mitigation advisories',
      'Accessible multi-lingual advisory interface concept for rural farmers'
    ],
    architectureOverview: 'Built around predictive decision trees and data aggregation pipelines that ingest temperature, humidity, rainfall indices, and soil chemistry data to generate tailored farming advisories.'
  },
  {
    id: 'qshield',
    name: 'QShield',
    shortDescription: 'Quantum-inspired cybersecurity and digital signature application exploring resilient cryptographic defense mechanisms.',
    detailedDescription: 'QShield is a cybersecurity software project exploring quantum-resistant digital signature concepts and secure cryptographic validation protocols. It examines critical threat vectors including message forgery, credential impersonation, replay attacks, and man-in-the-middle channel manipulation, benchmarking classical asymmetric schemes against quantum-resilient signatures.',
    category: 'Cybersecurity',
    technologies: ['C++', 'Cryptographic Algorithms', 'Hash Functions', 'Digital Signatures', 'Security Analysis'],
    status: 'In Development',
    completionDate: '2026',
    features: [
      'Mathematical modeling of quantum-resistant signature verification schemes',
      'Simulation of replay attacks and cryptographic integrity checks',
      'Detailed telemetry on signature generation latency and payload footprint',
      'Benchmarking verification speeds across cryptographic key lengths'
    ],
    architectureOverview: 'Implements algorithmic routines in C++ for hashing and digital signing workflows, providing a testbed to evaluate message integrity and resistance to forgery attempts.'
  },
  {
    id: 'smart-blind-stick',
    name: 'Smart Blind Stick',
    shortDescription: 'Arduino-based assistive prototype with ultrasonic obstacle detection and real-time acoustic alerts for visually impaired individuals.',
    detailedDescription: 'An assistive hardware prototype engineered to grant enhanced spatial mobility and safety to visually impaired individuals. Constructed around an Arduino microcontroller and high-frequency ultrasonic range sensor, the device measures obstacle distances in real-time and triggers proportional buzzer frequency alerts as obstacles approach the user.',
    category: 'Hardware / IoT',
    technologies: ['Arduino (C++)', 'Ultrasonic Sensors', 'Embedded Systems', 'Buzzer Actuators', 'Circuit Design'],
    status: 'Completed Prototype',
    completionDate: '2025 - 2026',
    features: [
      'Real-time ultrasonic obstacle proximity sensing up to 3 meters',
      'Dynamic auditory alerts with buzzer frequency proportional to proximity',
      'Lightweight, ergonomic walking cane mount design',
      'Low-power consumption circuit architecture for long battery life'
    ],
    architectureOverview: 'Employs an HC-SR04 ultrasonic sensor interfaced with an Arduino microcontroller running an embedded C++ control loop that samples distance at 50ms intervals and drives an alert buzzer.'
  },
  {
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    shortDescription: 'Futuristic, highly animated developer portfolio showcasing skills, projects, learning journey, and coding platform activity.',
    detailedDescription: 'A premium, responsive digital portfolio engineered with React.js, Framer Motion, Three.js, Tailwind CSS, and Supabase. Features a dark-themed visual design system with interactive particle constellations, floating 3D tech icons, live developer analytics, filtered project showcase, learning timeline, and a secured Supabase contact and administration backend.',
    category: 'Web Development',
    technologies: ['React.js', 'TypeScript', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'Supabase'],
    status: 'Live Production',
    completionDate: '2026',
    githubUrl: 'https://github.com/Adithyan49',
    features: [
      'Interactive Three.js floating technology icons with studio illumination',
      'Physics-based particle constellation background responding to cursor coordinates',
      'Multi-page animated transitions with zero-flash AnimatePresence orchestration',
      'Supabase-backed contact dispatch and authenticated administration control panel',
      'Real-time Developer Dashboard integrating official GitHub API statistics'
    ],
    architectureOverview: 'Component-driven Vite + React architecture utilizing modular state, custom motion variants, isolated WebGL canvas rendering, and direct Supabase database synchronization.'
  }
];
