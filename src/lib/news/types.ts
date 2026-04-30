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
