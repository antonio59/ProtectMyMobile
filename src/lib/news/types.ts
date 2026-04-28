export interface NewsSource {
  name: string;
  url: string;
  priority: number;
}

export interface FeedResult {
  source: NewsSource;
  items: any[];
  error?: string;
}

export interface RelevanceResult {
  score: number;
  shouldImport: boolean;
  reason: string;
}

export interface ScrapedContent {
  content: string;
  featuredImageUrl: string | null;
}

export interface CreatedPost {
  _id: string;
  title: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  relevanceScore: number;
}

export interface RejectedArticle {
  title: string;
  score: number;
  reason: string;
}
