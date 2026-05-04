import FirecrawlApp from '@mendable/firecrawl-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || '' });
    const result = await firecrawl.scrape(url, { formats: ['markdown'] });
    
    if (!result) {
      throw new Error(`Firecrawl returned empty result`);
    }

    return NextResponse.json({ markdown: result.markdown });
  } catch (err: any) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: err.message || 'Scrape failed' }, { status: 500 });
  }
}
