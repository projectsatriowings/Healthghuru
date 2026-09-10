# HealthGhuru — Enterprise Health Content & Wellness Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

HealthGhuru is an enterprise-grade digital health media, content aggregation, and personal wellness platform. It combines an automated health intelligence engine—ingesting, classifying, deduplicating, and scoring medical news and video literature—with personal health record management (Health Vault), wellness tracking, and an editorial publication system.

---

## 🌟 Key Platform Features

### 1. Multi-Format Health Content Aggregation
- **Unified Media Catalog**: Discovers, classifies, and indexes **News**, **Articles**, **Digital Magazines**, and **YouTube Videos**.
- **Automated Ingestion Pipeline**:
  - Pluggable adapters: **RSS 2.0**, **Atom 1.0**, **YouTube Channel Feeds & Data API v3**, **NewsAPI**, and **Generic REST APIs**.
  - **SSRF Defense Firewall**: Blocks private network ranges, loopbacks, link-local IPs, and cloud metadata targets (`169.254.169.254`).
  - **4-Level Deduplication Engine**:
    - *Level 1*: External Item ID matching.
    - *Level 2*: Canonical URL normalization (stripping tracking queries, UTM tags, and protocol variants).
    - *Level 3*: Exact headline match within a rolling 48-hour window.
    - *Level 4*: Sørensen-Dice bigram string similarity for syndicated content.
  - **Deterministic Health Classifier**: Categorizes content across 20+ medical pillars with confidence scores and tag extraction.
  - **Trust & Quality Scoring**: Rates stories (0–100) factoring source authority, completeness, capitalization hygiene, and freshness decay.
- **Fair-Use Compliance**: Publisher attribution badges, external canonical links, and prominent medical disclaimers.

### 2. Public Discovery Experience
- **Live Breaking News Ticker**: Real-time pulsing alert bar for verified medical breakthroughs.
- **Editorial Hubs**:
  - `/news`: Real-time health updates with category filters.
  - `/articles`: Unified hub integrating HealthGhuru original articles and curated medical literature.
  - `/videos` & `/video/[slug]`: Video gallery with inline YouTube embeds and related content suggestions.
  - `/magazines`: Periodicals and digital health digests.
  - `/latest` & `/trending`: Chronological and engagement-ranked streams.
  - `/search`: Multi-faceted instant search across headlines, bodies, tags, and formats.
  - `/category/[slug]` & `/source/[slug]`: Dynamic topic pillar pages and publisher profiles.

### 3. Personal Health Vault
- **Encrypted Medical Records**: Secure storage of lab reports, prescriptions, clinical summaries, and doctor notes.
- **Family Member Profiles**: Multi-profile management under a single account.
- **Health Goals Tracker**: Metrics tracking (blood glucose, weight, blood pressure, etc.) with visual progress history.
- **Wellness Logging**: Workouts, sleep cycles, dietary meals, and daily mental wellness journals.

### 4. Admin Operations & Governance Console
- **Feed Sources Management** (`/admin/sources`): Create, toggle, configure cadence, and preview live feeds with the interactive drawer.
- **Editorial Review Queue** (`/admin/review-queue`): Batch approve or reject content from sources flagged for human review.
- **Ingestion Run Monitor** (`/admin/ingestion`): Real-time batch logs, execution durations, and per-item error isolation.
- **Taxonomy Manager** (`/admin/categories`): Dynamic hierarchy and category slug management.
- **Unified Catalog** (`/admin/content`): Manage, edit, feature, or soft-delete content items.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) (with `@neondatabase/serverless`)
- **Authentication**: [Auth.js / NextAuth.js](https://authjs.dev/) with bcrypt password hashing
- **Styling**: Tailwind CSS with custom healthcare tokens and glassmorphism accents
- **Icons**: Lucide React
- **XML/Feed Parser**: `fast-xml-parser`
- **Validation**: Zod schema validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- A Neon PostgreSQL database instance

### 1. Clone the Repository
```bash
git clone https://github.com/projectsatriowings/Healthghuru.git
cd Healthghuru
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth / Auth.js Configuration
AUTH_SECRET="your_nextauth_secret_here"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# Cron Ingestion Secret
CRON_SECRET="your_secure_cron_secret_here"

# Public App URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional API Keys (YouTube feed parsing works without API key via Atom fallback)
NEWS_API_KEY=""
YOUTUBE_API_KEY=""
```

### 4. Initialize Database
Run the setup and migration scripts to initialize all 28 tables, categories, and sources:

```bash
# Setup core vault & user tables
node scripts/setup-complete-db.js

# Setup content aggregation tables, seeds, and initial sources
node scripts/migrate-content-platform.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Access & Authentication

### Admin Portal
- **URL**: `/admin/login`
- **Email**: `admin@healthghuru.com`
- **Password**: `admin123`

### Demo User (Health Vault)
- **URL**: `/login`
- **Email**: `user@example.com`
- **Password**: `password123`

---

## 🧪 Testing & Ingestion

### Automated Unit Test Suite
Execute the content platform unit tests (SSRF, URL canonicalization, XML parsing, deduplication, quality scoring):
```bash
npx tsx tests/ingestion.test.ts
```

### Automated Ingestion via Cron
Trigger an ingestion cycle manually via HTTP:
```bash
curl -X POST http://localhost:3000/api/cron/ingest \
  -H "Authorization: Bearer your_secure_cron_secret_here"
```

---

## 📦 Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 📄 License
All rights reserved © 2026 HealthGhuru.
