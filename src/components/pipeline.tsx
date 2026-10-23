import type { Project } from "@/content/projects";

/** Architecture as an ordered flow: numbered steps connected by a rail. */
export function Pipeline({ architecture }: { architecture: Project["architecture"] }) {
  return (
    <figure>
      <ol className="relative">
        {architecture.steps.map((step, i) => {
          const last = i === architecture.steps.length - 1;
          return (
            <li key={step.name} className="relative flex gap-4 pb-4 last:pb-0">
              {!last && <span aria-hidden="true" className="absolute top-9 bottom-0 left-[15px] w-px bg-line" />}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent bg-accent-soft font-mono text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <div className="flex-1 rounded-xl border border-line bg-surface px-4 py-3">
                <p className="text-sm font-semibold">{step.name}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {architecture.note && <figcaption className="mt-4 text-sm text-faint">{architecture.note}</figcaption>}
    </figure>
  );
}
