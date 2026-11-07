export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  category: 'social' | 'coding' | 'contact';
  description?: string;
  badge?: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/Adithyan49",
    icon: "Github",
    category: "coding",
    description: "Source code repositories, personal builds, and open-source contributions",
    badge: "Adithyan49"
  },
  {
    name: "LeetCode",
    url: "https://leetcode.com/u/adithyan_adhi/",
    icon: "Code2",
    category: "coding",
    description: "Data structures, algorithmic problem solving & daily challenges",
    badge: "adithyan_adhi"
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/adithyan-r-7420bb419/",
    icon: "Linkedin",
    category: "social",
    description: "Professional networking, academic milestones and engineering updates",
    badge: "Adithyan R"
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/adithyanraids",
    icon: "BarChart3",
    category: "coding",
    description: "Datasets, machine learning kernels, exploratory data analysis",
    badge: "adithyanraids"
  },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/profile/adithyan_r2026a1",
    icon: "Award",
    category: "coding",
    description: "Skill certifications, core language practice & algorithm tracks",
    badge: "adithyan_r2026a1"
  },
  {
    name: "CodeChef",
    url: "https://www.codechef.com/users/plush_plume_54",
    icon: "Terminal",
    category: "coding",
    description: "Competitive programming contests and division problem solving",
    badge: "plush_plume_54"
  },
  {
    name: "GeeksforGeeks",
    url: "https://www.geeksforgeeks.org/profile/adithyanr2pr2",
    icon: "BookOpen",
    category: "coding",
    description: "Computer science theory, practice questions and algorithm practice",
    badge: "adithyanr2pr2"
  },
  {
    name: "Unstop",
    url: "https://unstop.com/u/adithyan70944",
    icon: "Trophy",
    category: "coding",
    description: "Hackathons, collegiate competitions and technical quizzes",
    badge: "adithyan70944"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/aadhi49.exe/",
    icon: "Instagram",
    category: "social",
    description: "Personal tech journey, campus life and creative updates",
    badge: "@aadhi49.exe"
  },
  {
    name: "Email",
    url: "mailto:adithyanadhi2998@gmail.com",
    icon: "Mail",
    category: "contact",
    description: "Direct email for inquiries, collaborations, and internships",
    badge: "adithyanadhi2998@gmail.com"
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/919659007117",
    icon: "MessageCircle",
    category: "contact",
    description: "Instant messaging for quick questions and project discussions",
    badge: "Direct Chat"
  }
];

export const directContact = {
  email: "adithyanadhi2998@gmail.com",
  emailMailto: "mailto:adithyanadhi2998@gmail.com",
  whatsappNumber: "9659007117",
  whatsappUrl: "https://wa.me/919659007117",
};
