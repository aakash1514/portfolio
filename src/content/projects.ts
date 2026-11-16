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
  /** Set when a live demo exists; the button is hidden while empty or while status is "paused". */
  live?: string;
  /**
   * "paused": the deployment is switched off to save cloud costs. The live link and Live badge
   * are hidden (the URL above is kept), and the demo video becomes the main call to action.
   * Set back to "live" (or remove) to restore the live link.
   */
  status?: "live" | "paused";
  note?: string;
  /** Where and how it runs; shown as a "Deployment" section after Results. */
  deployment?: { label: string; detail: string }[];
  /** 2–4 key design decisions; shown after Architecture. */
  decisions?: { choice: string; alternative: string; why: string }[];
  /** Screenshots (files in /public) and a YouTube demo link; nothing renders while empty. */
  media?: { screenshots?: { src: string; alt: string }[]; video?: string };
};

/** True when the live demo link should be shown. */
export const isLive = (p: Project) => Boolean(p.live) && p.status !== "paused";

/** True when the project's deployment is paused and the demo video stands in for it. */
export const isPaused = (p: Project) => p.status === "paused";

export const projects: Project[] = [
  {
    slug: "quantaxis",
    title: "QuantAxis",
    kind: "Agentic AI · Trading",
    period: "Oct 2026 – Nov 2026",
    tagline: "LLMs interpret, code decides, a human approves: a fail-closed AI trading decision system.",
    metrics: [
      { value: "0 / 1,790", label: "backtest–live mismatches over H1 clock closes" },
      { value: "95%", label: "LLM eval sign accuracy (42 / 44)" },
      { value: "98.7%", label: "test coverage on the core packages" },
    ],
    problem:
      "LLMs read macro text such as central-bank statements, rate gaps and events well, but they aren't calibrated for numbers, can invent them, and can be steered by injected text. A trading system that lets a model set prices, sizes or stops is untestable and unsafe. QuantAxis uses the LLM only to turn text into bounded scores with citations. Everything numeric is deterministic and tested, every gate fails closed, and a person approves every order. Live and backtest runs share one decision engine.",
    architecture: {
      title: "Decision pipeline",
      steps: [
        { name: "Ingest", detail: "Celery workers pull MT5 bars, FRED, the economic calendar, RSS headlines (scored by a local FinBERT) and CFTC positioning into TimescaleDB" },
        { name: "Bias graph", detail: "LangGraph + Groq gpt-oss-120b (20b fallback) score USD, EUR and JPY from cited facts; every number must appear in a cited fact" },
        { name: "Decision graph", detail: "On each H1 close: regime → bias → sentiment → intermarket → event guard → conviction → SMC trigger; stale data or any error fails closed" },
        { name: "Risk veto", detail: "Deterministic sizing, portfolio limits and breakers; signs the exact order with an HMAC token (single-use nonce, 15 min TTL)" },
        { name: "Human approval", detail: "The graph pauses with interrupt(), checkpointed in Postgres; the operator approves with TOTP" },
        { name: "Execution", detail: "Re-checks risk, plan hash and kill switch, consumes the token's nonce, then places an idempotent order via the replay broker or the MT5 bridge" },
        { name: "Manage & journal", detail: "Every 60 s under an account lock: TP1 partial → breakeven → reconcile. Outbox → Redis Streams → WebSocket UI; closed trades get a grounded LLM review" },
      ],
      note: "14 services in Docker Compose locally, with OpenTelemetry → Jaeger, Prometheus → Grafana and LangSmith on the LLM graphs. The public demo serves only the database, Redis, the API and the SPA.",
    },
    decisions: [
      {
        choice: "Modular monolith (7 Django apps) with dedicated Celery worker pools",
        alternative: "Microservices, or one shared queue",
        why: "One developer and low load. Bulkhead queues mean a slow LLM call never delays an order or a stop move, and 9 import-linter contracts enforce the boundaries.",
      },
      {
        choice: "A fixed LangGraph state machine",
        alternative: "ReAct / supervisor agents or role-playing crews",
        why: "Deterministic order and cost, no LLM path to trading tools, pause and resume via interrupt(), and it can be backtested.",
      },
      {
        choice: "The LLM returns only scores and cited text",
        alternative: "The LLM proposes the whole trade",
        why: "No ungrounded numbers on the money path, and every citation can be checked in code.",
      },
      {
        choice: "One replay broker shared by live replay and the backtester",
        alternative: "A separate vectorised backtester",
        why: "One set of fill rules for both, checked by a parity test.",
      },
    ],
    built: [
      "Django 5 modular monolith with 7 bounded-context apps, a Django Ninja API with JWT (30 endpoints + 1 WebSocket), and Celery worker pools on separate queues for agents, trading, ingest and sentiment.",
      "Data layer on TimescaleDB hypertables: JForex CSV history, FRED macro series, an economic calendar, live MT5 bars, RSS headlines scored by a local FinBERT model, and CFTC COT positioning.",
      "Deterministic core: indicators, regime, smart-money-concepts structure, intermarket, event guard, conviction scoring with a sentiment guard (sentiment can shrink a bias but never flip it), and a risk engine with sizing, portfolio limits and breakers.",
      "LLM gateway with a Groq fallback chain, circuit breaker and token budget, plus a grounding validator and a prompt-injection sanitiser.",
      "Two LangGraph graphs: bias_graph for validated, cited currency bias, and decision_graph, which pauses with interrupt() for approval and is checkpointed in Postgres.",
      "Execution safety: HMAC-signed risk tokens with nonce replay protection, deterministic idempotent order ids, a kill switch, flatten, and TOTP on approve, release and flatten.",
      "A replay broker shared with the backtester (bid/ask fills, spread, slippage, stop-first, TP1 partial, breakeven) and an MT5 bridge in FastAPI on Windows with HMAC-signed requests.",
      "Live updates via a transactional outbox → Redis Streams → Django Channels WebSocket → React SPA, with one-time ticket auth.",
      "Observability with OpenTelemetry (redacting exporter), Jaeger, Prometheus and 2 Grafana dashboards; two read-only MCP servers for market and macro data.",
      "A pre-registered 30-case LLM eval suite that replays 148 recorded cassettes offline in CI behind a regression gate.",
    ],
    hardParts: [
      {
        title: "MT5 silently cut order comments to 16 characters",
        problem:
          "The first live smoke order filled, but the bridge answered 504 because it couldn't find the deal. The broker keeps only 16 comment characters, not the documented 31, so the 19-character idempotency id was cut and lookups could never match.",
        fix: "Order ids became a 13-character base32 digest, the bridge refuses an over-long comment before sending, and the fake terminal used in tests now truncates like the broker.",
        verified: "Regression tests for the short id, the length check and the truncating fake terminal; one broker contract suite runs against the replay, fake and MT5 bridge adapters.",
      },
      {
        title: "Backtest and live had to decide identically",
        problem:
          "The live LangGraph pipeline and the bar-by-bar backtester each had their own gate logic. Separately, re-running a pinned config gave 18 trades instead of 13, because cached config was read before the config files were swapped.",
        fix: "Gate steps and pending-setup resolution moved into one shared qa_core.decision module, each run parses one config snapshot, and runs are compared by a results hash over trades, summary, gates and costs only.",
        verified: "A parity test over 1,790 H1 clock closes and 5 scenarios shows 0 mismatches, and the train re-run reproduces its results hash (13 trades).",
      },
      {
        title: "A prompt injection that passed every validator",
        problem:
          "In an eval run on prompt v4, a fact carrying a fake operator rule made the model score JPY +1 and USD −1. The output was valid by shape, because schema and grounding checks validate form, not intent.",
        fix: "Prompt v5 added an input sanitiser (NFKC, invisible-character removal, rule-based removal repeated until clean) and an output screen that rejects drivers repeating input instructions. It was pre-registered and recorded once.",
        verified: "5 of 6 injection cases pass. One forged-source case still passes silently with wrong signs and is documented as a known limitation; the LLM has no tools, and orders still need a signed token and human approval.",
      },
    ],
    results: [
      { label: "Backtest–live parity", value: "1,790 H1 clock closes, 5 scenarios, 0 mismatches" },
      { label: "LLM eval (30 cases, prompt v5)", value: "pass 28/30 (93%), sign accuracy 42/44 (95%), stable pair decisions 14/21 (67%)" },
      { label: "Prompt-injection cases", value: "5 / 6 pass" },
      { label: "Backtest, train 2015–2019", value: "13 trades, win rate 30.8%, net −$204.74, profit factor 0.55, max DD 2.05%" },
      { label: "Backtest, test 2020–2022 (run once)", value: "13 trades, win rate 53.8%, net +$32.33, profit factor 1.08, max DD 2.97%" },
      { label: "End-to-end replay", value: "265 H1 closes, 425 decision runs; the approved XAUUSD short filled and exited exactly as in the backtest" },
      { label: "Python tests", value: "1,871 passed, 2 skipped; 98.68% coverage on qa_core, engine and agents (gate 85%)" },
      { label: "SPA tests", value: "58 passed" },
      { label: "Static checks", value: "mypy strict: 0 issues in 419 files; 9 / 9 import-linter contracts kept" },
      { label: "LLM latency", value: "mean 1.69 s per call (32 live calls)" },
      { label: "Public demo load test", value: "k6, 20 users × 2 min: p95 621 ms, 34.2 req/s, 0% errors" },
      { label: "Surface", value: "30 REST endpoints + 1 WebSocket, 19 Celery tasks, 14 services" },
    ],
    caveat:
      "Each backtest split has 13 trades, below the 30 needed to call a result meaningful; the test split is roughly break-even after costs. It shows the pipeline runs end to end, not that it has an edge. The MT5 demo forward test has been paused since 20 Oct 2026, with too few closed trades to publish. The public demo is a read-only replay snapshot with no workers or LLM calls.",
    deployment: [
      { label: "Provider", detail: "AWS ap-south-1 (Mumbai), public read-only demo" },
      { label: "Compute", detail: "One EC2 t3.small running Docker Compose with only the database, Redis, the API and the SPA (no workers, LLM calls or tracing)" },
      { label: "Database", detail: "TimescaleDB in a container on the instance, because RDS doesn't offer the TimescaleDB extension" },
      { label: "Images & config", detail: "ECR with immutable tags; config and secrets in SSM Parameter Store; Session Manager only, port 22 closed" },
      { label: "TLS & ops", detail: "Let's Encrypt, renewed automatically; CloudWatch Logs with 7-day retention; daily EBS snapshots, 7 kept" },
      { label: "CI/CD", detail: "GitHub Actions: ci on every push and pull request, evals when the agents or evals change, and a one-click deploy that pushes images to ECR via OIDC and updates the host through SSM Run Command" },
      { label: "Trading", detail: "The MT5 forward test ran locally (WSL2 + Windows bridge), not on AWS; paused since 20 Oct 2026" },
    ],
    stack: ["Python", "Django", "Django Ninja", "Celery", "LangGraph", "LangSmith", "Groq", "MCP", "FinBERT", "TimescaleDB", "Redis", "FastAPI", "MetaTrader 5", "OpenTelemetry", "Prometheus", "Grafana", "React", "TypeScript", "Docker", "AWS"],
    repo: { url: "https://github.com/aakash1514/quantaxis", public: false },
    live: "https://quantaxis.dev",
    status: "paused",
    media: {
      video: "https://youtu.be/eiLO20cUC7E",
      screenshots: [
        {
          src: "/projects/quantaxis/dashboard.webp",
          alt: "QuantAxis read-only demo dashboard: replayed XAUUSD and EURUSD prices, empty pending approvals and open positions, the kill switch with Engage and Flatten buttons, and the risk state with equity, daily and weekly loss limits and the loss streak.",
        },
        {
          src: "/projects/quantaxis/xauusd-decision-results.webp",
          alt: "XAUUSD instrument page with the stored decision results: regime trend down, pair bias −0.270 (short), intermarket confirm, and conviction 72.0 passed with its score breakdown, above the H1 chart.",
        },
        {
          src: "/projects/quantaxis/xauusd-chart-trade-levels.webp",
          alt: "XAUUSD H1 chart of closed replay bars with the stored entry, stop-loss, invalidation and TP1 levels drawn as horizontal lines.",
        },
        {
          src: "/projects/quantaxis/opportunities-history.webp",
          alt: "Opportunities history table: XAUUSD and EURUSD sell setups with conviction, trigger and invalidation prices, close time and status (triggered, expired, invalidated or closed at window end).",
        },
      ],
    },
  },
  {
    slug: "code-review-agent",
    title: "Autonomous Code Review Agent",
    kind: "Multi-agent · RAG",
    period: "Jul 2026 – Sep 2026",
    tagline: "Four LLM agents review every pull request and block merges on critical bugs.",
    metrics: [
      { value: "17% → 83%", label: "merge-gate block recall" },
      { value: "0", label: "false merge blocks" },
      { value: "$0.0017", label: "LLM cost per reviewed file" },
    ],
    problem:
      "Code review is a bottleneck, and LLM review bots fail in three ways. They see only the diff, so they miss who calls the changed function. They rate real vulnerabilities too low to act on: in the first eval the agents found 5 of the 6 blocking issues but rated them HIGH. And a diff is attacker-controlled text, so a planted comment can talk the model out of reporting a bug.",
    architecture: {
      title: "Review pipeline",
      steps: [
        { name: "PR webhook", detail: "GitHub App webhook verified with HMAC-SHA256; job stored in SQLite with a duplicate-delivery guard and a stale-commit check" },
        { name: "Filter & screen", detail: "Skips lockfiles, generated and oversized patches; Bedrock Guardrails screens each patch for prompt injection and quarantines flagged files" },
        { name: "Context retrieval", detail: "Callers, callees and imports from an AST call graph, plus similar code from Qdrant (Titan embeddings), capped at 8,000 chars" },
        { name: "4 agents in parallel", detail: "Security, architecture, test coverage and documentation on Bedrock gpt-oss-120b / 20b; 45 s timeout each; untrusted text in randomly named tags" },
        { name: "Post-processing", detail: "Re-anchors line numbers to the quoted snippets, applies the deterministic severity floor and ceiling, de-duplicates and ranks" },
        { name: "Synthesizer", detail: "gpt-oss-120b writes the PR comment, with a deterministic fallback" },
        { name: "Merge gate", detail: "Any CRITICAL finding fails the ai-code-review status until a reviewer with write access approves or blocks" },
      ],
      note: "A React dashboard streams each agent's progress over WebSocket. Groq is the fallback LLM provider.",
    },
    decisions: [
      {
        choice: "Plain asyncio orchestration",
        alternative: "LangGraph or CrewAI",
        why: "The four agents are independent, so they only need gather, a timeout and failure isolation, and I can see exactly what runs.",
      },
      {
        choice: "Severity decided in code (a deterministic floor and ceiling)",
        alternative: "Trusting the LLM's severity, or prompt tuning",
        why: "The agents detected the issues but under-rated them. The floor and ceiling took block recall from 17% to 83% with 0 false blocks.",
      },
      {
        choice: "Bedrock gpt-oss as primary, Groq as fallback",
        alternative: "Groq only, or Bedrock Nova 2 Lite",
        why: "Same quality as Groq at p50 5.5 s vs 19.2 s per file, with no daily token cap. Nova followed injected instructions in evals.",
      },
      {
        choice: "The injection guardrail fails open",
        alternative: "Failing closed",
        why: "Failing closed would block every PR during an AWS incident; the code-level severity floor still applies.",
      },
    ],
    built: [
      "FastAPI service installed as a GitHub App: HMAC-verified webhooks (constant-time compare), duplicate-delivery and stale-commit guards, background reviews and graceful shutdown.",
      "Codebase-aware RAG: AST chunking per function and class, Titan V2 or local granite embeddings in Qdrant (one collection per model, filtered by repo), and an AST call graph rebuilt on every push to the default branch.",
      "Four specialist agents run in parallel with asyncio, each with its own prompt, JSON schema, parse-retry and timeout; one agent's failure never stops the others.",
      "Prompt-injection defence in layers: a Bedrock Guardrails screen, random per-call prompt delimiters, and a deterministic severity floor and ceiling in code.",
      "LLM routing with Bedrock as primary and Groq as fallback, per-model client-side rate limiting, and fail-fast on daily quotas.",
      "Human-in-the-loop merge gate through GitHub commit statuses, with approve, block and clear overrides.",
      "React 19 dashboard with GitHub OAuth, single-use WebSocket tickets, live agent progress, a Monaco diff viewer and a React Flow call graph.",
      "MCP server with 7 read-only tools, so a developer can review a patch from Claude Code or Cursor before pushing.",
      "A 45-case labelled eval set with a strict scorer, and a CI eval gate on five thresholds.",
      "The whole AWS stack in Terraform, with CloudWatch metrics, 7 alarms and LangSmith tracing.",
      "A secret-leak audit (gitleaks, trufflehog and an exact-value check for every real secret) over the full history and public surfaces found no leaked values.",
    ],
    hardParts: [
      {
        title: "Real vulnerabilities were found but didn't block merges",
        problem:
          "In the first eval, merge-gate block recall was 17% (1 of 6). The agents detected 5 of the 6 blocking issues but rated them HIGH, and only CRITICAL blocks a merge.",
        fix: "A deterministic floor raises 5 canonical classes (SQL injection, command injection, hard-coded secrets, unsafe deserialization, missing auth) to CRITICAL only when the wording and a regex on the actual code agree. A ceiling caps context-dependent classes such as SSRF at HIGH.",
        verified: "Re-scoring the saved runs on the 33 original cases: block recall 83% (5 of 6), block precision 100%, 0 false blocks. Unit tests cover the floor.",
      },
      {
        title: "Prompt injection through the diff",
        problem:
          "On Nova 2 Lite, the security agent returned no findings for an f-string SQL injection because an adjacent comment told it to. A fake closing tag could also break out of the fenced diff.",
        fix: "Four layers, because none is enough alone: a Bedrock Guardrails screen that quarantines flagged files, random per-call tag names the diff can't guess, a production model chosen with injection evals, and the code-level severity floor.",
        verified: "The guardrail caught 5 of 8 injection cases with 0 of 37 false positives, and gpt-oss ignored the injection in all 3 misses. The CI eval gate passes all 5 rules.",
      },
      {
        title: "LLM line numbers pointed at the wrong code",
        problem:
          "In the first eval, 37 of 157 findings sat more than 3 lines from their own quoted snippet, so PR comments pointed at the wrong lines.",
        fix: "Each finding is re-anchored to where its quoted snippet appears in the patch's new-file lines (whitespace-normalised), choosing the match nearest the reported line.",
        verified: "In later runs, strict line scoring and snippet-anchored scoring agree exactly. Unit tests cover re-anchoring.",
      },
    ],
    results: [
      { label: "Merge-gate block recall (33 cases)", value: "17% → 83%, block precision 100%, 0 false blocks" },
      { label: "Recall, all categories", value: "81% (25 / 32)" },
      { label: "Exact-severity match", value: "46% → 73%" },
      { label: "Latency per file (Bedrock)", value: "p50 5.5 s, p95 10.9 s" },
      { label: "LLM cost", value: "$0.0017 per reviewed file" },
      { label: "Injection guardrail", value: "5 / 8 caught, 0 / 37 false positives" },
      { label: "Early production (N = 4 PRs)", value: "4 / 4 completed, 0 fallbacks; median about 50 s per PR; $0.0095 LLM cost per PR" },
      { label: "Tests", value: "597 passed with the network blocked, 84% app line coverage" },
    ],
    caveat:
      "Every eval number comes from a single run, so differences of 1–2 issues are noise. Production usage is 4 PRs, too few for headline claims. The call graph parses Python only.",
    deployment: [
      { label: "Provider", detail: "AWS ap-south-1 (Mumbai), defined in Terraform: 50 resource blocks, 63 resources on apply; state in S3 with native locking" },
      { label: "Edge", detail: "CloudFront serves the dashboard from private S3 and forwards API, WebSocket and webhook paths to an ALB that only accepts CloudFront" },
      { label: "Compute", detail: "ECS Fargate, 1 task (0.5 vCPU / 1 GB); SQLite and call-graph JSON on EFS" },
      { label: "AI services", detail: "Amazon Bedrock (gpt-oss, Titan embeddings, Guardrails), Qdrant Cloud, Groq as fallback" },
      { label: "Secrets & monitoring", detail: "Secrets Manager; CloudWatch logs, EMF metrics and 7 alarms → SNS email" },
      { label: "CI/CD", detail: "5 required checks (tests, dashboard lint + build, Docker build + Trivy, LLM eval gate, the bot's own review); deploys via GitHub OIDC after manual approval, with ECS circuit-breaker rollback" },
      { label: "Cost", detail: "About $1.5 a day while running" },
    ],
    stack: ["Python", "FastAPI", "Amazon Bedrock", "Qdrant", "Groq", "LangSmith", "MCP", "SQLite", "React", "Monaco", "React Flow", "Terraform", "AWS ECS Fargate", "Docker", "GitHub Actions"],
    repo: { url: "https://github.com/aakash1514/code-review-agent", public: true },
    live: "https://d1ngkk9hkqym35.cloudfront.net",
    status: "paused",
    media: {
      video: "https://youtu.be/gDpw28_ASEg",
      screenshots: [
        {
          src: "/projects/code-review-agent/review-dashboard.webp",
          alt: "Review dashboard for PR #1 on a test repo: tabs for the security, architecture, test coverage and documentation agents, and three HIGH architecture findings with the quoted code and a suggested fix; the PR is marked manually approved.",
        },
        {
          src: "/projects/code-review-agent/merge-blocked-by-guardrail.webp",
          alt: "GitHub pull request where the bot reports one CRITICAL issue, a possible prompt injection flagged by Bedrock Guardrails with the file quarantined for a human, and the failed ai-code-review check that blocks the merge.",
        },
        {
          src: "/projects/code-review-agent/mcp-review-patch.webp",
          alt: "Claude Code terminal calling the review_patch MCP tool on an f-string SQL query: the JSON result shows would_block true and one critical SQL-injection finding.",
        },
        {
          src: "/projects/code-review-agent/langsmith-trace.webp",
          alt: "LangSmith trace of one review: guardrail screens, then the security, test coverage, architecture and documentation agents, each with its Bedrock gpt-oss call, duration and token count.",
        },
      ],
    },
  },
  {
    slug: "forexedge",
    title: "ForexEdge",
    kind: "Microservices · LLM agent",
    period: "May 2026 – Jul 2026",
    tagline:
      "A forex paper-trading platform on 19M real minute bars, with a backtester and bar replay reproduced to the cent and a research agent whose every number is machine-checked.",
    metrics: [
      { value: "19.2M", label: "real one-minute bars" },
      { value: "689 / 689", label: "trades reproduced to the cent" },
      { value: "9 / 10", label: "research agent live eval" },
    ],
    problem:
      "Trading tools often show numbers nobody can check: simulated prices that look like market data, backtests you can't audit, and AI answers with made-up figures. ForexEdge only shows numbers it can back up: 13 years of real minute history validated against FRED, a backtester and bar replay reproduced to the cent by independent checks, an LSTM evaluation that reports its weak result, and a research agent whose every number is checked by code against real tool results.",
    architecture: {
      title: "Services",
      steps: [
        { name: "Caddy", detail: "One HTTPS origin in production; routes each path prefix to its service" },
        { name: "market-service", detail: "Live feed per MARKET_FEED (none by default; mock is always labelled), publishes forex.ticks to Kafka, serves candles from TimescaleDB" },
        { name: "order-service", detail: "Paper broker: validates orders against live ticks, spread and market hours; SL/TP and stop-out; publishes order, position and account events" },
        { name: "domain-service", detail: "Pip value, margin, swaps, session clock, spread monitor, FOMC and ECB calendar" },
        { name: "ws-gateway", detail: "Socket.IO relay for ticks and per-user events; hosts the BullMQ backtest engine, with results in S3" },
        { name: "replay-service", detail: "Bar replay over 2010–2022 on a server-owned clock; its own DB login, no Kafka" },
        { name: "ml-service + research-agent", detail: "Python FastAPI: walk-forward LSTM inference, and a LangGraph agent over 7 read-only MCP tools with a deterministic verifier" },
      ],
      note: "Plus auth-service (JWT, Argon2) and a Next.js trading terminal. Nx monorepo with 8 backend services; Kafka in KRaft mode; TimescaleDB, Redis and S3 (MinIO locally).",
    },
    decisions: [
      {
        choice: "One trading-rules library shared by the backtester and the replay",
        alternative: "Separate fill logic in each",
        why: "Fills, SL/TP exits, USD money, commission and mark-to-market live in @forexedge/trading-sim, a pure library on integer points, so the replay can be checked against the verified backtest trades to the cent.",
      },
      {
        choice: "A verifier with no LLM checks every number",
        alternative: "Trusting the model's figures",
        why: "Every number must match a unit-suffixed field of a real tool result. After one failed retry the answer is “could not verify” and the unverified text is never shown.",
      },
      {
        choice: "No live price feed by default",
        alternative: "Showing simulated prices as if they were market data",
        why: "There is no licensed live feed. MARKET_FEED=none disables order entry; mock prices are labelled “SIMULATED PRICES — not market data” everywhere, and any other value fails startup.",
      },
      {
        choice: "The server owns the replay clock",
        alternative: "Letting the client play back history it already holds",
        why: "History is only completed bars, and every payload is checked so that nothing after the clock is ever sent: no look-ahead.",
      },
    ],
    built: [
      "19,187,987 real one-minute bid/ask bars for EUR/USD, GBP/USD, USD/JPY and XAU/USD (2010–2022), stored as exact integer points in TimescaleDB (7.5× compression) with M5, M15, H1, H4 and D1 continuous aggregates.",
      "Eight backend services in an Nx monorepo (6 NestJS, 2 Python FastAPI) over Kafka, plus a Next.js trading terminal behind one Caddy origin.",
      "Paper trading on a simulated broker: orders validated against live ticks, spread and market hours, SL/TP and stop-out; JWT access and refresh tokens with Argon2 hashing.",
      "BullMQ backtester that fills at the next bar's open on the real bid/ask and reports USD equity, drawdown and a daily New York-close Sharpe, plus an independent SQL verification command.",
      "Bar replay of the 2010–2022 history on 1m to 1d bars (play, pause or step at 0.5–2 s per bar) on a separate replay account.",
      "Walk-forward LSTM next-hour direction models per pair (7 expanding folds, test years 2016–2022) with a decision rule fixed before training, served read-only.",
      "LangGraph research agent over an MCP server of 7 read-only tools, with a deterministic number verifier, its own read-only DB login and per-request budgets.",
      "Terraform on AWS and GitHub Actions CI/CD with OIDC, pre-deploy database dumps and automatic rollback.",
      "Frontend pages: trading terminal, backtest, replay, economic calendar, model evaluation and research.",
    ],
    hardParts: [
      {
        title: "Stopping the LLM from inventing numbers",
        problem: "An LLM summarising market data can make numbers up, and they look identical to real ones.",
        fix: "The answer must be a structured report. A verifier with no LLM checks every number against a unit-suffixed field of a real tool result: prices at the pair's decimals, percentages to at least 3 significant digits, counts and USD exact. After one failed retry the response is “could not verify”.",
        verified: "A 10-question live eval with independently computed expectations scored 8/10, 9/10 and 9/10. Run 1's misses came from the eval's own number check; run 3's was a provider HTTP 400 that ended in “could not verify”.",
      },
      {
        title: "Proving the backtester is right",
        problem: "A backtest is only useful if its trades and money are right, and the backtester can't check itself.",
        fix: "backtest:verify submits runs through the real API and reproduces each one from the raw minute table in independent SQL, without the backtester's code, comparing money in cents.",
        verified: "MA crossover 10/30 on H1, 2022: every trade and metric match exactly. EUR/USD 257 trades (−$272.20), XAU/USD 217 (−$555.92), USD/JPY 215 (+$1,485.75).",
      },
      {
        title: "Bar replay without look-ahead",
        problem: "A replay that sends data past its clock leaks the future, and its fills have to match the backtester's.",
        fix: "The server owns the clock: the current bar is rebuilt from minutes up to the clock, history is only completed bars, and every payload is checked. Orders fill at the next minute's open, with SL/TP checked minute by minute through the shared trading-sim library.",
        verified: "replay:verify replays the 689 verified backtest trades through the running service and all match to the cent. The database refuses any write from replay-service to the history tables.",
      },
      {
        title: "Deploys that roll themselves back",
        problem: "A release that fails its readiness checks must not leave the single production host broken.",
        fix: "deploy.sh takes a pre-deploy database dump, runs backward-compatible migrations, switches the release and checks every service's readiness; a failed check rolls back to the previous release.",
        verified: "A rollback drill (simulate_failure) proved it. restore-test.sh restores the newest dump into a scratch database and compares row counts, and planted-faults.sh catches 143 of 143 planted infrastructure faults.",
      },
    ],
    results: [
      { label: "Data", value: "19,187,987 minute bars; FRED noon fixings agree to a median 0.40–1.60 pips in every pair-year; 3 gold extremes within $2.30" },
      { label: "Backtest verification", value: "689 / 689 trades match independent SQL, money to the cent" },
      { label: "Replay verification", value: "689 / 689 verified trades match to the cent" },
      { label: "LSTM (7 walk-forward folds)", value: "pooled accuracy 51.63–51.84%; beats 9 of 16 baseline comparisons but never anti-persistence; below spread break-even (53.24–60.18%) for all four pairs" },
      { label: "Research agent live eval", value: "8/10, 9/10, 9/10 over three runs" },
      { label: "Infrastructure checks", value: "143 planted faults caught, 0 missed" },
      { label: "Deploy pipeline", value: "10 image builds, then the deploy job: 12 min 31 s" },
    ],
    caveat:
      "Paper trading only: orders fill on a simulated broker and there is no licensed live price feed. The LSTM doesn't cover the spread, and the platform presents it as a historical test, not a signal. The agent eval has 10 questions.",
    deployment: [
      { label: "Provider", detail: "AWS ap-south-1 (Mumbai), built with Terraform" },
      { label: "Compute", detail: "One EC2 t3.medium (IMDSv2 only, encrypted root volume, no key pair) running Docker Compose behind Caddy on one HTTPS origin" },
      { label: "Images & storage", detail: "ECR with immutable tags and scan on push; private, encrypted, TLS-only S3 buckets for backtest results and backups" },
      { label: "Access", detail: "No SSH: only HTTP and HTTPS open, the host is reached through SSM, and only ws-gateway can reach the instance metadata service" },
      { label: "Monitoring", detail: "CloudWatch alarms (CPU, CPU credits, status check, memory, disk) by email; daily root-volume snapshots" },
      { label: "CI/CD", detail: "CI on every pull request (lint, typecheck, test and build, ruff, mypy, pytest, offline infra checks); CD on every push to main via OIDC, with automatic rollback" },
    ],
    stack: ["NestJS", "TypeScript", "Nx", "Kafka", "TimescaleDB", "Redis", "BullMQ", "Socket.IO", "Next.js", "Redux Toolkit", "Python", "PyTorch", "FastAPI", "LangGraph", "MCP", "Groq", "Terraform", "AWS", "Docker", "Caddy", "GitHub Actions"],
    repo: { url: "https://github.com/aakash1514/algo_trading_forex", public: false },
    live: "https://forexedge.tech",
    status: "paused",
    media: {
      video: "https://youtu.be/Q_-vPWzzyYE",
      screenshots: [
        {
          src: "/projects/forexedge/replay-closed-trades.webp",
          alt: "Bar replay of EUR/USD H1 at 2022-03-07 18:59 UTC: the candle chart, playback and speed controls, a market order panel with bid and ask, the replay account balance, and closed trades with take-profit, stop-loss and manual exits and their net P&L.",
        },
        {
          src: "/projects/forexedge/backtest-result.webp",
          alt: "Backtest page: an MA crossover run on EUR/USD H1 from 3 to 31 Jan 2022, with net P&L +$282.80, 1.06% max drawdown, Sharpe ratio, win rate, profit factor and 15 trades.",
        },
        {
          src: "/projects/forexedge/research-verified-answer.webp",
          alt: "Research agent answer marked VERIFIED: the 2020 XAU/USD high of 2075.362 on 2020-08-06, with the claim, value and unit, the data used, and the get_market_stats tool call it was checked against.",
        },
        {
          src: "/projects/forexedge/lstm-evaluation.webp",
          alt: "Model evaluation table: pooled 2016–2022 LSTM accuracy for each pair against logistic, majority, persistence and anti-persistence baselines, with raw and Holm p-values and a verdict of LSTM better or no evidence of a difference.",
        },
        {
          src: "/projects/forexedge/trading-terminal-no-feed.webp",
          alt: "Trading terminal with no live market feed: an empty chart, a banner linking to the historical replay, and the order panel showing order entry disabled.",
        },
      ],
    },
  },
  {
    slug: "agriflow",
    title: "AgriFlow",
    kind: "Full-stack · ML",
    period: "Oct 2025 – Feb 2026",
    tagline: "Farm-to-buyer crop marketplace with ML price forecasts, online payments and an AWS deployment.",
    metrics: [
      { value: "21×", label: "faster p95 on admin orders" },
      { value: "38.7% → 0%", label: "error rate at 50 users" },
      { value: "60 ms", label: "production p95 on browsing APIs" },
    ],
    problem:
      "AgriFlow is a marketplace where farmers sell crops directly to buyers, with a quality inspection and tracked delivery in between, plus price and demand predictions to help price the crops. A farmer lists a lot with photos, a field agent inspects it, an admin approves and lists it, a buyer orders and pays an advance or the full amount online, and an agent delivers it.",
    architecture: {
      title: "Order and payment flow",
      steps: [
        { name: "Web or mobile client", detail: "React web app on S3 + CloudFront, or the Expo app; both call one API over HTTPS" },
        { name: "Nginx on EC2", detail: "TLS 1.2/1.3 with Let's Encrypt and HSTS in front of the API container" },
        { name: "Express API", detail: "JWT + requireRole; checks the crop is listed, stock, address and mobile; computes the total on the server" },
        { name: "PostgreSQL on RDS", detail: "Order saved as pending, over verified TLS" },
        { name: "Razorpay order", detail: "getAmountDue() works out the advance or balance in integer paise" },
        { name: "Payment verify", detail: "HMAC signature check, amount re-fetched from Razorpay, idempotent atomic SQL update and a JSONB audit-log row" },
      ],
      note: "Price and demand predictions go from the API to an internal Flask service with no public port. Images upload straight from the browser to a private S3 bucket via presigned POST.",
    },
    decisions: [
      {
        choice: "ML in a separate Flask service, called only by the API",
        alternative: "Running the models in Node, or calling ML from the clients",
        why: "The models are scikit-learn and XGBoost pickles. The service has no public port; the API proxies it with JWT auth and returns 503 if it's down.",
      },
      {
        choice: "Presigned S3 POST for images",
        alternative: "Uploading through the API to local disk (the earlier approach)",
        why: "S3 enforces the 5 MB limit and the content type, the API never handles file bytes, and files survive container rebuilds.",
      },
      {
        choice: "Money in integer paise",
        alternative: "Floating-point rupees",
        why: "No float rounding when comparing the advance, the total and the amount paid.",
      },
      {
        choice: "Deploys through GitHub OIDC + SSM Run Command",
        alternative: "Stored AWS keys, or SSH",
        why: "No long-lived keys and no open SSH port.",
      },
    ],
    built: [
      "Four roles on web and mobile: farmers list crops, field agents file quality inspections and update deliveries, admins approve listings and manage users, KYC, transport and farmer payouts, and buyers order and pay.",
      "Crop lifecycle pending → inspected → approved/rejected → listed → sold, enforced by database CHECK constraints.",
      "Express API with 58 HTTP endpoints across 9 role-guarded routers, JWT auth and bcrypt, on PostgreSQL (9 tables).",
      "Public marketplace with server-side pagination, search, category and price-range filters, and sorting.",
      "Razorpay advance and balance payments: HMAC signature check, server-side amounts, idempotent verification, a payment audit log and admin farmer settlement; mobile checkout through a short-lived checkout token.",
      "Price prediction (Random Forest: min, max and modal price) and demand prediction (XGBoost) in a Flask service, proxied by the API.",
      "Direct-to-S3 image uploads via presigned POST, limited to JPG, PNG and WEBP up to 5 MB.",
      "React + TypeScript web app (22 pages) and Expo React Native app (23 screens).",
    ],
    hardParts: [
      {
        title: "Unpaginated endpoints failing under load",
        problem:
          "GET /api/crops returned all 2,000 crops in every status (842 KiB), and the admin orders endpoint returned all 10,000 orders (6.4 MiB). At 50 concurrent users the large responses held database pool connections until the 2-second connect timeout turned the waiting into HTTP 500s.",
        fix: "LIMIT/OFFSET pagination with total-count headers. The public listing returns listed crops only (default 20, max 100) with server-side search, filters and sort, and the web and mobile apps switched to “load more”.",
        verified: "k6, 50 users × 60 s, median of 3 on a re-seeded database: admin orders p95 20.5 s → 974 ms and errors 38.7% → 0%; crops p95 3.93 s → 455 ms and errors 47.3% → 0%.",
      },
      {
        title: "A 208 MB model reloaded on every request",
        problem:
          "joblib.load ran on every price request. Each load took 0.646 s and added about 216 MB, and under 20 concurrent users free RAM on a 16 GB laptop dropped to 7 MB.",
        fix: "An in-process model cache preloaded at startup, later downloaded from S3 into a Docker volume and served by waitress.",
        verified: "200 sequential requests, median of 3: price p50 738.7 → 183.8 ms (4.0×), demand 15.8 → 5.2 ms (3.0×).",
      },
      {
        title: "Advance payments were recorded as full payments",
        problem:
          "Buyers could choose an advance, but checkout always charged the full total and verification marked the order fully paid. One column held both the advance the buyer chose and what was actually paid.",
        fix: "A new amount_paid column with a backfill, one getAmountDue() function in integer paise, the amount taken from Razorpay's payments.fetch, an atomic SQL increment with a payment-id idempotency guard, and advance-paid or fully-paid derived in SQL.",
        verified: "Code change only (commit d65b242); no automated test yet.",
      },
    ],
    results: [
      { label: "Admin orders p95", value: "20.5 s → 974 ms (21×)" },
      { label: "Admin orders throughput / errors", value: "4.9 → 81.5 req/s; 38.7% → 0%" },
      { label: "Admin crops p95", value: "4,514 → 247.5 ms" },
      { label: "Public crops p95 / errors", value: "3.93 s → 455 ms; 47.3% → 0%" },
      { label: "Price prediction median", value: "738.7 → 183.8 ms (4.0×)" },
      { label: "Production load test (3 min)", value: "879 requests, 0% errors; browsing p95 60 ms, price p95 198 ms" },
    ],
    caveat:
      "Before/after numbers are k6 runs on localhost against a seeded database (10,000 orders, 50 users, median of 3). The production run was 3 minutes of light load (10 users plus 1 prediction per second) from one laptop. Payments run in Razorpay test mode.",
    deployment: [
      { label: "Provider", detail: "AWS ap-south-1 (Mumbai)" },
      { label: "Web", detail: "React build on S3, served by CloudFront at agriflow.me with an ACM certificate" },
      { label: "API & ML", detail: "One EC2 t3.small running Docker Compose: Nginx (Let's Encrypt), the Express API and the Flask ML service, with health checks and memory limits; api.agriflow.me via Route 53" },
      { label: "Data", detail: "RDS PostgreSQL 18, not publicly accessible, over verified TLS; ML models loaded from S3 at startup" },
      { label: "Images", detail: "Private S3 bucket filled by presigned POST, served through CloudFront at /uploads/*" },
      { label: "Secrets & access", detail: "SSM Parameter Store → env file at deploy time; CloudWatch Logs for all 3 containers; EC2 managed through Session Manager, no SSH" },
      { label: "CI/CD", detail: "GitHub Actions via OIDC: the backend deploys through SSM Run Command, waits for healthy containers and checks /api/health; the frontend syncs to S3 and invalidates CloudFront" },
    ],
    stack: ["Node.js", "Express", "PostgreSQL", "React", "TypeScript", "Expo", "Python", "Flask", "scikit-learn", "XGBoost", "Razorpay", "Docker", "Nginx", "AWS", "GitHub Actions", "k6"],
    repo: { url: "https://github.com/aakash1514/Major_prj", public: true },
    live: "https://agriflow.me",
    status: "paused",
    media: {
      video: "https://youtu.be/GBNkDY_mssM",
      screenshots: [
        {
          src: "/projects/agriflow/farmer-dashboard.webp",
          alt: "AgriFlow farmer dashboard: a welcome banner with an Add New Crop button, the demand outlook for the farmer's primary crop, counts of total, pending, approved and rejected crops, and a performance overview with orders and revenue.",
        },
        {
          src: "/projects/agriflow/price-demand-prediction.webp",
          alt: "Prediction page for 500 kg of onions in summer in the West region: the price estimate (₹9,248.33 modal, with the min and max model outputs) beside the demand estimate.",
        },
        {
          src: "/projects/agriflow/admin-crop-submissions.webp",
          alt: "Admin crop submissions page: counts by status, search and status filters, and crop cards showing quantity, harvest date, the farmer's price next to the AI price estimate, and List on Marketplace buttons.",
        },
        {
          src: "/projects/agriflow/buyer-marketplace.webp",
          alt: "Buyer marketplace: a Market Insights panel with predicted demand, search, sort and filters, and a grid of listed crops with photos.",
        },
        {
          src: "/projects/agriflow/razorpay-checkout.webp",
          alt: "Razorpay checkout in test mode over the marketplace: a ₹2,500 price summary with card, netbanking and wallet payment options.",
        },
      ],
    },
  },
  {
    slug: "smc-complaints",
    title: "Municipal Complaints System",
    kind: "Production · Client work",
    period: "Feb – Jun 2026",
    tagline:
      "A complaints platform for the Solapur Municipal Corporation, built and deployed end to end during my Apprely internship.",
    metrics: [{ value: "On-prem", label: "production deployment" }],
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
