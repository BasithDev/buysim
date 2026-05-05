export interface ProgressStep {
  step: number;
  total: number;
  message: string;
  done?: boolean;
  error?: boolean;
  durationMs?: number;
}

export interface AnalysisResult {
  mainProduct: {
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
  };
  competitors: AnalysisResult['mainProduct'][];
  comparison: {
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
  };
  meta: { totalScrapes: number; competitorAsins: string[]; timeTakenMs: number };
}
