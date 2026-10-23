import { Fragment } from "react";
import { projects } from "@/content/projects";
import { experience, site, skills, tagline } from "@/content/site";
import { CopyEmail } from "@/components/copy-email";
import { ProjectCard } from "@/components/project-card";
import { ArrowIcon, ButtonLink, Chip, Container, GitHubIcon, Label } from "@/components/ui";

const proof = [
  { value: "0 / 1,790", label: "mismatches between backtest and live decisions (QuantAxis)" },
  { value: "689 / 689", label: "backtest trades reproduced by independent SQL (ForexEdge)" },
  { value: "77% → 93%", label: "LLM eval pass rate after prompt iteration, CI-gated (QuantAxis)" },
];

export default function Home() {
  const [lead, ...rest] = projects;
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <Label>
            {/* Each part stays on one line; the label only wraps between parts. */}
            {tagline.map((part, i) => (
              <Fragment key={part}>
                {i > 0 && " "}
                <span className="whitespace-nowrap">
                  {part}
                  {i < tagline.length - 1 && " ·"}
                </span>
              </Fragment>
            ))}
          </Label>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {site.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Hi, I&apos;m {site.name.split(" ")[0]}. {site.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#projects" variant="primary">
              See projects <ArrowIcon />
            </ButtonLink>
            <ButtonLink href={site.github}>
              <GitHubIcon /> GitHub
            </ButtonLink>
            {site.resume && (
              <ButtonLink href={site.resume} external>
                Resume
              </ButtonLink>
            )}
          </div>

          <dl className="mt-14 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {proof.map((p) => (
              <div key={p.value}>
                <dt className="font-mono text-2xl font-semibold text-accent">{p.value}</dt>
                <dd className="mt-1 text-sm leading-snug text-muted">{p.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-14">
        <Container className="py-16 sm:py-20">
          <Label>Selected work</Label>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Each case study covers the problem, the architecture, the hardest bugs and how the fix was verified.
          </p>
          <div className="mt-8 grid gap-5">
            <ProjectCard project={lead} large />
            <div className="grid gap-5 md:grid-cols-2">
              {rest.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Experience */}
      <section id="experience" className="scroll-mt-14 border-t border-line">
        <Container className="py-16 sm:py-20">
          <Label>Background</Label>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Experience</h2>
          <ol className="mt-8 space-y-8">
            {experience.map((e) => (
              <li key={e.org} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-8">
                <p className="font-mono text-sm text-faint">{e.period}</p>
                <div>
                  <h3 className="font-semibold">
                    {e.role} <span className="text-muted">· {e.org}</span>
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                    {e.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Skills */}
      <section id="skills" className="scroll-mt-14 border-t border-line">
        <Container className="py-16 sm:py-20">
          <Label>Toolbox</Label>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Skills</h2>
          <dl className="mt-8 space-y-5">
            {skills.map((s) => (
              <div key={s.group} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-8">
                <dt className="text-sm font-semibold">{s.group}</dt>
                <dd className="flex min-w-0 flex-wrap gap-1.5">
                  {s.items.map((i) => (
                    <Chip key={i}>{i}</Chip>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-14 border-t border-line">
        <Container className="py-16 sm:py-20">
          <Label>Contact</Label>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Open to AI engineering and full-stack roles
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Looking for full-time roles building AI agents, backends and full-stack products. Based in Pune; open to
            remote, relocation, and international teams.
          </p>
          <p className="mt-2 text-sm text-faint">
            Available to join immediately · IST (UTC+5:30) · open to remote and relocation
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {site.email && (
              <ButtonLink href={`mailto:${site.email}`} variant="primary">
                Email me
              </ButtonLink>
            )}
            {site.linkedin && <ButtonLink href={site.linkedin}>LinkedIn</ButtonLink>}
            {site.resume && (
              <ButtonLink href={site.resume} external>
                Resume
              </ButtonLink>
            )}
            <ButtonLink href={site.github}>
              <GitHubIcon /> GitHub
            </ButtonLink>
          </div>
          {site.email && <CopyEmail email={site.email} />}
        </Container>
      </section>
    </>
  );
}
