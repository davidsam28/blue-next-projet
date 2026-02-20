#!/usr/bin/env node

/**
 * Blue Next Projet -- Environment Setup Validator
 *
 * Validates that all required environment variables are set,
 * tests the Supabase connection, and verifies the storage bucket exists.
 *
 * Usage:
 *   node scripts/setup-check.mjs
 *
 * Reads from .env.local in the project root.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Helpers: colored output
// ---------------------------------------------------------------------------
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

const PASS = `${colors.green}PASS${colors.reset}`;
const FAIL = `${colors.red}FAIL${colors.reset}`;
const WARN = `${colors.yellow}WARN${colors.reset}`;
const INFO = `${colors.cyan}INFO${colors.reset}`;

function heading(text) {
  console.log(
    `\n${colors.bold}${colors.cyan}${"=".repeat(60)}${colors.reset}`
  );
  console.log(`${colors.bold}${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}\n`);
}

function section(text) {
  console.log(`\n${colors.bold}--- ${text} ---${colors.reset}\n`);
}

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const envPath = resolve(projectRoot, ".env.local");

const env = {};

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  console.log(`${INFO}  Loaded environment from ${envPath}`);
} else {
  console.log(
    `${WARN}  No .env.local found at ${envPath}. Falling back to process.env.`
  );
  console.log(
    `${colors.dim}     (Run "cp .env.example .env.local" and fill in your values)${colors.reset}`
  );
}

// Merge: .env.local values take precedence, fall back to process.env
function getVar(name) {
  return env[name] || process.env[name] || "";
}

// ---------------------------------------------------------------------------
// Define required and optional variables
// ---------------------------------------------------------------------------
const REQUIRED_VARS = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    hint: "Supabase > Settings > API > Project URL",
    validate: (v) => v.startsWith("https://") && v.includes(".supabase.co"),
    formatError: 'Must start with "https://" and contain ".supabase.co"',
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    hint: "Supabase > Settings > API > anon/public key",
    validate: (v) => v.length > 20,
    formatError: "Appears too short to be a valid key",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    hint: "Supabase > Settings > API > service_role key",
    validate: (v) => v.length > 20,
    formatError: "Appears too short to be a valid key",
  },
  {
    name: "STRIPE_SECRET_KEY",
    hint: "Stripe > Developers > API Keys > Secret key",
    validate: (v) => v.startsWith("sk_test_") || v.startsWith("sk_live_"),
    formatError: 'Must start with "sk_test_" or "sk_live_"',
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    hint: "Stripe > Developers > API Keys > Publishable key",
    validate: (v) => v.startsWith("pk_test_") || v.startsWith("pk_live_"),
    formatError: 'Must start with "pk_test_" or "pk_live_"',
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    hint: "Stripe > Developers > Webhooks > Signing secret",
    validate: (v) => v.startsWith("whsec_"),
    formatError: 'Must start with "whsec_"',
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    hint: 'Your site URL (e.g., "https://yourdomain.com" or "http://localhost:3000")',
    validate: (v) => v.startsWith("http://") || v.startsWith("https://"),
    formatError: 'Must start with "http://" or "https://"',
  },
  {
    name: "ADMIN_EMAIL",
    hint: "The admin user email (must match the user in Supabase Auth)",
    validate: (v) => v.includes("@") && v.includes("."),
    formatError: "Must be a valid email address",
  },
];

const OPTIONAL_VARS = [
  {
    name: "RESEND_API_KEY",
    hint: "Resend > API Keys (starts with re_)",
    validate: (v) => v.startsWith("re_"),
    formatError: 'Must start with "re_"',
  },
  {
    name: "FROM_EMAIL",
    hint: 'Sender email address (e.g., "noreply@yourdomain.org")',
    validate: (v) => v.includes("@"),
    formatError: "Must be a valid email address",
  },
  {
    name: "FROM_NAME",
    hint: 'Sender display name (e.g., "Blue Next Projet")',
    validate: (v) => v.length > 0,
    formatError: "Should not be empty if set",
  },
];

// ---------------------------------------------------------------------------
// Check 1: Environment Variables
// ---------------------------------------------------------------------------
heading("Blue Next Projet -- Setup Check");

let totalPass = 0;
let totalFail = 0;
let totalWarn = 0;

section("Required Environment Variables");

for (const v of REQUIRED_VARS) {
  const value = getVar(v.name);
  if (!value) {
    console.log(`  ${FAIL}  ${v.name}`);
    console.log(`${colors.dim}         Missing. Find it at: ${v.hint}${colors.reset}`);
    totalFail++;
  } else if (v.validate && !v.validate(value)) {
    console.log(`  ${WARN}  ${v.name}`);
    console.log(
      `${colors.dim}         Set but format looks wrong: ${v.formatError}${colors.reset}`
    );
    totalWarn++;
  } else {
    const masked =
      value.length > 12
        ? value.slice(0, 8) + "..." + value.slice(-4)
        : "****";
    console.log(`  ${PASS}  ${v.name}  ${colors.dim}(${masked})${colors.reset}`);
    totalPass++;
  }
}

section("Optional Environment Variables");

for (const v of OPTIONAL_VARS) {
  const value = getVar(v.name);
  if (!value) {
    console.log(`  ${WARN}  ${v.name}  ${colors.dim}(not set -- feature disabled)${colors.reset}`);
    console.log(`${colors.dim}         ${v.hint}${colors.reset}`);
    totalWarn++;
  } else if (v.validate && !v.validate(value)) {
    console.log(`  ${WARN}  ${v.name}`);
    console.log(
      `${colors.dim}         Set but format looks wrong: ${v.formatError}${colors.reset}`
    );
    totalWarn++;
  } else {
    const masked =
      v.name.includes("KEY") && value.length > 12
        ? value.slice(0, 8) + "..." + value.slice(-4)
        : value;
    console.log(`  ${PASS}  ${v.name}  ${colors.dim}(${masked})${colors.reset}`);
    totalPass++;
  }
}

// ---------------------------------------------------------------------------
// Check 2: Supabase Connection
// ---------------------------------------------------------------------------
section("Supabase Connection Test");

const supabaseUrl = getVar("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceKey = getVar("SUPABASE_SERVICE_ROLE_KEY");

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Test the REST API health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    if (response.ok) {
      console.log(`  ${PASS}  Supabase REST API is reachable`);
      totalPass++;
    } else {
      console.log(
        `  ${FAIL}  Supabase REST API returned status ${response.status}`
      );
      console.log(
        `${colors.dim}         Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct${colors.reset}`
      );
      totalFail++;
    }
  } catch (err) {
    console.log(`  ${FAIL}  Could not connect to Supabase: ${err.message}`);
    totalFail++;
  }

  // Test a table query to verify migrations were run
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=key&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    if (response.ok) {
      console.log(`  ${PASS}  Database tables exist (migration 001 was run)`);
      totalPass++;
    } else if (response.status === 404) {
      console.log(`  ${FAIL}  Table "site_settings" not found -- migration 001 may not have been run`);
      console.log(
        `${colors.dim}         Run supabase/migrations/001_initial_schema.sql in the SQL Editor${colors.reset}`
      );
      totalFail++;
    } else {
      console.log(
        `  ${WARN}  Could not query site_settings (status ${response.status})`
      );
      totalWarn++;
    }
  } catch (err) {
    console.log(`  ${WARN}  Could not verify tables: ${err.message}`);
    totalWarn++;
  }

  // Test LRC tables (migration 002)
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/lrc_posts?select=id&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    if (response.ok || response.status === 200) {
      console.log(`  ${PASS}  LRC tables exist (migration 002 was run)`);
      totalPass++;
    } else {
      console.log(`  ${WARN}  LRC table "lrc_posts" not accessible -- migration 002 may not have been run`);
      console.log(
        `${colors.dim}         Run supabase/migrations/002_lrc.sql in the SQL Editor${colors.reset}`
      );
      totalWarn++;
    }
  } catch (err) {
    console.log(`  ${WARN}  Could not verify LRC tables: ${err.message}`);
    totalWarn++;
  }

  // Test enrollments table (migration 003)
  if (supabaseServiceKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/enrollments?select=id&limit=1`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      );
      if (response.ok || response.status === 200) {
        console.log(`  ${PASS}  Enrollments table exists (migration 003 was run)`);
        totalPass++;
      } else {
        console.log(
          `  ${WARN}  Enrollments table not accessible -- migration 003 may not have been run`
        );
        console.log(
          `${colors.dim}         Run supabase/migrations/003_enrollments.sql in the SQL Editor${colors.reset}`
        );
        totalWarn++;
      }
    } catch (err) {
      console.log(`  ${WARN}  Could not verify enrollments table: ${err.message}`);
      totalWarn++;
    }
  } else {
    console.log(
      `  ${WARN}  Skipped enrollments table check (SUPABASE_SERVICE_ROLE_KEY not set)`
    );
    totalWarn++;
  }
} else {
  console.log(
    `  ${FAIL}  Cannot test Supabase -- URL or anon key is missing`
  );
  totalFail++;
}

// ---------------------------------------------------------------------------
// Check 3: Storage Bucket
// ---------------------------------------------------------------------------
section("Supabase Storage Bucket");

if (supabaseServiceKey && supabaseUrl) {
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    });
    if (response.ok) {
      const buckets = await response.json();
      const siteImages = buckets.find((b) => b.name === "site-images");
      if (siteImages) {
        console.log(`  ${PASS}  Storage bucket "site-images" exists`);
        totalPass++;
        if (siteImages.public) {
          console.log(`  ${PASS}  Bucket is set to public`);
          totalPass++;
        } else {
          console.log(`  ${WARN}  Bucket "site-images" is NOT public -- images will not load on the site`);
          console.log(
            `${colors.dim}         Go to Supabase > Storage > site-images > Settings and enable "Public bucket"${colors.reset}`
          );
          totalWarn++;
        }
      } else {
        const bucketNames = buckets.map((b) => b.name).join(", ") || "(none)";
        console.log(`  ${FAIL}  Storage bucket "site-images" NOT found`);
        console.log(
          `${colors.dim}         Found buckets: ${bucketNames}${colors.reset}`
        );
        console.log(
          `${colors.dim}         Create it: Supabase > Storage > New bucket > name "site-images" > Public ON${colors.reset}`
        );
        totalFail++;
      }
    } else {
      console.log(
        `  ${WARN}  Could not list storage buckets (status ${response.status})`
      );
      totalWarn++;
    }
  } catch (err) {
    console.log(`  ${FAIL}  Could not connect to Supabase Storage: ${err.message}`);
    totalFail++;
  }
} else {
  console.log(
    `  ${FAIL}  Cannot check storage -- SUPABASE_SERVICE_ROLE_KEY or URL is missing`
  );
  totalFail++;
}

// ---------------------------------------------------------------------------
// Check 4: Migration files exist locally
// ---------------------------------------------------------------------------
section("Local Migration Files");

const migrations = [
  "supabase/migrations/001_initial_schema.sql",
  "supabase/migrations/002_lrc.sql",
  "supabase/migrations/003_enrollments.sql",
];

for (const m of migrations) {
  const fullPath = resolve(projectRoot, m);
  if (existsSync(fullPath)) {
    console.log(`  ${PASS}  ${m}`);
    totalPass++;
  } else {
    console.log(`  ${FAIL}  ${m}  ${colors.dim}(file not found)${colors.reset}`);
    totalFail++;
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
heading("Summary");

console.log(`  ${colors.green}Passed:${colors.reset}   ${totalPass}`);
console.log(`  ${colors.yellow}Warnings:${colors.reset} ${totalWarn}`);
console.log(`  ${colors.red}Failed:${colors.reset}   ${totalFail}`);
console.log();

if (totalFail === 0 && totalWarn === 0) {
  console.log(
    `${colors.green}${colors.bold}  All checks passed! Your environment is fully configured.${colors.reset}\n`
  );
} else if (totalFail === 0) {
  console.log(
    `${colors.yellow}${colors.bold}  Setup looks good but there are warnings. Optional features may be disabled.${colors.reset}\n`
  );
} else {
  console.log(
    `${colors.red}${colors.bold}  Some required checks failed. Fix the issues above before deploying.${colors.reset}\n`
  );
  console.log(
    `${colors.dim}  See DEPLOYMENT.md for detailed setup instructions.${colors.reset}\n`
  );
}

process.exit(totalFail > 0 ? 1 : 0);
