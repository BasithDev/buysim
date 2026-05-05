# BuySim

**See your listing through your buyer's eyes.**

BuySim is an AI-powered Amazon listing analysis tool. Paste any Amazon product URL and get a competitive breakdown -- listing grade, keyword gaps, comparison table, AI suggestions, and a buyer simulation where five distinct personas evaluate your listing and render verdicts.

## Demo

This is a demo-only product. The shared environment has rate limiting, so expect occasional scraping failures during peak usage.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans, Manrope, Space Grotesk |
| AI | Google Gemini (`@google/generative-ai`) |
| Web Scraping | Firecrawl (`@mendable/firecrawl-js`) |
| Streaming | Custom SSE over `ReadableStream` |
| Package Manager | pnpm |
| Deployment | Vercel (60s max serverless timeout) |

## How It Works

### Full Request Flow

```
USER                 CLIENT (/analysis)           API                FIRECRAWL          GEMINI
|                      |                           |                    |                |
|  Paste Amazon URL    |                           |                    |                |
|-------------------->|                           |                    |                |
|                      |  POST /api/analyze {url}  |                    |                |
|                      |-------------------------->|                    |                |
|                      |                           |  Scrape product    |                |
|                      |                           |------------------>|                |
|                      |                           |<-------------------|  markdown      |
|                      |                           |   Parse product    |                |
|                      |                           |---------------------------------->|
|                      |                           |<-------------------|  ProductData   |
|                      |                           |                    |                |
|                      |                           |  Scrape search     |                |
|                      |                           |------------------>|  results page  |
|                      |                           |<-------------------|                |
|                      |                           |   Select           |                |
|                      |                           |   competitors      |                |
|                      |                           |---------------------------------->|
|                      |                           |<-------------------|  up to 5 ASINs |
|                      |                           |                    |                |
|  SSE progress events |                           |  Scrape each       |                |
|<---------------------|  Scrape + parse           |------------------>|  competitor    |
|                      |                           |<-------------------|  page (up to 3)|
|                      |                           |                    |                |
|                      |                           |   Generate         |                |
|                      |                           |   comparison       |                |
|                      |                           |---------------------------------->|
|                      |                           |<-------------------|  ComparisonResult|
|                      |                           |                    |                |
|  SSE complete event  |                           |   AnalysisResult   |                |
|<---------------------|<---------------------------|                    |                |
|                      |                           |                    |                |
|  Click "Simulate"    |                           |                    |                |
|-------------------->|                           |                    |                |
|                      |  POST /api/simulate-buying|                    |                |
|                      |  {mainProduct, competitors|                    |                |
|                      |   ,comparison}            |                    |                |
|                      |-------------------------->|                    |                |
|                      |                           |   Simulate 5       |                |
|                      |                           |   buyer personas   |                |
|                      |                           |---------------------------------->|
|                      |                           |<-------------------|  SimulationResult|
|  SSE stream w/       |                           |                    |                |
|  persona verdicts    |                           |                    |                |
|<---------------------|<---------------------------|                    |                |
```

### Step-by-Step Pipeline

**Phase 1 -- Analysis (`/api/analyze`)**

1. **Scrape main product** -- Firecrawl fetches the Amazon product page, returns clean markdown
2. **Parse product data** -- Gemini extracts structured JSON: title, brand, ASIN, price, rating, review count, category, specs, features, images
3. **Find competitors** -- Scrape Amazon search results page, Gemini selects up to 5 best-matching competitor ASINs (fallback: use "also viewed" data from main page)
4. **Scrape competitors** -- Iteratively scrape and parse up to 3 competitor product pages
5. **Generate comparison** -- Gemini produces insights, listing score (0-100), letter grade (A-F), suggested title, feature bullets, keyword gaps, review gaps
6. **Stream results** -- Full `AnalysisResult` sent back via SSE

**Phase 2 -- Buyer Simulation (`/api/simulate-buying`)**

7. **Five personas evaluate** -- Budget Buyer, Review-Driven, Quality Seeker, Brand Loyal, Listing Quality -- each with verdict (buy/skip/on-the-fence), confidence score, first-person monologue, and "where we lost" reason
8. **Render results** -- Persona cards with verdict badges, confidence bars, monologues, and simulated conversion rate

**Phase 3 -- Results Display**

The results dashboard renders these scrollable sections (via `SubNav`):

- **Listing Grade** -- Letter grade with color coding (A+ through F)
- **Product Context** -- Product card with image, animated score ring, quality breakdown bars
- **Listing Optimization** -- AI-suggested title rewrite, feature bullets, missing keywords, customer pain points
- **Market Comparison** -- Side-by-side comparison table (price, rating, reviews, specs) with best-value highlighting
- **AI Insight** -- Strengths, weaknesses, improvements cards with summary
- **Simulate Buying** -- Simulation trigger button + results display
- **Export Report** -- Copy to clipboard or download as `.txt` file

Results are persisted to `localStorage` (`buysim_analysis_result`) so they survive page refreshes.

## API Endpoints

### `POST /api/analyze`

Analyze an Amazon product listing against its competitors.

**Request:**
```json
{ "url": "https://www.amazon.com/dp/B0EXAMPLE" }
```

**Response:** SSE stream with `progress`, `complete`, and `error` events.

**Complete event payload:** `AnalysisResult` -- main product data, competitors array, comparison (insights, scores, grade, suggestions), and meta (total scrapes, time taken).

### `POST /api/simulate-buying`

Run a buyer persona simulation on the analysis results.

**Request:**
```json
{
  "mainProduct": { ...ProductData },
  "competitors": [ ...ProductData[] ],
  "comparison": { ...ComparisonResult }
}
```

**Response:** SSE stream with progress events per persona and a `complete` event with `SimulationResult` (five persona verdicts + summary).

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, Navbar, Footer)
│   ├── page.tsx                # Landing page (Hero, HowItWorks, AgentPreview)
│   ├── analysis/page.tsx       # Analysis dashboard (client component)
│   ├── api/
│   │   ├── analyze/route.ts    # Analysis SSE API endpoint
│   │   └── simulate-buying/    #
│   │       └── route.ts        # Buyer simulation SSE endpoint
│   ├── error.tsx               # Error boundary
│   ├── global-error.tsx        # Root error boundary
│   └── not-found.tsx           # 404 page
├── components/
│   ├── analysis/
│   │   ├── AiInsight.tsx       # Strengths/weaknesses/improvements
│   │   ├── AnalysisInput.tsx   # URL input form
│   │   ├── AnalysisLoading.tsx # Progress tracker
│   │   ├── ErrorFallback.tsx   # Error state with contextual messages
│   │   ├── ExportReport.tsx    # Copy/download report
│   │   ├── ListingGrade.tsx    # Letter grade display
│   │   ├── ListingOptimization.tsx  # AI suggestions
│   │   ├── MarketComparison.tsx     # Comparison table
│   │   ├── ProductContext.tsx       # Product card with score ring
│   │   ├── SimulateBuying.tsx       # Simulation trigger + results wrapper
│   │   ├── SimulationResults.tsx    # Persona cards with verdicts
│   │   └── SubNav.tsx               # Sticky section navigation
│   ├── home/
│   │   ├── AgentPreview.tsx    # Landing page preview section
│   │   ├── HeroSection.tsx     # Landing page hero
│   │   └── HowItWorks.tsx      # Landing page steps
│   └── layout/
│       ├── Footer.tsx           # Footer with demo disclaimer
│       └── Navbar.tsx           # Top navigation bar
├── lib/
│   ├── gemini.ts               # Gemini prompts and AI calls
│   ├── scraper.ts              # Firecrawl wrappers, URL builders
│   ├── sse.ts                  # SSE event stream reader
│   └── types.ts                # TypeScript interfaces
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Firecrawl](https://www.firecrawl.dev/) API key
- A [Google AI Studio](https://aistudio.google.com/) API key

### Setup

```bash
# Clone and install
git clone https://github.com/your-org/buysim.git
cd buysim
pnpm install

# Copy and fill in environment variables
cp .env.example .env

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|---|---|
| `FIRECRAWL_API_KEY` | Firecrawl API key for web scraping |
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis |
| `GEMINI_MODEL` | Gemini model to use (default: `gemini-3.1-flash-lite-preview`) |

## Key Design Patterns

- **SSE Streaming** -- Both API routes use `ReadableStream` with `text/event-stream` for real-time progress updates. Client reads events via `readSseEvents()` async generator in `lib/sse.ts`
- **AbortController** -- Both analysis and simulation flows use AbortControllers with `useRef` cleanup on unmount, preventing dangling fetches
- **LocalStorage persistence** -- Analysis results cached under `buysim_analysis_result` key, survives refreshes
- **Fallback strategy** -- Competitor search falls back to main product page "also viewed" data when Amazon blocks search scraping
- **Error categorization** -- `ErrorFallback` component parses error messages for contextual user-facing descriptions (rate limit, network, AI service, invalid URL)
- **Security headers** -- All routes get `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy` headers via `next.config.ts`

## Deployment

Deploy on [Vercel](https://vercel.com) -- set the environment variables in your Vercel project settings. API routes use `maxDuration = 60` for the maximum serverless function timeout.

```bash
pnpm build
vercel --prod
```
