# Blue Next Projet

A full-stack nonprofit website for **Blue Next Projet** — an organization dedicated to trauma-informed healing through the power of media arts.

Built with Next.js 16, Supabase, Stripe, and Resend. Deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Styling | Tailwind CSS 4 + Shadcn/ui |
| Database | Supabase (PostgreSQL, Auth, RLS, Storage) |
| Payments | Stripe Checkout (one-time + recurring subscriptions) |
| Email | Resend (transactional emails, donation receipts, bulk messaging) |
| Hosting | Vercel |

---

## Features

### Public Site
- **Home** — Hero, mission statement, impact stats, social feed, donate CTA
- **About** — Mission, vision, approach, core values (CMS-driven)
- **Programs** — Active programs grid (managed via admin)
- **Team** — Team member cards with photos (managed via admin)
- **Donate** — Three channels: Stripe (card), Zelle, Cash App; recurring donations
- **Contact** — Contact form that sends email to admin

### Admin Panel (`/admin`)
- **Dashboard** — Stats overview: total raised, monthly, donor count, breakdown by channel
- **Donations** — Full donation log with filters (source, status, date range), CSV export
- **Log Donation** — Manual entry for Zelle and Cash App payments
- **Donors** — Searchable donor database with contact info
- **Email Donors** — Compose and send emails to all donors or selected individuals
- **Page Content** — CMS editor for all public page text and HTML
- **Programs** — CRUD management for programs
- **Team** — CRUD management for team members
- **Settings** — Org info, Cash App tag, Zelle info, social media links

### Donation System
- **Stripe**: Automatic via Checkout Sessions + webhooks
- **Zelle / Cash App**: Display payment info publicly, admin logs donations manually
- **Unified dashboard**: All three channels appear in one view with totals and breakdowns
- **Receipts**: Automatic email receipts for Stripe donations
- **Recurring**: Monthly, quarterly, and annual subscription support

---

## Project Structure

```
blue-next-projet/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages (Home, About, Programs, etc.)
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   │   ├── contact/       # Contact form handler
│   │   │   ├── content/       # CMS content PATCH
│   │   │   ├── donations/     # Donations CRUD, checkout, CSV export
│   │   │   ├── donors/        # Donors CRUD
│   │   │   ├── emails/        # Bulk email send
│   │   │   ├── programs/      # Programs CRUD
│   │   │   ├── settings/      # Site settings
│   │   │   ├── team/          # Team members CRUD
│   │   │   └── webhooks/      # Stripe webhook handler
│   │   ├── globals.css        # Tailwind + brand CSS variables
│   │   ├── layout.tsx         # Root layout with SEO metadata
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── admin/             # Admin components (tables, forms, editors)
│   │   ├── common/            # Shared components (PageHeader, SocialLinks)
│   │   ├── contact/           # Contact form
│   │   ├── donate/            # Donation form, amount selector, Zelle/CashApp info
│   │   ├── home/              # Hero, Mission, Social Feed, Donate CTA
│   │   ├── layout/            # Navbar, Footer, AdminSidebar
│   │   └── ui/                # Shadcn/ui components
│   ├── lib/
│   │   ├── resend.ts          # Email client (lazy singleton)
│   │   ├── stripe.ts          # Stripe client (lazy singleton)
│   │   ├── supabase/          # Supabase clients (server, client, middleware)
│   │   └── utils.ts           # Utilities (formatting, sanitization)
│   ├── types/
│   │   ├── database.ts        # TypeScript interfaces for all DB tables
│   │   └── index.ts           # Re-exports + form data types
│   └── middleware.ts           # Auth middleware for admin routes
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Complete DB schema + seed data
├── .env.example               # Environment variable template
├── next.config.ts             # Next.js configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account (for email)

### 1. Clone and install

```bash
git clone <repo-url>
cd blue-next-projet
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See the `.env.example` file for descriptions.

### 3. Set up the database

Run the migration in your Supabase SQL editor:

1. Go to your Supabase dashboard > SQL Editor
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query

This creates all tables, indexes, RLS policies, triggers, and seeds default content.

### 4. Create an admin account

In the Supabase dashboard:

1. Go to **Authentication** > **Users**
2. Click **Add User** > **Create New User**
3. Enter the email and password for the admin
4. Set the `ADMIN_EMAIL` env var to match this email

### 5. Set up Stripe webhooks

1. In Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the admin panel.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example`
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

Vercel will automatically build and deploy on every push to `main`.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `donors` | Donor profiles (name, email, phone, Stripe customer ID) |
| `donation_records` | All donations across all channels with amounts, status, dates |
| `site_content` | CMS key-value pairs (page + section = unique content block) |
| `team_members` | Team member profiles with ordering and active/inactive toggle |
| `programs` | Program listings with ordering and active/inactive toggle |
| `site_settings` | Key-value site configuration (Cash App tag, Zelle info, social links) |
| `admin_email_log` | Audit log of all emails sent from admin panel |

All tables have:
- UUID primary keys
- `created_at` / `updated_at` timestamps with auto-update triggers
- Row Level Security (RLS) enabled
- Appropriate indexes

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/donations/create-checkout` | Public | Create Stripe Checkout session |
| GET | `/api/donations` | Admin | List donations with filters |
| POST | `/api/donations` | Admin | Log manual donation (Zelle/CashApp) |
| GET | `/api/donations/export` | Admin | CSV export of all donations |
| POST | `/api/webhooks/stripe` | Stripe | Handle Stripe webhook events |
| GET | `/api/donors` | Admin | List donors with search |
| POST | `/api/donors` | Admin | Create donor |
| POST | `/api/contact` | Public | Send contact form email |
| POST | `/api/emails/send` | Admin | Send bulk/individual donor emails |
| PATCH | `/api/content` | Admin | Update CMS content |
| POST | `/api/settings` | Admin | Update site settings |
| GET/POST | `/api/programs` | Admin | List/create programs |
| PATCH/DELETE | `/api/programs/[id]` | Admin | Update/delete program |
| POST | `/api/team` | Admin | Create team member |
| PATCH/DELETE | `/api/team/[id]` | Admin | Update/delete team member |

---

## Admin Guide

### First-Time Setup
1. Log in at `/admin/login` with the credentials created in Supabase Auth
2. Go to **Settings** and configure: org name, contact email, Cash App tag, Zelle info, social media links
3. Go to **Page Content** to customize all public page text
4. Go to **Programs** to add/edit programs
5. Go to **Team** to add team members

### Recording Manual Donations
For Zelle and Cash App donations received outside Stripe:
1. Go to **Donations** > **Log Donation**
2. Enter donor info, amount, source (Zelle or Cash App), and notes
3. If the donor already exists, they'll be matched by email; otherwise a new donor record is created

### Emailing Donors
1. Go to **Email Donors**
2. Compose your message (supports `{{first_name}}` personalization)
3. Choose to send to all donors or select specific ones
4. All emails are logged in the audit trail

### Exporting Data
- Click **Export CSV** on the Donations page to download all donation records

---

## Security

- All admin routes protected by Supabase Auth middleware
- Stripe webhooks verified via signature
- HTML content sanitized before rendering
- API routes validate and whitelist input fields
- Email API requires admin-level authentication
- Service role key used only for webhook processing (bypasses RLS)
- Environment variables never exposed to the client (except `NEXT_PUBLIC_*`)

---

## License

Private. All rights reserved.
