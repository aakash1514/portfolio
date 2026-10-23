import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./ui";

const nav = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight whitespace-nowrap">
          {site.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-sm text-muted sm:gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-ink ${item.label === "Skills" || item.label === "Experience" ? "hidden sm:inline" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
