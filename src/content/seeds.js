// Seed data extracted EXACTLY from the original hardcoded components.
// Public site renders `published ?? seed` via ContentContext (see docs/CMS-CONTRACT.md).
// Note: `color` fields on experience/projects/skills/certifications items are
// extra (beyond the contract shape) to preserve pixel-identical accents;
// components fall back to defaults when a published item omits them.

export const seeds = {
  hero: {
    greeting: "Hello, I'm",
    name: "Akshay Kumar",
    roles: [
      "Generative AI Engineer",
      "LLM Engineer",
      "AI Systems Engineer",
      "Machine Learning Engineer",
    ],
    description:
      "Generative AI Engineer skilled in building LLM-powered applications, multi-agent systems, and scalable AI pipelines that turn complex data into actionable insights.",
    resumeUrl: "/Akshay_BTech_AI_DS_Resume.pdf",
    buttons: [
      { label: "View My Work", href: "#projects", style: "primary" },
      { label: "Get in Touch", href: "#contact", style: "outline" },
      { label: "Resume", href: "/Akshay_BTech_AI_DS_Resume.pdf", style: "outline" },
    ],
    socials: [],
  },

  about: {
    paragraphs: [
      "I am a Generative AI Engineer with a strong background in building intelligent systems powered by Large Language Models (LLMs), natural language processing, and machine learning. I specialize in designing AI-driven solutions that automate complex workflows, process large volumes of unstructured data, and transform information into structured, actionable insights.",
      "My work focuses on developing scalable AI pipelines and real-world LLM applications using tools such as LangChain, LangGraph, Hugging Face, and modern AI infrastructure. I have hands-on experience building multi-agent AI systems, retrieval-augmented generation (RAG) pipelines, and intelligent document processing solutions that enable efficient information extraction from complex documents.",
      "I am particularly interested in solving challenging problems involving document understanding, knowledge retrieval, and AI-powered automation. My goal is to create reliable and production-ready AI systems that improve extraction accuracy, reduce hallucinations in LLM outputs, and deliver meaningful value through data-driven intelligence.",
      "With experience across generative AI frameworks, vector databases, machine learning models, and modern LLM ecosystems, I enjoy exploring new advancements in AI and continuously improving intelligent systems that bridge the gap between research and real-world applications.",
    ],
    highlights: [],
    stats: [
      { value: 12, suffix: "+", label: "AI Projects" },
      { value: 8, suffix: "+", label: "LLM Systems" },
      { value: 4, suffix: "+", label: "RAG / Agent Systems" },
    ],
    image: "",
  },

  experience: {
    items: [
      {
        id: "exp-sla-trainee",
        company: "SLA Institute",
        role: "Data Science Trainee",
        duration: "Mar 2025 – Aug 2025",
        location: "Chennai, Tamil Nadu",
        description:
          "Intensive training in Data Science, Machine Learning, and AI application development with hands-on projects.",
        technologies: [],
        achievements: [
          "Built end-to-end ML pipelines with Python, Pandas, and Scikit-learn",
          "Developed LLM-powered applications using LangChain and RAG architecture",
          "Worked with vector databases (FAISS, ChromaDB) for semantic search systems",
        ],
        tag: "Training",
        color: "#6366f1",
      },
      {
        id: "exp-btech-ai-ds",
        company: "Annai Mira College of Engineering and Technology",
        role: "B.Tech in AI & Data Science",
        duration: "Sep 2022 – May 2025",
        location: "Ranipet, Tamil Nadu",
        description:
          "Completed Bachelor of Technology in Artificial Intelligence and Data Science with a focus on ML, NLP, and deep learning.",
        technologies: [],
        achievements: [
          "Built Hate Speech Detection system using NLP and TF-IDF as capstone project",
          "Gained expertise in Python, Machine Learning, and Deep Learning",
          "Studied core AI concepts including NLP, model evaluation, and feature engineering",
        ],
        tag: "Education",
        color: "#38bdf8",
      },
      {
        id: "exp-diploma-mech",
        company: "Thanthai Periyar Government Polytechnic College",
        role: "Diploma in Mechanical Engineering",
        duration: "Mar 2020 – Mar 2022",
        location: "Vellore, Tamil Nadu",
        description:
          "Completed Diploma in Mechanical Engineering, building a strong analytical and problem-solving foundation before transitioning to AI.",
        technologies: [],
        achievements: [
          "Developed strong analytical thinking and engineering fundamentals",
          "Transitioned from mechanical engineering to AI & Data Science",
        ],
        tag: "Education",
        color: "#818cf8",
      },
    ],
  },

  projects: {
    items: [
      {
        id: "proj-langgraph-agents",
        title: "Multi-Agent AI Applications with LangGraph",
        description:
          "Built stateful multi-agent AI systems using LangGraph to enable collaborative AI workflows and intelligent automation.",
        tech: ["LangGraph", "LLM", "Multi-Agent Systems", "Python"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/Multi-Agent-AI-Applications-with-LangGraph",
        demo: "",
        featured: false,
        category: "LangGraph",
        order: 0,
        status: "completed",
        color: "#6366f1",
      },
      {
        id: "proj-pdf-rag",
        title: "PDF Query RAG System with LangChain & AstraDB",
        description:
          "Developed a Retrieval-Augmented Generation (RAG) system that enables querying PDF documents using LLMs, embeddings, and AstraDB vector database.",
        tech: ["RAG", "LangChain", "AstraDB", "LLM"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/PDF-Query-RAG-System-with-LangChain-AstraDB",
        demo: "",
        featured: false,
        category: "RAG",
        order: 1,
        status: "completed",
        color: "#38bdf8",
      },
      {
        id: "proj-insightstream",
        title: "InsightStream AI Web & YouTube Summarization",
        description:
          "AI-powered system that extracts and summarizes web articles and YouTube videos using LLMs to help users quickly understand long-form content.",
        tech: ["LLM", "NLP", "Content Summarization"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/InsightStream-AI-LLM-Powered-Web-YouTube-Summarization-System",
        demo: "",
        featured: false,
        category: "LLM",
        order: 2,
        status: "completed",
        color: "#38bdf8",
      },
      {
        id: "proj-web-miner",
        title: "Smart Web Data Miner with LLM Processing",
        description:
          "Developed an intelligent web data mining tool that scrapes online content and processes it using LLMs to extract structured insights.",
        tech: ["Web Scraping", "LLM", "NLP"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/Smart-Web-Data-Miner-with-LLM-Based-Content-Processing",
        demo: "",
        featured: false,
        category: "Web Scraping",
        order: 3,
        status: "completed",
        color: "#818cf8",
      },
      {
        id: "proj-sql-chatbot",
        title: "LLM-Powered SQL Database Chatbot",
        description:
          "Built a conversational AI chatbot that allows users to interact with SQL databases using natural language queries.",
        tech: ["LangChain", "SQL", "Streamlit", "LLM"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/LLM-Powered-SQL-Database-Chatbot-using-LangChain-and-Streamlit",
        demo: "",
        featured: false,
        category: "LangChain",
        order: 4,
        status: "completed",
        color: "#818cf8",
      },
      {
        id: "proj-hate-speech",
        title: "Hate Speech Detection using ML",
        description:
          "Machine learning model that detects and classifies hate speech in text using NLP techniques and supervised learning algorithms.",
        tech: ["Machine Learning", "NLP", "Text Classification"],
        image: "",
        video: "",
        github: "https://github.com/akshaytoni99/hate-speech-detection-using-machine-learning",
        demo: "",
        featured: false,
        category: "Machine Learning",
        order: 5,
        status: "completed",
        color: "#4338ca",
      },
    ],
  },

  skills: {
    categories: [
      {
        id: "skills-languages-data",
        name: "Languages & Data",
        color: "#6366f1",
        skills: [
          { name: "Python", level: 85, icon: "/logos/python.svg" },
          { name: "SQL", level: 85, icon: "SQL" },
          { name: "Pandas", level: 85, icon: "Pd" },
          { name: "NumPy", level: 85, icon: "Np" },
          { name: "Git", level: 85, icon: "Git" },
        ],
      },
      {
        id: "skills-ml-dl",
        name: "Machine Learning & Deep Learning",
        color: "#818cf8",
        skills: [
          { name: "Scikit-learn", level: 85, icon: "Sk" },
          { name: "TensorFlow", level: 85, icon: "/logos/tensorflow.svg" },
          { name: "PyTorch", level: 85, icon: "/logos/pytorch.svg" },
          { name: "spaCy", level: 85, icon: "sC" },
          { name: "Matplotlib", level: 85, icon: "Mp" },
        ],
      },
      {
        id: "skills-genai-llms",
        name: "Generative AI & LLMs",
        color: "#38bdf8",
        skills: [
          { name: "GPT", level: 85, icon: "/logos/openai.svg" },
          { name: "Claude", level: 85, icon: "/logos/claude.svg" },
          { name: "Gemini", level: 85, icon: "/logos/gemini.svg" },
          { name: "LLaMA", level: 85, icon: "/logos/llama.svg" },
          { name: "Mistral", level: 85, icon: "/logos/mistral.svg" },
        ],
      },
      {
        id: "skills-ai-frameworks",
        name: "AI Frameworks & Tools",
        color: "#38bdf8",
        skills: [
          { name: "LangChain", level: 85, icon: "/logos/langchain.svg" },
          { name: "LangGraph", level: 85, icon: "/logos/langgraph.svg" },
          { name: "HF Transformers", level: 85, icon: "/logos/huggingface.svg" },
          { name: "Groq", level: 85, icon: "/logos/groq.svg" },
          { name: "Streamlit", level: 85, icon: "/logos/streamlit.svg" },
        ],
      },
      {
        id: "skills-retrieval-systems",
        name: "Retrieval & AI Systems",
        color: "#818cf8",
        skills: [
          { name: "RAG", level: 85, icon: "RAG" },
          { name: "FAISS", level: 85, icon: "F" },
          { name: "ChromaDB", level: 85, icon: "C" },
          { name: "AstraDB", level: 85, icon: "A" },
          { name: "Embeddings", level: 85, icon: "E" },
          { name: "Multi-Agent", level: 85, icon: "MA" },
        ],
      },
    ],
  },

  certifications: {
    items: [
      {
        id: "cert-genai-rag-udemy",
        title: "Generative AI, LLMs & RAG using LangChain and Hugging Face",
        issuer: "Udemy",
        date: "",
        image: "",
        credentialUrl: "",
        color: "#6366f1",
      },
      {
        id: "cert-python-basics",
        title: "Certified Python Basics",
        issuer: "Pantech Solutions",
        date: "",
        image: "",
        credentialUrl: "",
        color: "#38bdf8",
      },
      {
        id: "cert-ml-dl-ai-master",
        title: "Certified Master in Machine Learning, Deep Learning & AI",
        issuer: "Pantech Solutions",
        date: "",
        image: "",
        credentialUrl: "",
        color: "#38bdf8",
      },
      {
        id: "cert-data-science-sla",
        title: "Data Science Certification with Grade 'A'",
        issuer: "SLA Institute",
        date: "",
        image: "",
        credentialUrl: "",
        color: "#818cf8",
      },
      {
        id: "cert-python-ds-ibm",
        title: "Python for Data Science",
        issuer: "IBM",
        date: "",
        image: "",
        credentialUrl: "",
        color: "#818cf8",
      },
    ],
  },

  education: {
    items: [
      {
        id: "edu-btech-ai-ds",
        degree: "B.Tech in AI & Data Science",
        institution: "Annai Mira College of Engineering and Technology",
        duration: "Sep 2022 – May 2025",
        grade: "",
        description:
          "Completed Bachelor of Technology in Artificial Intelligence and Data Science with a focus on ML, NLP, and deep learning.",
      },
      {
        id: "edu-diploma-mech",
        degree: "Diploma in Mechanical Engineering",
        institution: "Thanthai Periyar Government Polytechnic College",
        duration: "Mar 2020 – Mar 2022",
        grade: "",
        description:
          "Completed Diploma in Mechanical Engineering, building a strong analytical and problem-solving foundation before transitioning to AI.",
      },
    ],
  },

  contact: {
    email: "akshaytoni99@gmail.com",
    phone: "",
    location: "",
    github: "https://github.com/akshaytoni99",
    linkedin: "https://www.linkedin.com/in/akshaytoni99/",
    socials: [
      { platform: "GitHub", url: "https://github.com/akshaytoni99" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/akshaytoni99/" },
      { platform: "Email", url: "mailto:akshaytoni99@gmail.com" },
    ],
  },

  testimonials: {
    items: [],
  },

  seo: {
    title: "Akshay Kumar | Generative AI Engineer",
    description: "",
    keywords: "",
    ogImage: "",
    favicon: "/favicon.svg",
  },

  theme: {
    primary: "#6366f1",
    accent: "#38bdf8",
    background: "#030712",
    animationsEnabled: true,
  },

  resume: {
    url: "/Akshay_BTech_AI_DS_Resume.pdf",
    filename: "Akshay_BTech_AI_DS_Resume.pdf",
    uploadedAt: null,
  },
};
