import { ImageResponse } from "next/og";
import { site, tagline } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Preview card shown when the link is shared on LinkedIn, WhatsApp, etc.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0c0a09",
          color: "#f5f5f4",
        }}
      >
        <div style={{ fontSize: 26, color: "#34d399", letterSpacing: 4 }}>
          {tagline.join(" · ").toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700 }}>{site.name}</div>
          <div style={{ fontSize: 40, color: "#a8a29e", marginTop: 16 }}>{site.headline}</div>
        </div>
        <div style={{ fontSize: 26, color: "#78716c" }}>LangGraph · RAG · Python · TypeScript · React · NestJS · Django · AWS</div>
      </div>
    ),
    size,
  );
}
