export interface NewsPost {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  publishedAt?: number;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
  imageUrl?: string;
  featuredImageUrl?: string;
  authorName?: string;
}
