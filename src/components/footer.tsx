import { site } from "@/content/site";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-2 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © 2026 {site.name} · {site.location}
        </p>
        <p className="font-mono text-xs">Every number on this site was measured.</p>
      </Container>
    </footer>
  );
}
