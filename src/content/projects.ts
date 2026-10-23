export type Step = { name: string; detail: string };

export type HardPart = {
  title: string;
  problem: string;
  fix: string;
  verified: string;
};

export type Project = {
  slug: string;
  title: string;
  kind: string;
  period: string;
  tagline: string;
  /** Up to 3 headline numbers shown on the card and page header. */
  metrics: { value: string; label: string }[];
  problem: string;
  architecture: { title: string; steps: Step[]; note?: string };
  built: string[];
  hardParts: HardPart[];
  results?: { label: string; value: string }[];
  /** A short honest caveat shown under the results. */
  caveat?: string;
  stack: string[];
  /** Set public: true once the repo is public; the GitHub button only shows then. */
  repo?: { url: string; public: boolean };
  /** Set when a live demo exists; the button is hidden while empty. */
  live?: string;
  note?: string;
};

export const projects: Project[] = [
  {
    slug: "quantaxis",
    title: "QuantAxis",
    kind: "Agentic AI · Trading",
    period: "2026",
    tagline:
      "A fail-closed LangGraph trading pipeline where LLMs interpret macro text, deterministic code decides, and a human approves every order.",
    metrics: [
      { value: "0 / 1,790", label: "backtest–live mismatches" },
      { value: "77% → 93%", label: "LLM eval pass rate" },
      { value: "98.9%", label: "test coverage on the core" },
    ],
    problem:
      "LLM trading bots often let the model set prices, sizes or stops, and nobody can audit or reproduce the result. QuantAxis limits the LLM to scored, cited, validated macro bias. Every number comes from tested deterministic code, every gate fails closed, and an order needs a signed risk token plus human approval. Live and backtest runs share one decision engine.",
    architecture: {
      title: "Decision pipeline",
      steps: [
        { name: "Ingest", detail: "Celery beat pulls MT5 bars, FRED, calendar, RSS (FinBERT-scored) and CFTC data into TimescaleDB" },
        { name: "Bias graph", detail: "LangGraph + Groq gpt-oss-120b (20b fallback) produce validated, cited currency bias" },
        { name: "Decision graph", detail: "At each H1 close: regime → sentiment → bias → intermarket → event guard → conviction → trigger" },
        { name: "Risk veto", detail: "Deterministic sizing and limits; signs an HMAC risk token" },
        { name: "Human approval", detail: "Graph pauses with interrupt(); operator approves with TOTP within 12 minutes" },
        { name: "Execution", detail: "Re-checks token, risk, plan hash and kill switch, then places an idempotent order via the MT5 bridge" },
        { name: "Journal & review", detail: "Outbox → Redis Streams → WebSocket UI; closed trades get an LLM review grounded in facts" },
      ],
      note: "14 services in Docker Compose. OpenTelemetry → Jaeger, Prometheus → Grafana, LangSmith on the LLM graphs.",
    },
    built: [
      "Django 5 control plane with 7 bounded-context apps, a Django Ninja API with JWT, and Celery on separate queues for agents, trading, ingest and sentiment.",
      "Data layer on TimescaleDB: 1-minute bid/ask history, FRED macro series, an economic calendar, live MT5 bars, RSS headlines scored by a local FinBERT model, CFTC positioning and VIX/SPX.",
      "Deterministic core: indicators, regime rules, intermarket confirmation, event guard, conviction scoring and a risk engine with portfolio limits, circuit breakers and HMAC-signed risk tokens, covered by property-based tests.",
      "Two LangGraph graphs: bias_graph for validated, cited macro bias and decision_graph, which pauses for human approval and is checkpointed in Postgres.",
      "MT5 bridge in FastAPI on Windows: HMAC-signed requests with nonce replay protection, demo accounts only, symbol allowlist, idempotent orders.",
      "Trade management with TP1 partials, breakeven, reconciliation every 60 s, a kill switch and TOTP on approve and flatten.",
      "Live updates via a transactional outbox → Redis Streams → Django Channels WebSocket → React SPA.",
      "Observability with OpenTelemetry, Jaeger, Prometheus, 2 Grafana dashboards and 7 alert rules; read-only MCP servers for market and macro data.",
      "A 30-case pre-registered LLM eval with a CI regression gate. Forward test running on an MT5 demo account since 19 Oct 2026.",
    ],
    hardParts: [
      {
        title: "MT5 silently cut order comments to 16 characters",
        problem:
          "The first live smoke order filled, but the bridge returned 504 because it couldn't find the deal. The broker had stored a truncated comment, breaking idempotent order lookup.",
        fix: "Order ids became 13-character base32 digests, comment length is checked before sending, and lookup goes ticket → exact comment + magic number → unique truncated match, otherwise “unknown”, which fails closed.",
        verified: "A re-run of the live smoke test filled, found the order by its short id, closed it and ended flat.",
      },
      {
        title: "Backtest and live runs had to agree exactly",
        problem: "A re-run gave 18 trades instead of 13: cached config was read before the config files were swapped.",
        fix: "Each run reads one config snapshot, gate logic moved into one shared decision module used by both the graph and the backtester, and a results hash changes only when outcomes change.",
        verified: "A parity test over 1,790 decision points and 5 scenarios shows 0 mismatches, and the results hash reproduces after every later change.",
      },
      {
        title: "Pre-registered LLM evals caught a silent prompt injection",
        problem: "Shape and grounding validators can't tell whether a model was manipulated.",
        fix: "Eval cases are dated 2031–2037 so the model can't answer from training data; metrics and thresholds are frozen before any live call, and CI replays recorded cassettes.",
        verified: "A forged-source case passed every validator but gave wrong signs. It's documented as a known limitation, and in production news text never reaches the LLM.",
      },
    ],
    results: [
      { label: "Python tests", value: "1,125+, 98.9% coverage on the core (gate 85%)" },
      { label: "Backtest–live parity", value: "1,790 decision points, 0 mismatches" },
      { label: "LLM eval, prompt v4 → v5", value: "pass 77% → 93%, stable decisions 38% → 67%" },
      { label: "LLM latency", value: "mean 1.7 s per call" },
      { label: "Surface", value: "29 API routes + WebSocket, 14 bridge routes, 14 services" },
    ],
    caveat: "Backtests have 13 trades per split, which is too few to show an edge. Forward-test results aren't in yet.",
    stack: ["Python", "Django", "Django Ninja", "Celery", "LangGraph", "LangSmith", "Groq", "MCP", "FinBERT", "TimescaleDB", "Redis", "FastAPI", "MetaTrader 5", "OpenTelemetry", "Grafana", "React", "TypeScript", "Docker"],
    repo: { url: "https://github.com/aakash1514/quantaxis", public: false },
  },
  {
    slug: "code-review-agent",
    title: "Autonomous Code Review Agent",
    kind: "Multi-agent · RAG",
    period: "2026",
    tagline:
      "Four specialist AI agents review every GitHub pull request in parallel, with whole-codebase context, and block the merge on critical issues.",
    metrics: [
      { value: "4", label: "agents in parallel" },
      { value: "14–35 s", label: "per PR review (observed)" },
      { value: "110 / 183", label: "functions / call edges indexed" },
    ],
    problem:
      "Most AI reviewers only see the diff, so they miss how the changed code fits the rest of the system. A useful reviewer needs to know who calls the changed function and what similar code already exists, and it must never block a merge by mistake.",
    architecture: {
      title: "Review pipeline",
      steps: [
        { name: "PR event", detail: "GitHub App webhook, HMAC-verified (bad signatures get 401)" },
        { name: "Background job", detail: "SQLite job store, duplicate guard, stale-commit handling, stuck-job sweeper" },
        { name: "Context retrieval", detail: "Qdrant vectors of function/class chunks + AST call graph" },
        { name: "4 agents in parallel", detail: "Security, Architecture, Test coverage, Documentation; 45 s timeout each" },
        { name: "Synthesizer", detail: "Dedupe, group, rank; Llama 3.3 70B summary with deterministic fallback" },
        { name: "Merge gate", detail: "Any CRITICAL finding sets a failed commit status; humans can approve or block" },
      ],
      note: "A React dashboard shows each agent's progress live over WebSocket.",
    },
    built: [
      "FastAPI webhook service installed as a GitHub App that verifies X-Hub-Signature-256 and runs reviews in background tasks.",
      "Job safety: duplicate-job guard, a sweeper that fails jobs stuck over 900 s, and stale-commit handling so only the newest commit on a PR counts.",
      "Codebase-aware RAG: Python's ast module splits code into function and class chunks, embedded with granite-embedding-97m into Qdrant, plus a call graph that rebuilds on every push to the default branch.",
      "Synthesizer that de-duplicates, groups and ranks findings, summarises them with Llama 3.3 70B and posts native GitHub PR comments, with a deterministic markdown fallback.",
      "Human-in-the-loop merge gate through GitHub commit statuses, with approve/block overrides from the dashboard.",
      "React 19 dashboard with GitHub OAuth login, live WebSocket progress, a Monaco side-by-side diff viewer and a React Flow call graph.",
    ],
    hardParts: [
      {
        title: "False merge blocks",
        problem: "The Architecture agent sometimes rated routine edge cases as CRITICAL, which would wrongly block pull requests.",
        fix: "Two layers: a severity anchor in the system prompt plus a deterministic cap in code for routine edge-case findings.",
        verified: "Clean across 4 consecutive live runs.",
      },
      {
        title: "Cross-repo data leaks in the vector store",
        problem: "Two repos with the same file::function name overwrote each other's vectors, so searches could return another repo's code.",
        fix: "The repo is part of the Qdrant point-id hash, and every search filters by repo.",
        verified: "Tested by indexing a second repo alongside the main one.",
      },
      {
        title: "Call-graph name collisions",
        problem: "self.method() calls were linked to same-named methods in other classes.",
        fix: "Calls are scoped to the caller's own class, with a global-name fallback for inherited methods.",
        verified: "A synthetic two-class test with shared method names.",
      },
    ],
    results: [
      { label: "Test repo PR, run 1", value: "14.1 s, 12 findings" },
      { label: "Test repo PR, run 2", value: "34.4 s, 11 findings" },
      { label: "Self-review of its own codebase", value: "about 6 min, 45 findings" },
      { label: "Models", value: "Llama 3.3 70B + Llama 3.1 8B on Groq, each the other's fallback" },
    ],
    caveat: "Timings are observed from live runs, not benchmarks.",
    stack: ["Python", "FastAPI", "Groq", "Llama 3.3", "Qdrant", "Hugging Face", "SQLite", "GitHub Apps", "WebSockets", "React", "Monaco", "React Flow"],
    repo: { url: "https://github.com/aakash1514/code-review-agent", public: true },
  },
  {
    slug: "forexedge",
    title: "ForexEdge",
    kind: "Microservices · LLM agent",
    period: "2026",
    tagline:
      "A forex paper-trading platform on 19M real minute bars, with a backtester verified to the cent and a research agent whose numbers are machine-checked.",
    metrics: [
      { value: "19.2M", label: "real minute bars" },
      { value: "689 / 689", label: "trades reproduced in SQL" },
      { value: "9 / 10", label: "research agent live eval" },
    ],
    problem:
      "Retail trading tools often show numbers nobody can check: simulated prices, backtests you can't audit, and AI answers with made-up figures. ForexEdge only presents numbers it can prove: history validated against FRED, backtests reproduced independently in SQL, and every LLM figure checked by code against real tool results.",
    architecture: {
      title: "Services",
      steps: [
        { name: "market-service", detail: "Ticks → Kafka → TimescaleDB + Redis latest price" },
        { name: "order-service", detail: "Gates: instrument → market open → spread → SL/TP → margin → risk; events after commit" },
        { name: "domain-service", detail: "Pip value, margin, swaps, session clock, spread monitor, FOMC/ECB calendar" },
        { name: "ws-gateway", detail: "Socket.IO live P&L + BullMQ backtester → MinIO" },
        { name: "ml-service", detail: "Walk-forward LSTM evaluation, read-only API" },
        { name: "research-agent", detail: "LangGraph ↔ Groq gpt-oss-120b, 7 MCP tools, deterministic verifier" },
      ],
      note: "Plus auth-service and a Next.js frontend. Nx monorepo; Kafka in KRaft mode.",
    },
    built: [
      "Real Dukascopy minute-level bid/ask history for EUR/USD, GBP/USD, USD/JPY and XAU/USD (2010–2022), with M5 to D1 rollups and validation against FRED.",
      "Seven backend services in an Nx monorepo (5 NestJS, 2 Python) plus a Next.js frontend.",
      "Paper trading with SL/TP, stop-out, and gates for instrument, market hours, spread, margin and risk limits.",
      "Price safety: with no live feed, order entry is disabled; simulated prices appear only when switched on and are labelled SIMULATED.",
      "BullMQ backtester (MA crossover, London breakout) reporting USD equity, drawdown and Sharpe, with a SQL verification command.",
      "LangGraph research agent over a FastMCP server with 7 read-only tools, a least-privilege database login and per-user scoping.",
      "Frontend pages: trading terminal, backtest, economic calendar, model evaluation and research.",
    ],
    hardParts: [
      {
        title: "Stopping the LLM from inventing numbers",
        problem: "An LLM summarising market data can make numbers up, and they look identical to real ones.",
        fix: "The agent must finish with a submit_report tool call where every claim cites a tool call. A plain-code verifier checks each number against the real tool result (prices rounded to the pair's decimals, USD exact); one retry, then “could not verify”.",
        verified: "A 10-question live eval with independently computed answers scored 8/10, 9/10 and 9/10, with no per-question tuning.",
      },
      {
        title: "Backtester reproduced to the cent",
        problem: "Floating-point ties fired crossovers one bar early, an end date dropped the last day, and pip-based drawdown showed 93% for gold.",
        fix: "Exact integer prefix sums, inclusive calendar days, and USD equity marked to market at every bar.",
        verified: "An independent SQL reproduction from the raw minute table matches every trade and metric: 689 of 689 across EUR/USD, XAU/USD and USD/JPY.",
      },
      {
        title: "Kafka consumers trusting fields nobody sent",
        problem: "The spread gate never blocked an order because it read a field the producer never sent, and treated “missing” as “allow”.",
        fix: "Typed, validating message contracts per topic, a shared market clock, and a spread gate based on each instrument's average spread.",
        verified: "Tests run on captured real Kafka messages.",
      },
    ],
    results: [
      { label: "Data", value: "19.2M bars, median 0.4–1.6 pips vs FRED, 7.5× compression" },
      { label: "Backtest verification", value: "689 / 689 trades match independent SQL" },
      { label: "Research agent", value: "9/10 live eval, 1.5–6.5K tokens per question" },
      { label: "ML", value: "51.6–51.8% accuracy, below spread break-even" },
      { label: "Tests", value: "590 Jest + 198 pytest, 18 Nx projects passing" },
    ],
    caveat: "The LSTM doesn't beat trading costs, and the platform says so instead of hiding it.",
    stack: ["NestJS", "TypeScript", "Nx", "Kafka", "TimescaleDB", "Redis", "BullMQ", "Socket.IO", "MinIO", "Next.js", "Python", "PyTorch", "LangGraph", "MCP", "Groq"],
    repo: { url: "https://github.com/aakash1514/algo_trading_forex", public: false },
  },
  {
    slug: "agriflow",
    title: "AgriFlow",
    kind: "Full-stack · ML",
    period: "Mar – Jun 2025",
    tagline:
      "A four-role farm-to-buyer marketplace on web and mobile, with agent-verified crop quality, Razorpay payments and ML price forecasts.",
    metrics: [
      { value: "21×", label: "faster p95 on admin orders" },
      { value: "38.7% → 0%", label: "error rate at 50 users" },
      { value: "4×", label: "faster price predictions" },
    ],
    problem:
      "Farmers often sell through middlemen without knowing a fair price or whether buyers will trust their crop quality. AgriFlow connects farmers and buyers directly: field agents inspect crops before they're listed, buyers pay online, and forecasts support pricing.",
    architecture: {
      title: "System",
      steps: [
        { name: "Web + mobile", detail: "React/TypeScript web app and Expo app share one API config" },
        { name: "Express API", detail: "54 routes, JWT + role guards, PostgreSQL (9 tables)" },
        { name: "Razorpay", detail: "Create order → checkout → server-side signature verification" },
        { name: "Flask ML service", detail: "Price (Random Forest) and demand (XGBoost) models cached in memory" },
      ],
    },
    built: [
      "Monorepo with four apps: Node.js + Express + PostgreSQL API, React + TypeScript web app, Expo (React Native) mobile app and a Flask ML service.",
      "Four roles on web and mobile: farmer (list crops), field agent (quality inspections, deliveries), admin (approve listings, KYC, transport, payouts) and buyer (marketplace, orders, payments).",
      "Crop flow pending → inspected → approved → listed → sold, and order flow pending → confirmed → assigned → in-transit → delivered.",
      "Razorpay checkout with server-side payment verification and a payment audit log.",
      "Price prediction (scikit-learn Random Forest, min/max/modal price) and demand prediction (XGBoost) behind the Express API.",
    ],
    hardParts: [
      {
        title: "Unpaginated endpoints and a data leak",
        problem: "The admin orders endpoint returned all 10,000 orders (6.4 MiB), failing 38.7% of requests at 50 users, and the buyer orders endpoint returned every buyer's orders.",
        fix: "LIMIT/OFFSET pagination with counts, and role-scoped queries.",
        verified: "k6 before/after on the same seeded database: p95 20.5 s → 974 ms, errors 38.7% → 0%, buyers see only their own orders.",
      },
      {
        title: "Model reloaded on every request",
        problem: "Each price request loaded the 208 MB model from disk, costing about 0.65 s and 216 MB of memory.",
        fix: "A module-level model cache, preloaded at startup.",
        verified: "200 sequential requests × 3 runs: median price latency 739 ms → 184 ms.",
      },
      {
        title: "Checking the ML claims honestly",
        problem: "A random-split notebook R² of 0.90 is weak evidence for a time-series forecast.",
        fix: "A time-based holdout (train ≤ 2020, test 2021–23) compared against naive baselines.",
        verified: "The retrained model reached R² 0.967 but still lost to a “last year's value” baseline, so no accuracy claim is made.",
      },
    ],
    results: [
      { label: "Admin orders p95", value: "20.5 s → 974 ms" },
      { label: "Admin orders throughput", value: "4.9 → 81.5 req/s" },
      { label: "Admin crops p95", value: "4.5 s → 248 ms" },
      { label: "Price prediction median", value: "739 → 184 ms" },
      { label: "Create order", value: "576 req/s, 0 errors over ~103K writes" },
    ],
    caveat: "Measured with k6 at 50 concurrent users on one laptop over localhost.",
    stack: ["Node.js", "Express", "PostgreSQL", "React", "TypeScript", "Expo", "Python", "Flask", "scikit-learn", "XGBoost", "Razorpay", "k6"],
    repo: { url: "https://github.com/aakash1514/Major_prj", public: true },
  },
  {
    slug: "smc-complaints",
    title: "Municipal Complaints System",
    kind: "Production · Client work",
    period: "Feb – Jun 2026",
    tagline:
      "A complaints platform for the Solapur Municipal Corporation, built and deployed end to end during my Apprely internship.",
    metrics: [
      { value: "8", label: "people on the team I led" },
      { value: "On-prem", label: "production deployment" },
    ],
    problem:
      "Citizens had no simple way to raise and track civic complaints, and staff had no single place to assign and resolve them.",
    architecture: {
      title: "System",
      steps: [
        { name: "Citizen site", detail: "Next.js, Tailwind CSS, shadcn/ui, Material UI" },
        { name: "NestJS API", detail: "JWT + OTP login, role guards, photo uploads; TypeORM + PostgreSQL" },
        { name: "Staff admin", detail: "React Admin panel to assign and resolve complaints" },
        { name: "On-prem server", detail: "Docker on WSL2, Nginx reverse proxy, wildcard SSL" },
      ],
    },
    built: [
      "REST APIs in NestJS, TypeORM and PostgreSQL, built with a colleague.",
      "JWT and OTP login, role-based guards for citizens, staff and admins, and file uploads for complaint photos.",
      "A React Admin panel for staff and the public website in Next.js.",
      "A migration design for the Birth and Death Certificate Portal from .NET to NestJS and Next.js.",
    ],
    hardParts: [
      {
        title: "First production deployment on a Windows server",
        problem: "The client's on-premises server ran Windows, with no ready Linux hosting.",
        fix: "Docker on WSL2 with custom networking, Nginx as reverse proxy, wildcard SSL, domain and IP setup, and PostgreSQL.",
        verified: "Went live for the corporation; the full process is documented in a runbook the team could repeat.",
      },
    ],
    stack: ["NestJS", "TypeScript", "TypeORM", "PostgreSQL", "React Admin", "Next.js", "Tailwind CSS", "Docker", "Nginx"],
    note: "Client project: code isn't public.",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
