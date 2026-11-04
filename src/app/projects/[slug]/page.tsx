import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { Pipeline } from "@/components/pipeline";
import { ArrowIcon, ButtonLink, Chip, Container, GitHubIcon, Label } from "@/components/ui";

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

  // Optional sections drop out when empty; labels are numbered from whatever remains.
  const sections: { title: string; body: React.ReactNode }[] = [];
  if (screenshots.length > 0 || video) {
    sections.push({
      title: "Demo",
      body: (
        <>
          {screenshots.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {screenshots.map((s) => (
                <figure key={s.src} className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 640px) 360px, 100vw" className="object-contain" />
                </figure>
              ))}
            </div>
          )}
          {video && (
            <div className={screenshots.length > 0 ? "mt-6" : undefined}>
              <ButtonLink href={video} external>
                Watch demo video <ArrowIcon />
              </ButtonLink>
            </div>
          )}
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
          {showRepo && (
            <ButtonLink href={project.repo!.url} variant="primary">
              <GitHubIcon /> View code
            </ButtonLink>
          )}
          {project.live && <ButtonLink href={project.live}>Live demo</ButtonLink>}
          {project.repo && !showRepo && <Chip>Repo going public soon</Chip>}
          {project.note && <Chip>{project.note}</Chip>}
        </div>

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
