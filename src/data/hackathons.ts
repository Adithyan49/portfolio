export interface HackathonEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  participationStatus: string;
  role: string;
  teamMembers?: string[];
  technologiesUsed: string[];
  projectDetails: string;
  keyLearnings: string[];
  result?: string;
  certificateNote?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const initialHackathons: HackathonEvent[] = [
  {
    id: 'ai-agent-hackathon-2026',
    name: 'AI Agent Hackathon 2026',
    description: 'An intensive technical hackathon focused on conceptualizing, designing, and prototyping autonomous AI agents and workflow automation tools.',
    date: '2026',
    participationStatus: 'Active Participant',
    role: 'Developer & AI System Researcher',
    teamMembers: ['Adithyan (Lead Developer)', 'Collegiate Peer Collaborators'],
    technologiesUsed: ['Python', 'AI Agent Concepts', 'Prompt Engineering', 'API Integration', 'Data Processing'],
    projectDetails: 'Engineered an autonomous workflow prototype exploring how agentic tool-use can decompose complex real-world queries, query external APIs, and execute multi-step problem solving autonomously.',
    keyLearnings: [
      'Gained deep appreciation for agent loop architecture and context window management',
      'Refined collaborative git branching and high-intensity sprint problem solving',
      'Explored practical API integrations under strict time constraints'
    ],
    result: 'Successfully completed working prototype submission with live technical demonstration'
  },
  {
    id: 'fund-my-crazy-2-0',
    name: 'Fund My Crazy 2.0',
    description: 'An innovation and entrepreneurial ideation challenge bringing together multidisciplinary engineering minds to pitch and prototype unconventional technological ideas.',
    date: '2026',
    participationStatus: 'Event Participant',
    role: 'Technical Ideator & Pitch Presenter',
    teamMembers: ['Adithyan', 'Innovation Team Members'],
    technologiesUsed: ['Problem Validation', 'Product Architecture', 'Technical Feasibility Analysis', 'Prototyping Strategy'],
    projectDetails: 'Formulated a comprehensive technical roadmap and architecture specification addressing emerging technological bottlenecks, presenting the engineering feasibility, target user impact, and scalability model.',
    keyLearnings: [
      'Bridged theoretical AI knowledge with real-world product viability and user requirements',
      'Honed technical storytelling, active listening, and engineering defense in front of evaluation panels',
      'Synthesized complex engineering trade-offs into accessible functional demonstrations'
    ],
    result: 'Selected for advanced presentation round; commended for structured technical reasoning'
  }
];
