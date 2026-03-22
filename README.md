# ProtectMyMobile 📱🇬🇧

**ProtectMyMobile** is a comprehensive resource for mobile phone theft prevention, statistics, and recovery in the UK. It features real-time data visualization, automated news aggregation, community-driven analytics, and actionable advice to help users protect their devices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build) (SSR mode)
- **UI Library:** [React](https://react.dev) (for interactive islands)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **Database:** [Convex](https://convex.dev) (Real-time backend)
- **Charts:** [Recharts](https://recharts.org)
- **Hosting:** [Netlify](https://netlify.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Package Manager:** [Bun](https://bun.sh)

## ✨ Key Features

### 📊 UK Theft Statistics & Live Trends
- **Live Monthly Trends:** Interactive area charts showing theft patterns over time across UK cities
- **Police.uk Integration:** Automated data fetching from official crime statistics API
- **13 Location Pages:** Detailed theft hotspots for London, Manchester, Birmingham, Liverpool, Leeds, Edinburgh, Glasgow, Bristol, Brighton, and London boroughs
- **Data Visualization:** Stacked area charts with toggle between stacked/lines view

### 📰 Automated News Aggregation
- **12+ News Sources:** Automatically monitors Google News, BBC, Guardian, Sky News, Evening Standard, Metro, Daily Mail, Telegraph, Mirror, ITV, and Independent
- **Smart Categorization:** Articles auto-categorized as Arrests, Seizures, Law Changes, Statistics, or Prevention Tips
- **Relevance Scoring:** Keyword-based filtering to ensure only phone-theft related articles are included
- **RSS Feed:** Subscribe to updates via `/rss.xml`
- **Twice Daily Updates:** Automated cron jobs fetch new articles at 6am and 6pm UTC

### 🔍 Site-Wide Search
- **Command+K Modal:** Quick access search with keyboard shortcut
- **40+ Pages Indexed:** Search across guides, locations, directories, and resources
- **Keyboard Navigation:** Arrow keys to navigate, Enter to select
- **Categorized Results:** Results grouped by category (Emergency, Prevention, Locations, etc.)

### 🗺️ Location-Specific Guides
- **Theft Hotspots:** High-risk areas identified for each city/borough
- **Transport Safety:** Mode-specific advice (Tube, Bus, Rail, Metro)
- **Police Contacts:** Direct links to report theft in each area
- **Breadcrumb Navigation:** Easy navigation back to statistics overview

### 🗳️ Community Analytics
- Anonymous voting system for users to share theft experiences
- Real-time insights on recovery rates, police reporting, and security measures
- IP-based hashing for spam prevention without tracking personal data

### 🛡️ Prevention & Recovery Resources
- **Security Checkup:** Interactive 12-question assessment with personalized recommendations
- **Emergency Guide:** 5-step action plan for when your phone is stolen
- **Bank Directory:** Emergency contact numbers for all UK banks
- **Mobile Provider Directory:** Contact numbers for network providers to block SIMs
- **Scenario Gallery:** Visual guides showing common theft methods and prevention strategies

### 🎨 UI/UX Improvements
- **Loading Skeletons:** Smooth loading states for async content
- **Print Styles:** Optimized print layouts for emergency guides
- **Breadcrumbs:** Navigation aid on deep pages
- **Mobile Emergency CTA:** Quick-access emergency button in mobile header
- **Responsive Design:** Mobile-first design optimized for all screen sizes

## 🛠️ Development

### Prerequisites
- [Bun](https://bun.sh) 1.3+
- [Convex](https://convex.dev) account

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/antonio59/ProtectMyMobile.git
   cd ProtectMyMobile
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_CONVEX_URL=your_convex_deployment_url
   CRON_SECRET=your_secure_random_string
   RESEND_API_KEY=your_resend_api_key_optional
   ```

4. **Start Convex development server:**
   ```bash
   bunx convex dev
   ```

5. **Start Astro development server:**
   ```bash
   bun run dev
   ```
   Visit `http://localhost:4321`

## 📂 Project Structure

```
/
├── convex/                  # Convex backend functions & schema
│   ├── schema.ts            # Database schema
│   ├── banks.ts             # Bank queries/mutations
│   ├── newsPosts.ts         # News queries/mutations
│   ├── theftDataPoints.ts   # Crime statistics data
│   └── ...
├── netlify/functions/       # Netlify scheduled functions
│   ├── scheduled-news.ts    # Daily news fetching
│   └── scheduled-police-data.ts  # Weekly police data refresh
├── public/                  # Static assets
├── src/
│   ├── components/          # UI Components
│   │   ├── SiteSearch.tsx   # Command+K search modal
│   │   ├── TheftTrendsChart.tsx  # Live trends visualization
│   │   ├── Breadcrumb.astro # Navigation breadcrumbs
│   │   └── ui/Skeleton.tsx  # Loading skeletons
│   ├── data/                # Static data files
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Utilities & Convex client
│   ├── pages/               # File-based routing
│   │   ├── api/             # Server-side API endpoints
│   │   ├── [location].astro # Location-specific guides (13 cities)
│   │   └── news/            # News listing & article pages
│   └── styles/              # Global CSS (including print styles)
└── package.json
```

## 🚢 Deployment

The project is configured for deployment on **Netlify** with **Bun**.

1. Connect your GitHub repository to Netlify
2. Build command: `bun run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `PUBLIC_CONVEX_URL`
   - `CRON_SECRET`
5. Deploy Convex to production: `bunx convex deploy --prod`

### Scheduled Functions

The following cron jobs run automatically on Netlify:

| Function | Schedule | Description |
|----------|----------|-------------|
| `scheduled-news` | 0 6,18 * * * | Fetch news twice daily (6am, 6pm UTC) |
| `scheduled-police-data` | 0 3 * * 0 | Refresh police.uk data weekly (Sundays 3am) |

## 📄 License

This project is licensed under the MIT License.
