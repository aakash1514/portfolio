import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, isLive, isPaused, projects } from "@/content/projects";
import { Pipeline } from "@/components/pipeline";
import { ButtonLink, Chip, Container, GitHubIcon, Label, PlayIcon } from "@/components/ui";
import { VideoEmbed } from "@/components/video-embed";

// Only the slugs in projects.ts exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.tagline };
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10 sm:py-12">
      <Label>{label}</Label>
      <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Labelled rows inside a card, e.g. Problem / Fix / Verified. */
function Rows({ rows, accent }: { rows: [string, string][]; accent: string }) {
  return (
    <dl className="mt-4 space-y-3 text-sm leading-relaxed">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
          <dt className={`font-mono text-xs uppercase tracking-wider ${k === accent ? "text-accent" : "text-faint"} sm:pt-0.5`}>
            {k}
          </dt>
          <dd className="text-muted">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function KeyValueTable({ rows, mono = false }: { rows: [string, string][]; mono?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-line last:border-0">
              <th scope="row" className="w-2/5 bg-surface px-4 py-3 align-top font-medium">
                {k}
              </th>
              <td className={`px-4 py-3 text-muted ${mono ? "font-mono" : ""}`}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const showRepo = project.repo?.public;
  const screenshots = project.media?.screenshots ?? [];
  const video = project.media?.video;
  const paused = isPaused(project);

  // Optional sections drop out when empty; labels are numbered from whatever remains.
  const sections: { title: string; body: React.ReactNode }[] = [];
  if (screenshots.length > 0 || video) {
    sections.push({
      title: "Demo",
      body: (
        <>
          {video && <VideoEmbed url={video} title={`${project.title} demo video`} />}
          {screenshots.length > 0 && (
            <ul className={`grid gap-4 sm:grid-cols-2 ${video ? "mt-6" : ""}`}>
              {screenshots.map((s) => (
                <li key={s.src}>
                  <a
                    href={s.src}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-[2/1] overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Image
                      src={s.src}
                      alt={s.alt}
                      fill
                      sizes="(min-width: 768px) 360px, (min-width: 640px) 45vw, 100vw"
                      className="object-cover object-top"
                    />
                    <span className="sr-only"> (opens full size in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {screenshots.length > 0 && <p className="mt-3 text-sm text-faint">Select a screenshot to open it full size.</p>}
        </>
      ),
    });
  }
  sections.push(
    { title: "The problem", body: <p className="leading-relaxed text-muted">{project.problem}</p> },
    {
      title: `Architecture: ${project.architecture.title.toLowerCase()}`,
      body: <Pipeline architecture={project.architecture} />,
    },
  );
  if (project.decisions?.length) {
    sections.push({
      title: "Design decisions",
      body: (
        <div className="space-y-5">
          {project.decisions.map((d) => (
            <article key={d.choice} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h3 className="font-semibold">{d.choice}</h3>
              <Rows rows={[["Instead of", d.alternative], ["Why", d.why]]} accent="Why" />
            </article>
          ))}
        </div>
      ),
    });
  }
  sections.push(
    {
      title: "What I built",
      body: (
        <ul className="space-y-3">
          {project.built.map((b) => (
            <li key={b} className="flex gap-3 leading-relaxed text-muted">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {b}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Hard problems",
      body: (
        <div className="space-y-5">
          {project.hardParts.map((h) => (
            <article key={h.title} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h3 className="font-semibold">{h.title}</h3>
              <Rows rows={[["Problem", h.problem], ["Fix", h.fix], ["Verified", h.verified]]} accent="Verified" />
            </article>
          ))}
        </div>
      ),
    },
  );
  if (project.results) {
    sections.push({
      title: "Results",
      body: (
        <>
          <KeyValueTable rows={project.results.map((r) => [r.label, r.value])} mono />
          {project.caveat && <p className="mt-3 text-sm text-faint">{project.caveat}</p>}
        </>
      ),
    });
  }
  if (project.deployment?.length) {
    sections.push({
      title: "Deployment",
      body: <KeyValueTable rows={project.deployment.map((d) => [d.label, d.detail])} />,
    });
  }
  sections.push({
    title: "Stack",
    body: (
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
    ),
  });

  return (
    <Container className="max-w-3xl">
      {/* Header */}
      <div className="py-12 sm:py-16">
        <Link href="/#projects" className="font-mono text-xs text-faint hover:text-accent">
          ← All projects
        </Link>
        <p className="mt-6 font-mono text-xs text-faint">
          {project.kind} · {project.period}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{project.tagline}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* While paused, the demo video is the main call to action. */}
          {paused && video && (
            <ButtonLink href={video} variant="primary" external>
              <PlayIcon /> Watch demo
            </ButtonLink>
          )}
          {showRepo && (
            <ButtonLink href={project.repo!.url} variant={paused && video ? "ghost" : "primary"}>
              <GitHubIcon /> View code
            </ButtonLink>
          )}
          {isLive(project) && <ButtonLink href={project.live!}>Live demo</ButtonLink>}
          {project.repo && !showRepo && <Chip>Repo going public soon</Chip>}
          {project.note && <Chip>{project.note}</Chip>}
        </div>
        {paused && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-faint">
            Deployed on AWS. Paused to save cloud costs; I can bring it back up for a live walkthrough in an interview.
          </p>
        )}

        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {project.metrics.map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd className="font-mono text-2xl font-semibold text-accent">{m.value}</dd>
              <dd className="mt-1 text-sm text-muted">{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {sections.map((s, i) => (
        <Section key={s.title} label={String(i + 1).padStart(2, "0")} title={s.title}>
          {s.body}
        </Section>
      ))}

      <div className="border-t border-line py-10">
        <Link href={`/projects/${next.slug}`} className="group block rounded-2xl border border-line bg-surface p-5 hover:border-accent">
          <p className="font-mono text-xs text-faint">Next project</p>
          <p className="mt-1 font-semibold group-hover:text-accent">{next.title} →</p>
        </Link>
      </div>
    </Container>
  );
}
