# Blue Next Projet -- Getting Started Guide

Welcome! This guide walks you through setting up and managing your Blue Next Projet website. No coding experience is required -- just follow the steps below.

---

## Table of Contents

1. [Initial Setup (One-Time)](#1-initial-setup-one-time)
2. [Using the Admin Panel](#2-using-the-admin-panel)
3. [Managing Your Content](#3-managing-your-content)
4. [Managing Your Team](#4-managing-your-team)
5. [Managing Donations](#5-managing-donations)
6. [Managing Enrollments](#6-managing-enrollments)
7. [Learning Resource Center (LRC)](#7-learning-resource-center-lrc)
8. [Sending Emails to Donors](#8-sending-emails-to-donors)
9. [Changing Your Admin Password or Email](#9-changing-your-admin-password-or-email)
10. [Common Questions](#10-common-questions)
11. [Support](#11-support)

---

## 1. Initial Setup (One-Time)

Follow these five steps to get your site live. Each step links to the service you need.

### Step 1: Fork the Repository

1. Go to the project's GitHub page
2. Click the **Fork** button in the upper right
3. This creates your own copy of the code under your GitHub account

### Step 2: Create a Supabase Project (Your Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and give it a name (e.g., "blue-next-projet")
3. Choose a region close to your users and set a database password
4. Wait about 2 minutes for it to provision
5. Run the database migrations:
   - Click **SQL Editor** in the left sidebar
   - Click **New query**
   - Open each migration file from the `supabase/migrations/` folder (in order: `001_initial_schema.sql`, then `002_lrc.sql`, then `003_enrollments.sql`)
   - Paste the contents into the SQL editor and click **Run** for each one
6. Create the image storage bucket:
   - Click **Storage** in the left sidebar
   - Click **New bucket**, name it `site-images`, toggle **Public bucket** ON, click **Create bucket**
7. Create your admin user:
   - Click **Authentication** in the left sidebar
   - Click **Users** > **Add user** > **Create new user**
   - Enter your email and a strong password, toggle **Auto Confirm User** ON
   - Click **Create user**
8. Copy your API keys (you will need them in Step 4):
   - Click **Settings** > **API**
   - Note down the **Project URL**, **anon key**, and **service_role key**

### Step 3: Create a Vercel Project (Your Hosting)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New...** > **Project**
3. Find your forked repository and click **Import**
4. It should auto-detect **Next.js** as the framework -- leave the defaults
5. **Do NOT deploy yet** -- first add your environment variables (next step)

### Step 4: Set Your Environment Variables

In the Vercel project settings, go to **Settings** > **Environment Variables** and add each of the following:

| Variable | Where to Find It |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role key |
| `STRIPE_SECRET_KEY` | Stripe > Developers > API Keys > Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe > Developers > API Keys > Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe > Developers > Webhooks > your endpoint > Signing secret |
| `RESEND_API_KEY` | Resend > API Keys (optional -- for email features) |
| `FROM_EMAIL` | Your choice, e.g. `noreply@yourdomain.org` |
| `FROM_NAME` | Your organization name, e.g. `Blue Next Projet` |
| `NEXT_PUBLIC_APP_URL` | Your site's URL, e.g. `https://yourdomain.com` |
| `ADMIN_EMAIL` | The same email you used for the Supabase admin user |

Click **Save** after adding all variables.

### Step 5: Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site is now live at the URL Vercel provides (e.g., `https://your-app.vercel.app`)
4. Visit `/admin/login` to log in with the credentials you created in Step 2

From this point on, every time you push changes to the `main` branch on GitHub, Vercel will automatically rebuild and redeploy your site.

---

## 2. Using the Admin Panel

Access the admin panel at: **https://yourdomain.com/admin/login**

Log in with the email and password you created in Supabase during setup.

The admin panel has a sidebar with these sections:

| Section | What It Does |
|---------|-------------|
| **Dashboard** | Overview of donation stats, donor count, and recent activity |
| **Website Editor** | Edit all public page text and images (hero, mission, about, donate, contact) |
| **Programs** | Add, edit, reorder, and show/hide programs on the Programs page |
| **Team** | Add, edit, reorder, and show/hide team members on the Team page |
| **Donations** | View all donations, filter by source/status, export CSV, log manual donations |
| **Donors** | Search and manage your donor database |
| **Enrollments** | Review student enrollment applications |
| **LRC** | Manage Learning Resource Center content (posts, classes, resources, events) |
| **Email Donors** | Send emails to all donors or selected individuals |
| **Settings** | Organization info, payment channels, social links, and password change |

---

## 3. Managing Your Content

### Website Editor

The Website Editor lets you change all the text and images on your public site without touching any code.

1. Go to **Website Editor** in the admin sidebar
2. You will see sections for each part of your site:
   - **Hero Section** -- the large banner at the top of the homepage (headline, subtitle, buttons, background image)
   - **Mission Section** -- the mission statement on the homepage
   - **Impact Stats** -- the numbers displayed on the homepage (e.g., "500+ Individuals Served")
   - **About Page** -- your mission, vision, and approach text
   - **Donate Page** -- the donate page title, subtitle, and impact note
   - **Contact Page** -- the contact page title and subtitle
3. Edit the text fields and click **Save**
4. Changes appear on the live site immediately

### Uploading Images

When you see an image field (hero image, team photo, program image, etc.):

1. Click the upload button or drag and drop an image
2. Supported formats: JPEG, PNG, WebP, GIF, SVG
3. Maximum file size: 5MB
4. The image is stored in your Supabase storage bucket and displayed on the site

---

## 4. Managing Your Team

1. Go to **Team** in the admin sidebar
2. To add a team member, click **Add Team Member** and fill in:
   - Name
   - Title/Role
   - Bio (optional)
   - Photo (upload)
3. To edit, click on an existing team member
4. To reorder, change the **Display Order** number (lower numbers appear first)
5. To hide a team member without deleting them, toggle **Active** off
6. Team members appear on the public `/team` page

---

## 5. Managing Donations

### Viewing Donations

1. Go to **Donations** in the admin sidebar
2. You will see a table of all donations with:
   - Donor name
   - Amount
   - Source (Stripe, Zelle, or Cash App)
   - Status (completed, pending, or failed)
   - Date
3. Use the filters to narrow by source or status
4. Click **Export CSV** to download all donation records

### Logging Manual Donations (Zelle / Cash App)

Stripe donations are recorded automatically via webhooks. For Zelle and Cash App donations that you receive outside the website:

1. Click **Log Donation**
2. Enter the donor's name and email
3. Enter the amount and select the source (Zelle or Cash App)
4. Add any notes (e.g., "Received via Zelle on 2/15")
5. Click **Save**

### Managing Donors

1. Go to **Donors** in the admin sidebar
2. Search by name or email
3. Click a donor to see their full donation history
4. Add new donors manually or edit existing contact info

---

## 6. Managing Enrollments

The enrollment system allows students to apply for your programs through a public form on the website.

1. Go to **Enrollments** in the admin sidebar
2. You will see all submitted applications with their current status
3. Each application shows:
   - Student name, email, phone, age
   - School and location
   - Program interests and experience level
   - Social/music links
   - How they heard about you
4. Review each application and update its status:
   - **Pending** -- new submission, not yet reviewed
   - **Approved** -- accepted into the program
   - **Enrolled** -- confirmed and enrolled
   - **Waitlisted** -- on the waiting list
   - **Declined** -- not accepted
5. Click **Export CSV** to download enrollment data

---

## 7. Learning Resource Center (LRC)

The LRC section of the admin panel lets you manage educational content that appears on the public Learning Resource Center pages.

### Blog Posts

1. Go to **LRC** > **Posts** in the admin sidebar
2. Create new posts with a title, slug (URL-friendly name), content, category, and tags
3. Set the status:
   - **Draft** -- only visible in the admin panel
   - **Published** -- visible on the public site
   - **Archived** -- hidden from both
4. Mark posts as **Featured** to highlight them on the LRC landing page

### Classes / Courses

1. Go to **LRC** > **Classes**
2. Create a class with a title, description, difficulty level, and estimated duration
3. Add **Sections** to each class (reading material or video content)
4. Sections are ordered by their sort order number

### Resources / Guides

1. Go to **LRC** > **Resources**
2. Create downloadable resources with a title, description, and optional file URL
3. Publish them to make them available on the public site

### Events

1. Go to **LRC** > **Events**
2. Create events with title, description, date, location, and registration link
3. Published events appear on the public LRC events page

---

## 8. Sending Emails to Donors

Requires Resend to be configured (see DEPLOYMENT.md Section 6).

1. Go to **Email Donors** in the admin sidebar
2. Write your email:
   - **Subject** -- the email subject line
   - **Body** -- the email content (supports HTML)
3. Use personalization tags:
   - `{{first_name}}` -- inserts the donor's first name
   - `{{name}}` -- inserts the donor's full name
4. Choose recipients:
   - Send to **all donors** in your database
   - Or select specific donors
5. Click **Send**
6. All sent emails are logged and viewable in the email history

---

## 9. Changing Your Admin Password or Email

### Change Password

1. Log in to the admin panel
2. Go to **Settings** in the sidebar
3. Scroll to the **Change Password** section
4. Enter your new password and confirm it
5. Click **Update Password**

### Change Admin Email

1. Log in to the admin panel
2. Go to **Settings** in the sidebar
3. Use the **Change Email** section
4. Enter your new email address
5. You will need to verify the new email
6. After changing, also update the `ADMIN_EMAIL` environment variable in Vercel to match

---

## 10. Common Questions

**Q: How do I update the text on my homepage?**
A: Log in to the admin panel, go to Website Editor, and edit the Hero or Mission sections.

**Q: How do I add a new program?**
A: Go to Programs in the admin panel and click "Add Program."

**Q: Why are my uploaded images not showing?**
A: Check that the `site-images` storage bucket exists in your Supabase project and is set to Public. See DEPLOYMENT.md Section 4.3 for setup instructions.

**Q: How do I accept credit card donations?**
A: Stripe handles this automatically. Make sure your Stripe account is set up and your API keys are in the environment variables. Donors click "Donate" on the public site and pay through Stripe Checkout.

**Q: How do I record a Zelle or Cash App donation?**
A: Go to Donations in the admin panel and click "Log Donation" to manually enter it.

**Q: What happens if Resend is not set up?**
A: The site works fine without it. Email features (contact form forwarding, donation receipts, broadcast emails) are simply disabled. Everything else functions normally.

**Q: How do I make a blog post visible on the public site?**
A: In the LRC > Posts section, change the post's status from "Draft" to "Published."

**Q: How do I review student enrollment applications?**
A: Go to Enrollments in the admin panel. Each application shows up with a "Pending" status. Review the details and change the status to Approved, Enrolled, Waitlisted, or Declined.

---

## 11. Support

For technical issues or questions about your website:

- **Email:** [your-support-email@yourdomain.org]
- **Documentation:** See `DEPLOYMENT.md` for detailed technical setup instructions
- **Environment Check:** Run `node scripts/setup-check.mjs` to diagnose configuration issues

---

*This guide was prepared for Blue Next Projet. For the full technical deployment guide, see DEPLOYMENT.md.*
