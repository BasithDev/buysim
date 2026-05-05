import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || '' });

/** Scrape full page (includes sidebars). */
export async function scrapeFullPage(url: string): Promise<string> {
  const result = await firecrawl.scrape(url, { formats: ['markdown'], onlyMainContent: false });
  if (!result?.markdown) throw new Error(`Empty result for ${url}`);
  return result.markdown;
}

/** Scrape main content only. */
export async function scrapeMainContent(url: string): Promise<string> {
  const result = await firecrawl.scrape(url, { formats: ['markdown'] });
  if (!result?.markdown) throw new Error(`Empty result for ${url}`);
  return result.markdown;
}

/** Extract the Amazon domain from a URL. */
export function getAmazonDomain(url: string): string {
  const match = url.match(/(https?:\/\/www\.amazon\.[a-z.]+)/);
  return match ? match[1] : 'https://www.amazon.com';
}

/** Build a search URL on the same Amazon domain. */
export function buildSearchUrl(query: string, originalUrl: string): string {
  const domain = getAmazonDomain(originalUrl);
  const encoded = encodeURIComponent(query);
  return `${domain}/s?k=${encoded}`;
}

/** Build a product URL from ASIN on the same domain. */
export function buildProductUrl(asin: string, originalUrl: string): string {
  return `${getAmazonDomain(originalUrl)}/dp/${asin}`;
}
