import { scrapeFullPage, scrapeMainContent, buildSearchUrl, buildProductUrl } from '@/lib/scraper';
import { parseProductFromMarkdown, selectBestCompetitors, generateComparison, type ProductData, type ComparisonResult } from '@/lib/gemini';

export interface AnalysisResult {
  mainProduct: ProductData;
  competitors: ProductData[];
  comparison: ComparisonResult;
  meta: { totalScrapes: number; competitorAsins: string[]; timeTakenMs: number };
}

/** Build a short search query: use Gemini's searchQuery, or strip brand from first phrase of title */
function buildSearchQuery(product: ProductData): string {
  // Prefer Gemini's generated search query (it's already concise)
  if (product.searchQuery?.trim()) return product.searchQuery.trim();

  // Fallback: remove brand from title and take first comma-separated phrase
  let query = product.title || '';
  if (product.brand) {
    const brandRegex = new RegExp(`^${product.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
    query = query.replace(brandRegex, '');
  }
  // Take first meaningful chunk (before first comma)
  const firstPhrase = query.split(',')[0].trim();
  return firstPhrase || query.substring(0, 80);
}

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) {
    return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const startTime = Date.now();

      try {
        // Step 1: Get product details (full page to also capture "also viewed" as fallback)
        send({ type: 'progress', step: 1, total: 6, message: 'Getting your product details...' });
        const t1 = Date.now();
        const mainMarkdown = await scrapeFullPage(url);
        send({ type: 'progress', step: 1, total: 6, message: 'Product page loaded', done: true, durationMs: Date.now() - t1 });

        // Step 2: AI analysis of main product
        send({ type: 'progress', step: 2, total: 6, message: 'AI is analyzing your product...' });
        const t2 = Date.now();
        const mainProduct = await parseProductFromMarkdown(mainMarkdown, url);
        send({ type: 'progress', step: 2, total: 6, message: `Identified: ${mainProduct.brand} — ${mainProduct.productType}`, done: true, durationMs: Date.now() - t2 });

        // Step 3: Find competitors
        send({ type: 'progress', step: 3, total: 6, message: `Searching for similar ${mainProduct.productType || 'products'}...` });
        const t3 = Date.now();
        let candidateAsins: string[] = [];

        // Try 1: Search Amazon with a concise query
        const searchQuery = buildSearchQuery(mainProduct);
        const searchUrl = buildSearchUrl(searchQuery, url);
        console.log(`[Search] Query: "${searchQuery}"`);
        console.log(`[Search] URL: ${searchUrl}`);

        try {
          const searchMarkdown = await scrapeMainContent(searchUrl);

          // Check if Amazon returned an error page
          if (searchMarkdown.includes('rush hour') || searchMarkdown.includes('503') || searchMarkdown.length < 500) {
            console.log('[Search] Amazon returned error page, falling back to product page competitors');
            throw new Error('Amazon blocked search');
          }

          send({ type: 'progress', step: 3, total: 6, message: 'AI is picking the best competitors...' });
          candidateAsins = await selectBestCompetitors(searchMarkdown, {
            title: mainProduct.title,
            brand: mainProduct.brand,
            asin: mainProduct.asin,
            productType: mainProduct.productType,
          });
        } catch {
          // Fallback: extract competitors from the main product page ("also viewed" section)
          send({ type: 'progress', step: 3, total: 6, message: 'Using product page recommendations as fallback...' });
          candidateAsins = await selectBestCompetitors(mainMarkdown, {
            title: mainProduct.title,
            brand: mainProduct.brand,
            asin: mainProduct.asin,
            productType: mainProduct.productType,
          });
        }

        send({ type: 'progress', step: 3, total: 6, message: `Found ${candidateAsins.length} competing products`, done: true, durationMs: Date.now() - t3 });

        // Step 4: Get details for each competitor
        const competitors: ProductData[] = [];
        const validAsins: string[] = [];
        const MAX_VALID = 3;

        for (let i = 0; i < candidateAsins.length && competitors.length < MAX_VALID; i++) {
          const asin = candidateAsins[i];
          // Always build URL on the SAME domain as the original product
          const compUrl = buildProductUrl(asin, url);

          send({ type: 'progress', step: 4, total: 6, message: `Getting competitor ${competitors.length + 1} of ${MAX_VALID} details...`, subStep: competitors.length + 1, subTotal: MAX_VALID });

          try {
            const compMarkdown = await scrapeMainContent(compUrl);

            send({ type: 'progress', step: 4, total: 6, message: `AI is analyzing competitor ${competitors.length + 1}...`, subStep: competitors.length + 1, subTotal: MAX_VALID });

            const compData = await parseProductFromMarkdown(compMarkdown, compUrl);

            // Skip empty results
            if (!compData.title?.trim()) {
              send({ type: 'progress', step: 4, total: 6, message: `Skipped empty listing, trying next...`, subStep: competitors.length + 1, subTotal: MAX_VALID });
              continue;
            }

            competitors.push(compData);
            validAsins.push(asin);

            send({ type: 'progress', step: 4, total: 6, message: `✓ ${compData.brand}: ${compData.title?.substring(0, 40)}...`, done: competitors.length >= MAX_VALID, subStep: competitors.length, subTotal: MAX_VALID });
          } catch (err: any) {
            send({ type: 'progress', step: 4, total: 6, message: `Skipped one product, trying next...`, error: true, subStep: competitors.length + 1, subTotal: MAX_VALID });
          }
        }

        // Step 5: AI comparison & insights
        send({ type: 'progress', step: 5, total: 6, message: 'AI is generating competitive insights...' });
        const t5 = Date.now();
        const comparison = await generateComparison(mainProduct, competitors);
        send({ type: 'progress', step: 5, total: 6, message: 'Competitive analysis ready', done: true, durationMs: Date.now() - t5 });

        // Step 6: Done
        const timeTakenMs = Date.now() - startTime;
        send({ type: 'progress', step: 6, total: 6, message: `Analysis complete — ${(timeTakenMs / 1000).toFixed(0)} seconds`, done: true, durationMs: timeTakenMs });

        send({ type: 'complete', data: {
          mainProduct, competitors, comparison,
          meta: { totalScrapes: 2 + competitors.length, competitorAsins: validAsins, timeTakenMs },
        } as AnalysisResult });

      } catch (err: any) {
        send({ type: 'error', message: err.message || 'Something went wrong' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
