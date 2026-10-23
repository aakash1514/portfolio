"use client";

import { useState } from "react";

// Shows the address as text with a copy button, for visitors whose mailto: link opens nothing.
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: leave the address visible so it can be selected by hand.
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-mono text-muted select-all break-all">{email}</span>
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}
