export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatarText: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  linkedInPostUrl?: string;
}

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Deconstructing Autonomous AI Agents: Reflections from AI Agent Hackathon 2026',
    content: `During the AI Agent Hackathon 2026, our team dove deep into agent loop architectures, tool calling mechanisms, and context memory retention. 

One of the biggest takeaways was that prompt engineering alone is not enough—state determinism and fallback handling when an external tool API errors out are what make an AI agent truly production-ready.

Key engineering takeaways:
1. ReAct (Reasoning + Acting) loops need strict token budget guards.
2. Structured output parsing (JSON schema validation) prevents downstream runtime errors.
3. Local test harnesses before connecting live APIs save countless debugging hours.

Excited to keep building and experimenting with multi-agent orchestration frameworks!`,
    author: {
      name: 'Adithyan',
      role: 'AI & Data Science Student · Sri Eshwar College',
      avatarText: 'A',
    },
    date: 'March 2026',
    readTime: '3 min read',
    tags: ['Artificial Intelligence', 'AI Agents', 'Hackathon', 'Python'],
    likes: 24,
    linkedInPostUrl: 'https://www.linkedin.com/in/adithyan-r-7420bb419/',
  },
  {
    id: 'post-2',
    title: 'Why I Chose C++ Alongside Python in My First Year of AI & Data Science',
    content: `A common question among fellow first-year engineering students is: "Why bother mastering pointers and memory management in C++ when Python has all the modern AI libraries?"

The reality is that every high-performance ML tensor engine—PyTorch, TensorFlow, GGML, ONNX Runtime, and CUDA kernels—is written in C++ or C.

Understanding contiguous memory layout, cache lines, and algorithmic Big-O complexity in C++ transforms you from someone who simply calls .fit() or .predict() into an engineer who can optimize inference latency and profile real systems.

Never skip foundational computer science.`,
    author: {
      name: 'Adithyan',
      role: 'AI & Data Science Student · Sri Eshwar College',
      avatarText: 'A',
    },
    date: 'February 2026',
    readTime: '4 min read',
    tags: ['C++', 'Computer Science', 'Machine Learning', 'Performance'],
    likes: 38,
    linkedInPostUrl: 'https://www.linkedin.com/in/adithyan-r-7420bb419/',
  },
  {
    id: 'post-3',
    title: 'AgriSaarthi AI: Bridging Agronomic Intelligence and Localized Climate Data',
    content: `Agriculture in Tamil Nadu and Southern India requires hyper-local considerations: seasonal soil moisture depletion, monsoon variance, and pest vectors specific to regional crops.

With AgriSaarthi AI, we are building a predictive advisory pipeline combining:
• Soil pH and nitrogen-phosphorus-potassium (NPK) ratios
• Multi-day meteorological forecasts
• Crop risk decision trees

Our goal is simple: transform raw agronomic data into actionable, easy-to-understand recommendations that farmers can trust.`,
    author: {
      name: 'Adithyan',
      role: 'AI & Data Science Student · Sri Eshwar College',
      avatarText: 'A',
    },
    date: 'January 2026',
    readTime: '5 min read',
    tags: ['AgriTech', 'AI Systems', 'Data Science', 'Social Impact'],
    likes: 42,
    linkedInPostUrl: 'https://www.linkedin.com/in/adithyan-r-7420bb419/',
  },
];
