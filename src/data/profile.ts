export interface ProfileData {
  name: string;
  professionalTitle: string;
  degree: string;
  college: string;
  academicYear: string;
  location: string;
  careerGoal: string;
  tagline: string;
  supportingIntro: string;
  aboutMe: string;
  learningPhilosophy: string;
  interests: {
    programming: string[];
    aiAndMl: string[];
    domains: string[];
  };
  educationDetails: {
    institution: string;
    degree: string;
    duration: string;
    status: string;
    highlights: string[];
  }[];
}

export const initialProfile: ProfileData = {
  name: "Adithyan",
  professionalTitle: "AI & Data Science Student",
  degree: "B.Tech – Artificial Intelligence and Data Science",
  college: "Sri Eshwar College of Engineering",
  academicYear: "First Year",
  location: "Pollachi, Coimbatore, Tamil Nadu, India",
  careerGoal: "AI/ML Engineer",
  tagline: "CODE. CREATE. INNOVATE. REPEAT.",
  supportingIntro: "Exploring the intersection of artificial intelligence, programming and innovation. Building projects, solving problems and learning something new every day.",
  aboutMe: "I am Adithyan, a first-year B.Tech Artificial Intelligence and Data Science student at Sri Eshwar College of Engineering. I am passionate about programming, technology, problem-solving and exploring the possibilities of artificial intelligence. I am currently developing my programming skills, exploring AI and machine learning concepts, building practical projects and participating in hackathons. I enjoy learning new technologies and turning ideas into useful applications. My long-term goal is to become an AI/ML Engineer and continuously improve my technical and problem-solving abilities.",
  learningPhilosophy: "Continuous improvement driven by hands-on experimentation, disciplined problem solving on algorithmic platforms, and building tangible software and hardware prototypes that solve genuine needs.",
  interests: {
    programming: ["C++ Algorithms", "Python Scripting", "Modern Web Architecture", "Object-Oriented Design"],
    aiAndMl: ["Supervised Learning", "Deep Learning Fundamentals", "Neural Network Architecture", "Natural Language Processing Concepts"],
    domains: ["Agriculture Technology", "Assistive Hardware & IoT", "Quantum-Inspired Cryptography", "Intelligent Systems"]
  },
  educationDetails: [
    {
      institution: "Sri Eshwar College of Engineering",
      degree: "B.Tech in Artificial Intelligence & Data Science",
      duration: "2026 - Present",
      status: "Currently in First Year",
      highlights: [
        "Specializing in AI algorithms, data structures, and mathematical foundations for Machine Learning",
        "Active participant in technical club initiatives and collegiate hackathons",
        "Focused on foundational excellence in C++ and Python"
      ]
    }
  ]
};
