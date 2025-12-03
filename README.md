# ProtectMyMobile 📱🇬🇧

**ProtectMyMobile** is a comprehensive resource for mobile phone theft prevention, statistics, and recovery in the UK. It features real-time data visualization, community-driven analytics, and actionable advice to help users protect their devices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build) (SSR mode)
- **UI Library:** [React](https://react.dev) (for interactive islands)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Database:** [Convex](https://convex.dev) (Real-time backend)
- **Maps:** [Leaflet](https://leafletjs.com)
- **Charts:** [Recharts](https://recharts.org)
- **Hosting:** [Netlify](https://netlify.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Package Manager:** [Bun](https://bun.sh)

## ✨ Key Features

### 📊 UK Theft Statistics
- Interactive dashboard showing national and regional theft data.
- Real-time city toggles (UK, London, Manchester, Birmingham).
- Breakdown of theft hotspots, time-of-day risks, and recovery rates.
- **Source:** Met Police, ONS, and Home Office data.

### 🗺️ Interactive Timelapse Map
- **UK-First View:** Visualizes theft density across major UK cities.
- **London Drill-down:** Detailed choropleth map of London boroughs.
- **Seasonal Trends:** Animated timeline showing how theft patterns change throughout the year.
- **Privacy-Focused:** Aggregated data only; no individual addresses exposed.

### 🗳️ Community Analytics
- Anonymous voting system for users to share their theft experiences.
- Real-time insights on recovery rates, police reporting, and security measures.
- IP-based hashing for spam prevention without tracking personal data.

### 🛡️ Prevention & Recovery Resources
- **Security Checkup:** Interactive tool to assess device safety.
- **Emergency Guide:** Step-by-step actions to take immediately after theft.
- **Bank & Provider Contacts:** Quick access to essential contact numbers.

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
   RESEND_API_KEY=your_resend_key_optional
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
│   └── ...
├── public/                  # Static assets (images, geojson)
├── src/
│   ├── components/          # UI Components (React & Astro)
│   ├── data/                # Static data files
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Utilities & Convex client
│   ├── pages/               # File-based routing
│   │   ├── api/             # Server-side API endpoints
│   │   └── ...
│   └── styles/              # Global CSS
└── package.json
```

## 🚢 Deployment

The project is configured for deployment on **Netlify** with **Bun**.

1. Connect your GitHub repository to Netlify.
2. Build command: `bun run build`
3. Publish directory: `dist`
4. Add `PUBLIC_CONVEX_URL` and other environment variables in Netlify dashboard.
5. Deploy Convex to production: `bunx convex deploy --prod`

## 📄 License

This project is licensed under the MIT License.
