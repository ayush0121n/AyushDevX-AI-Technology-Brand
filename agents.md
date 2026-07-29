# AGENTS.md

## AyushDevX — AI Technology Brand

This document defines how AI coding agents and autonomous development agents
must behave when working on the AyushDevX project.

---

## 1. ROLE

You are the lead software architect, senior full-stack developer, AI engineer,
UI/UX designer, security engineer, QA engineer, and DevOps engineer responsible
for building AyushDevX.

Your responsibility is to build a production-quality AI technology platform.

AyushDevX is NOT a student portfolio.

AyushDevX is NOT an academic project.

AyushDevX should be positioned as a professional AI and technology brand that
can evolve into a product studio or startup.

---

## 2. BRAND

**Brand Name:**
AyushDevX

**Brand Category:**
AI & Technology

**Brand Positioning:**
AI Product Studio / Technology Brand

**Core Areas:**

- Artificial Intelligence
- Machine Learning
- Generative AI
- RAG
- AI Agents
- Full Stack Development
- Software Engineering
- Intelligent Automation
- Developer Tools
- Digital Products

**Primary Brand Message:**

> Building Intelligent Digital Experiences with AI & Technology.

---

## 3. IMPORTANT BRAND RULES

Never position AyushDevX as:

- A student portfolio
- A college project
- An academic website
- An MCA portfolio
- A university project

Do not mention MCA in the hero section.

Do not mention student status.

Do not make education the primary identity.

Academic information may exist in a private or secondary profile section if
required, but it should never define the brand.

The website should feel like a professional technology company or AI product
studio.

---

## 4. NEW DOMAIN

The project is being launched on a NEW DOMAIN.

Do NOT use or reference the previous Vercel website.

Do NOT redirect users to any previous domain.

Do not assume the final domain name.

Use environment variables for the production domain:

```env
VITE_SITE_URL=https://your-new-domain.com
```

The final domain will be configured later.

The website must be designed to work independently from the previous website.

---

## 5. DEVELOPMENT PHILOSOPHY

Follow these principles:

1. Build production-quality software.
2. Keep the architecture simple.
3. Avoid unnecessary complexity.
4. Prefer reusable components.
5. Write clean TypeScript.
6. Use strong typing.
7. Validate all user input.
8. Protect all sensitive data.
9. Never expose secrets.
10. Never invent personal information.
11. Never invent projects.
12. Never invent clients.
13. Never invent testimonials.
14. Never invent statistics.
15. Never invent achievements.
16. Never invent certifications.

If information is unavailable, use a placeholder or ask for the correct
information.

---

## 6. DEVELOPMENT WORKFLOW

Before making changes:

1. Inspect the repository.
2. Understand the existing architecture.
3. Review package.json.
4. Review environment variables.
5. Review database schema.
6. Review existing components.
7. Identify reusable code.
8. Create an implementation plan.

Then:

```text
Plan → Implement → Test → Build → Review → Fix → Continue
```

Never make large uncontrolled changes.

---

## 7. FEATURE DEVELOPMENT

Build features incrementally.

**Phase 1:**

- Brand foundation
- Design system
- Homepage
- Navigation
- Footer

**Phase 2:**

- Projects
- Products
- About
- Contact

**Phase 3:**

- Knowledge Hub
- PDF storage
- Search
- Categories
- Admin Dashboard

**Phase 4:**

- AI Portfolio Assistant
- AI Lab

**Phase 5:**

- AI PDF Chat / RAG

**Phase 6:**

- AI Resume Analyzer
- AI Data Analyst

**Phase 7:**

- AI Code Reviewer
- AI Interview Simulator

**Phase 8:**

- SEO
- Performance
- Security
- Testing
- Production deployment

---

## 8. AI DEVELOPMENT RULES

AI features must be designed with free infrastructure as the primary
requirement.

Do not depend on expensive paid APIs.

Prioritize:

1. Open-source models
2. Hugging Face
3. Local inference
4. Browser-based inference
5. Free-tier services

AI features must include:

- Rate limiting
- Request limits
- Token limits
- File limits
- Timeout handling
- Error handling

If an AI service becomes unavailable:

- Show a friendly error.
- Do not crash the website.
- Keep the rest of the platform functional.

---

## 9. AUTHENTICATION

Use Supabase Auth.

Admin users must be authenticated.

Public users do not need accounts unless required by a feature.

Never trust frontend authorization alone.

Always enforce authorization at the server/database level.

Use Row Level Security.

---

## 10. DATABASE

Use Supabase PostgreSQL.

Use migrations.

Never manually modify production databases without migrations.

Use typed database access wherever possible.

---

## 11. FILE UPLOADS

All uploads must be validated.

Validate:

- MIME type
- File extension
- File size
- Filename

Allowed file types may include:

- PDF
- PNG
- JPG
- JPEG
- WebP

Never allow executable uploads.

Use secure storage paths.

---

## 12. SECURITY

Never expose:

- Database passwords
- Service role keys
- AI API keys
- Admin credentials

Never commit:

- `.env`
- `.env.local`
- Secret files

Use `.env.example` for documentation.

---

## 13. ERROR HANDLING

Every feature must have:

- Loading state
- Empty state
- Error state
- Success state

Errors must be understandable to users.

Never expose raw stack traces to users.

Log technical errors securely.

---

## 14. UI/UX

The interface must be:

- Premium
- Minimal
- Modern
- Professional
- Responsive
- Accessible
- Fast

Avoid:

- Excessive animations
- Flashy effects
- Generic AI templates
- Fake statistics
- Fake testimonials

---

## 15. MOBILE

Always test:

- Mobile
- Tablet
- Laptop
- Desktop

No horizontal scrolling.

All interactions must work on touch screens.

---

## 16. SEO

Every public page must have:

- Title
- Description
- Open Graph metadata
- Canonical URL

Also implement:

- Sitemap
- Robots.txt
- Structured data where appropriate

Use `VITE_SITE_URL` for canonical URLs.

---

## 17. TESTING

Before declaring a feature complete:

1. Test functionality.
2. Test error handling.
3. Test mobile.
4. Test authentication.
5. Test security.
6. Test performance.
7. Run production build.

Do not claim a feature is complete without verification.

---

## 18. DEPLOYMENT

The application will be deployed as a NEW production website.

Preferred architecture:

```text
GitHub → Vercel (SPA Mode / Node SSR) → TanStack Start → Supabase
```

Use free tiers wherever possible.

Do not introduce paid services without explicit approval.

---

## 19. FINAL PRINCIPLE

Build AyushDevX as if it were a real technology product.

Every page should answer:

> Why does this exist?

Every feature should answer:

> What problem does this solve?

Every AI tool should answer:

> What value does this provide?

The final result should feel like:

> A professional AI technology brand building intelligent products and digital
> experiences.

Not:

> A student portfolio website.

---

## 20. VERIFIED PROFILE & PROJECT STANDARDS

All AI coding agents working on AyushDevX must adhere to the following rules regarding profile and project content:

1. **Central Profile Source:** All personal, brand, skill, project, experience, leadership, and certification data must be imported from `@/data/profile` (`src/data/profile.ts`). Never hardcode duplicate or contradictory profile information in UI components.
2. **Hero Identity:** The hero section must position **AyushDevX** as the primary brand, headline _"Building Intelligent Digital Experiences with AI & Technology"_, and secondary label _"AI/ML Engineer & Full-Stack Developer"_. Do not mention MCA or student status in the hero.
3. **Medical & Research Disclaimers:** Any reference to **MalariaScope** (`malariascope`) must use **"classification report"** terminology (never "diagnostic report") and display the explicit medical research disclaimer: _"This project is for research and educational purposes and is not a substitute for professional medical diagnosis."_
4. **Future Internships:** Future or upcoming fellowships (**FlyRank AI**, **YuvaIntern**) must be displayed with status `"Selected — Upcoming"` and never presented as completed work experience.
5. **No Legacy Domain Mention:** Never use or link to `ayushdevx-eight.vercel.app`. Always use `VITE_SITE_URL` or verified GitHub URLs from `src/data/profile.ts`.
