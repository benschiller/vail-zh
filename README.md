# VAIL ZH - Market Intelligence from Chinese Twitter Spaces

A Next.js application that displays English-translated reports from Chinese crypto Twitter Spaces using the VAIL API.

## Prerequisites

- Node.js 18+ 
- npm
- Access to VAIL API with bearer token

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Update `.env.local` with your VAIL API bearer token:

```env
VAIL_API_BEARER_TOKEN=your_actual_bearer_token_here
NEXT_PUBLIC_API_URL=https://api.vail.report
```

3. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
vail-zh/
├── app/
│   ├── chinese/                  # Main list page
│   │   └── spaces/[id]/         # Individual report pages
│   ├── api/spaces/              # API route for pagination
│   └── layout.tsx               # Root layout with Geist fonts
├── components/
│   ├── header.tsx               # Shared header component
│   ├── space-card.tsx           # Space list item component
│   ├── spaces-list.tsx          # Spaces list with pagination
│   ├── report-display.tsx       # Report rendering component
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── api.ts                   # API client functions
│   ├── types.ts                 # TypeScript interfaces
│   ├── format.ts                # Formatting utilities
│   └── utils.ts                 # General utilities
└── .env.local                   # Environment variables
```

## Features

### List Page (`/chinese`)
- Displays Chinese crypto Twitter Spaces with published English reports
- Shows space metadata: title, date, duration, listeners, speakers, host
- "View Report" button to see full report
- "Listen on X" button to redirect to Twitter/X
- "Load More" button for pagination

### Report Page (`/chinese/spaces/[id]`)
- Header card with all space metadata
- Report sections in fixed order:
  1. Abstract
  2. Timeline
  3. Key Insights
  4. Project Mentions
  5. Hot Takes
  6. Potential Alpha
  7. Market Sentiment
- "Back to list" navigation
- "Listen on X" button

## Global Gate Filter

The app applies a server-side filter to show only spaces that meet ALL criteria:

- `detected_language = 'zh'` (Chinese language)
- `is_crypto = true` (crypto-related content)
- `state IN ('Ended', 'TimedOut')` (completed spaces)
- Has published English report (`report_language = 'en'`, `is_published = true`)

## API Integration

The app calls the VAIL Core API via bearer auth (server-side only):

- `GET /v0/spaces` - List spaces with pagination
- `GET /v0/spaces/[id]/report` - Get full report
- `GET /v0/spaces/[id]/listen` - Redirect to Twitter/X

## Design System

- **Fonts:** Geist Sans, Geist Mono (Vercel design system)
- **Colors:** OKLCH color tokens (dark mode default)
- **UI Framework:** Tailwind CSS + shadcn/ui components
- **Aesthetic:** Clean, minimal, border-based separation

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

The app is designed to deploy on Vercel:

1. Push to GitHub repository
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

Route configuration for production:
- Root: `vail.report/` (existing landing page)
- This app: `vail.report/chinese` (path-based routing)

## Next Steps (Post-MVP)

- [ ] Add OpenGraph metadata for social sharing
- [ ] Implement server-side analytics
- [ ] Add error boundaries and better error handling
- [ ] Implement loading states
- [ ] Add mobile-optimized layouts
- [ ] Set up CI/CD pipeline
