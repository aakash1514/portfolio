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
  linkedin: "https://www.linkedin.com/in/aakash-devkar",
  resume: "/Aakash_Devkar_Resume.pdf",
  url: "https://aakash-devkar.vercel.app",
};

// Short label parts, e.g. "AI Engineer · Full-Stack Developer · Pune, India".
export const tagline = [...site.role.split(" & "), site.location];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "AI & agents",
    items: [
      "LangGraph",
      "LangChain",
      "MCP",
      "RAG",
      "Embeddings",
      "Multi-agent systems",
      "LLM evals",
      "Guardrails",
      "Prompt-injection defence",
      "Prompt engineering",
      "LangSmith",
      "Groq",
      "Amazon Bedrock",
      "Bedrock Guardrails",
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
      "asyncio",
      "Flask",
      "Django",
      "Django Ninja",
      "Django Channels",
      "NestJS",
      "Node.js",
      "Express",
      "Celery",
      "BullMQ",
      "Kafka",
      "Redis Streams",
      "Event-driven architecture (outbox)",
      "WebSockets",
      "Socket.IO",
      "REST APIs",
      "Swagger / OpenAPI",
      "JWT/OAuth",
      "RBAC",
      "GitHub Apps",
      "Payment gateways (Razorpay)",
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
      "TanStack Query",
      "Zustand",
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
      "AWS (Cloud Practitioner Essentials course)",
      "S3",
      "EC2",
      "ECS",
      "ECS Fargate",
      "ECR",
      "EFS",
      "ALB",
      "CloudFront",
      "SNS",
      "RDS",
      "IAM",
      "Secrets Manager",
      "SSM",
      "CloudWatch",
      "Terraform",
      "Docker",
      "Nginx",
      "GitHub Actions",
      "Bash",
      "Vercel",
    ],
  },
  {
    group: "Quality & observability",
    items: [
      "pytest",
      "Jest",
      "Vitest",
      "Hypothesis",
      "k6",
      "Postman",
      "mypy",
      "Ruff",
      "Trivy",
      "OpenTelemetry",
      "Jaeger",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    group: "Ways of working",
    items: ["Agile / Scrum", "Jira"],
  },
  {
    group: "Communication",
    items: [
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
      "Worked in Agile sprints tracked in Jira on a production AI product.",
    ],
  },
  {
    period: "Feb – Jun 2026",
    role: "Software Developer Intern",
    org: "Apprely Technologies",
    points: [
      "Built the Solapur Municipal Corporation complaints system end to end, from API design to production deployment.",
      "Built NestJS + TypeORM + PostgreSQL REST APIs with JWT and OTP login, role-based guards and file uploads, plus a React Admin panel for staff.",
      "Built the public website with Next.js, Tailwind CSS, shadcn/ui and Material UI.",
      "Deployed to the client's on-premises Windows server (Docker on WSL2, Nginx reverse proxy, wildcard SSL) and wrote the deployment runbook.",
      "Worked in Agile sprints tracked in Jira; documented the APIs with Swagger and tested them with Postman.",
    ],
  },
  {
    period: "2022 – 2026",
    role: "B.Tech, Computer Science",
    org: "NKOCET Solapur (DBATU)",
    points: [
      "Co-inventor on a published patent, Roadwatch: AI-driven monitoring analytics for transportation networks (Application No. 202521048351, June 2025). Built the data pipeline and AI model, designed the architecture and wrote the technical documentation for filing.",
      "Major project: AgriFlow, a four-role agri marketplace on web and mobile with ML price and demand forecasts, built and deployed solo.",
    ],
  },
];
