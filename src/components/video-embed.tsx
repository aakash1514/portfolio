"use client";

import Image from "next/image";
import { useState } from "react";

/** Extracts the video id from youtu.be/<id> or youtube.com/watch?v=<id> links. */
function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
}

/**
 * Click-to-load YouTube embed: shows the thumbnail and a play button, and only
 * loads the youtube-nocookie.com iframe after the visitor clicks.
 */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-lg transition-transform group-hover:scale-105"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
