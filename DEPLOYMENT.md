# Blue Next Projet -- Deployment Guide

Everything you need to deploy, configure, and manage the Blue Next Projet website.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Local Development)](#2-quick-start-local-development)
3. [Environment Variables](#3-environment-variables)
4. [Supabase Setup](#4-supabase-setup)
5. [Stripe Setup](#5-stripe-setup)
6. [Resend Email Setup (Optional)](#6-resend-email-setup-optional)
7. [Vercel Deployment](#7-vercel-deployment)
8. [Custom Domain Setup](#8-custom-domain-setup)
9. [Admin Panel Guide](#9-admin-panel-guide)
10. [Security Notes](#10-security-notes)
11. [Troubleshooting](#11-troubleshooting)
12. [Maintenance](#12-maintenance)

---

## 1. Prerequisites

Before you begin, make sure you have the following:

| Requirement        | Minimum Version | Where to Get It                          |
| ------------------ | --------------- | ---------------------------------------- |
| Node.js            | 18.x or higher  | https://nodejs.org                       |
| npm                | 9.x or higher   | Comes with Node.js                       |
| Git                | Any recent      | https://git-scm.com                      |
| GitHub Account     | --              | https://github.com                       |
| Vercel Account     | Free tier works | https://vercel.com                       |
| Supabase Account   | Free tier works | https://supabase.com                     |
| Stripe Account     | --              | https://stripe.com                       |
| Resend Account     | Optional        | https://resend.com (for email features)  |

To verify Node.js and npm are installed, run:

```bash
node --version
npm --version
git --version
```

---

## 2. Quick Start (Local Development)

### 2.1 Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/blue-next-projet.git
cd blue-next-projet
```

### 2.2 Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` in any text editor and fill in your actual values (see Section 3 below for where to find each value).

### 2.3 Install Dependencies

```bash
npm install
```

### 2.4 Run the Development Server

```bash
npm run dev
```

The site will be available at **http://localhost:3000**.

- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

### 2.5 Build for Production (Test Locally)

```bash
npm run build
npm run start
```

---

## 3. Environment Variables

Every environment variable the application uses, where to find it, and whether it is required.

### Supabase Variables

| Variable                         | Required | Description                                                        |
| -------------------------------- | -------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | Yes      | Your Supabase project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Yes      | Your Supabase anonymous/public API key                             |
| `SUPABASE_SERVICE_ROLE_KEY`      | Yes      | Your Supabase service role key (KEEP SECRET -- never expose this!) |

**Where to find them:**
1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon in left sidebar)
3. Click **API** under "Configuration"
4. You will see:
   - **Project URL** -- this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key -- this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret** key -- this is `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Variables

| Variable                              | Required | Description                                           |
| ------------------------------------- | -------- | ----------------------------------------------------- |
| `STRIPE_SECRET_KEY`                   | Yes      | Your Stripe secret API key (starts with `sk_live_` or `sk_test_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | Yes      | Your Stripe publishable key (starts with `pk_live_` or `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET`              | Yes      | Webhook signing secret (starts with `whsec_`)          |

**Where to find them:**
1. Go to https://dashboard.stripe.com
2. Click **Developers** in the top menu
3. Click **API Keys**
   - **Publishable key** -- this is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** -- this is `STRIPE_SECRET_KEY`
4. For the webhook secret, see Section 5 below

**Important:** Use **test keys** (`sk_test_...` / `pk_test_...`) during development. Switch to **live keys** (`sk_live_...` / `pk_live_...`) only in production.

### Email Variables (Resend)

| Variable         | Required | Description                                            |
| ---------------- | -------- | ------------------------------------------------------ |
| `RESEND_API_KEY`  | No       | Your Resend API key (starts with `re_`)               |
| `FROM_EMAIL`      | No       | The "from" email address (e.g., `noreply@yourdomain.org`) |
| `FROM_NAME`       | No       | The sender name shown in emails (e.g., `Blue Next Projet`) |

**Where to find them:**
1. Go to https://resend.com/api-keys
2. Create a new API key -- this is `RESEND_API_KEY`

**Note:** If `RESEND_API_KEY` is not set, the app will still function -- email features (contact form notifications, donation receipts, broadcast emails) will simply be disabled and log to the console instead.

### App Variables

| Variable                | Required | Description                                                          |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`   | Yes      | Your site's full URL (e.g., `https://yourdomain.com`)               |
| `ADMIN_EMAIL`           | Yes      | The email address of the admin user (used for login and contact form notifications) |

**Important:** In local development, set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`. In production on Vercel, set it to your live domain (e.g., `https://bluenextprojet.org` or `https://your-app.vercel.app`).

---

## 4. Supabase Setup

### 4.1 Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Choose your organization (or create one)
4. Give your project a name (e.g., "blue-next-projet")
5. Set a **database password** (save this somewhere safe -- you will not need it for the app, but you need it for direct DB access)
6. Choose a region close to your users
7. Click **Create new project** and wait for it to provision (about 2 minutes)

### 4.2 Run the Database Migration

The migration file is located at: `supabase/migrations/001_initial_schema.sql`

To run it:

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project in a text editor
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)

This will create all the tables, indexes, Row Level Security policies, triggers, and seed data the app needs:

- `donors` -- stores donor contact information
- `donation_records` -- tracks all donations (Stripe, Zelle, Cash App)
- `site_content` -- CMS content for all public pages
- `team_members` -- team/staff directory
- `programs` -- program listings
- `site_settings` -- org info, payment channels, social links
- `admin_email_log` -- log of all broadcast emails sent

### 4.3 Create the Storage Bucket

The admin panel allows uploading images (team photos, program images, hero images, etc.). These are stored in Supabase Storage.

1. In your Supabase dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Set the name to exactly: **site-images**
4. Toggle **Public bucket** to ON (images need to be publicly accessible)
5. Click **Create bucket**
6. After the bucket is created, click on it, then click **Policies**
7. Add these policies:

**Policy 1 -- Public Read Access:**
- Policy name: `Public can read images`
- Allowed operation: SELECT
- Target roles: `anon`, `authenticated`
- USING expression: `true`

**Policy 2 -- Authenticated Upload:**
- Policy name: `Authenticated users can upload`
- Allowed operation: INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `true`

**Policy 3 -- Authenticated Delete:**
- Policy name: `Authenticated users can delete`
- Allowed operation: DELETE
- Target roles: `authenticated`
- USING expression: `true`

**File size limit:** The application enforces a 5MB limit and only allows image files (JPEG, PNG, WebP, GIF, SVG). You can optionally configure the same limits on the bucket level via the Supabase dashboard under Storage > site-images > Settings.

### 4.4 Create the Admin User

The admin panel uses Supabase Auth (email + password login). You need to create the admin user manually:

1. In your Supabase dashboard, click **Authentication** in the left sidebar
2. Click **Users** tab
3. Click **Add user** > **Create new user**
4. Enter:
   - **Email:** the same email you set as `ADMIN_EMAIL` in your `.env.local`
   - **Password:** choose a strong password (you will log in with this at `/admin/login`)
   - **Auto Confirm User:** toggle ON
5. Click **Create user**

You can now log in at `/admin/login` with these credentials.

---

## 5. Stripe Setup

### 5.1 Create a Stripe Account

1. Go to https://stripe.com and sign up
2. Complete the onboarding process (business info, bank account for payouts, etc.)
3. Your account starts in **test mode** -- use this for development

### 5.2 Get Your API Keys

1. Go to https://dashboard.stripe.com/developers
2. Click **API Keys**
3. Copy the **Publishable key** -- put this in `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Click **Reveal** next to the **Secret key** -- put this in `STRIPE_SECRET_KEY`

### 5.3 Set Up the Webhook

Stripe uses webhooks to notify your app when a donation payment completes (or fails). This is critical -- without it, donations will not be recorded in your database.

**For production (Vercel):**

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set the Endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
   (Replace `yourdomain.com` with your actual domain or Vercel URL)
4. Under **Events to send**, click **Select events** and add these three:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. On the webhook detail page, click **Reveal** under **Signing secret**
7. Copy the signing secret (starts with `whsec_`) -- put this in `STRIPE_WEBHOOK_SECRET`

**For local development (testing):**

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. The CLI will print a webhook signing secret -- put this in your `.env.local` as `STRIPE_WEBHOOK_SECRET`
5. Keep this terminal running while you test donations

### 5.4 What Each Webhook Event Does

| Event                          | What It Does                                                           |
| ------------------------------ | ---------------------------------------------------------------------- |
| `checkout.session.completed`   | Records the donation, creates/links the donor, sends a receipt email   |
| `invoice.payment_succeeded`    | Records recurring subscription payments and sends receipt emails       |
| `payment_intent.payment_failed`| Marks the donation record as "failed" in the database                  |

---

## 6. Resend Email Setup (Optional)

Resend powers three email features:
- **Contact form submissions** -- forwards messages to the admin email
- **Donation receipts** -- automatic thank-you emails to donors after payment
- **Broadcast emails** -- send mass emails to donors from the admin panel

If you skip this step, the app will still work -- email features will be silently disabled.

### 6.1 Create a Resend Account

1. Go to https://resend.com and sign up
2. Verify your email

### 6.2 Add and Verify Your Domain

By default, Resend only lets you send from `onboarding@resend.dev`. To send from your own domain:

1. Go to https://resend.com/domains
2. Click **Add domain**
3. Enter your domain (e.g., `bluenextprojet.org`)
4. Add the DNS records Resend gives you (MX, TXT/SPF, DKIM) to your domain's DNS settings
5. Click **Verify** once the records propagate (can take up to 48 hours, usually much faster)

### 6.3 Get Your API Key

1. Go to https://resend.com/api-keys
2. Click **Create API Key**
3. Give it a name (e.g., "Blue Next Projet Production")
4. Copy the key (starts with `re_`) -- put this in `RESEND_API_KEY`

### 6.4 Set Your FROM_EMAIL

Set `FROM_EMAIL` to an address on your verified domain (e.g., `noreply@bluenextprojet.org`). This does not need to be a real inbox -- it is just the sender address that appears on outgoing emails.

---

## 7. Vercel Deployment

### 7.1 Push Your Code to GitHub

If you have not already done so:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blue-next-projet.git
git push -u origin main
```

### 7.2 Import the Project in Vercel

1. Go to https://vercel.com and sign in
2. Click **Add New...** > **Project**
3. Click **Import** next to your `blue-next-projet` repository
4. Framework Preset should auto-detect as **Next.js** -- leave it as is
5. Under **Build and Output Settings**, the defaults are fine:
   - Build Command: `next build`
   - Output Directory: `.next`
6. Do NOT deploy yet -- first add your environment variables

### 7.3 Add Environment Variables

In the Vercel project settings (before or after first deploy):

1. Go to your project **Settings** > **Environment Variables**
2. Add EVERY variable from the list below:

```
NEXT_PUBLIC_SUPABASE_URL          = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = your-anon-key
SUPABASE_SERVICE_ROLE_KEY         = your-service-role-key
STRIPE_SECRET_KEY                 = sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET             = whsec_...
RESEND_API_KEY                    = re_...
FROM_EMAIL                        = noreply@yourdomain.org
FROM_NAME                         = Blue Next Projet
NEXT_PUBLIC_APP_URL               = https://yourdomain.com
ADMIN_EMAIL                       = admin@yourdomain.org
```

**Important:** Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain (with `https://`). Stripe checkout redirect URLs depend on this.

3. Click **Save**

### 7.4 Deploy

1. Click **Deploy** (or push a new commit to `main` to trigger automatic deployment)
2. Vercel will build and deploy your site
3. Your site will be live at `https://your-app.vercel.app`

Every future push to `main` will automatically redeploy.

### 7.5 Verify the Deployment

After deployment:

1. Visit your site URL -- the public homepage should load
2. Visit `/admin/login` -- you should see the admin login page
3. Log in with the Supabase Auth credentials you created in Section 4.4
4. Make a test donation to verify the Stripe integration

---

## 8. Custom Domain Setup

### 8.1 Add a Domain in Vercel

1. In your Vercel project, go to **Settings** > **Domains**
2. Enter your domain (e.g., `bluenextprojet.org`)
3. Click **Add**
4. Vercel will show you the DNS records to configure

### 8.2 Configure DNS

At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

- For the root domain (`bluenextprojet.org`):
  - Add an **A record** pointing to `76.76.21.21`
- For `www.bluenextprojet.org`:
  - Add a **CNAME record** pointing to `cname.vercel-dns.com`

### 8.3 Update Environment Variables

After your domain is active:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://yourdomain.com`
2. Update your Stripe webhook endpoint URL to `https://yourdomain.com/api/webhooks/stripe`
3. Redeploy (push a commit or click "Redeploy" in the Vercel dashboard)

---

## 9. Admin Panel Guide

Access the admin panel at: **https://yourdomain.com/admin/login**

Log in with the email and password you created in Supabase Authentication (Section 4.4).

### 9.1 Dashboard

The main overview page. Shows key statistics at a glance.

### 9.2 Website Editor

Edit all the public-facing content on your website without touching code:

- **Hero Section** -- headline, subheadline, call-to-action buttons, hero image
- **Mission Section** -- title and body text
- **Impact Stats** -- the numbers displayed on the homepage (e.g., "500+ Individuals Served")
- **About Page** -- mission, vision, and approach sections
- **Donate Page** -- title, subtitle, and impact note
- **Contact Page** -- title and subtitle

All changes save to the database and appear on the live site immediately.

### 9.3 Programs

Manage the programs displayed on the `/programs` page:

- **Add** a new program with name, description, and image
- **Edit** existing program details
- **Reorder** programs by changing their display order
- **Hide/Show** programs by toggling the "Active" status

### 9.4 Team Members

Manage the team displayed on the `/team` page:

- **Add** team members with name, title, bio, and photo
- **Edit** existing team member information
- **Reorder** team members by changing their display order
- **Hide/Show** team members by toggling the "Active" status

### 9.5 Donations

View and manage all donations:

- **View** a table of all donations with amount, source (Stripe/Zelle/Cash App), status, date, and donor name
- **Filter** by source or status
- **Export** donation data
- **Log a Manual Donation** -- click "Log Donation" to record offline donations (Zelle, Cash App, checks, etc.)

### 9.6 Donors

Manage your donor database:

- **View** all donors with contact information
- **Search** donors by name or email
- **Add** donors manually
- **Edit** donor details
- **View** a donor's donation history

### 9.7 Email Donors

Send broadcast emails to your donor base:

- **Compose** emails with a subject line and HTML body
- **Personalize** with merge tags: `{{first_name}}` and `{{name}}`
- **Send to all** donors or select specific recipients
- **View** email send history and status in the email log

Requires Resend to be configured (Section 6).

### 9.8 Raw Content

A lower-level view of all CMS content entries. Useful for advanced edits or debugging. Most users should use the Website Editor (Section 9.2) instead.

### 9.9 Settings

Configure organization-wide settings:

- **Organization Info** -- name, EIN, address
- **Contact Info** -- email, phone
- **Payment Channels** -- Cash App cashtag/QR code, Zelle recipient and instructions
- **Social Links** -- Instagram handle, Facebook URL
- **Change Password** -- update your admin login password

---

## 10. Security Notes

### Never Share These Secrets

The following values must NEVER be shared publicly, committed to Git, or exposed in client-side code:

- `SUPABASE_SERVICE_ROLE_KEY` -- full database access, bypasses all Row Level Security
- `STRIPE_SECRET_KEY` -- can create charges, read customer data, manage your Stripe account
- `STRIPE_WEBHOOK_SECRET` -- validates that webhook events come from Stripe
- `RESEND_API_KEY` -- can send emails from your domain

### Environment Variable Safety

- Environment variables are stored securely in Vercel -- they are NOT included in the client-side JavaScript bundle unless prefixed with `NEXT_PUBLIC_`
- Variables prefixed with `NEXT_PUBLIC_` ARE visible to anyone who visits your site. That is fine for the Supabase URL, anon key, Stripe publishable key, and app URL -- they are designed to be public
- The `.env.local` file is already in `.gitignore` and will never be committed to Git

### Change Your Admin Password

After your first login, go to **Settings** in the admin panel and change your password to something strong and unique.

### Stripe Webhook Security

The webhook endpoint at `/api/webhooks/stripe` validates the `stripe-signature` header on every request using your `STRIPE_WEBHOOK_SECRET`. This ensures that only genuine events from Stripe are processed. Never disable this validation.

### Row Level Security (RLS)

All database tables have Row Level Security enabled:

- Public visitors can only READ `site_content`, `site_settings`, active `team_members`, and active `programs`
- Only authenticated users (the admin) can write to any table
- The Stripe webhook uses the `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS -- this is by design, so webhook-created donations are always recorded

### Supabase Auth

- The admin panel uses Supabase Auth with email/password login
- The middleware at `/src/middleware.ts` protects all `/admin/*` routes (except `/admin/login`) by checking for an active Supabase Auth session
- Unauthenticated users are automatically redirected to `/admin/login`

---

## 11. Troubleshooting

### "Login failed" at /admin/login

- Verify the admin user exists in Supabase Dashboard > Authentication > Users
- Make sure the user's email is confirmed (should show "Confirmed" status)
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Donations are not being recorded

- Check that the Stripe webhook is active at https://dashboard.stripe.com/webhooks
- Verify the webhook endpoint URL matches your deployed site: `https://yourdomain.com/api/webhooks/stripe`
- Check that `STRIPE_WEBHOOK_SECRET` matches the signing secret shown in Stripe
- In Stripe's webhook dashboard, check the "Attempts" tab for failed deliveries and error messages

### Images are not loading

- Verify the `site-images` storage bucket exists in Supabase
- Check that the bucket is set to **Public**
- Ensure the storage policies are configured (Section 4.3)
- Check that `images.remotePatterns` in `next.config.ts` includes `**.supabase.co`

### Emails are not sending

- Verify `RESEND_API_KEY` is set and valid
- Check that your sending domain is verified in Resend
- Make sure `FROM_EMAIL` is an address on your verified domain
- Check Resend's dashboard for delivery logs and bounces

### Build fails on Vercel

- Verify all required environment variables are set in Vercel's project settings
- Check the build logs in the Vercel dashboard for specific error messages
- Make sure you are using Node.js 18 or higher (set in Vercel project settings under "General" > "Node.js Version")

### Contact form messages are not arriving

- Check that `ADMIN_EMAIL` is set to a valid email address
- Verify Resend is configured (Section 6)
- Check your spam folder

---

## 12. Maintenance

### Updating the Site

Any push to the `main` branch on GitHub will automatically trigger a new deployment on Vercel. The typical workflow:

```bash
# Make changes locally
npm run dev           # Test locally
npm run build         # Verify the build passes

# Deploy
git add .
git commit -m "Description of changes"
git push origin main  # Triggers automatic Vercel deployment
```

### Updating Dependencies

Periodically update npm packages for security patches:

```bash
npm update            # Update within semver ranges
npm audit             # Check for known vulnerabilities
npm audit fix         # Auto-fix what's possible
```

For major Next.js version upgrades, consult the Next.js upgrade guide at https://nextjs.org/docs/upgrading.

### Database Backups

Supabase automatically handles daily backups on paid plans. On the free tier:

1. Go to Supabase Dashboard > Settings > Database
2. You can manually create backups or export data as needed
3. The admin panel also has a **donation export** feature for backing up donation records

### Monitoring

- **Vercel:** Check the "Deployments" tab for build/deploy status and the "Analytics" tab for traffic
- **Stripe:** Monitor payments, disputes, and webhook deliveries at https://dashboard.stripe.com
- **Supabase:** Monitor database usage, API requests, and storage at your Supabase project dashboard
- **Resend:** Monitor email deliveries, bounces, and complaints at https://resend.com

---

## Quick Reference -- All Commands

```bash
npm run dev      # Start local development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server locally
npm run lint     # Run ESLint
```

## Tech Stack Summary

| Layer      | Technology          |
| ---------- | ------------------- |
| Framework  | Next.js 16 (App Router) |
| Language   | TypeScript          |
| Styling    | Tailwind CSS 4      |
| UI         | Radix UI + shadcn/ui |
| Database   | Supabase (PostgreSQL) |
| Auth       | Supabase Auth       |
| Storage    | Supabase Storage    |
| Payments   | Stripe              |
| Email      | Resend              |
| Hosting    | Vercel              |
| Charts     | Recharts            |
| Forms      | React Hook Form     |
