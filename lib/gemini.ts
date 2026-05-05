import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
  generationConfig: { responseMimeType: 'application/json' },
});

export interface ProductData {
  title: string;
  brand: string;
  asin: string;
  url: string;
  price: string;
  originalPrice: string;
  rating: string;
  reviewCount: number;
  category: string[];
  productType: string;
  specifications: Record<string, string>;
  features: string[];
  images: string[];
  searchQuery: string;
}

export interface ComparisonResult {
  normalizedProducts: {
    asin: string;
    title: string;
    brand: string;
    price: number;
    currency: string;
    originalPrice: number;
    rating: number;
    reviewCount: number;
    capacity: string;
    material: string;
    keySpecs: Record<string, string>;
  }[];
  insights: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
  };
  listingScore: {
    overall: number;
    visualClarity: number;
    informationHierarchy: number;
    compellingCta: number;
  };
  grade: string;
  titleSuggestion: string;
  featureBulletSuggestions: string[];
  keywordGaps: { missingKeywords: string[]; explanation: string };
  reviewGaps: { competitorPainPoints: string[]; explanation: string };
}

/** Parse an Amazon product page markdown into structured JSON. */
export async function parseProductFromMarkdown(
  markdown: string,
  productUrl: string
): Promise<ProductData> {
  const prompt = `You are an expert Amazon product data extractor. Extract EVERY field. NEVER return empty/0 for fields that exist in the markdown.

Here is EXACTLY how data appears in scraped Amazon markdown:

TITLE — appears as an H1 heading:
  # HYDROWION 32oz Stainless Steel Water Bottle...
Extract the FULL title including all details after the brand name.

BRAND — appears as:
  [Visit the HYDROWION Store](...)  OR  Visit the XYZ Store
The brand name is between "Visit the " and " Store".

RATING — appears in these exact formats:
  4.5 _4.5 out of 5 stars_[(1,312)]
  OR: 3.9 _3.9 out of 5 stars_
The number before the underscore IS the rating. Extract as "4.5".

REVIEW COUNT — appears right after rating:
  [(1,312)]  OR  [(773)]  OR  _1,312 ratings_
The number in parentheses/brackets near "ratings" IS the count. Extract as number: 1312.

PRICE — appears as:
  $29.99  OR  ₹89.00 with 85 percent savings
  OR: $29.99$29.99 (duplicated text is normal)
Extract the first price with currency symbol.

MRP / ORIGINAL PRICE — appears as:
  M.R.P.: ₹599.00  OR  List Price: $39.99  OR  -85% ₹599
Extract with currency symbol.

FEATURES — appear under "# About this item" as bullet list:
  - \\[Feature Title\\]: Feature description here...
  - \\[Another Feature\\] - More details...
Extract each bullet as a clean sentence (remove \\[ \\] brackets).

IMAGES — appear as markdown images:
  ![alt](https://m.media-amazon.com/images/I/XXXXX._SS100_.jpg)
  ![alt](https://m.media-amazon.com/images/I/XXXXX._SX679_.jpg)
Collect ALL unique image IDs (the XXXXX part) and build high-res URLs:
  https://m.media-amazon.com/images/I/XXXXX._AC_SX679_.jpg

SPECIFICATIONS — appear in table format:
  | Brand | XYZ |
  | Material | Stainless Steel |
  | Capacity | 32 Ounces |
  OR in key-value pairs. Extract ALL as snake_case keys.

CATEGORY — breadcrumb links near top:
  - [Home & Kitchen](...) > [Kitchen & Dining](...) > [Water Bottles](...)

ASIN: Extract from /dp/XXXXXXXXXX/ in the URL: ${productUrl}

SEARCH QUERY: Generate a concise Amazon search query (under 8 words) to find competing products. NO brand name. Example: "32 oz insulated stainless steel water bottle"

Return ONLY valid JSON with ALL fields populated:
{ "title": "full title", "brand": "brand", "asin": "ASIN", "url": "${productUrl}", "price": "$XX.XX", "originalPrice": "$XX.XX", "rating": "4.5", "reviewCount": 1312, "category": ["Cat1","Cat2"], "productType": "last category", "specifications": {"key":"value"}, "features": ["feature1","feature2"], "images": ["url1","url2"], "searchQuery": "search terms" }

MARKDOWN:
${markdown.substring(0, 40000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as ProductData;
  } catch {
    console.error('Gemini parse error:', text.substring(0, 300));
    throw new Error('Gemini returned invalid JSON');
  }
}

/** Use Gemini to intelligently select the best competitor ASINs from search results. */
export async function selectBestCompetitors(
  searchMarkdown: string,
  mainProduct: { title: string; brand: string; asin: string; productType: string }
): Promise<string[]> {
  const prompt = `You are an Amazon product matching expert.

I sell: "${mainProduct.title}"
My brand: "${mainProduct.brand}"
My ASIN: ${mainProduct.asin}
My product type: ${mainProduct.productType}

Below are Amazon search results. Find exactly 5 ASINs of products that are DIRECT competitors.

STRICT RULES:
1. ONLY select products that are the EXACT SAME type: "${mainProduct.productType}". If my product is a water bottle, ONLY pick water bottles. NEVER pick electric kettles, trimmers, phone cases, or ANY other product type.
2. Each competitor MUST be from a DIFFERENT brand. Never pick 2 products from the same brand/seller.
3. Do NOT pick color variants or size variants of the same product (they have nearly identical titles).
4. Do NOT pick my own ASIN: ${mainProduct.asin}
5. IGNORE any "Sponsored" sections or ads — only use organic search results.
6. Prefer products with more reviews and higher ratings.
7. ASINs are 10-character codes found in /dp/XXXXXXXXXX/ URL patterns.

If you cannot find 5 valid competitors matching ALL rules, return fewer. NEVER include products of a different type.

Return JSON: { "asins": ["ASIN1", "ASIN2", ...], "reasoning": "why each was chosen" }

Search results:
${searchMarkdown.substring(0, 25000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const parsed = JSON.parse(text);
    console.log('[Competitor Selection]', parsed.reasoning);
    return (parsed.asins || []).filter((a: string) => a !== mainProduct.asin).slice(0, 5);
  } catch {
    console.error('Competitor selection parse error:', text.substring(0, 300));
    return [];
  }
}

export interface SimulationPersona {
  name: string;
  verdict: 'buy' | 'skip' | 'on-the-fence';
  confidence: number;
  monologue: string;
  where_we_lost: string;
}

export interface SimulationResult {
  personas: SimulationPersona[];
  summary: string;
}

/** Run 5 buyer persona simulations in a single Gemini call. */
export async function simulateBuying(
  mainProduct: ProductData,
  competitors: ProductData[],
  comparison: ComparisonResult
): Promise<SimulationResult> {
  const prompt = `You are analyzing buyer conversion from 5 distinct buyer psychology profiles.

RULES:
- Write in FIRST PERSON as a real shopper thinking out loud — emotional, biased, imperfect. NOT a bullet list or report.
- Each persona MUST have a distinct voice and decision-making pattern.
- Be specific — reference actual prices, ratings, brands, features from the data.
- For "where_we_lost", identify the EXACT listing element that made them look away (e.g. "the price was ₹600 more than the closest rival with almost identical specs").

THE 5 PERSONAS:

1. BUDGET BUYER — Seeks the cheapest option. Compares prices across all listings. Highly sensitive to discounts. Will pick the lowest price that still meets basic needs.
2. REVIEW-DRIVEN — Relies heavily on ratings and review counts. Skips listing copy entirely, goes straight to social proof. Trusts numbers over marketing.
3. QUALITY SEEKER — Reads every spec line, compares materials and build quality. Will pay more if the product justifies the price. Unimpressed by cheap-looking listings.
4. BRAND LOYAL — Looks for brand names they recognize. Less likely to try unknown brands even if price is better. Trusts established reputation.
5. LISTING QUALITY — Judges by how professional the listing looks. Evaluates image count/quality, description completeness, FAQ presence, overall polish. Crisp listings signal credibility.

YOUR PRODUCT (the one being analyzed):
${JSON.stringify(mainProduct, null, 2)}

COMPETITORS:
${JSON.stringify(competitors.slice(0, 3), null, 2)}

ALREADY GENERATED COMPARISON DATA (for reference):
${JSON.stringify(comparison.normalizedProducts ? comparison.normalizedProducts : [], null, 2)}

Return ONLY valid JSON matching this exact shape:
{
  "personas": [
    { "name": "Budget Buyer", "verdict": "skip", "confidence": 72, "monologue": "what they're thinking in 2-3 sentences", "where_we_lost": "the specific reason they looked elsewhere" },
    { "name": "Review-Driven", "verdict": "on-the-fence", "confidence": 55, "monologue": "...", "where_we_lost": "..." },
    { "name": "Quality Seeker", "verdict": "buy", "confidence": 80, "monologue": "...", "where_we_lost": "nothing — they'd buy" },
    { "name": "Brand Loyal", "verdict": "skip", "confidence": 65, "monologue": "...", "where_we_lost": "..." },
    { "name": "Listing Quality", "verdict": "on-the-fence", "confidence": 50, "monologue": "...", "where_we_lost": "..." }
  ],
  "summary": "a 2-3 sentence overview of how many would buy, how many would skip, and the single biggest thing to fix to improve conversion"
}

verdict can only be: "buy", "skip", or "on-the-fence"
confidence is 0-100, how strongly they feel
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as SimulationResult;
  } catch {
    console.error('Simulation parse error:', text.substring(0, 500));
    throw new Error('Gemini simulation returned invalid JSON');
  }
}

/** Generate a normalized comparison + AI insights across all products. */
export async function generateComparison(
  mainProduct: ProductData,
  competitors: ProductData[]
): Promise<ComparisonResult> {
  const allProducts = [mainProduct, ...competitors];

  const prompt = `You are an Amazon competitive analyst and listing quality expert.

Given the main product (first) and its competitors, generate:
1. normalizedProducts: array of objects with NORMALIZED data. Convert ALL prices to the same currency as the main product. Convert capacity/volume to the same unit. Include: asin, title, brand, price (number), currency (symbol), originalPrice (number), rating (number), reviewCount (number), capacity (standardized string), material, keySpecs (normalized flat object with matching keys across all products).
2. insights: object with:
   - strengths: array of 3-4 things the main product does BETTER than competitors
   - weaknesses: array of 3-4 things competitors do BETTER
   - improvements: array of 3-5 ACTIONABLE suggestions to improve the listing/product for better sales
   - summary: a 2-3 sentence executive summary of competitive position
3. listingScore: Score the MAIN product listing quality (0-100 for each):
   - overall: weighted average of the 3 sub-scores below
   - visualClarity: How good are the images? (number of images, quality, infographics, lifestyle shots) Score 0-100.
   - informationHierarchy: How well-structured are the title, bullets, and specs? (keyword density, readability, completeness) Score 0-100.
   - compellingCta: How persuasive is the listing? (pricing strategy, discount display, urgency, social proof via reviews) Score 0-100.
   Consider: 1 image = low visualClarity (~20-30), 5+ images = high (~70-90). 0 reviews = low compellingCta (~10-20). Missing features = low informationHierarchy.
4. grade: Single letter grade based on overall score: 90-100="A", 80-89="B", 70-79="C", 60-69="D", <60="F"
5. titleSuggestion: A REWRITTEN title (under 200 chars) that improves keyword coverage and readability. Must include brand name, key specs, and important keywords that competitors use.
6. featureBulletSuggestions: array of 4-5 REWRITTEN feature bullets (each 50-120 chars) that are benefit-driven, keyword-rich, and more compelling than the original.
7. keywordGaps: object with:
   - missingKeywords: array of 5-10 important keywords found in competitor titles but NOT in your title
   - explanation: 1-2 sentence summary of keyword coverage gap
8. reviewGaps: object with:
   - competitorPainPoints: array of 3-5 common complaints or problems from competitor reviews (infer from competitor weaknesses and what they try to address in features/bullets)
   - explanation: 1-2 sentence summary — what customers in this category want but aren't getting, and how your listing could address this

IMPORTANT:
- All prices must use the SAME currency as the main product
- keySpecs should have IDENTICAL keys across all products for fair comparison
- Be specific and data-driven in insights (reference actual numbers)
- titleSuggestion must be under 200 chars
- featureBulletSuggestions must be exactly 4-5 bullets

Products data:
${JSON.stringify(allProducts, null, 2).substring(0, 25000)}

Return JSON matching:
{ normalizedProducts: [{ asin, title, brand, price, currency, originalPrice, rating, reviewCount, capacity, material, keySpecs }], insights: { strengths, weaknesses, improvements, summary }, listingScore: { overall, visualClarity, informationHierarchy, compellingCta }, grade: "A/B/C/D/F", titleSuggestion: "improved title", featureBulletSuggestions: ["bullet 1", "bullet 2"], keywordGaps: { missingKeywords: ["keyword1", "keyword2"], explanation: "..." }, reviewGaps: { competitorPainPoints: ["pain point 1", "pain point 2"], explanation: "..." } }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as ComparisonResult;
  } catch {
    console.error('Comparison parse error:', text.substring(0, 300));
    throw new Error('Gemini comparison returned invalid JSON');
  }
}
