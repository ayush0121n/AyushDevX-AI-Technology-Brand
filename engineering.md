# ENGINEERING.md

# AyushDevX — Engineering Specification

---

## 1. Architecture

**Frontend:**
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Next.js Server Actions
- Next.js Route Handlers

**Database:**
- Supabase PostgreSQL

**Authentication:**
- Supabase Auth

**Storage:**
- Supabase Storage

**AI:**
- Open-source / free AI infrastructure

**Deployment:**
- Vercel Free Tier

**Source Control:**
- GitHub

---

## 2. Architecture Principle

Prefer a modular monolith.

Do not create microservices unless there is a clear technical requirement.

Keep clearly separated:
- Frontend
- Backend
- Database
- AI integrations
- Authentication
- Storage

---

## 3. Database

Use PostgreSQL through Supabase.

**Recommended tables:**

```sql
profiles
projects
products
resources
resource_categories
resource_tags
resource_tags_map
blogs
certificates
ai_tools
conversations
messages
contact_messages
admin_activity
```

---

## 4. Database Security

Enable Row Level Security on all tables.

**Public users:**
- Read published content only

**Admin users:**
- Create
- Read
- Update
- Delete

Never allow anonymous users to modify content.

---

## 5. Authentication

Use Supabase Auth.

Admin roles should be stored securely.

Never trust a client-provided role.

Verify authorization server-side.

---

## 6. Storage

**Storage buckets:**
```
resources
projects
certificates
blog-images
avatars
```

Use public access only where appropriate.

Private files should use signed URLs.

---

## 7. API Design

Use clear API boundaries.

**Example routes:**

```
GET    /api/projects
GET    /api/products
GET    /api/resources
POST   /api/resources
DELETE /api/resources/:id

POST   /api/ai/chat
POST   /api/ai/pdf-chat
POST   /api/ai/resume-analyze
POST   /api/ai/data-analyze
```

---

## 8. AI Architecture

AI tools should be modular.

**File structure:**

```
lib/ai/
├── provider.ts
├── embeddings.ts
├── rag.ts
├── prompts.ts
├── validators.ts
└── rate-limit.ts
```

---

## 9. RAG Pipeline

```text
Document
    ↓
Text Extraction
    ↓
Cleaning
    ↓
Chunking
    ↓
Embedding
    ↓
Vector Storage
    ↓
Similarity Search
    ↓
Context Retrieval
    ↓
Prompt Construction
    ↓
LLM
    ↓
Response
    ↓
Sources
```

---

## 10. RAG Safety

The AI must:
- Use retrieved context
- Avoid hallucination
- Cite sources
- Say when information is unavailable

Prompt injection protections should be considered.

Never treat document instructions as system instructions.

---

## 11. AI Rate Limiting

Because the system must remain free, implement limits.

**Example:**

| User Type     | Limit                       |
|---------------|-----------------------------|
| Anonymous     | 5 AI requests per hour      |
| Authenticated | 10 AI requests per hour     |
| Admin         | Higher configurable limit   |

Make these configurable.

---

## 12. File Limits

| File Type | Maximum Size |
|-----------|--------------|
| PDF       | 10 MB        |
| CSV       | 5 MB         |
| Images    | 5 MB         |

Make limits configurable via environment variables.

---

## 13. File Security

Validate:
- MIME type
- File extension
- File size

Sanitize filenames.

Never execute uploaded files.

Never trust client-provided MIME types alone.

---

## 14. Code Quality

Use:
- TypeScript (strict mode)
- ESLint
- Prettier
- Reusable components
- Small, focused functions
- Meaningful variable names
- No unnecessary duplication

---

## 15. Component Architecture

**Directory structure:**

```
components/
├── ui/
├── layout/
├── projects/
├── products/
├── ai/
├── resources/
└── admin/
```

Avoid huge components.

Split complex features into smaller components.

---

## 16. Error Handling

Use centralized error handling where practical.

Return safe, user-friendly errors.

Log detailed technical errors securely.

Never expose:
- Stack traces
- Secrets
- Raw database errors

---

## 17. Environment Variables

Use `.env.local` for local development.

Never commit secrets.

Provide `.env.example` for documentation.

**Required variables:**

```env
# Site
NEXT_PUBLIC_SITE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (server-only — never expose to client)
# Add AI provider keys here
```

---

## 18. Domain

The application will use a new production domain.

Do not hardcode any previous Vercel URL.

Use `NEXT_PUBLIC_SITE_URL` for:
- SEO metadata
- Sitemap generation
- Canonical URLs
- Open Graph tags
- Metadata API

---

## 19. Testing

Use automated tests where practical.

**Test:**
- Authentication flows
- Database operations
- API routes
- File uploads
- AI services
- RAG pipeline
- Search functionality
- Admin permissions

Perform manual responsive testing on all major breakpoints.

---

## 20. Performance

**Optimize:**
- Images (next/image)
- Fonts (next/font)
- API calls
- Database queries
- AI requests

**Use:**
- Server components where possible
- Response caching
- Lazy loading
- Dynamic imports

Avoid unnecessary client-side JavaScript.

---

## 21. SEO

**Implement:**
- Metadata API (Next.js)
- Sitemap (app/sitemap.ts)
- Robots.txt (app/robots.ts)
- Open Graph tags
- Canonical URLs
- Structured data where appropriate

---

## 22. Accessibility

Follow WCAG principles.

**Ensure:**
- Keyboard navigation
- Semantic HTML
- Proper ARIA labels
- Visible focus states
- Sufficient color contrast

---

## 23. Deployment

**Production architecture:**

```text
GitHub → Vercel → Next.js → Supabase
```

Use free tiers.

Do not introduce paid services without approval.

---

## 24. CI/CD

Every production deployment should:

1. Install dependencies
2. Run lint checks
3. Run TypeScript type checks
4. Run tests
5. Build application

Deployment should fail if critical checks fail.

---

## 25. Monitoring

Use free monitoring options where possible.

**Track:**
- Build failures
- API errors
- AI errors
- Database errors

Do not collect unnecessary user data.

---

## 26. Backups

**Maintain:**
- Database backup strategy
- Project source code in GitHub
- Important documents locally

Do not rely on a single copy of important content.

---

## 27. Zero-Cost Principle

The application should prioritize free infrastructure.

**Preferred:**
- Vercel Free Tier
- Supabase Free Tier
- GitHub Free
- Open-source AI models
- Hugging Face where appropriate
- Browser-based processing where practical

The architecture must gracefully handle free-tier limitations.

Do not build a system that requires expensive infrastructure to function.

---

## 28. Development Priority

Build in this order:

1. Core website
2. Design system
3. Projects
4. Products
5. Knowledge Hub
6. Admin Dashboard
7. AI Portfolio Assistant
8. AI PDF Chat
9. Additional AI tools
10. SEO
11. Security
12. Performance
13. Production deployment

---

## 29. Production Quality Checklist

Before launch:

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

## 30. Final Engineering Principle

Build a system that is:

- **Secure** — protect user data and credentials
- **Scalable** — handle growth without rewrites
- **Maintainable** — clean code, clear structure
- **Fast** — optimized for real-world performance
- **Accessible** — usable by everyone
- **Cost-efficient** — free infrastructure first
- **AI-ready** — modular AI integration

The architecture should allow AyushDevX to evolve from a technology brand into
a full AI product ecosystem without requiring a complete rewrite.
