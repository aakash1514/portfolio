import Link from "next/link";
import type { Project } from "@/content/projects";
import { ArrowIcon, Chip } from "./ui";

export function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-faint">{project.kind}</p>
        <p className="font-mono text-xs text-faint">{project.period}</p>
      </div>
      <h3 className={`mt-3 font-semibold tracking-tight ${large ? "text-2xl" : "text-xl"}`}>{project.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        {project.metrics.slice(0, 3).map((m) => (
          <div key={m.label}>
            <dt className="sr-only">{m.label}</dt>
            <dd className="font-mono text-base font-semibold text-accent sm:text-lg">{m.value}</dd>
            <dd className="mt-0.5 text-xs leading-snug text-faint">{m.label}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.slice(0, large ? 8 : 6).map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>

      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-ink group-hover:text-accent">
        Read case study <ArrowIcon />
      </span>
    </Link>
  );
}
