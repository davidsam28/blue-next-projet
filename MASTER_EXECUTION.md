# BLUE NEXT PROJET — MASTER EXECUTION DOCUMENT
## Trauma Informed Media Arts | Nonprofit Website Build
**Project Owner:** David
**Builder:** Claude Code
**Started:** 2026-02-19
**Status:** ACTIVE BUILD

---

## GATE LOG (Approval Checkpoints)

| Gate | Description | Status | Date |
|------|-------------|--------|------|
| G1 | Scraped content summary presented | ⏳ PENDING | - |
| G2 | Tech stack confirmed | ✅ CONFIRMED | 2026-02-19 |
| G3 | Database schema approved | ⏳ PENDING | - |
| G4 | Admin panel scope confirmed | ⏳ PENDING | - |
| G5 | Social feed method confirmed | ⏳ PENDING | - |
| G6 | Deployment authorized | ⏳ PENDING | - |

---

## SCRAPE RESULTS (Gate 1)

### Site Info
- **Official Name:** Blue Next Projet (French spelling - intentional)
- **Wix URL:** https://blueliveone.wixsite.com/my-site
- **Platform:** Wix Thunderbolt (JS-rendered, most content could not be statically scraped)

### Live Pages Found (3)
1. Home — `/`
2. About — `/about`
3. Contact — `/contact`

### Pages That Do NOT Exist Yet on Wix
- /programs, /team, /gallery, /blog, /services, /media, /donate

### Brand Colors (from CSS)
- Primary Blue: `#0033FF`
- Dark Blue: `#001A80`
- Light Blue Accent: `#E6EBFF`
- White: `#FFFFFF`
- Light Gray: `#F2F2F2`
- Medium Gray: `#CCCCCC`
- Dark Gray: `#404040`
- Black: `#000000`

### Typography (from CSS)
- Display: Madefor Display Bold
- Body: Madefor Text / Helvetica Neue / DIN Next / Univers LT Std

### Content Gaps (JS-Rendered - Cannot Scrape Statically)
⚠️ Wix uses client-side JS rendering. All actual copy (mission statement, about text, program descriptions, team bios, contact info, social handles) requires either:
1. Browser automation with JS execution (Chrome extension not connected)
2. David to provide content directly
3. David to copy/paste from Wix dashboard

**CONTENT NEEDED FROM DAVID (BLOCKING):**
- [ ] Mission statement
- [ ] About / organizational story
- [ ] Program descriptions
- [ ] Team member names + bios
- [ ] Email address
- [ ] Phone number (if any)
- [ ] Physical address (if any)
- [ ] Instagram handle
- [ ] Facebook page URL
- [ ] Cash App $cashtag
- [ ] Zelle email/phone for donations
- [ ] Any existing logo files

**DECISION:** Build with brand colors/fonts from scrape + placeholder structure, allow content injection via Admin CMS.

---

## TECH STACK (Gate 2)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | SSR for SEO, file-based routing, API routes |
| Language | TypeScript (strict mode) | Type safety per Law 6 |
| Styling | Tailwind CSS + Shadcn/ui | Rapid, consistent, accessible components |
| Database | Supabase (PostgreSQL) | Existing infrastructure, RLS, Auth |
| Payments | Stripe Elements | PCI compliant, no raw card data |
| Email | Resend | Simple, reliable, great DX |
| Hosting | Vercel | Existing infra, Next.js native |
| Social Feeds | oEmbed embeds (fallback iframes) | No API keys needed for display |
| Analytics | Vercel Analytics | Zero-config |

---

## DATABASE SCHEMA (Gate 3 — Pending Approval)

### Tables

#### `donors`
```sql
id UUID PK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
first_name TEXT NOT NULL, last_name TEXT NOT NULL,
email TEXT UNIQUE, phone TEXT, notes TEXT,
stripe_customer_id TEXT -- nullable, only if they donated via Stripe
```

#### `donation_records`
```sql
id UUID PK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
donor_id UUID FK donors(id),
amount NUMERIC(10,2) NOT NULL,
source TEXT NOT NULL CHECK (source IN ('stripe','zelle','cashapp')),
status TEXT NOT NULL CHECK (status IN ('completed','pending','failed')),
stripe_payment_intent_id TEXT, -- nullable
notes TEXT,
recorded_by UUID FK auth.users(id), -- admin who logged manual entry
donation_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### `site_content`
```sql
id UUID PK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
page TEXT NOT NULL, -- 'home','about','programs','team','contact'
section TEXT NOT NULL, -- 'hero','mission','bio_1', etc.
content_type TEXT NOT NULL, -- 'text','html','image_url','json'
content TEXT NOT NULL,
updated_by UUID FK auth.users(id)
```

#### `team_members`
```sql
id UUID PK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
name TEXT NOT NULL, title TEXT NOT NULL, bio TEXT,
image_url TEXT, display_order INT DEFAULT 0, is_active BOOL DEFAULT true
```

#### `programs`
```sql
id UUID PK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
name TEXT NOT NULL, description TEXT NOT NULL,
image_url TEXT, display_order INT DEFAULT 0, is_active BOOL DEFAULT true
```

#### `site_settings`
```sql
key TEXT PK, value TEXT NOT NULL, updated_at TIMESTAMPTZ,
updated_by UUID FK auth.users(id)
-- keys: cashapp_cashtag, zelle_recipient, zelle_instructions,
--       instagram_handle, facebook_url, contact_email, contact_phone
```

#### `admin_email_log`
```sql
id UUID PK, created_at TIMESTAMPTZ,
sent_by UUID FK auth.users(id),
recipient_email TEXT NOT NULL, recipient_donor_id UUID FK donors(id),
subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT
```

---

## BUILD PHASES

### Phase 0 — Project Init ✅ IN PROGRESS
- [x] Create /blue-next-projet directory
- [ ] npx create-next-app
- [ ] Install deps: @supabase/ssr, stripe, resend, @stripe/stripe-js, @stripe/react-stripe-js
- [ ] Configure Tailwind, Shadcn, TypeScript strict
- [ ] Set up .env.local + .env.example
- [ ] Initialize Supabase client (server + client)

### Phase 1 — Foundation
- [ ] Supabase migration file (all tables + RLS)
- [ ] Stripe webhook endpoint (/api/webhooks/stripe)
- [ ] Admin auth setup (Supabase Auth)
- [ ] Layout components (Navbar, Footer)
- [ ] Design system (colors, fonts, tokens)

### Phase 2 — Public Pages
- [ ] Home page (Hero, Mission, Social Feed, Donation CTA)
- [ ] About page (Mission statement, org story, TIMA explanation)
- [ ] Programs page (Services/programs grid)
- [ ] Team page (Staff profiles)
- [ ] Donate page (Stripe form + Zelle/CashApp info)
- [ ] Contact page (Form + social links)

### Phase 3 — Admin Panel
- [ ] /admin/login (Supabase Auth)
- [ ] /admin/dashboard (overview stats)
- [ ] /admin/donations (unified 3-channel view)
- [ ] /admin/donations/new (manual entry Zelle/CashApp)
- [ ] /admin/donors (donor management)
- [ ] /admin/emails (send to donors)
- [ ] /admin/content (CMS - edit pages)
- [ ] /admin/team (manage team members)
- [ ] /admin/programs (manage programs)
- [ ] /admin/settings (CashApp/Zelle/social links)

### Phase 4 — Integration & Polish
- [ ] Stripe end-to-end test (donate → webhook → DB → dashboard)
- [ ] Social feed rendering (Instagram + Facebook)
- [ ] CSV export for donations
- [ ] Mobile responsiveness pass
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Error pages (404, 500)

### Phase 5 — Documentation & Deploy
- [ ] README.md
- [ ] Database schema diagram
- [ ] Admin guide
- [ ] API documentation
- [ ] Deployment guide
- [ ] GitHub push
- [ ] Vercel deploy

---

## FILE STRUCTURE (Target)
```
blue-next-projet/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Home
│   │   ├── about/page.tsx              # About
│   │   ├── programs/page.tsx           # Programs
│   │   ├── team/page.tsx               # Team
│   │   ├── donate/page.tsx             # Donate
│   │   ├── donate/success/page.tsx     # Post-donation thank you
│   │   └── contact/page.tsx            # Contact
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── donations/page.tsx
│   │   ├── donations/new/page.tsx
│   │   ├── donors/page.tsx
│   │   ├── donors/[id]/page.tsx
│   │   ├── emails/page.tsx
│   │   ├── content/page.tsx
│   │   ├── team/page.tsx
│   │   ├── programs/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── webhooks/stripe/route.ts
│   │   ├── donations/route.ts
│   │   ├── donors/route.ts
│   │   ├── content/route.ts
│   │   └── emails/send/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
├── components/
│   ├── ui/                             # Shadcn components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AdminSidebar.tsx
│   ├── donate/
│   │   ├── DonationForm.tsx
│   │   ├── DonationAmountSelector.tsx
│   │   ├── ZelleInfo.tsx
│   │   └── CashAppInfo.tsx
│   ├── admin/
│   │   ├── DonationTable.tsx
│   │   ├── DonorTable.tsx
│   │   ├── ManualDonationForm.tsx
│   │   ├── EmailComposer.tsx
│   │   ├── ContentEditor.tsx
│   │   └── StatsCard.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── MissionSection.tsx
│   │   ├── SocialFeedSection.tsx
│   │   └── DonateCTA.tsx
│   └── common/
│       ├── PageHeader.tsx
│       └── SocialLinks.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stripe.ts
│   ├── resend.ts
│   └── utils.ts
├── hooks/
│   ├── useDonations.ts
│   ├── useDonors.ts
│   └── useContent.ts
├── types/
│   ├── database.ts
│   ├── stripe.ts
│   └── index.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── images/
├── .env.local               (gitignored)
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## CONTENT STATUS TRACKER

| Page | Content | Status |
|------|---------|--------|
| Home - Hero headline | Scraped brand colors, awaiting copy | ⚠️ PLACEHOLDER |
| Home - Mission text | Not extractable from Wix | ⚠️ PLACEHOLDER |
| About - Org story | Not extractable from Wix | ⚠️ PLACEHOLDER |
| Programs | No programs page on Wix yet | ⚠️ PLACEHOLDER |
| Team | No team page on Wix yet | ⚠️ PLACEHOLDER |
| Contact - Email | Not extracted | ⚠️ PLACEHOLDER |
| Donate - CashApp $tag | Not provided | ⚠️ PLACEHOLDER |
| Donate - Zelle info | Not provided | ⚠️ PLACEHOLDER |
| Social - Instagram | Not found | ⚠️ PLACEHOLDER |
| Social - Facebook | Not found | ⚠️ PLACEHOLDER |

---

## DECISIONS LOG

| # | Decision | Made By | Date |
|---|----------|---------|------|
| 1 | Next.js 15 App Router (not Vite/React, separate project) | Claude Code | 2026-02-19 |
| 2 | Social feeds via oEmbed/embed widgets (no API keys required) | Claude Code | 2026-02-19 |
| 3 | Resend for email (simpler than SendGrid for v1) | Claude Code | 2026-02-19 |
| 4 | Admin CMS for all content (makes content gaps irrelevant at launch) | Claude Code | 2026-02-19 |

---

## RISKS & BLOCKERS

| Risk | Mitigation |
|------|-----------|
| Wix content not extractable | Build CMS-driven site; David populates via admin panel |
| Instagram/Facebook API requires app review | Use embed widgets (Elfsight fallback or oEmbed) |
| CashApp/Zelle have no APIs | Manual entry in admin dashboard, display info on donate page |
| Stripe test → live key switch | Checklist item before launch |

---

*This document is the single source of truth for build status.*
*Last updated: 2026-02-19*
