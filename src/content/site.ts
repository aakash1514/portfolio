// Site-wide settings. Empty strings hide the related button/link.
export const site = {
  name: "Aakash Devkar",
  role: "AI Engineer & Full-Stack Developer",
  location: "Pune, India",
  headline: "I build AI agents and the full-stack products around them.",
  intro:
    "AI engineer and full-stack developer. I design LangGraph agents and RAG pipelines, then build the APIs, databases, frontends and deployments that turn them into products. My rule: the LLM interprets, deterministic code decides, and every number is checked before anyone sees it.",
  github: "https://github.com/aakash1514",
  email: "aakashdevkar777@gmail.com",
  linkedin: "https://linkedin.com/in/aakash-devkar-2a7810327",
  resume: "/Aakash_Devkar_Resume.pdf",
  url: "https://aakash-devkar.vercel.app", // TODO: update after the first Vercel deploy
};

// Short label parts, e.g. "AI Engineer · Full-Stack Developer · Pune, India".
export const tagline = [...site.role.split(" & "), site.location];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "AI & agents",
    items: [
      "LangGraph",
      "LangChain",
      "CrewAI",
      "MCP",
      "RAG",
      "Multi-agent systems",
      "LLM evals",
      "Guardrails",
      "Prompt engineering",
      "LangSmith",
      "Groq",
      "Amazon Bedrock",
      "Hugging Face",
    ],
  },
  {
    group: "ML",
    items: ["PyTorch", "scikit-learn", "XGBoost", "FinBERT", "pandas", "NumPy"],
  },
  {
    group: "Backend",
    items: [
      "Python",
      "FastAPI",
      "Django",
      "Django Ninja",
      "NestJS",
      "Node.js",
      "Express",
      "Celery",
      "BullMQ",
      "Kafka",
      "WebSockets",
      "Socket.IO",
      "REST APIs",
      "JWT/OAuth",
      "Java + Spring Boot (learning)",
    ],
  },
  {
    group: "Frontend & mobile",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Material UI",
      "Redux Toolkit",
      "TanStack Query",
      "React Native (Expo)",
    ],
  },
  {
    group: "Data",
    items: ["PostgreSQL", "TimescaleDB", "Redis", "Qdrant", "ChromaDB", "MongoDB", "SQLite", "TypeORM", "MinIO"],
  },
  {
    group: "Cloud & DevOps",
    items: [
      "AWS (Cloud Practitioner)",
      "Lambda",
      "API Gateway",
      "S3",
      "EC2",
      "ECS",
      "ECR",
      "DynamoDB",
      "SQS",
      "SNS",
      "RDS",
      "IAM",
      "CloudWatch",
      "Step Functions",
      "EventBridge",
      "OpenSearch",
      "Docker",
      "Kubernetes",
      "Nginx",
      "GitHub Actions",
      "Vercel",
      "Railway",
    ],
  },
  {
    group: "Quality & observability",
    items: ["pytest", "Jest", "Hypothesis", "k6", "OpenTelemetry", "Jaeger", "Prometheus", "Grafana"],
  },
  {
    group: "Leadership & communication",
    items: [
      "Team leadership (8 people)",
      "Technical writing & runbooks",
      "Patent documentation",
      "Presenting to clients",
      "Hackathon organising",
    ],
  },
];

export const experience: {
  period: string;
  role: string;
  org: string;
  points: string[];
}[] = [
  {
    period: "Jun – Aug 2026",
    role: "AI Engineer Intern",
    org: "Genesis Technologies",
    points: [
      "Built a RAG pipeline and multi-agent orchestration with tiered memory for AuraSync, a production AI hiring platform, on Django microservices with Qdrant, ChromaDB, Redis and Kafka.",
      "Added a Redis-based idempotency layer so retried agent and pipeline requests never double-process.",
      "Hardened a browser-based candidate assessment pipeline (webcam and microphone capture to a facial-analysis service), fixing camera-constraint and audio-signal issues in production.",
      "Researched Indian compliance for the product launch (DPDP Act, RPWD Act accessibility) and handled SEO.",
    ],
  },
  {
    period: "Feb – Jun 2026",
    role: "Software Developer Intern",
    org: "Apprely Technologies",
    points: [
      "Led a team of 8 building the Solapur Municipal Corporation complaints system, from API design to production.",
      "Built NestJS + TypeORM + PostgreSQL REST APIs with JWT and OTP login, role-based guards and file uploads, plus a React Admin panel for staff.",
      "Built the public website with Next.js, Tailwind CSS, shadcn/ui and Material UI.",
      "Deployed to the client's on-premises Windows server (Docker on WSL2, Nginx reverse proxy, wildcard SSL) and wrote the deployment runbook.",
    ],
  },
  {
    period: "2022 – 2026",
    role: "B.Tech, Computer Science",
    org: "NKOCET Pune (DBATU)",
    points: [
      "Co-inventor on a published patent, Roadwatch: AI-driven monitoring analytics for transportation networks (Application No. 202521048351, June 2025). Built the data pipeline and AI model, designed the architecture and wrote the technical documentation for filing.",
      "Major project: AgriFlow, a four-role agri marketplace on web and mobile with ML price and demand forecasts.",
    ],
  },
];
