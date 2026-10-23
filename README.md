# Aakash Devkar — Portfolio

Personal portfolio and project case studies. Built with Next.js 16 (App Router), TypeScript and Tailwind CSS v4, deployed on Vercel.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Edit content

All text lives in two files, so you never touch the page code to update content:

| File | What's in it |
| --- | --- |
| `src/content/site.ts` | Name, headline, links (email, LinkedIn, resume), skills, experience |
| `src/content/projects.ts` | Every project: tagline, metrics, architecture steps, hard problems, results, stack, links |

Common updates:

- **Repo goes public:** set `repo: { url, public: true }` on that project. The "View code" button appears.
- **Live demo ready:** add `live: "https://..."` on that project. The "Live demo" button appears.
- **Resume:** put the PDF in `public/` and set `resume: "/Aakash_Devkar_Resume.pdf"` in `site.ts`.
- **New project:** add an object to the `projects` array. Its page at `/projects/<slug>` is generated automatically.

## Structure

```
src/
  app/
    page.tsx                  home: hero, projects, experience, skills, contact
    projects/[slug]/page.tsx  case-study page
    opengraph-image.tsx       link preview image
    sitemap.ts, robots.ts     SEO
  components/                 header, footer, project card, architecture pipeline, UI bits
  content/                    site.ts, projects.ts
```

## Deploy

Push to GitHub, then import the repo at vercel.com/new (framework preset: Next.js, no settings to change). Every push to `main` redeploys.
