import type { NewsSource } from "./types";

export const NEWS_SOURCES: NewsSource[] = [
  // Single Google News aggregator query. A second "smartphone theft UK" query
  // was dropped because it was ~64% duplicate of this one (7 of 11 items
  // overlapped) while adding only a handful of unique stories — its main effect
  // was re-ingesting duplicates. Cross-outlet syndication within this one feed
  // is handled by the dedup logic, not by adding/removing sources.
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=UK+mobile+phone+theft+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    priority: 1,
  },
  {
    name: "Guardian UK",
    url: "https://www.theguardian.com/uk/rss",
    priority: 2,
  },
  {
    name: "Guardian UK Crime",
    url: "https://www.theguardian.com/uk/crime/rss",
    priority: 3,
  },
  {
    name: "Sky News UK",
    url: "https://feeds.skynews.com/feeds/rss/uk.xml",
    priority: 4,
  },
  {
    name: "The Independent UK News",
    url: "https://www.independent.co.uk/news/uk/rss",
    priority: 5,
  },
  {
    name: "Evening Standard",
    url: "https://www.standard.co.uk/rss",
    priority: 6,
  },
  {
    name: "Metro UK News",
    url: "https://metro.co.uk/news/uk/feed/",
    priority: 7,
  },
  {
    name: "Daily Mail UK News",
    url: "https://www.dailymail.co.uk/news/uk/index.rss",
    priority: 8,
  },
  {
    name: "The Telegraph UK",
    url: "https://www.telegraph.co.uk/news/rss.xml",
    priority: 9,
  },
  {
    name: "Mirror UK News",
    url: "https://www.mirror.co.uk/news/uk-news/rss.xml",
    priority: 10,
  },
  {
    name: "ITV News",
    url: "https://www.itv.com/news/rss/",
    priority: 11,
  },
];
