# AyushDevX

> Building Intelligent Digital Experiences with AI & Technology.

---

## Overview

AyushDevX is a professional AI and technology brand focused on building
intelligent applications, AI-powered tools, software products, and digital
experiences.

This is NOT a student portfolio.
This is NOT an academic project.

AyushDevX is positioned as a professional AI product studio and technology
brand that can evolve into a full startup ecosystem.

---

## Project Structure

```text
AYUSHDEVX
│
├── README.md           ← Master project specification
├── agents.md           ← How AI agents should work
├── product.md          ← What AyushDevX is
├── ui.md               ← Design & UX system
├── engineering.md      ← Technical architecture
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx          ← TanStack root layout
│   │   ├── index.tsx           ← Homepage
│   │   ├── ai-lab.tsx          ← AI Lab tools hub
│   │   ├── products.tsx        ← Digital products catalog
│   │   ├── projects.tsx        ← Production projects
│   │   ├── knowledge-hub.tsx   ← Document & PDF library
│   │   ├── insights.tsx        ← Engineering articles
│   │   ├── about.tsx           ← Brand positioning
│   │   └── contact.tsx         ← Contact & inquiry form
│   │
│   ├── components/
│   │   ├── site/               ← Core brand & layout components (Nav, Hero, Footer, etc.)
│   │   ├── ui/                 ← Reusable UI components
│   │   ├── ai/                 ← AI Lab widgets & components
│   │   └── projects/           ← Project display components
│   │
│   ├── lib/
│   │   ├── supabase/           ← Supabase client (client.ts, server.ts, types.ts)
│   │   ├── ai/                 ← AI integrations & prompts
│   │   └── utils/              ← Utility functions
│   │
│   └── styles.css              ← Tailwind v4 CSS design tokens
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.example                ← Environment template (VITE_ convention)
└── .env.local                  ← Local secrets (ignored by git)
```

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Framework      | TanStack Start (React 19 + Vite)      |
| Routing        | TanStack Router (file-system based)   |
| Language       | TypeScript                            |
| Styling        | Tailwind CSS v4 + Custom OKLCH tokens |
| UI Components  | Custom / Framer Motion                |
| Database       | Supabase PostgreSQL (10 tables + RLS) |
| Auth           | Supabase Auth                         |
| Storage        | Supabase Storage (6 buckets)          |
| AI             | Open-source / Free APIs               |
| Deployment     | Vercel (SPA Mode / Node SSR)          |
| Source Control | GitHub                                |

---

## Core Features

### Phase 1 — Foundation

- Brand foundation
- Design system
- Homepage
- Navigation
- Footer

### Phase 2 — Content

- Projects
- Products
- About
- Contact

### Phase 3 — Knowledge Hub

- PDF storage
- Search
- Categories
- Admin Dashboard

### Phase 4 — AI Portfolio Assistant

- RAG-powered assistant
- AI Lab dashboard

### Phase 5 — AI PDF Chat

- Document upload
- Question answering
- Source citations

### Phase 6 — AI Resume Analyzer

- Resume analysis
- Job description matching
- ATS scoring

### Phase 7 — Additional AI Tools

- AI Data Analyst
- AI Code Reviewer
- AI Interview Simulator

### Phase 8 — Production

- SEO
- Performance
- Security
- Testing
- Production deployment

---

## Selected Engineering Projects (Verified)

| Project                       | Category   | Key Tech & Metrics                                            | Description & Disclaimer                                                                                                                                                                    |
| :---------------------------- | :--------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MalariaScope**              | AI / ML    | `93% Val Accuracy`, `0.97 ROC-AUC`, EfficientNetB0, Flask API | Deep learning vision system for analyzing 27,558 NIH blood-smear images with automated **classification reports**. _(Research & educational use only; not a medical diagnosis substitute.)_ |
| **EstateXAI**                 | Full-Stack | MERN, JWT Auth, MongoDB Atlas, Geospatial Filters             | Real estate & PG discovery platform with role-based access control and AI-based listing recommendations.                                                                                    |
| **ProConnect**                | Full-Stack | React 19, TypeScript, Socket.IO, Express.js                   | Professional networking platform with real-time Socket.IO messaging and 20+ Atomic Design components (`github.com/ayush0121n/ai`).                                                          |
| **Agentic Document Pipeline** | AI / ML    | Python, ChromaDB, `pdfplumber`, Claude API                    | Take-home agentic RAG pipeline for structured document ingestion and retrieval-augmented extraction.                                                                                        |

---

## AI Lab Tools

| Tool                   | Description                                      |
| ---------------------- | ------------------------------------------------ |
| AI Portfolio Assistant | RAG-powered assistant for AyushDevX content      |
| AI PDF Chat            | Upload documents and ask questions               |
| AI Resume Analyzer     | Analyze resumes against job descriptions         |
| AI Data Analyst        | Natural language queries on uploaded datasets    |
| AI Code Reviewer       | Analyze and improve code quality                 |
| AI Interview Simulator | Practice technical and HR interviews             |
| AI Study Assistant     | Generate learning plans, quizzes, and flashcards |

---

## Navigation

```text
Home | AI Lab | Products | Projects | Knowledge Hub | Insights | About | Contact
```

---

## Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
VITE_SITE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://zkgixwywetajnogrihfy.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Domain

This project is deployed on a NEW production domain.

Do NOT reference the previous Vercel website.

Set `VITE_SITE_URL` to your new domain when configuring deployment.

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

---

## Development Workflow

```text
Plan → Implement → Test → Build → Review → Fix → Continue
```

---

## Production Quality Checklist

- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Authentication works
- [ ] Admin routes protected
- [ ] RLS enabled on all tables
- [ ] File uploads validated
- [ ] AI rate limits enabled
- [ ] Secrets protected
- [ ] Mobile responsive
- [ ] SEO configured
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Error states implemented
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Accessibility reviewed
- [ ] Performance reviewed
- [ ] New domain configured
- [ ] HTTPS enabled
- [ ] Production environment tested

---

## Brand

**Name:** AyushDevX

**Tagline:** Building Intelligent Digital Experiences with AI & Technology.

**Category:** AI & Technology

**Positioning:** AI Product Studio / Technology Brand

---

## License

All rights reserved. AyushDevX.
